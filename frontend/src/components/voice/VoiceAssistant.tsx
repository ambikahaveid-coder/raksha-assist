import { useState, useRef, useEffect } from "react";
import { fetchWithCsrf } from "@/lib/csrf";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  MessageCircle, 
  X, 
  Send,
  Bot,
  User,
  Loader2,
  Languages,
  Phone
} from "lucide-react";

const LANGUAGES = [
  { code: "te-IN", name: "తెలుగు (Telugu)", flag: "🇮🇳" },
  { code: "hi-IN", name: "हिंदी (Hindi)", flag: "🇮🇳" },
  { code: "en-IN", name: "English (India)", flag: "🇮🇳" },
  { code: "ta-IN", name: "தமிழ் (Tamil)", flag: "🇮🇳" },
  { code: "kn-IN", name: "ಕನ್ನಡ (Kannada)", flag: "🇮🇳" },
  { code: "ml-IN", name: "മലയാളം (Malayalam)", flag: "🇮🇳" },
  { code: "mr-IN", name: "मराठी (Marathi)", flag: "🇮🇳" },
  { code: "bn-IN", name: "বাংলা (Bengali)", flag: "🇮🇳" },
  { code: "gu-IN", name: "ગુજરાતી (Gujarati)", flag: "🇮🇳" }
];

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface VoiceAssistantProps {
  onClose?: () => void;
}

