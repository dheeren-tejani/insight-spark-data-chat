
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface MessageRendererProps {
  content: string;
  isStreaming?: boolean;
  className?: string;
}

// Simple markdown-like parser
const parseMarkdown = (text: string) => {
  // Bold
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Italic
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // Headers
  text = text.replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mb-2 mt-4">$1</h3>');
  text = text.replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mb-3 mt-4">$1</h2>');
  text = text.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4 mt-4">$1</h1>');
  // Code blocks
  text = text.replace(/```([\s\S]*?)```/g, '<pre class="bg-muted p-3 rounded-lg overflow-x-auto my-2"><code>$1</code></pre>');
  // Inline code
  text = text.replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>');
  // Links
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');
  // Bullet points
  text = text.replace(/^[\s]*\* (.*$)/gm, '<li class="ml-4">• $1</li>');
  text = text.replace(/(<li.*<\/li>)/s, '<ul class="my-2">$1</ul>');
  // Numbered lists
  text = text.replace(/^[\s]*\d+\. (.*$)/gm, '<li class="ml-4 list-decimal">$1</li>');
  // Blockquotes
  text = text.replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-primary pl-4 italic my-2">$1</blockquote>');
  // Horizontal rules
  text = text.replace(/^---$/gm, '<hr class="border-border my-4">');
  // Line breaks
  text = text.replace(/\n\n/g, '</p><p class="mb-2">');
  text = text.replace(/\n/g, '<br>');
  
  return `<p class="mb-2">${text}</p>`;
};

// Simple LaTeX parser for basic math
const parseLatex = (text: string) => {
  // Display math $$...$$
  text = text.replace(/\$\$(.*?)\$\$/g, '<div class="math-display bg-muted p-2 rounded my-2 text-center font-mono">$1</div>');
  // Inline math $...$
  text = text.replace(/\$([^$]+)\$/g, '<span class="math-inline bg-muted px-1 rounded font-mono">$1</span>');
  return text;
};

// Simple table parser
const parseTable = (text: string) => {
  const tableRegex = /\|(.+)\|\n\|[-\s\|]+\|\n((?:\|.+\|\n?)+)/g;
  
  return text.replace(tableRegex, (match, header, rows) => {
    const headerCells = header.split('|').filter(cell => cell.trim()).map(cell => 
      `<th class="border border-border px-3 py-2 bg-muted font-semibold">${cell.trim()}</th>`
    ).join('');
    
    const rowCells = rows.trim().split('\n').map(row => {
      const cells = row.split('|').filter(cell => cell.trim()).map(cell => 
        `<td class="border border-border px-3 py-2">${cell.trim()}</td>`
      ).join('');
      return `<tr>${cells}</tr>`;
    }).join('');
    
    return `<div class="overflow-x-auto my-4">
      <table class="w-full border-collapse border border-border rounded-lg">
        <thead><tr>${headerCells}</tr></thead>
        <tbody>${rowCells}</tbody>
      </table>
    </div>`;
  });
};

export const MessageRenderer: React.FC<MessageRendererProps> = ({ 
  content, 
  isStreaming = false, 
  className = "" 
}) => {
  const [displayedContent, setDisplayedContent] = useState(isStreaming ? '' : content);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (isStreaming && currentIndex < content.length) {
      const timer = setTimeout(() => {
        setDisplayedContent(content.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 20); // Adjust speed as needed
      
      return () => clearTimeout(timer);
    } else if (!isStreaming) {
      setDisplayedContent(content);
      setCurrentIndex(content.length);
    }
  }, [content, currentIndex, isStreaming]);

  const processContent = (text: string) => {
    // Process in order: tables, latex, then markdown
    let processed = parseTable(text);
    processed = parseLatex(processed);
    processed = parseMarkdown(processed);
    return processed;
  };

  const htmlContent = processContent(displayedContent);

  return (
    <div 
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};
