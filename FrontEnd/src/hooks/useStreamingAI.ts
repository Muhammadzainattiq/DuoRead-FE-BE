import { useState, useCallback } from 'react';

interface StreamingAIState {
  isStreaming: boolean;
  streamedText: string;
  error: string | null;
}

interface StreamingAIActions {
  streamResponse: (endpoint: string, data: any, token: string) => Promise<string>;
  reset: () => void;
}

export const useStreamingAI = (): StreamingAIState & StreamingAIActions => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const streamResponse = useCallback(async (endpoint: string, data: any, token: string): Promise<string> => {
    setIsStreaming(true);
    setStreamedText('');
    setError(null);

    try {
      const response = await fetch(`https://zainattiq-duoread.hf.space${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        console.log('Received chunk:', chunk); // Debug log
        
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const content = line.slice(6); // Remove 'data: ' prefix
            console.log('Processing data line:', content); // Debug log
            
            if (content === '[DONE]') {
              console.log('Stream completed, full text length:', fullText.length); // Debug log
              setIsStreaming(false);
              return fullText;
            } else if (content.startsWith('Error:')) {
              throw new Error(content);
            } else if (content) {
              fullText += content;
              setStreamedText(fullText);
              console.log('Updated streamed text length:', fullText.length); // Debug log
            }
          }
        }
        
        // Add a small delay to allow UI updates between chunks
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      setIsStreaming(false);
      return fullText;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setIsStreaming(false);
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setIsStreaming(false);
    setStreamedText('');
    setError(null);
  }, []);

  return { 
    streamResponse, 
    isStreaming, 
    streamedText, 
    error, 
    reset 
  };
};