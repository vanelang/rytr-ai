import { ResearchSource } from "@/db/schema";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, PlayCircle } from "lucide-react";

interface VideoListProps {
  sources: ResearchSource[];
}

export function VideoList({ sources }: VideoListProps) {
  // Filter out video sources
  const videoSources = sources.filter((source) => source.source === "video");

  if (videoSources.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-white">Video Sources</h3>
      <div className="grid grid-cols-2 gap-2">
        {videoSources.slice(0, 3).map((source, index) => (
          <div
            key={index}
            className={`relative aspect-square rounded-lg overflow-hidden bg-white/5 ${
              index === 2 ? "col-span-1" : ""
            }`}
          >
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block w-full h-full relative"
            >
              {/* Dark overlay with play button */}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <PlayCircle className="h-12 w-12 text-white" />
              </div>

              {/* Video title overlay at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/70">
                <h4 className="text-sm font-medium text-white line-clamp-2">{source.title}</h4>
              </div>
            </a>
          </div>
        ))}
        {videoSources.length > 3 && (
          <div className="relative aspect-square rounded-lg overflow-hidden bg-white/5">
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-center">
                <PlayCircle className="h-8 w-8 text-white mx-auto mb-2" />
                <span className="text-sm font-medium text-white">
                  {videoSources.length - 3} more{" "}
                  {videoSources.length - 3 === 1 ? "video" : "videos"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
