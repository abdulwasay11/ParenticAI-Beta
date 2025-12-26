import React from 'react';
import { Typography, Box } from '@mui/material';

interface FormattedMessageProps {
  text: string;
  variant?: 'body1' | 'body2';
}

const FormattedMessage: React.FC<FormattedMessageProps> = ({ text, variant = 'body1' }) => {
  // Function to format the text with proper line breaks and styling
  const formatText = (text: string) => {
    // First, split by lines to handle headers and lists
    const lines = text.split('\n');
    const elements: React.ReactElement[] = [];
    let currentParagraph: string[] = [];
    let keyIndex = 0;

    const flushParagraph = () => {
      if (currentParagraph.length === 0) return;
      
      const paragraphText = currentParagraph.join('\n').trim();
      if (!paragraphText) return;

      // Check if it's a numbered list
      if (/^\d+\./.test(paragraphText.trim())) {
        const listLines = paragraphText.split('\n');
        elements.push(
          <Box key={keyIndex++} sx={{ mb: 1 }}>
            {listLines.map((line, lineIndex) => {
              const trimmedLine = line.trim();
              if (/^\d+\./.test(trimmedLine)) {
                const content = trimmedLine.replace(/^\d+\.\s*/, '');
                return (
                  <Box key={lineIndex} sx={{ display: 'flex', mb: 0.5 }}>
                    <Typography variant={variant} component="span" sx={{ mr: 1, fontWeight: 'bold' }}>
                      {trimmedLine.match(/^\d+\./)?.[0]}
                    </Typography>
                    <Typography variant={variant} component="span">
                      {formatInlineText(content)}
                    </Typography>
                  </Box>
                );
              }
              return (
                <Typography key={lineIndex} variant={variant} sx={{ mb: 0.5 }}>
                  {formatInlineText(line)}
                </Typography>
              );
            })}
          </Box>
        );
      }
      // Check if it's a bullet list
      else if (/^[•\-\*]/.test(paragraphText.trim())) {
        const listLines = paragraphText.split('\n');
        elements.push(
          <Box key={keyIndex++} sx={{ mb: 1 }}>
            {listLines.map((line, lineIndex) => {
              const trimmedLine = line.trim();
              if (/^[•\-\*]/.test(trimmedLine)) {
                const content = trimmedLine.replace(/^[•\-\*]\s*/, '');
                return (
                  <Box key={lineIndex} sx={{ display: 'flex', mb: 0.5 }}>
                    <Typography variant={variant} component="span" sx={{ mr: 1 }}>
                      •
                    </Typography>
                    <Typography variant={variant} component="span">
                      {formatInlineText(content)}
                    </Typography>
                  </Box>
                );
              }
              return (
                <Typography key={lineIndex} variant={variant} sx={{ mb: 0.5 }}>
                  {formatInlineText(line)}
                </Typography>
              );
            })}
          </Box>
        );
      }
      // Regular paragraph
      else {
        elements.push(
          <Typography key={keyIndex++} variant={variant} sx={{ mb: 1 }}>
            {formatInlineText(paragraphText)}
          </Typography>
        );
      }
      currentParagraph = [];
    };

    // Process lines
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Check for markdown headers (## or ###)
      if (/^###\s+/.test(trimmedLine)) {
        flushParagraph();
        const headerText = trimmedLine.replace(/^###\s+/, '');
        elements.push(
          <Typography
            key={keyIndex++}
            variant="subtitle1"
            component="div"
            sx={{ fontWeight: 'bold', mt: 1.5, mb: 0.5 }}
          >
            {formatInlineText(headerText)}
          </Typography>
        );
      }
      else if (/^##\s+/.test(trimmedLine)) {
        flushParagraph();
        const headerText = trimmedLine.replace(/^##\s+/, '');
        elements.push(
          <Typography
            key={keyIndex++}
            variant="h6"
            component="div"
            sx={{ fontWeight: 'bold', mt: 2, mb: 1 }}
          >
            {formatInlineText(headerText)}
          </Typography>
        );
      }
      // Empty line - flush current paragraph
      else if (trimmedLine === '') {
        flushParagraph();
      }
      // Regular line - add to current paragraph
      else {
        currentParagraph.push(line);
      }
    }
    
    // Flush any remaining paragraph
    flushParagraph();
    
    return elements;
  };

  // Function to format inline text (bold, italic, etc.)
  const formatInlineText = (text: string) => {
    // Handle bold text (**text**)
    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return (
          <Typography
            key={index}
            variant={variant}
            component="span"
            sx={{ fontWeight: 'bold' }}
          >
            {boldText}
          </Typography>
        );
      }
      return part;
    });
  };

  return (
    <Box>
      {formatText(text)}
    </Box>
  );
};

export default FormattedMessage; 