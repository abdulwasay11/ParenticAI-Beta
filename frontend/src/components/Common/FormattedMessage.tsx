import React from 'react';
import { Typography, Box } from '@mui/material';

interface FormattedMessageProps {
  text: string;
  variant?: 'body1' | 'body2';
}

const FormattedMessage: React.FC<FormattedMessageProps> = ({ text, variant = 'body1' }) => {
  // Function to format the text with proper line breaks and styling
  const formatText = (text: string) => {
    // Split by double line breaks to create paragraphs
    const paragraphs = text.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      // Handle numbered lists (lines starting with numbers)
      if (/^\d+\./.test(paragraph.trim())) {
        const lines = paragraph.split('\n');
        return (
          <Box key={index} sx={{ mb: 1 }}>
            {lines.map((line, lineIndex) => {
              const trimmedLine = line.trim();
              if (/^\d+\./.test(trimmedLine)) {
                // Remove the number and dot, then format as list item
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
      
      // Handle bullet points or lines starting with special characters
      if (/^[•\-\*]/.test(paragraph.trim())) {
        const lines = paragraph.split('\n');
        return (
          <Box key={index} sx={{ mb: 1 }}>
            {lines.map((line, lineIndex) => {
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
      return (
        <Typography key={index} variant={variant} sx={{ mb: 1 }}>
          {formatInlineText(paragraph)}
        </Typography>
      );
    });
  };

  // Function to format inline text (bold, etc.)
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