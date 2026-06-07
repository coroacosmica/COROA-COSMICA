import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60; // 60 seconds max

const SYSTEM_PROMPT = `
You are an expert graphic design AI for Coroa Cósmica corporate gifts.
Your job is to generate a visual layout using basic geometric shapes and text on a 500x500 canvas.
The canvas is centered at (250, 250).

You MUST respond with a valid JSON array of layer objects. Do not include any markdown formatting, explanations, or backticks around the JSON. JUST the JSON array.

Supported layer types:
1. text: { "type": "text", "text": string, "left": number, "top": number, "fill": string, "fontSize": number, "fontFamily": string }
2. rect: { "type": "rect", "left": number, "top": number, "width": number, "height": number, "fill": string }
3. circle: { "type": "circle", "left": number, "top": number, "radius": number, "fill": string }
4. line: { "type": "line", "x1": number, "y1": number, "x2": number, "y2": number, "stroke": string, "strokeWidth": number }

All coordinate origins ("left" and "top") should represent the CENTER of the object (originX="center", originY="center").
Create clean, modern, professional layouts suitable for corporate gifting (e.g. logos, sleek badges, monograms, neat typography).
`;

const MOCK_RESPONSE = [
  { "type": "circle", "left": 250, "top": 250, "radius": 120, "fill": "#f8f9fa" },
  { "type": "circle", "left": 250, "top": 250, "radius": 110, "fill": "#ffffff" },
  { "type": "rect", "left": 250, "top": 250, "width": 140, "height": 140, "fill": "#1f2937" },
  { "type": "text", "text": "COROA", "left": 250, "top": 230, "fill": "#ffffff", "fontSize": 32, "fontFamily": "Impact" },
  { "type": "text", "text": "EST. 2026", "left": 250, "top": 270, "fill": "#9ca3af", "fontSize": 14, "fontFamily": "Arial" }
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mode, prompt, imageBase64 } = body;

    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn("No ANTHROPIC_API_KEY found. Returning mock design data.");
      // Simulate network delay
      await new Promise((r) => setTimeout(r, 1500));
      return NextResponse.json({ layers: MOCK_RESPONSE });
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    let messageContent: any[] = [];

    if (mode === "text") {
      messageContent.push({
        type: "text",
        text: `Create a corporate design layout for the following request: ${prompt}`,
      });
    } else if (mode === "image" && imageBase64) {
      const base64Data = imageBase64.split(",")[1] || imageBase64;
      let mediaType = "image/jpeg";
      if (imageBase64.includes("image/png")) mediaType = "image/png";
      else if (imageBase64.includes("image/webp")) mediaType = "image/webp";

      messageContent.push({
        type: "image",
        source: {
          type: "base64",
          media_type: mediaType,
          data: base64Data,
        },
      });
      messageContent.push({
        type: "text",
        text: `Analyze this reference image and extract its style, layout, and colors. Then generate a similar professional layout using the JSON format. ${prompt ? "Additional instructions: " + prompt : ""}`,
      });
    } else {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 2000,
      temperature: 0.7,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: messageContent }],
    });

    const responseText = response.content.find((c) => c.type === "text") as any;
    const textContent = responseText?.text || "[]";
    
    // Extract JSON block if Claude included markdown
    let jsonStr = textContent.trim();
    if (jsonStr.startsWith("\`\`\`json")) {
      jsonStr = jsonStr.replace(/\`\`\`json/g, "");
      jsonStr = jsonStr.replace(/\`\`\`/g, "");
    }
    
    const parsedLayers = JSON.parse(jsonStr.trim());
    return NextResponse.json({ layers: parsedLayers });

  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate design" }, { status: 500 });
  }
}
