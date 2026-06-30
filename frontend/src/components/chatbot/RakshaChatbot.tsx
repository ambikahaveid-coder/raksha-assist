import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, X, Loader2, Phone, ShoppingCart, AlertCircle, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { fetchWithCsrf } from "@/lib/csrf";
import logoImg from "@/assets/logo.png";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SESSION_KEY = "raksha_chat_session";

function getOrCreateSessionId(): string {
  let sid = localStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

const QUICK_QUESTIONS = [
  "Plans & pricing?",
  "How does SOS work?",
  "Family plans?",
  "Refund policy?",
  "What's covered?",
  "Why Raksha Assist?",
];

export function RakshaChatbot() {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! 🙏 I'm Raksha Buddy, an AI assistant for Raksha Assist.\n\nI can help you with plans, SOS assistance, refunds, and anything else about your membership. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const [sessionId] = useState(getOrCreateSessionId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!hasAutoOpened && !isAuthenticated) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setHasAutoOpened(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [hasAutoOpened, isAuthenticated]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const resetChat = () => {
    localStorage.removeItem(SESSION_KEY);
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hello! 🙏 I'm Raksha Buddy, an AI assistant for Raksha Assist.\n\nI can help you with plans, SOS assistance, refunds, and anything else about your membership. What would you like to know?",
      },
    ]);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const conversationHistory = messages
      .filter((m) => m.id !== "welcome")
      .map((m) => ({ role: m.role, content: m.content }));

    const assistantId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "" },
    ]);

    try {
      const res = await fetchWithCsrf("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          sessionId,
          conversationHistory,
        }),
      });

      if (!res.ok) throw new Error("Failed to get response");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              fullContent += data.content;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: fullContent } : m
                )
              );
            }
          } catch {}
        }
      }

      if (!fullContent) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: "Sorry, I couldn't respond right now. Please call +91 81437 52025." }
              : m
          )
        );
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "Connection issue. Please try again or call +91 81437 52025." }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const showQuickButtons = messages.length <= 1 && !isLoading;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-3 z-50 w-[330px] max-w-[calc(100vw-1.5rem)]"
          >
            <Card className="overflow-hidden shadow-2xl border-0 rounded-2xl">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#0B1F3A] to-[#179299] px-3 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-white p-0.5 shadow-md flex-shrink-0">
                    <img src={logoImg} alt="Raksha" className="h-full w-full object-contain rounded-full" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-xs leading-tight">Raksha Buddy</h4>
                    <p className="text-[9px] text-white/80 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                      AI Assistant · Always Online
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  <Button
                    variant="ghost" size="icon"
                    className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/10 rounded-full"
                    title="Call us"
                    onClick={() => (window.location.href = "tel:+918143752025")}
                  >
                    <Phone className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost" size="icon"
                    className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/10 rounded-full"
                    title="New chat"
                    onClick={resetChat}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost" size="icon"
                    className="h-7 w-7 text-white/80 hover:text-white hover:bg-white/10 rounded-full"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="h-[300px] overflow-y-auto p-3 space-y-2.5 bg-gradient-to-b from-slate-50 to-white">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-1.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="h-5 w-5 rounded-full bg-white border border-slate-200 p-0.5 flex-shrink-0 mt-1 shadow-sm">
                        <img src={logoImg} alt="" className="h-full w-full object-contain rounded-full" />
                      </div>
                    )}
                    <div
                      className={`max-w-[82%] px-2.5 py-2 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-[#0B1F3A] text-white rounded-br-sm"
                          : "bg-white border border-slate-100 text-slate-700 rounded-bl-sm shadow-sm"
                      }`}
                    >
                      {msg.role === "assistant" && !msg.content && isLoading ? (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span className="text-[10px]">Typing...</span>
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />

                {/* Quick question buttons */}
                {showQuickButtons && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[10px] text-slate-400 text-center">Quick questions:</p>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {QUICK_QUESTIONS.map((q) => (
                        <button
                          key={q}
                          onClick={() => sendMessage(q)}
                          className="text-[10px] px-2.5 py-1 rounded-full bg-white border border-[#179299]/20 text-[#179299] hover:bg-[#179299]/10 hover:border-[#179299]/40 transition-all shadow-sm"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="px-2.5 pt-2 pb-1 border-t border-slate-100 bg-white flex gap-1.5">
                <a
                  href="/plans"
                  className="flex-1 flex items-center justify-center gap-1 text-[10px] font-semibold bg-[#179299]/10 text-[#179299] border border-[#179299]/20 rounded-xl py-1.5 hover:bg-[#179299]/20 transition-all"
                >
                  <ShoppingCart className="h-3 w-3" /> Buy Plan
                </a>
                <a
                  href="tel:+918143752025"
                  className="flex-1 flex items-center justify-center gap-1 text-[10px] font-semibold bg-red-50 text-red-600 border border-red-100 rounded-xl py-1.5 hover:bg-red-100 transition-all"
                >
                  <AlertCircle className="h-3 w-3" /> Emergency SOS
                </a>
              </div>

              {/* Input */}
              <div className="px-2.5 py-2 bg-white">
                <form
                  onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
                  className="flex items-center gap-1.5"
                >
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask anything about Raksha Assist..."
                    className="rounded-full bg-slate-50 border-slate-200 focus-visible:ring-[#179299] text-xs h-8 px-3"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="rounded-full h-8 w-8 shrink-0 bg-[#0B1F3A] hover:bg-[#0B1F3A]/90"
                    disabled={!input.trim() || isLoading}
                  >
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </form>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <div className="fixed bottom-4 right-3 z-50">
        <button
          className={`group relative h-12 w-12 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-105 ${
            isOpen ? "bg-slate-700 hover:bg-slate-600" : "bg-gradient-to-br from-[#0B1F3A] to-[#179299] hover:shadow-2xl"
          }`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <X className="h-5 w-5 text-white" />
          ) : (
            <img src={logoImg} alt="Chat" className="h-8 w-8 rounded-full object-contain" />
          )}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
          )}
        </button>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute bottom-1 right-14 whitespace-nowrap bg-white border border-slate-200 text-slate-700 text-[10px] font-medium px-2.5 py-1 rounded-full shadow-md pointer-events-none"
          >
            Chat with us · AI Powered
          </motion.div>
        )}
      </div>

      {/* Phone floating */}
      <div className="fixed bottom-4 left-3 z-40 hidden md:flex items-center">
        <a
          href="tel:+918143752025"
          className="bg-white/90 backdrop-blur border border-slate-200 shadow-md px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:shadow-lg transition-shadow"
        >
          <Phone className="h-3 w-3 text-green-600" />
          <span className="font-mono font-bold text-slate-800 text-xs">+91 81437 52025</span>
        </a>
      </div>
    </>
  );
}
