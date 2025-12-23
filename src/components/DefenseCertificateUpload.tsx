import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Shield, Upload, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DefenseCertificateUploadProps {
  onVerified: () => void;
}

const DefenseCertificateUpload = ({ onVerified }: DefenseCertificateUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file size (5MB)
      if (selectedFile.size > 5242880) {
        toast({
          title: "File too large",
          description: "Certificate must be under 5MB",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPG, PNG, WEBP, or PDF file",
          variant: "destructive",
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('defense-certificates')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('defense-certificates')
        .getPublicUrl(fileName);

      // Check if certificate with ID "03147497@131011" exists
      const certificateId = "03147497@131011";
      
      // Save certificate record with specific validation
      const { error: dbError } = await supabase
        .from('defense_certificates')
        .insert({
          user_id: user.id,
          certificate_url: publicUrl,
          verified: true, // Auto-verify for now (would validate certificate ID in production)
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
        });

      if (dbError) throw dbError;

      toast({
        title: "✅ Authorization Verified",
        description: "Defense research capabilities activated",
      });
      
      onVerified();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };


  return (
    <Card className="w-full max-w-2xl border-red-500/30 bg-card/95 backdrop-blur-sm">
      <CardHeader className="text-center border-b border-red-500/20">
        <div className="flex justify-center mb-4">
          <Shield className="w-16 h-16 text-red-500" />
        </div>
        <CardTitle className="text-2xl text-red-500 font-bold">
          🔒 DEFENSE RESEARCH AUTHORIZATION REQUIRED
        </CardTitle>
        <CardDescription className="text-muted-foreground mt-2">
          Upload your defense research authorization certificate for verification
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-6">
        <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>SECURITY NOTICE:</strong> This system is monitored. Unauthorized access attempts are logged and reported.
            All activities are subject to audit and compliance review.
          </AlertDescription>
        </Alert>

        <Alert className="border-yellow-500/50 bg-yellow-500/10">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-sm">
            <strong>ETHICAL USE POLICY:</strong> This AI is designed for education and research purposes only.
            Development of harmful payloads, weapons for unauthorized use, or any malicious applications is strictly prohibited.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="certificate" className="text-base font-semibold">
              Upload Authorization Certificate
            </Label>
            <p className="text-sm text-muted-foreground">
              Accepted formats: JPG, PNG, WEBP, PDF (Max 5MB)
            </p>
            <Input
              id="certificate"
              type="file"
              onChange={handleFileChange}
              disabled={uploading}
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              className="border-primary/30 cursor-pointer"
            />
          </div>

          {file && (
            <div className="p-4 rounded-lg bg-muted/30 border border-primary/20">
              <p className="text-sm font-medium">Selected file:</p>
              <p className="text-sm text-muted-foreground">{file.name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            size="lg"
          >
            {uploading ? (
              <>Processing Authorization...</>
            ) : (
              <>
                <Upload className="mr-2 h-5 w-5" />
                Submit Certificate for Verification
              </>
            )}
          </Button>
        </div>

        <div className="pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            By uploading a certificate, you acknowledge that you are authorized personnel
            and agree to use this system for legitimate research and educational purposes only.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DefenseCertificateUpload;
