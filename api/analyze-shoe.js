const { OpenAI } = require("openai"); // OpenAI SDK
import { buffer } from "micro"; // For handling raw image data

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Securely access API key from environment
});

export const config = {
  api: {
    bodyParser: false, // Disable body parser for raw image handling
  },
};

// The serverless function to analyze the shoe image
export default async (req, res) => {
  if (req.method === "POST") {
    try {
      // Parse the raw body (the image in base64 format)
      const rawBody = await buffer(req);
      const base64Image = rawBody.toString("base64");

      const { problemDescription, affectedPart } = req.body;

      let prompt = `
      You are a shoe product e-shop assistant trained to identify shoe models, and materials, and provide cleaning recommendations. The customer has uploaded a photo of a shoe and described the problem. Based on this, your task is to:

       Analyze the shoe in the provided image and return the information in the following format:

      {
        "brandAndModel": "Shoe brand and model name",
        "materials": {
          "upper": "Material of the upper, if visible. If not visible, suggest using the model name to determine the material.",
          "lining": "Material of the lining, if visible. If not visible, suggest using the model name to determine the material.",
          "insole": "Material of the insole, if visible. If not visible, suggest using the model name to determine the material.",
          "outsole": "Material of the outsole, if visible. If not visible, suggest using the model name to determine the material.",
          "laces": "Material of the laces, if visible. If not visible, suggest using the model name to determine the material.",
          "tongue": "Material of the tongue, if visible. If not visible, suggest using the model name to determine the material."
        },
        "cleaningRecommendations": [
          {
            "affectedPart": "The affected part of the shoe (e.g., Upper, Outsole, Toe, Heel, etc.)",
            "recommendations": [
              "List of cleaning recommendations for that part, based on the described problem."
            ]
          }
        ],
        "generalCare": ["General care tips for the shoe, based on the model and also the problem that was given so it wouldn't repeat."]
      }
      `;

      if (problemDescription) {
        prompt += ` The customer has described the following issue: "${problemDescription}".`;
      }
      if (affectedPart) {
        prompt += ` The affected part of the shoe is: "${affectedPart}".`;
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Use the correct model here
        messages: [
          {
            role: "system",
            content: prompt,
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: "high", // Base64-encoded image
                },
              },
            ],
          },
        ],
        temperature: 1,
        max_tokens: 2048,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        response_format: "json_object",
      });

      res.status(200).json(response.choices[0].message.content);
    } catch (error) {
      console.error("Error processing image:", error);
      res.status(500).json({ error: "Error processing image" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
};
