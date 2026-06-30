import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Upload, X, Check, RefreshCw, User } from "lucide-react";

interface FaceCaptureProps {
  onCapture: (imageData: string) => void;
  currentImage?: string | null;
}

export function FaceCapture({ onCapture, currentImage }: FaceCaptureProps) {
  const [mode, setMode] = useState<"idle" | "camera" | "preview">("idle");
  const [capturedImage, setCapturedImage] = useState<string | null>(currentImage || null);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [facePosition, setFacePosition] = useState<"center" | "left" | "right" | "up" | "down" | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setMode("camera");
      startFaceDetection();
    } catch (err) {
      console.error("Camera error:", err);
      setError("Could not access camera. Please check permissions.");
    }
  }, []);

  const startFaceDetection = () => {
    let consecutiveDetections = 0;
    const requiredDetections = 15;
    
    detectionIntervalRef.current = setInterval(() => {
      if (!videoRef.current || !canvasRef.current) return;
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const faceResult = detectFaceRegion(imageData, canvas.width, canvas.height);
      
      if (faceResult.detected) {
        setIsFaceDetected(true);
        setFacePosition(faceResult.position);
        
        if (faceResult.position === "center") {
          consecutiveDetections++;
          if (consecutiveDetections >= requiredDetections) {
            setCountdown(3);
            setTimeout(() => setCountdown(2), 1000);
            setTimeout(() => setCountdown(1), 2000);
            setTimeout(() => {
              capturePhoto();
            }, 3000);
            if (detectionIntervalRef.current) {
              clearInterval(detectionIntervalRef.current);
            }
          }
        } else {
          consecutiveDetections = Math.max(0, consecutiveDetections - 2);
        }
      } else {
        setIsFaceDetected(false);
        setFacePosition(null);
        consecutiveDetections = 0;
      }
    }, 100);
  };

  const detectFaceRegion = (imageData: ImageData, width: number, height: number) => {
    const data = imageData.data;
    const centerX = width / 2;
    const centerY = height / 2;
    const targetRadius = Math.min(width, height) * 0.25;
    
    let skinPixels = 0;
    let totalSkinX = 0;
    let totalSkinY = 0;
    let skinCount = 0;
    
    const sampleStep = 4;
    
    for (let y = 0; y < height; y += sampleStep) {
      for (let x = 0; x < width; x += sampleStep) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        if (isSkinColor(r, g, b)) {
          skinPixels++;
          totalSkinX += x;
          totalSkinY += y;
          skinCount++;
        }
      }
    }
    
    const minSkinPixels = (width * height) / (sampleStep * sampleStep) * 0.05;
    
    if (skinPixels < minSkinPixels) {
      return { detected: false, position: null };
    }
    
    const avgX = totalSkinX / skinCount;
    const avgY = totalSkinY / skinCount;
    
    const offsetX = avgX - centerX;
    const offsetY = avgY - centerY;
    const tolerance = targetRadius * 0.5;
    
    let position: "center" | "left" | "right" | "up" | "down" = "center";
    
    if (Math.abs(offsetX) > tolerance || Math.abs(offsetY) > tolerance) {
      if (Math.abs(offsetX) > Math.abs(offsetY)) {
        position = offsetX < 0 ? "left" : "right";
      } else {
        position = offsetY < 0 ? "up" : "down";
      }
    }
    
    return { detected: true, position };
  };

  const isSkinColor = (r: number, g: number, b: number) => {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    
    return (
      r > 95 && g > 40 && b > 20 &&
      r > g && r > b &&
      max - min > 15 &&
      Math.abs(r - g) > 15
    );
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 400;
    
    const size = Math.min(video.videoWidth, video.videoHeight);
    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;
    
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, size, size, 0, 0, 400, 400);
    ctx.restore();

    const imageData = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedImage(imageData);
    setMode("preview");
    setCountdown(null);
    stopCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const size = Math.min(img.width, img.height);
        canvas.width = 400;
        canvas.height = 400;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        ctx.drawImage(img, sx, sy, size, size, 0, 0, 400, 400);
        
        const imageData = canvas.toDataURL("image/jpeg", 0.9);
        setCapturedImage(imageData);
        setMode("preview");
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const confirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      setMode("idle");
    }
  };

  const retake = () => {
    setCapturedImage(null);
    setCountdown(null);
    startCamera();
  };

  const cancel = () => {
    stopCamera();
    setCapturedImage(currentImage || null);
    setMode("idle");
    setCountdown(null);
    setError(null);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const getPositionGuide = () => {
    if (!isFaceDetected) return "Position your face in the frame";
    switch (facePosition) {
      case "left": return "Move slightly right →";
      case "right": return "← Move slightly left";
      case "up": return "Move down ↓";
      case "down": return "Move up ↑";
      case "center": return "Perfect! Hold still...";
      default: return "Position your face in the frame";
    }
  };

  return (
    <div className="space-y-4">
      {mode === "idle" && (
        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-32 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
            {capturedImage ? (
              <img src={capturedImage} alt="Profile" className="w-full h-full object-cover" data-testid="preview-photo" />
            ) : (
              <User className="w-12 h-12 text-slate-400" />
            )}
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={startCamera} 
              variant="outline" 
              className="gap-2"
              data-testid="button-open-camera"
            >
              <Camera className="w-4 h-4" /> Open Camera
            </Button>
            
            <label>
              <Button variant="outline" className="gap-2" asChild>
                <span>
                  <Upload className="w-4 h-4" /> Upload Photo
                </span>
              </Button>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileUpload}
                data-testid="input-file-upload"
              />
            </label>
          </div>
          
          {error && (
            <p className="text-sm text-red-500" data-testid="error-message">{error}</p>
          )}
        </div>
      )}

      {mode === "camera" && (
        <Card className="overflow-hidden">
          <CardContent className="p-0 relative">
            <div className="relative aspect-square max-w-md mx-auto bg-black">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover transform scale-x-[-1]"
                data-testid="video-preview"
              />
              
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className={`w-48 h-48 md:w-64 md:h-64 rounded-full border-4 ${
                  isFaceDetected 
                    ? facePosition === "center" 
                      ? "border-green-500" 
                      : "border-yellow-500"
                    : "border-white/50"
                }`} />
              </div>
              
              {countdown !== null && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <span className="text-6xl font-bold text-white animate-pulse" data-testid="countdown">
                    {countdown}
                  </span>
                </div>
              )}
              
              <div className={`absolute bottom-4 left-0 right-0 text-center py-2 px-4 mx-4 rounded-lg ${
                isFaceDetected 
                  ? facePosition === "center"
                    ? "bg-green-500/90 text-white"
                    : "bg-yellow-500/90 text-black"
                  : "bg-black/60 text-white"
              }`}>
                <p className="text-sm font-medium" data-testid="position-guide">{getPositionGuide()}</p>
              </div>
            </div>
            
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="p-4 flex justify-center gap-3">
              <Button 
                variant="outline" 
                onClick={cancel}
                data-testid="button-cancel-camera"
              >
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
              <Button 
                onClick={capturePhoto}
                disabled={!isFaceDetected}
                data-testid="button-manual-capture"
              >
                <Camera className="w-4 h-4 mr-2" /> Capture Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {mode === "preview" && capturedImage && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col items-center gap-4">
              <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-primary">
                <img 
                  src={capturedImage} 
                  alt="Captured" 
                  className="w-full h-full object-cover"
                  data-testid="captured-photo"
                />
              </div>
              
              <p className="text-sm text-muted-foreground">Does this photo look good?</p>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={retake}
                  data-testid="button-retake"
                >
                  <RefreshCw className="w-4 h-4 mr-2" /> Retake
                </Button>
                <Button 
                  onClick={confirmPhoto}
                  data-testid="button-confirm-photo"
                >
                  <Check className="w-4 h-4 mr-2" /> Use This Photo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
