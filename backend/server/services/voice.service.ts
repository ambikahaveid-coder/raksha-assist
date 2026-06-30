import OpenAI from "openai";
import fs from "fs";
import path from "path";
import os from "os";

const OPENAI_API_KEY = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;

function getOpenAIClient(): OpenAI {
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured. Please set AI_INTEGRATIONS_OPENAI_API_KEY.");
  }
  return new OpenAI({
    apiKey: OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });
}

export interface VoiceSettings {
  voice?: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
  speed?: number;
  language?: string;
}

export interface TranscriptionResult {
  text: string;
  language?: string;
  duration?: number;
}

export interface SpeechResult {
  audioBuffer: Buffer;
  contentType: string;
}

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
}

const SUPPORTED_LANGUAGES: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  te: "Telugu",
  ta: "Tamil",
  kn: "Kannada",
  ml: "Malayalam",
  mr: "Marathi",
  gu: "Gujarati",
  bn: "Bengali",
  pa: "Punjabi",
  ur: "Urdu",
  or: "Odia",
  as: "Assamese",
  es: "Spanish",
  fr: "French",
  de: "German",
  zh: "Chinese",
  ja: "Japanese",
  ko: "Korean",
  ar: "Arabic",
  pt: "Portuguese",
  ru: "Russian",
  it: "Italian",
  nl: "Dutch",
  tr: "Turkish",
  vi: "Vietnamese",
  th: "Thai",
  id: "Indonesian",
  ms: "Malay",
  fil: "Filipino",
  sw: "Swahili",
  he: "Hebrew",
  pl: "Polish",
  uk: "Ukrainian",
  cs: "Czech",
  ro: "Romanian",
  hu: "Hungarian",
  el: "Greek",
  sv: "Swedish",
  da: "Danish",
  no: "Norwegian",
  fi: "Finnish",
};

const ACCESSIBILITY_PRESETS = {
  normal: { speed: 1.0, pauseBetweenSentences: false },
  slow: { speed: 0.75, pauseBetweenSentences: true },
  verySlow: { speed: 0.5, pauseBetweenSentences: true },
  clear: { speed: 0.85, pauseBetweenSentences: true },
};

class VoiceService {
  async speechToText(
    audioBuffer: Buffer,
    language?: string,
    filename?: string
  ): Promise<TranscriptionResult> {
    const tempDir = os.tmpdir();
    const tempFile = path.join(tempDir, filename || `audio_${Date.now()}.webm`);
    
    try {
      fs.writeFileSync(tempFile, audioBuffer);
      
      const transcription = await getOpenAIClient().audio.transcriptions.create({
        file: fs.createReadStream(tempFile),
        model: "whisper-1",
        language: language,
        response_format: "verbose_json",
      });

      return {
        text: transcription.text,
        language: transcription.language,
        duration: transcription.duration,
      };
    } finally {
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    }
  }

  async textToSpeech(
    text: string,
    settings: VoiceSettings = {}
  ): Promise<SpeechResult> {
    const { voice = "nova", speed = 1.0 } = settings;

    const response = await getOpenAIClient().audio.speech.create({
      model: "tts-1",
      voice: voice,
      input: text,
      speed: Math.max(0.25, Math.min(4.0, speed)),
    });

    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    return {
      audioBuffer,
      contentType: "audio/mpeg",
    };
  }

  async textToSpeechAccessible(
    text: string,
    accessibilityPreset: keyof typeof ACCESSIBILITY_PRESETS = "normal",
    voice: VoiceSettings["voice"] = "nova"
  ): Promise<SpeechResult> {
    const preset = ACCESSIBILITY_PRESETS[accessibilityPreset];
    
    let processedText = text;
    if (preset.pauseBetweenSentences) {
      processedText = text.replace(/\.\s+/g, ". ... ");
      processedText = processedText.replace(/\?\s+/g, "? ... ");
      processedText = processedText.replace(/!\s+/g, "! ... ");
    }

    return this.textToSpeech(processedText, {
      voice,
      speed: preset.speed,
    });
  }

  async translate(
    text: string,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<TranslationResult> {
    const targetLangName = SUPPORTED_LANGUAGES[targetLanguage] || targetLanguage;
    const sourceLangName = sourceLanguage 
      ? SUPPORTED_LANGUAGES[sourceLanguage] || sourceLanguage 
      : "auto-detected";

    const prompt = sourceLanguage
      ? `Translate the following text from ${sourceLangName} to ${targetLangName}. Only respond with the translation, nothing else:\n\n${text}`
      : `Translate the following text to ${targetLangName}. Detect the source language automatically. Only respond with the translation, nothing else:\n\n${text}`;

    const response = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional translator. Translate accurately while maintaining the original meaning and tone. Only output the translation, nothing else.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
    });

    const translatedText = response.choices[0]?.message?.content || text;

    return {
      originalText: text,
      translatedText: translatedText.trim(),
      sourceLanguage: sourceLanguage || "auto",
      targetLanguage,
    };
  }

  async speechToSpeechTranslate(
    audioBuffer: Buffer,
    targetLanguage: string,
    voice: VoiceSettings["voice"] = "nova",
    filename?: string
  ): Promise<{ transcription: TranscriptionResult; translation: TranslationResult; audio: SpeechResult }> {
    const transcription = await this.speechToText(audioBuffer, undefined, filename);
    const translation = await this.translate(transcription.text, targetLanguage, transcription.language);
    const audio = await this.textToSpeech(translation.translatedText, { voice });

    return {
      transcription,
      translation,
      audio,
    };
  }

  async chat(
    message: string,
    language: string = "en",
    conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = []
  ): Promise<{ response: string; audio?: SpeechResult }> {
    const languageName = SUPPORTED_LANGUAGES[language] || "English";
    
    const systemPrompt = `You are Raksha - a friendly, caring AI voice assistant for Raksha Assist emergency medical assistance platform. 
    
IMPORTANT: Always respond in ${languageName} language.

ABOUT RAKSHA ASSIST:
- Raksha Assist is a MEMBERSHIP program (NOT insurance) providing hospital-direct financial support
- Plans range from ₹1,499/year to ₹7,999/year with coverage from ₹1.5 Lakhs to ₹10 Lakhs
- We pay hospitals DIRECTLY - no reimbursement hassles
- 24/7 emergency support with instant hospital coordination
- Covers: accidents, medical emergencies, critical illness
- NOT covered: pre-existing conditions, planned surgeries, cosmetic procedures

RESPONSE GUIDELINES:
- Keep responses concise and clear (2-3 sentences for simple questions)
- Be warm, empathetic, and helpful
- For emergencies, immediately provide helpline number
- Always respond in ${languageName}`;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    const response = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const responseText = response.choices[0]?.message?.content || "I apologize, I couldn't process your request.";

    const audio = await this.textToSpeech(responseText, { voice: "nova" });

    return {
      response: responseText,
      audio,
    };
  }

  getSupportedLanguages(): Record<string, string> {
    return { ...SUPPORTED_LANGUAGES };
  }

  getAccessibilityPresets(): Record<string, typeof ACCESSIBILITY_PRESETS[keyof typeof ACCESSIBILITY_PRESETS]> {
    return { ...ACCESSIBILITY_PRESETS };
  }
}

export const voiceService = new VoiceService();
