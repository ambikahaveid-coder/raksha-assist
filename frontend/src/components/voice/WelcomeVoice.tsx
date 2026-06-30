import { useEffect, useState, useRef } from "react";
import { Volume2, VolumeX, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeVoiceProps {
  onComplete?: () => void;
}

export function WelcomeVoice({ onComplete }: WelcomeVoiceProps) {
  const [hasPlayed, setHasPlayed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const welcomeMessages = {
    english: "Welcome to Raksha Assist! It's Your Life Assist. We provide direct hospital payment within 24 hours during emergencies. Join 10,000 plus families who are already protected. Just 3 rupees a day for complete peace of mind!",
    telugu: "Raksha Assist ki welcome! It's Your Life Assist. Emergency lo hospital ki direct payment chestam, 24 hours lo. Already 10,000 families protected. Just 3 rupees per day - coffee price ke complete protection!"
  };

  useEffect(() => {
    const hasPlayedBefore = sessionStorage.getItem("welcomeVoicePlayed");
    if (hasPlayedBefore) {
      setHasPlayed(true);
      return;
    }

    synthRef.current = window.speechSynthesis;
    
    const timer = setTimeout(() => {
      setShowBanner(true);
    }, 1500);

    return () => {
      clearTimeout(timer);
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const playWelcomeMessage = () => {
    if (!synthRef.current || hasPlayed) return;

    const message = welcomeMessages.english;
    const utterance = new SpeechSynthesisUtterance(message);
    
    utterance.lang = "en-IN";
    utterance.rate = 0.95;
    utterance.pitch = 1.15;
    utterance.volume = 1;

    const voices = synthRef.current.getVoices();
    const femaleVoice = voices.find(v => {
      const isEnglish = v.lang.toLowerCase().includes("en");
      const isFemale = v.name.toLowerCase().includes('female') || 
                       v.name.toLowerCase().includes('woman') ||
                       v.name.toLowerCase().includes('zira') ||
                       v.name.toLowerCase().includes('samantha') ||
                       v.name.toLowerCase().includes('victoria') ||
                       v.name.toLowerCase().includes('karen') ||
                       v.name.toLowerCase().includes('google') && !v.name.toLowerCase().includes('male');
      return isEnglish && isFemale;
    }) || voices.find(v => v.lang.toLowerCase().includes("en") && !v.name.toLowerCase().includes('male'));

    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setHasPlayed(true);
      sessionStorage.setItem("welcomeVoicePlayed", "true");
      setTimeout(() => {
        setShowBanner(false);
        onComplete?.();
      }, 2000);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setHasPlayed(true);
    };

    if (synthRef.current.getVoices().length === 0) {
      synthRef.current.onvoiceschanged = () => {
        synthRef.current?.speak(utterance);
      };
    } else {
      synthRef.current.speak(utterance);
    }
  };

  const toggleMute = () => {
    if (synthRef.current) {
      if (isMuted) {
        playWelcomeMessage();
      } else {
        synthRef.current.cancel();
        setIsPlaying(false);
      }
      setIsMuted(!isMuted);
    }
  };

  const closeBanner = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setShowBanner(false);
    setHasPlayed(true);
    sessionStorage.setItem("welcomeVoicePlayed", "true");
  };

  if (!showBanner || hasPlayed) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="bg-gradient-to-r from-primary via-primary to-secondary text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4">
        <div className="flex items-center gap-3">
          {isPlaying && (
            <div className="flex items-center gap-1">
              <span className="w-1 h-3 bg-white rounded-full animate-pulse" />
              <span className="w-1 h-5 bg-white rounded-full animate-pulse delay-75" />
              <span className="w-1 h-4 bg-white rounded-full animate-pulse delay-150" />
              <span className="w-1 h-3 bg-white rounded-full animate-pulse delay-200" />
            </div>
          )}
          <div className="text-sm font-medium">
            <span className="font-bold">Raksha Assist</span>
            <span className="mx-2">-</span>
            <span className="italic">It's Your Life Assist!</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            className="text-white hover:bg-white/20 p-1.5 h-auto"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={closeBanner}
            className="text-white hover:bg-white/20 p-1.5 h-auto"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
