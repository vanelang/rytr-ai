import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, FileText } from "lucide-react";
import Link from "next/link";

interface Source {
  title: string;
  summary: string;
  source: string;
  url?: string;
}

interface SourcesListProps {
  sources: Source[];
}

export function SourcesList({ sources }: SourcesListProps) {
  if (sources.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-white">Sources</h3>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="flex flex-col items-center justify-center text-center gap-2 py-4">
              <FileText className="h-8 w-8 text-white/40" />
              <p className="text-sm text-white/60">No sources available for this article</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-white">Sources</h3>
      <div className="space-y-3">
        {sources.map((source, index) => (
          <Card key={index} className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-medium text-white line-clamp-2">{source.title}</h4>
                  {source.url && (
                    <Link
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-primary hover:text-primary/90 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  )}
                </div>
                {source.summary && (
                  <p className="text-xs text-white/70 line-clamp-3">{source.summary}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
