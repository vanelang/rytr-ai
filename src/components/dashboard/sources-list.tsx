"use client";
import { ResearchSource } from "@/db/schema";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Globe } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface SourcesListProps {
  sources: ResearchSource[];
}

export function SourcesList({ sources }: SourcesListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // Filter out web sources
  const webSources = sources.filter((source) => source.source === "web");

  if (webSources.length === 0) {
    return null;
  }

  const SourceCard = ({ source }: { source: ResearchSource }) => (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block w-full h-full relative"
    >
      {/* Dark overlay with icon */}
      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <ExternalLink className="h-12 w-12 text-white" />
      </div>

      {/* Content overlay */}
      <div className="absolute inset-0 p-4 flex flex-col">
        <div className="flex items-start gap-2">
          <Globe className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <h4 className="text-sm font-medium text-white line-clamp-2 flex-1">{source.title}</h4>
        </div>
        <p className="text-sm text-gray-400 line-clamp-3 mt-2">{source.summary}</p>
      </div>
    </a>
  );

  return (
    <>
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-white">Research Sources</h3>
        <div className="grid grid-cols-2 gap-2">
          {webSources.slice(0, 3).map((source, index) => (
            <div
              key={index}
              className={`relative aspect-square rounded-lg overflow-hidden bg-white/5 ${
                index === 2 ? "col-span-1" : ""
              }`}
            >
              <SourceCard source={source} />
            </div>
          ))}
          {webSources.length > 3 && (
            <div
              className="relative aspect-square rounded-lg overflow-hidden bg-white/5 cursor-pointer hover:bg-white/10 transition-all hover:scale-[1.02]"
              onClick={() => setIsDialogOpen(true)}
            >
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center">
                  <Globe className="h-8 w-8 text-white mx-auto mb-2" />
                  <span className="text-sm font-medium text-white">
                    {webSources.length - 3} more{" "}
                    {webSources.length - 3 === 1 ? "source" : "sources"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gray-950 border border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">All Research Sources</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
            {webSources.map((source, index) => (
              <div key={index} className="space-y-2 group">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-white/5 ring-1 ring-white/10 transition-all group-hover:ring-white/20">
                  <SourceCard source={source} />
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
