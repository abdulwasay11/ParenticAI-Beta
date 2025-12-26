// frontend/api/chat.js
const { query } = require('./db');

module.exports = async function handler(request, response) {
  // Set CORS headers
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request for CORS preflight
  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  // Only allow POST requests
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.error('DeepSeek API key not configured');
    return response.status(500).json({ error: 'DeepSeek API key not configured' });
  }

  try {
    const { message, childContext = [], firebase_uid, child_id } = request.body;

    if (!message || typeof message !== 'string') {
      return response.status(400).json({ error: 'Message is required and must be a string' });
    }

    // Get parent_id from firebase_uid if provided (for saving chat history)
    let parent_id = null;
    if (firebase_uid) {
      try {
        const userResult = await query('SELECT id FROM users WHERE firebase_uid = $1', [firebase_uid]);
        if (userResult.rows.length > 0) {
          const userId = userResult.rows[0].id;
          const parentResult = await query('SELECT id FROM parents WHERE user_id = $1', [userId]);
          if (parentResult.rows.length > 0) {
            parent_id = parentResult.rows[0].id;
          }
        }
      } catch (dbError) {
        console.error('Error fetching parent_id:', dbError);
        // Continue without saving chat history if DB query fails
      }
    }

    // Build system prompt
    // For anonymous users (no child context), provide concise responses
    // For signed-in users with child context, provide detailed responses
    const isAnonymous = !childContext || !Array.isArray(childContext) || childContext.length === 0;
    
    let systemPrompt = 'You are a helpful and knowledgeable AI parenting assistant. Provide evidence-based, compassionate, and practical parenting advice.';
    
    if (isAnonymous) {
      systemPrompt += ' Keep your responses concise and to the point (2-3 paragraphs maximum). Focus on the most important actionable advice.';
    } else {
      systemPrompt += `\n\nContext about the child(ren): ${childContext.join(', ')}`;
      systemPrompt += ' Provide detailed, comprehensive advice tailored to the child\'s context.';
    }

    // Set headers for streaming response
    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Connection', 'keep-alive');

    // Call DeepSeek API with streaming enabled
    const deepseekResponse = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        stream: true, // Enable streaming
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!deepseekResponse.ok) {
      const errorData = await deepseekResponse.json().catch(() => ({}));
      console.error('DeepSeek API error:', errorData);
      response.status(deepseekResponse.status);
      response.write(`data: ${JSON.stringify({ error: errorData.error?.message || 'Failed to get response from DeepSeek' })}\n\n`);
      response.end();
      return;
    }

    // Stream the response from DeepSeek to the client
    const reader = deepseekResponse.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullResponse = ''; // Collect full response for saving to database

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          // Send final message to indicate stream is complete
          response.write(`data: ${JSON.stringify({ done: true })}\n\n`);
          response.end();
          
          // Save chat history to database after streaming completes
          if (parent_id && fullResponse) {
            try {
              await query(
                `INSERT INTO chat_history (parent_id, child_id, message, response, child_context) 
                 VALUES ($1, $2, $3, $4, $5)`,
                [
                  parent_id,
                  child_id || null,
                  message,
                  fullResponse,
                  childContext.length > 0 ? childContext : null
                ]
              );
            } catch (saveError) {
              console.error('Error saving chat history:', saveError);
              // Don't fail the request if saving history fails
            }
          }
          break;
        }

        // Decode the chunk
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6); // Remove 'data: ' prefix
            
            if (data === '[DONE]') {
              response.write(`data: ${JSON.stringify({ done: true })}\n\n`);
              response.end();
              
              // Save chat history
              if (parent_id && fullResponse) {
                try {
                  await query(
                    `INSERT INTO chat_history (parent_id, child_id, message, response, child_context) 
                     VALUES ($1, $2, $3, $4, $5)`,
                    [
                      parent_id,
                      child_id || null,
                      message,
                      fullResponse,
                      childContext.length > 0 ? childContext : null
                    ]
                  );
                } catch (saveError) {
                  console.error('Error saving chat history:', saveError);
                }
              }
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              
              if (content) {
                fullResponse += content; // Accumulate full response
                // Forward the content chunk to the client
                response.write(`data: ${JSON.stringify({ chunk: content })}\n\n`);
              }
            } catch (e) {
              // Skip invalid JSON lines
              continue;
            }
          }
        }
      }
    } catch (streamError) {
      console.error('Error streaming response:', streamError);
      response.write(`data: ${JSON.stringify({ error: 'Stream error occurred' })}\n\n`);
      response.end();
    }
  } catch (error) {
    console.error('Error calling DeepSeek API:', error);
    response.status(500);
    response.write(`data: ${JSON.stringify({ error: 'Internal server error', message: error.message })}\n\n`);
    response.end();
  }
};