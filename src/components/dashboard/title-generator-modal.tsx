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
import { X, Minus, Plus } from "lucide-react";

interface TitleGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTitleSelect: (title: string) => void;
  onLimitReached?: () => void;
}

export function TitleGeneratorModal({
  isOpen,
  onClose,
  onTitleSelect,
  onLimitReached,
}: TitleGeneratorModalProps) {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [titleCount, setTitleCount] = useState(2);
  const [loading, setLoading] = useState(false);
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [selectedTitleIndex, setSelectedTitleIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateTitles = async () => {
    setLoading(true);
    setError(null);
    setGeneratedTitles([]);

    try {
      const response = await fetch("/api/generate-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, count: titleCount }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate titles");
      }

      const data = await response.json();

      if (!data.titles || !Array.isArray(data.titles)) {
        throw new Error("Invalid response format");
      }

      setGeneratedTitles(data.titles);
    } catch (error) {
      console.error("Error generating titles:", error);
      setError(error instanceof Error ? error.message : "Failed to generate titles");
      setGeneratedTitles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTitleSelect = async (title: string, index: number) => {
    try {
      setCreating(true);
      setSelectedTitleIndex(index);
      setError(null);

      // Create the article
      const createResponse = await fetch("/api/articles/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      const data = await createResponse.json();

      if (!createResponse.ok) {
        // Check if it's a limit reached error
        if (createResponse.status === 403 && data.error === "Monthly article limit reached") {
          onLimitReached?.();
          onClose();
          return;
        }
        throw new Error(data.error || "Failed to create article");
      }

      const { articleId } = data;

      // Generate content immediately
      const generateResponse = await fetch("/api/articles/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId }),
      });

      if (!generateResponse.ok) {
        throw new Error("Failed to generate content");
      }

      onTitleSelect(title);
      router.refresh();
    } catch (error) {
      console.error("Error creating article:", error);
      setError(error instanceof Error ? error.message : "Failed to create article");
    } finally {
      setCreating(false);
      setSelectedTitleIndex(null);
      if (!error) {
        onClose();
      }
    }
  };

  const incrementCount = () => {
    setTitleCount((prev) => Math.min(prev + 1, 3));
  };

  const decrementCount = () => {
    setTitleCount((prev) => Math.max(prev - 1, 1));
  };

  const handleClose = () => {
    setTopic("");
    setGeneratedTitles([]);
    setError(null);
    setLoading(false);
    setCreating(false);
    setSelectedTitleIndex(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-black/95 border-white/10 backdrop-blur">
        <button
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-black transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-white/10"
          onClick={handleClose}
        >
          <X className="h-4 w-4 text-white" />
          <span className="sr-only">Close</span>
        </button>

        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white">Generate Article Title</DialogTitle>
          </div>
          <DialogDescription className="text-white/70">
            Enter a topic to generate engaging article titles.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-4">
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Digital Marketing"
              className="h-12 bg-black/50 text-white border-white/10"
            />

            <div className="flex items-center gap-4">
              <label className="text-sm text-white/70">Number of titles:</label>
              <div className="flex items-center gap-2 bg-black/50 rounded-md border border-white/10 p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={decrementCount}
                  disabled={titleCount <= 1 || loading}
                  className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center text-white">{titleCount}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={incrementCount}
                  disabled={titleCount >= 3 || loading}
                  className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button
              onClick={generateTitles}
              disabled={!topic || loading}
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Generating...</span>
                </div>
              ) : (
                `Generate ${titleCount === 1 ? "Heading" : "Headings"}`
              )}
            </Button>
          </div>

          {error && (
            <div className="text-red-400 text-sm p-3 rounded-md bg-red-500/10 border border-red-500/20">
              {error}
            </div>
          )}

          {generatedTitles.length > 0 && (
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-medium text-white">Select a title to use:</h3>
              {generatedTitles.map((title, index) => (
                <div
                  key={index}
                  className={`rounded-lg border border-white/10 p-4 bg-white/5 
                    ${
                      creating && selectedTitleIndex === index ? "opacity-50" : "hover:bg-white/10"
                    } 
                    transition-colors cursor-pointer`}
                  onClick={() => !creating && handleTitleSelect(title, index)}
                >
                  <div className="flex justify-between items-center">
                    <p className="text-white">{title}</p>
                    {creating && selectedTitleIndex === index && (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
