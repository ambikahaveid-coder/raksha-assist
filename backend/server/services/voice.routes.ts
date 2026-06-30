import type { Express } from "express";
import { voiceService } from "./voice.service";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
});

export function registerVoiceRoutes(app: Express) {
  app.get("/api/voice/languages", (_req: any, res: any) => {
    try {
      const languages = voiceService.getSupportedLanguages();
      const presets = voiceService.getAccessibilityPresets();
      res.json({
        languages,
        accessibilityPresets: Object.keys(presets),
        voices: ["alloy", "echo", "fable", "onyx", "nova", "shimmer"],
      });
    } catch (error) {
      console.error("Error fetching voice config:", error);
      res.status(500).json({ error: "Failed to fetch voice configuration" });
    }
  });

  app.post("/api/voice/listen", upload.single("audio"), async (req: any, res: any) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No audio file provided" });
      }

      const { language } = req.body;
      const result = await voiceService.speechToText(
        req.file.buffer,
        language,
        req.file.originalname
      );

      res.json(result);
    } catch (error) {
      console.error("Error in speech-to-text:", error);
      res.status(500).json({ error: "Failed to transcribe audio" });
    }
  });

  app.post("/api/voice/speak", async (req: any, res: any) => {
    try {
      const { text, voice, speed, accessibility } = req.body;

      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Text is required" });
      }

      let result;
      if (accessibility) {
        result = await voiceService.textToSpeechAccessible(text, accessibility, voice);
      } else {
        result = await voiceService.textToSpeech(text, { voice, speed });
      }

      res.set("Content-Type", result.contentType);
      res.send(result.audioBuffer);
    } catch (error) {
      console.error("Error in text-to-speech:", error);
      res.status(500).json({ error: "Failed to generate speech" });
    }
  });

  app.post("/api/voice/translate", async (req: any, res: any) => {
    try {
      const { text, targetLanguage, sourceLanguage } = req.body;

      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "Text is required" });
      }

      if (!targetLanguage) {
        return res.status(400).json({ error: "Target language is required" });
      }

      const result = await voiceService.translate(text, targetLanguage, sourceLanguage);
      res.json(result);
    } catch (error) {
      console.error("Error in translation:", error);
      res.status(500).json({ error: "Failed to translate text" });
    }
  });

  app.post("/api/voice/translate-speech", upload.single("audio"), async (req: any, res: any) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No audio file provided" });
      }

      const { targetLanguage, voice, returnAudio } = req.body;

      if (!targetLanguage) {
        return res.status(400).json({ error: "Target language is required" });
      }

      const result = await voiceService.speechToSpeechTranslate(
        req.file.buffer,
        targetLanguage,
        voice,
        req.file.originalname
      );

      if (returnAudio === "true") {
        res.set("Content-Type", result.audio.contentType);
        res.set("X-Original-Text", encodeURIComponent(result.transcription.text));
        res.set("X-Translated-Text", encodeURIComponent(result.translation.translatedText));
        res.set("X-Source-Language", result.translation.sourceLanguage);
        res.set("X-Target-Language", result.translation.targetLanguage);
        res.send(result.audio.audioBuffer);
      } else {
        res.json({
          transcription: result.transcription,
          translation: result.translation,
        });
      }
    } catch (error) {
      console.error("Error in speech translation:", error);
      res.status(500).json({ error: "Failed to translate speech" });
    }
  });

  app.post("/api/voice/chat", upload.single("audio"), async (req: any, res: any) => {
    try {
      let message: string;
      let language = req.body.language || "en";
      
      if (req.file) {
        const transcription = await voiceService.speechToText(
          req.file.buffer,
          language,
          req.file.originalname
        );
        message = transcription.text;
        if (transcription.language) {
          language = transcription.language;
        }
      } else if (req.body.message) {
        message = req.body.message;
      } else {
        return res.status(400).json({ error: "Either audio file or message text is required" });
      }

      // Handle conversationHistory - can be array or JSON string
      let conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = [];
      if (req.body.conversationHistory) {
        if (Array.isArray(req.body.conversationHistory)) {
          conversationHistory = req.body.conversationHistory;
        } else if (typeof req.body.conversationHistory === "string") {
          try {
            conversationHistory = JSON.parse(req.body.conversationHistory);
          } catch {
            conversationHistory = [];
          }
        }
      }

      const result = await voiceService.chat(message, language, conversationHistory);

      const returnAudio = req.body.returnAudio === "true";
      
      if (returnAudio && result.audio) {
        res.set("Content-Type", result.audio.contentType);
        res.set("X-Response-Text", encodeURIComponent(result.response));
        res.set("X-Input-Text", encodeURIComponent(message));
        res.set("X-Language", language);
        res.send(result.audio.audioBuffer);
      } else {
        res.json({
          inputText: message,
          response: result.response,
          language,
        });
      }
    } catch (error) {
      console.error("Error in voice chat:", error);
      res.status(500).json({ error: "Failed to process voice chat" });
    }
  });

  console.log("Voice API routes registered successfully");
}
