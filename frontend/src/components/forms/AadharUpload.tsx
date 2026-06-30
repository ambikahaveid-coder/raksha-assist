import { useState, useRef } from "react";
import { fetchWithCsrf } from "@/lib/csrf";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, CheckCircle, AlertCircle, X, FileImage, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AadharUploadProps {
  aadharNumber?: string;
  aadharFrontUrl?: string;
  aadharBackUrl?: string;
  aadharVerified?: boolean;
  onUploadComplete?: () => void;
}

export function AadharUpload({ 
  aadharNumber: initialAadhar,
  aadharFrontUrl: initialFront,
  aadharBackUrl: initialBack,
  aadharVerified,
  onUploadComplete 
}: AadharUploadProps) {
  const { toast } = useToast();
  const [aadharNumber, setAadharNumber] = useState(initialAadhar || "");
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(initialFront || null);
  const [backPreview, setBackPreview] = useState<string | null>(initialBack || null);
  const [uploading, setUploading] = useState(false);
  const [autoVerifying, setAutoVerifying] = useState(false);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const handleAutoVerify = async () => {
    setAutoVerifying(true);
    try {
      const res = await fetchWithCsrf("/api/user/aadhar/auto-verify", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Verification Failed", description: data.error || data.message, variant: "destructive" });
      } else {
        toast({ title: "Verified!", description: "Your Aadhar has been verified successfully" });
        onUploadComplete?.();
      }
    } catch (error) {
      toast({ title: "Error", description: "Auto-verification failed", variant: "destructive" });
    } finally {
      setAutoVerifying(false);
    }
  };

  const formatAadhar = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 12);
    const parts = [];
    for (let i = 0; i < digits.length; i += 4) {
      parts.push(digits.slice(i, i + 4));
    }
    return parts.join(" ");
  };

  const handleAadharChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAadharNumber(formatAadhar(e.target.value));
  };

  const handleFileSelect = (type: "front" | "back", file: File | null) => {
    if (!file) return;
    
    if (!file.type.startsWith("image/")) {
      toast({ title: "Error", description: "Please upload an image file", variant: "destructive" });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Error", description: "File size must be less than 5MB", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (type === "front") {
        setFrontFile(file);
        setFrontPreview(e.target?.result as string);
      } else {
        setBackFile(file);
        setBackPreview(e.target?.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeFile = (type: "front" | "back") => {
    if (type === "front") {
      setFrontFile(null);
      setFrontPreview(initialFront || null);
      if (frontInputRef.current) frontInputRef.current.value = "";
    } else {
      setBackFile(null);
      setBackPreview(initialBack || null);
      if (backInputRef.current) backInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    const cleanAadhar = aadharNumber.replace(/\s/g, "");
    if (cleanAadhar.length !== 12) {
      toast({ title: "Error", description: "Please enter a valid 12-digit Aadhar number", variant: "destructive" });
      return;
    }

    if (!frontFile && !initialFront) {
      toast({ title: "Error", description: "Please upload front side of Aadhar", variant: "destructive" });
      return;
    }

    if (!backFile && !initialBack) {
      toast({ title: "Error", description: "Please upload back side of Aadhar", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      let frontUrl = initialFront;
      let backUrl = initialBack;

      if (frontFile || backFile) {
        const formData = new FormData();
        if (frontFile) formData.append("front", frontFile);
        if (backFile) formData.append("back", backFile);

        const uploadRes = await fetchWithCsrf("/api/upload/aadhar", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("Upload failed");
        const uploadData = await uploadRes.json();
        if (uploadData.frontUrl) frontUrl = uploadData.frontUrl;
        if (uploadData.backUrl) backUrl = uploadData.backUrl;
      }

      const updateRes = await fetchWithCsrf("/api/user/aadhar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aadhar: cleanAadhar,
          aadharFrontUrl: frontUrl,
          aadharBackUrl: backUrl
        }),
      });

      if (!updateRes.ok) throw new Error("Failed to save Aadhar details");

      toast({ title: "Success", description: "Aadhar details saved successfully" });
      onUploadComplete?.();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save Aadhar details", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const isComplete = aadharNumber.replace(/\s/g, "").length === 12 && 
    (frontFile || initialFront) && 
    (backFile || initialBack);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileImage className="h-5 w-5" />
              Aadhar Verification
            </CardTitle>
            <CardDescription>Upload your Aadhar card for identity verification</CardDescription>
          </div>
          {aadharVerified ? (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          ) : (initialFront && initialBack) ? (
            <Badge className="bg-yellow-100 text-yellow-800">
              <AlertCircle className="h-3 w-3 mr-1" />
              Pending Verification
            </Badge>
          ) : (
            <Badge variant="secondary">
              Not Uploaded
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="aadhar">Aadhar Number *</Label>
          <Input
            id="aadhar"
            value={aadharNumber}
            onChange={handleAadharChange}
            placeholder="XXXX XXXX XXXX"
            maxLength={14}
            className="font-mono text-lg tracking-wider"
          />
          <p className="text-xs text-muted-foreground mt-1">Enter 12-digit Aadhar number</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Front Side *</Label>
            <div 
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                frontPreview ? "border-green-300 bg-green-50" : "border-gray-300 hover:border-primary"
              }`}
              onClick={() => frontInputRef.current?.click()}
            >
              <input
                ref={frontInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileSelect("front", e.target.files?.[0] || null)}
              />
              {frontPreview ? (
                <div className="relative">
                  <img src={frontPreview} alt="Front" className="max-h-32 mx-auto rounded" />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-0 right-0 h-6 w-6 p-0"
                    onClick={(e) => { e.stopPropagation(); removeFile("front"); }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="py-4">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Click to upload front side</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <Label>Back Side *</Label>
            <div 
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                backPreview ? "border-green-300 bg-green-50" : "border-gray-300 hover:border-primary"
              }`}
              onClick={() => backInputRef.current?.click()}
            >
              <input
                ref={backInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileSelect("back", e.target.files?.[0] || null)}
              />
              {backPreview ? (
                <div className="relative">
                  <img src={backPreview} alt="Back" className="max-h-32 mx-auto rounded" />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-0 right-0 h-6 w-6 p-0"
                    onClick={(e) => { e.stopPropagation(); removeFile("back"); }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="py-4">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Click to upload back side</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
          <p className="text-amber-800">
            <AlertCircle className="h-4 w-4 inline mr-1" />
            <strong>Note:</strong> Aadhar verification is mandatory for membership activation.
          </p>
        </div>

        <div className="flex gap-3">
          <Button 
            className="flex-1" 
            onClick={handleSubmit} 
            disabled={!isComplete || uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Save Aadhar Details
              </>
            )}
          </Button>
          
          {(initialFront && initialBack && !aadharVerified) && (
            <Button 
              variant="outline"
              className="flex-1"
              onClick={handleAutoVerify}
              disabled={uploading || autoVerifying}
            >
              {autoVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Auto Verify
                </>
              )}
            </Button>
          )}
        </div>

        {(initialFront && initialBack && !aadharVerified) && (
          <p className="text-xs text-center text-muted-foreground">
            Auto-verify uses Verhoeff algorithm to validate your Aadhar number instantly. Or wait for manual verification (24 hours).
          </p>
        )}
      </CardContent>
    </Card>
  );
}
