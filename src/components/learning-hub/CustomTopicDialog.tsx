import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Lightbulb } from "lucide-react";

interface CustomTopicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (topic: string) => void;
}

const suggestedTopics = [
  "Arduino PWM Motor Control",
  "Designing Low-Pass Filters",
  "I2C Protocol Deep Dive",
  "Battery Management Systems",
  "FPGA vs Microcontroller",
  "PID Controller Tuning",
];

export function CustomTopicDialog({ open, onOpenChange, onSubmit }: CustomTopicDialogProps) {
  const [topic, setTopic] = useState("");

  const handleSubmit = () => {
    if (topic.trim()) {
      onSubmit(topic.trim());
      setTopic("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Learn a Custom Topic</DialogTitle>
          <DialogDescription>
            Enter any engineering topic you want to learn about. Our AI will generate a comprehensive lesson.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Textarea
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., How to design a 5V to 3.3V level shifter circuit"
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-muted-foreground">
              <Lightbulb className="h-4 w-4" />
              Suggested Topics
            </Label>
            <div className="flex flex-wrap gap-2">
              {suggestedTopics.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  onClick={() => setTopic(suggestion)}
                  className="text-xs"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!topic.trim()}>
            Start Learning
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
