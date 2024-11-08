"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

interface TitleGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTitleSelect: (title: string) => void;
}

export function TitleGeneratorModal({ isOpen, onClose, onTitleSelect }: TitleGeneratorModalProps) {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const generateTitles = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/generate-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await response.json();
      setGeneratedTitles(data.titles);
    } catch (error) {
      console.error("Error generating titles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTitleSelect = async (title: string) => {
    try {
      setCreating(true);
      const response = await fetch("/api/articles/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        throw new Error("Failed to create article");
      }

      onTitleSelect(title);
      router.refresh();
    } catch (error) {
      console.error("Error creating article:", error);
    } finally {
      setCreating(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black/95 border-white/10 backdrop-blur">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white">Generate Article Title</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="text-white/70 hover:text-white"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="text-white/70">
            Enter a topic to generate engaging article titles.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Digital Marketing"
              className="h-12 bg-black/50 text-white border-white/10"
            />
            <Button
              onClick={generateTitles}
              disabled={!topic || loading}
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? "Generating..." : "Generate Titles"}
            </Button>
          </div>

          {generatedTitles.length > 0 && (
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-medium text-white">Select a title to use:</h3>
              {generatedTitles.map((title, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-white/10 p-4 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => handleTitleSelect(title)}
                >
                  <p className="text-white">{title}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
