import { useState, useRef, useEffect } from "react";
import { fetchWithCsrf } from "@/lib/csrf";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, MessageSquare, X, Send, Mail, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

import logoImg from "@/assets/logo.png";

interface ChatMessage {
  id: string;
  senderType: string;
  senderName: string;
  message: string;
  createdAt: string;
}

export function SupportWidget() {
  const [showOptions, setShowOptions] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const { toast } = useToast();

  // Auto-open options after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowOptions(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleCallSupport = () => {
    window.location.href = "tel:+918143752025";
  };

  const handleEmailSupport = () => {
    window.location.href = "mailto:support@rakshaassist.com?subject=Support%20Request";
  };

  return (
    <>
      {/* Main Options Panel */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end">
        <AnimatePresence>
          {showOptions && !isChatOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="mb-2"
            >
              <Card className="p-4 bg-white shadow-2xl rounded-2xl border-none">
                <p className="text-center text-sm text-slate-600 mb-3">Our support team is here to help 24/7</p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    className="flex-1 h-12 rounded-xl border-2 hover:bg-green-50 hover:border-green-500"
                    onClick={handleCallSupport}
                  >
                    <Phone className="h-4 w-4 mr-2 text-green-600" />
                    <span className="text-sm">Call Support</span>
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1 h-12 rounded-xl border-2 hover:bg-blue-50 hover:border-blue-500"
                    onClick={() => { setIsChatOpen(true); setShowOptions(false); }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2 text-blue-600" />
                    <span className="text-sm">Live Chat</span>
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1 h-12 rounded-xl border-2 hover:bg-purple-50 hover:border-purple-500"
                    onClick={handleEmailSupport}
                  >
                    <Mail className="h-4 w-4 mr-2 text-purple-600" />
                    <span className="text-sm">Email Us</span>
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {isChatOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="mb-2"
            >
              <LiveChatInterface 
                onClose={() => { setIsChatOpen(false); setShowOptions(true); }}
                chatId={chatId}
                setChatId={setChatId}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Raksha Bot Button */}
        <Button
          className={`h-14 px-5 rounded-full shadow-2xl flex items-center gap-2 transition-all ${
            isChatOpen ? 'bg-slate-800 hover:bg-slate-700' : 'bg-primary hover:bg-primary/90'
          }`}
          onClick={() => {
            if (isChatOpen) {
              setIsChatOpen(false);
              setShowOptions(true);
            } else {
              setShowOptions(!showOptions);
            }
          }}
        >
          {isChatOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <>
              <img src={logoImg} alt="Raksha" className="h-8 w-8 rounded-full bg-white p-0.5" />
              <span className="font-bold text-white">Raksha</span>
            </>
          )}
        </Button>
      </div>

      {/* Left side - Phone number */}
      <div className="fixed bottom-6 left-6 z-40 hidden md:flex items-center gap-2">
        <Button
          className="h-12 px-4 rounded-full shadow-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center gap-2"
          onClick={() => { setShowOptions(false); setIsChatOpen(true); }}
        >
          <img src={logoImg} alt="Raksha" className="h-7 w-7" />
          <span className="font-bold text-primary text-sm">Raksha</span>
        </Button>
        <div className="bg-white/90 backdrop-blur border border-slate-200 shadow-lg px-4 py-2 rounded-full flex items-center gap-2">
          <Phone className="h-4 w-4 text-green-600" />
          <span className="font-mono font-bold text-slate-900 text-sm">+91 81437 52025</span>
        </div>
      </div>
    </>
  );
}

function LiveChatInterface({ onClose, chatId, setChatId }: { 
  onClose: () => void;
  chatId: string | null;
  setChatId: (id: string | null) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [userMobile, setUserMobile] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [step, setStep] = useState<"info" | "chat">(chatId ? "chat" : "info");
  const [waitingForAgent, setWaitingForAgent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Poll for new messages
  useEffect(() => {
    if (!chatId || step !== "chat") return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/support/chat/${chatId}/messages`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
          
          // Check if agent joined
          const hasAgentMessage = data.messages?.some((m: ChatMessage) => m.senderType === "agent" || m.senderType === "system");
          if (hasAgentMessage) {
            setWaitingForAgent(false);
          }
          
          // Check if chat is closed
          if (data.chat?.status === "closed") {
            toast({ title: "Chat ended", description: "This chat session has been closed." });
          }
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [chatId, step]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startChat = async () => {
    if (!userName.trim()) {
      toast({ title: "Name required", description: "Please enter your name", variant: "destructive" });
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetchWithCsrf("/api/support/chat/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userName,
          mobile: userMobile,
          email: userEmail,
          subject: "Live Chat Support",
          message: "Hello, I need help."
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setChatId(data.chatId);
        setStep("chat");
        setWaitingForAgent(true);
        setMessages([{
          id: "1",
          senderType: "customer",
          senderName: userName,
          message: "Hello, I need help.",
          createdAt: new Date().toISOString()
        }]);
      } else {
        toast({ title: "Error", description: "Failed to start chat", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Connection failed", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !chatId || isLoading) return;
    
    const messageText = input.trim();
    setInput("");
    
    // Optimistic update
    const tempMessage: ChatMessage = {
      id: Date.now().toString(),
      senderType: "customer",
      senderName: userName,
      message: messageText,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMessage]);
    
    try {
      await fetchWithCsrf(`/api/support/chat/${chatId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          senderName: userName,
          senderType: "customer"
        })
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (step === "info") {
    return (
      <Card className="w-80 bg-white border-slate-200 shadow-2xl flex flex-col overflow-hidden rounded-2xl">
        <div className="p-4 bg-gradient-to-r from-primary to-primary/80 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white p-1 shadow-md">
              <img src={logoImg} alt="Raksha Bot" className="h-full w-full object-contain" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Live Support</h4>
              <p className="text-[10px] opacity-90 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Agents Online
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10 rounded-full" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-sm text-slate-600 text-center">Connect with our support team. Please provide your details:</p>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-700">Your Name *</label>
              <Input 
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700">Mobile Number</label>
              <Input 
                value={userMobile}
                onChange={(e) => setUserMobile(e.target.value)}
                placeholder="+91 98765 43210"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700">Email (optional)</label>
              <Input 
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="you@email.com"
                className="mt-1"
              />
            </div>
          </div>
          
          <Button 
            className="w-full h-12 rounded-xl"
            onClick={startChat}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MessageSquare className="h-4 w-4 mr-2" />}
            Start Live Chat
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-80 h-[450px] bg-white border-slate-200 shadow-2xl flex flex-col overflow-hidden rounded-2xl">
      <div className="p-4 bg-gradient-to-r from-primary to-primary/80 text-white flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-white p-1 shadow-md">
            <img src={logoImg} alt="Raksha Bot" className="h-full w-full object-contain" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Live Support</h4>
            <p className="text-[10px] opacity-90 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> 
              {waitingForAgent ? "Connecting to agent..." : "Connected"}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10 rounded-full" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
        {waitingForAgent && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
            <Loader2 className="h-5 w-5 animate-spin mx-auto text-amber-600 mb-2" />
            <p className="text-xs text-amber-800">Please wait while we connect you to an available agent...</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.senderType === 'customer' ? 'justify-end' : 'justify-start'}`}>
            <div className={`
              max-w-[80%] p-3 rounded-2xl text-sm
              ${msg.senderType === 'customer' 
                ? 'bg-primary text-white rounded-br-none' 
                : msg.senderType === 'system'
                  ? 'bg-slate-200 text-slate-600 italic text-xs text-center w-full rounded-lg'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'}
            `}>
              {msg.senderType !== 'customer' && msg.senderType !== 'system' && (
                <p className="text-[10px] font-bold text-primary mb-1">{msg.senderName}</p>
              )}
              {msg.message}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t bg-white">
        <form 
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          className="flex items-center gap-2"
        >
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="rounded-full bg-slate-50 border-slate-200 focus-visible:ring-primary"
          />
          <Button type="submit" size="icon" className="rounded-full h-10 w-10 shrink-0" disabled={!input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
