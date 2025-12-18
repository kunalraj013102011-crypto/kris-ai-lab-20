import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Download, Loader2, Sparkles, RefreshCw, Image as ImageIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { generatePollinationsImageUrl, downloadImage } from "@/lib/pollinations";

interface ImageGeneratorProps {
  onImageGenerated?: (imageUrl: string) => void;
  compact?: boolean;
}

export const ImageGenerator = ({ onImageGenerated, compact = false }: ImageGeneratorProps) => {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(512);
  const [seed, setSeed] = useState<number | undefined>(undefined);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Empty Prompt",
        description: "Please enter a description for your image",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Generate new seed for unique images each time (unless fixed)
      const generatedUrl = generatePollinationsImageUrl(prompt, {
        width,
        height,
        seed: seed ?? Math.floor(Math.random() * 1000000),
        nologo: true,
      });
      
      setImageUrl(generatedUrl);
      onImageGenerated?.(generatedUrl);
      
      toast({
        title: "Image Generated",
        description: "Your image is being created!",
      });
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!imageUrl) return;
    
    try {
      await downloadImage(imageUrl, `kris-image-${Date.now()}.png`);
      toast({
        title: "Download Started",
        description: "Your image is being downloaded",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download the image",
        variant: "destructive",
      });
    }
  };

  const handleRegenerate = () => {
    setSeed(Math.floor(Math.random() * 1000000));
    handleGenerate();
  };

  if (compact) {
    return (
      <div className="space-y-4">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want to create..."
          className="min-h-[80px] bg-background/50 border-primary/20"
        />
        <div className="flex gap-2">
          <Button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="flex-1"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Generate
          </Button>
          {imageUrl && (
            <Button variant="outline" onClick={handleDownload}>
              <Download className="w-4 h-4" />
            </Button>
          )}
        </div>
        {imageUrl && (
          <div className="relative rounded-lg overflow-hidden border border-primary/20">
            <img
              src={imageUrl}
              alt="Generated"
              className="w-full h-auto"
              onLoad={() => setIsLoading(false)}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <ImageIcon className="w-5 h-5" />
          AI Image Generator
        </CardTitle>
        <CardDescription>
          Generate images using AI - Free, no API key required
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Prompt Input */}
        <div className="space-y-2">
          <Label>Prompt</Label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A futuristic robot in a neon-lit laboratory, digital art, high detail..."
            className="min-h-[100px] bg-background/50 border-primary/20"
          />
        </div>

        {/* Size Controls */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Width: {width}px</Label>
            <Slider
              value={[width]}
              onValueChange={(v) => setWidth(v[0])}
              min={256}
              max={1024}
              step={64}
            />
          </div>
          <div className="space-y-2">
            <Label>Height: {height}px</Label>
            <Slider
              value={[height]}
              onValueChange={(v) => setHeight(v[0])}
              min={256}
              max={1024}
              step={64}
            />
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex gap-2">
          <Button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Image
              </>
            )}
          </Button>
          {imageUrl && (
            <>
              <Button variant="outline" onClick={handleRegenerate} title="Regenerate with new seed">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={handleDownload} title="Download image">
                <Download className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>

        {/* Image Preview */}
        {imageUrl && (
          <div className="relative rounded-lg overflow-hidden border border-primary/20">
            {isLoading && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
            <img
              src={imageUrl}
              alt="Generated"
              className="w-full h-auto"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                toast({
                  title: "Image Load Error",
                  description: "Failed to load generated image",
                  variant: "destructive",
                });
              }}
            />
            <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm rounded px-2 py-1 text-xs text-muted-foreground">
              {width} × {height}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
