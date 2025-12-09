import { useState } from 'react';
import { aiResponse, streamAiResponse } from '../apis/generate.js';

function Generator() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // const handleSubmit = async (e) => {
  //   e.preventDefault(); 
    
  //   setResult('');
  //   setError(null);

  //   if (!prompt.trim()) {
  //     setError('Please enter a prompt.');
  //     return;
  //   }

  //   setIsLoading(true);

  //   try {
  //     const response = await streamAiResponse({ prompt });

  //     setResult(response.generatedText);
  //   } catch (err) {
  //     console.error('API Error:', err);
  //     setError('Failed to generate content. Please check the backend server.');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(''); // Clear previous result
    setError(null);
    setIsLoading(true);

    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      setIsLoading(false);
      return;
    }
    
    // Function to append new chunks to the result state
    const handleChunk = (chunk) => {
      setResult(prev => prev + chunk);
    };

    try {
      await streamAiResponse(
        { prompt }, 
        handleChunk, 
        (errorMessage) => setError(errorMessage) // Handle errors passed from API helper
      );
    } catch (error) {
        console.log('API Error:', error);
        // Errors caught here are network errors or errors thrown in the helper
        setError("Network error or failed to start stream.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="generator-container">
      <h1>AI Content Generator</h1>

      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt here (e.g., Write a blog post about MERN stack best practices)..."
          rows="5"
          cols="50"
          disabled={isLoading}
        />
        <br />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Generate Content'}
        </button>
      </form>

      {error && <p className="error-message">Error: {error}</p>}
      
      {result && (
        <div className="result-box">
          <h2>Generated Content:</h2>
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
}

export default Generator;