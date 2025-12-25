// frontend/api/chat.js
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
    const { message, childContext = [] } = request.body;

    if (!message || typeof message !== 'string') {
      return response.status(400).json({ error: 'Message is required and must be a string' });
    }

    // Build system prompt
    let systemPrompt = 'You are a helpful and knowledgeable AI parenting assistant. Provide evidence-based, compassionate, and practical parenting advice.';
    if (childContext && Array.isArray(childContext) && childContext.length > 0) {
      systemPrompt += `\n\nContext about the child(ren): ${childContext.join(', ')}`;
    }

    // Call DeepSeek API
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
        stream: false,
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!deepseekResponse.ok) {
      const errorData = await deepseekResponse.json().catch(() => ({}));
      console.error('DeepSeek API error:', errorData);
      return response.status(deepseekResponse.status).json({ 
        error: errorData.error?.message || 'Failed to get response from DeepSeek',
        details: errorData
      });
    }

    const data = await deepseekResponse.json();
    const aiResponse = data.choices?.[0]?.message?.content || 'I apologize, but I couldn\'t generate a response. Please try again.';
    
    return response.status(200).json({
      response: aiResponse,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error calling DeepSeek API:', error);
    return response.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};