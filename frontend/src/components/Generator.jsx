import React, { useState } from 'react';
import axios from 'axios';

function Generator() {
  // State variables for form and application status
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Async function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default browser refresh
    
    // Clear previous results and errors
    setResult('');
    setError(null);

    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Send POST request to the backend API endpoint
      // NOTE: We use '/api/generate' and rely on the proxy setting 
      // in package.json to route it to http://localhost:5000.
      const response = await axios.post('/api/generate', { prompt });

      // 2. Update state with the AI's generated content
      setResult(response.data.generatedText);

    } catch (err) {
      // 3. Handle any errors from the request or the server
      console.error('API Error:', err);
      setError('Failed to generate content. Please check the backend server.');
    } finally {
      // 4. Reset loading state
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

      {/* Conditional Rendering of Results and Errors */}
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