export function VoiceAssistant({ onClose }: VoiceAssistantProps) {
  const [language, setLanguage] = useState("en-IN");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
    }
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = async (text: string) => {
    if (!voiceEnabled) return;
    
    // Stop any current playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    setIsSpeaking(true);
    
    try {
      // Use OpenAI TTS API for high-quality voice
      const response = await fetchWithCsrf("/api/voice/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          voice: "nova", // Warm female voice
          speed: 1.0
        })
      });
      
      if (!response.ok) throw new Error("TTS failed");
      
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      audioRef.current.onerror = () => {
        setIsSpeaking(false);
        // Fallback to browser TTS if API fails
        fallbackSpeak(text);
      };
      
      await audioRef.current.play();
    } catch (error) {
      console.error("OpenAI TTS error, using fallback:", error);
      fallbackSpeak(text);
    }
  };

  // Fallback to browser TTS if OpenAI API fails
  const fallbackSpeak = (text: string) => {
    if (!synthRef.current) return;
    
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 0.95;
    utterance.pitch = 1.15;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    // Stop OpenAI audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    // Stop browser TTS
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice input not supported in this browser. Please type your question.");
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const startConversation = async () => {
    setHasStarted(true);
    setIsLoading(true);
    
    try {
      // Generate welcome message based on language
      const langCode = language.split('-')[0];
      const welcomeMessages: Record<string, string> = {
        te: "నమస్కారం! నేను రక్ష, మీ ఎమర్జెన్సీ మెడికల్ అసిస్టెంట్. Raksha Assist గురించి ఏమైనా తెలుసుకోవాలనుకుంటున్నారా? మీకు ఎలా సహాయం చేయగలను?",
        hi: "नमस्ते! मैं रक्षा हूं, आपकी इमरजेंसी मेडिकल असिस्टेंट। राक्षा असिस्ट के बारे में कुछ जानना चाहते हैं? मैं आपकी कैसे मदद कर सकती हूं?",
        en: "Hello! I'm Raksha, your emergency medical assistant. Would you like to know about Raksha Assist plans? How can I help you today?",
        ta: "வணக்கம்! நான் ரக்ஷா, உங்கள் அவசர மருத்துவ உதவியாளர். ராக்ஷா அசிஸ்ட் பற்றி தெரிந்துகொள்ள விரும்புகிறீர்களா?",
        kn: "ನಮಸ್ಕಾರ! ನಾನು ರಕ್ಷಾ, ನಿಮ್ಮ ತುರ್ತು ವೈದ್ಯಕೀಯ ಸಹಾಯಕ. ರಕ್ಷಾ ಅಸಿಸ್ಟ್ ಬಗ್ಗೆ ತಿಳಿಯಲು ಬಯಸುವಿರಾ?",
        ml: "നമസ്കാരം! ഞാൻ രക്ഷ, നിങ്ങളുടെ എമർജൻസി മെഡിക്കൽ അസിസ്റ്റന്റ്. രക്ഷ അസിസ്റ്റിനെക്കുറിച്ച് അറിയാൻ ആഗ്രഹിക്കുന്നുവോ?",
        mr: "नमस्कार! मी रक्षा, तुमची इमर्जन्सी मेडिकल असिस्टंट. राक्षा असिस्ट बद्दल जाणून घ्यायचे आहे का?",
        bn: "নমস্কার! আমি রক্ষা, আপনার ইমার্জেন্সি মেডিকেল অ্যাসিস্ট্যান্ট। রক্ষা অ্যাসিস্ট সম্পর্কে জানতে চান?",
        gu: "નમસ્તે! હું રક્ષા છું, તમારી ઇમરજન્સી મેડિકલ આસિસ્ટન્ટ. રક્ષા એસિસ્ટ વિશે જાણવા માંગો છો?"
      };
      
      const welcomeText = welcomeMessages[langCode] || welcomeMessages.en;
      const welcomeMessage: Message = { role: "assistant", content: welcomeText };
      setMessages([welcomeMessage]);
      speak(welcomeText);
    } catch (error) {
      console.error("Error starting conversation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;
    
    const userMessage: Message = { role: "user", content: inputText };
    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);
    
    try {
      // Use our Voice API chat endpoint
      const langCode = language.split('-')[0]; // Convert "te-IN" to "te"
      const res = await fetchWithCsrf("/api/voice/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: inputText,
          language: langCode,
          conversationHistory: messages
        })
      });
      
      if (!res.ok) throw new Error("Failed to get response");
      
      const data = await res.json();
      const assistantMessage: Message = { role: "assistant", content: data.response };
      setMessages(prev => [...prev, assistantMessage]);
      speak(data.response);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = { 
        role: "assistant", 
        content: language.startsWith("te") 
          ? "క్షమించండి, సమస్య వచ్చింది. మళ్ళీ ప్రయత్నించండి."
          : language.startsWith("hi")
          ? "क्षमा करें, कोई समस्या हुई। कृपया पुनः प्रयास करें।"
          : "Sorry, there was an issue. Please try again."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleClose = () => {
    stopSpeaking();
    onClose?.();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm">
      <Card className="shadow-xl border border-primary/20 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary to-secondary text-white py-2.5 px-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/20 rounded-full">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm">Raksha Assistant</CardTitle>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20 h-7 w-7"
                onClick={() => setVoiceEnabled(!voiceEnabled)}
              >
                {voiceEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20 h-7 w-7"
                onClick={handleClose}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {!hasStarted ? (
            <div className="p-4 space-y-3">
              <div className="text-center space-y-1">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-base">Welcome!</h3>
                <p className="text-xs text-muted-foreground">
                  I'll help you find the perfect emergency plan.
                </p>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-medium flex items-center gap-1.5">
                  <Languages className="h-3.5 w-3.5" />
                  Language
                </label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <span className="flex items-center gap-2 text-sm">
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                className="w-full" 
                size="sm"
                onClick={startConversation}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Phone className="h-3.5 w-3.5 mr-1.5" />
                )}
                Start
              </Button>
            </div>
          ) : (
            <>
              <div className="h-56 overflow-y-auto p-3 space-y-2 bg-slate-50">
                {messages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex items-start gap-2 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                      <div className={`p-1.5 rounded-full ${msg.role === "user" ? "bg-primary" : "bg-secondary"}`}>
                        {msg.role === "user" ? (
                          <User className="h-3 w-3 text-white" />
                        ) : (
                          <Bot className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <div 
                        className={`p-3 rounded-2xl text-sm ${
                          msg.role === "user" 
                            ? "bg-primary text-white rounded-tr-sm" 
                            : "bg-white shadow-sm rounded-tl-sm"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 bg-white p-3 rounded-2xl shadow-sm">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">Typing...</span>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
              
              {isSpeaking && (
                <div className="px-4 py-2 bg-secondary/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-1 h-3 bg-secondary rounded-full animate-pulse" />
                      <span className="w-1 h-4 bg-secondary rounded-full animate-pulse delay-75" />
                      <span className="w-1 h-2 bg-secondary rounded-full animate-pulse delay-150" />
                    </div>
                    <span className="text-xs text-secondary font-medium">Speaking...</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={stopSpeaking}>
                    Stop
                  </Button>
                </div>
              )}
              
              <div className="p-3 border-t bg-white">
                <div className="flex gap-2">
                  <Button
                    variant={isListening ? "destructive" : "outline"}
                    size="icon"
                    onClick={toggleListening}
                    className="shrink-0"
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={isListening ? "Listening..." : "Type or speak your question..."}
                    disabled={isLoading || isListening}
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    onClick={sendMessage}
                    disabled={!inputText.trim() || isLoading}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex justify-center mt-2">
                  <Badge variant="outline" className="text-xs">
                    {LANGUAGES.find(l => l.code === language)?.name}
                  </Badge>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface VoiceAssistantTriggerProps {
  autoStart?: boolean;
}

export function VoiceAssistantTrigger({ autoStart = false }: VoiceAssistantTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);
  const [showPulse, setShowPulse] = useState(true);

  useEffect(() => {
    if (autoStart && !hasAutoStarted) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setHasAutoStarted(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [autoStart, hasAutoStarted]);

  useEffect(() => {
    const pulseTimer = setInterval(() => {
      setShowPulse(prev => !prev);
    }, 3000);
    return () => clearInterval(pulseTimer);
  }, []);

  return (
    <>
      {!isOpen && (
        <div className="fixed bottom-4 left-4 z-50 flex flex-col items-start gap-1">
          <button
            onClick={() => setIsOpen(true)}
            className="relative p-2.5 bg-gradient-to-br from-primary via-primary to-secondary text-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 group"
          >
            {showPulse && (
              <span className="absolute inset-0 rounded-xl bg-primary/20 animate-pulse" />
            )}
            <div className="relative flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold">Raksha</p>
              </div>
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white animate-pulse" />
          </button>
        </div>
      )}
      
      {isOpen && <VoiceAssistant onClose={() => setIsOpen(false)} />}
    </>
  );
}
