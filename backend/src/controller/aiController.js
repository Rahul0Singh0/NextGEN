import { GoogleGenAI } from "@google/genai";

// Initialize the GoogleGenAI instance
// It will automatically look for the GEMINI_API_KEY in process.env
const ai = new GoogleGenAI({}); 

/**
 * Controller function to handle the content generation request.
 * @param {object} req - Express request object (expects req.body.prompt)
 * @param {object} res - Express response object
 */
export const generateContent = async (req, res) => {
  // Check if the API Key is available
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "API Key not configured on the server." });
  }

  // Extract the user's prompt from the request body
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required in the request body." });
  }

  try {
    // 1. Call the Gemini API to generate content
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Use a fast and capable model
      contents: prompt,
    });

    // 2. Extract the text from the response
    const generatedText = response.text;

    // 3. Send the result back to the frontend
    res.status(200).json({
      success: true,
      generatedText,
    });

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Send a generic error message to the client
    res.status(500).json({
      success: false,
      error: "An internal server error occurred during content generation.",
    });
  }
};