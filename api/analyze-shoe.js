const axios = require("axios"); // Axios to make HTTP requests to OpenAI API

async function analyzeShoe(req, res) {
  const { base64Image, problemDescription, affectedPart } = req.body;

  try {
    // Create a detailed prompt for the OpenAI API
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
      "generalCare": ["General care tips for the shoe, based on the model and also the problem that was given so it wouldn't repeat. "]
    }
    
# Notes

-The model name should be used to suggest materials for any visible parts that are not identifiable.
-If the problem and affected parts are visible, provide the appropriate cleaning recommendations. 
-If multiple parts are affected, provide multiple recommendations.
- If the brand and model cannot be recognized, provide your best estimate or mark it as "unknown."
- In cases where part of the material cannot be clearly identified, use "unspecified" or "possibly [type]" for transparency.
- Be as specific as possible, but avoid guessing if the information is not recognizable.
- Please format the response as JSON with the appropriate details based on the shoe in the image.

#Customers input
          `;

    // Add the problem description and affected part to the prompt if provided
    if (problemDescription) {
      prompt += ` The customer has described the following issue: "${problemDescription}".`;
    }
    if (affectedPart) {
      prompt += ` The affected part of the shoe is: "${affectedPart}".`;
    }

    // Call OpenAI's chat completion API with the constructed prompt
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Use the correct model here (adjust as necessary)
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

    // Parse the OpenAI response and send it back to the frontend
    const data = openAiResponse.data;
    res.json(data); // Send the JSON response back
  } catch (error) {
    console.error("Error in analyzeShoe:", error);
    res.status(500).json({ error: "Failed to analyze the shoe." });
  }
}

module.exports = { analyzeShoe };
