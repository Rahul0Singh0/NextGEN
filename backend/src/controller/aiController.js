import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({}); 

export const generateContent = async (req, res) => {
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "API Key not configured on the server." });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required in the request body." });
  }

  try {
    // 1. Set headers for streaming (keep the connection open)
    res.setHeader('Content-Type', 'text/plain'); // Use plain text for simplicity
    res.setHeader('Transfer-Encoding', 'chunked'); // Important for flushing data immediately

    // 2. Call the Gemini streaming API
    const responseStream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    // 3. Pipe the stream output directly to the Express response
    for await (const chunk of responseStream) {
      // Write each chunk of text to the response
      res.write(chunk.text);
    }

    // 4. End the response when the stream is complete
    res.end(); 

  } catch (error) {
    console.error("Gemini Streaming API Error:", error);
    // Important: Close the connection with an error message
    if (!res.headersSent) {
      res.status(500).send("An internal server error occurred during streaming.");
    } else {
      res.end(); // If headers were sent, just close the connection
    }
  }
};