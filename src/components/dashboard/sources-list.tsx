import { ResearchSource } from "@/db/schema";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface SourcesListProps {
  sources: ResearchSource[];
}

export function SourcesList({ sources }: SourcesListProps) {
  // Filter out image sources
  const webSources = sources.filter((source) => source.source === "web");

  if (webSources.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-white">Research Sources</h3>
      <div className="space-y-3">
        {webSources.map((source, index) => (
          <Card key={index} className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-medium text-white line-clamp-2">{source.title}</h4>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 text-primary hover:text-primary/80 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                <p className="text-sm text-gray-400 line-clamp-3">{source.summary}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
