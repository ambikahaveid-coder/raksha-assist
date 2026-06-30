import { Router } from "express";
import { z } from "zod";
import OpenAI from "openai";
import { storage } from "./storage";

const router = Router();
const openaiApiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
const openai = openaiApiKey ? new OpenAI({
  apiKey: openaiApiKey,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
}) : null;

const chatbotMessageSchema = z.object({
  message: z.string().min(1),
  conversationHistory: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string()
  })).optional().default([])
});

router.post("/api/chatbot", async (req, res) => {
  try {
    const parsed = chatbotMessageSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid message" });
    if (!openai) return res.status(503).json({ error: "AI service not available" });

    const { message, conversationHistory } = parsed.data;
    const plans = await storage.getActivePlans();
    
    // Generate Dynamic Prompt based on current plans
    const chatbotSystemPrompt = `You are Raksha Buddy - friendly AI for Raksha Assist.
    IMPORTANT: THIS IS NOT INSURANCE. 
    Current Plans: ${JSON.stringify(plans.map(p => ({ name: p.name, price: p.price })))}`;

    res.setHeader("Content-Type", "text/event-stream");
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: chatbotSystemPrompt },
        ...conversationHistory,
        { role: "user", content: message }
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) res.write(`data: ${JSON.stringify({ content })}\n\n`);
    }
    res.end();
  } catch (error) {
    res.status(500).json({ error: "Chat error" });
  }
});

export default router;