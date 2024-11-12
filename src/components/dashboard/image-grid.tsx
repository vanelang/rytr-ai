"use client";
import Image from "next/image";
import { Plus } from "lucide-react";
import { ResearchSource } from "@/db/schema";

interface ImageGridProps {
  sources: ResearchSource[];
}

export function ImageGrid({ sources }: ImageGridProps) {
  // Filter only image sources
  const imageUrls = sources
    .filter((source) => source.source === "image")
    .map((source) => ({
      url: source.url,
      title: source.title,
    }));

  const displayedImages = imageUrls.slice(0, 3); // Show first 3 images
  const remainingCount = Math.max(0, imageUrls.length - 3); // Count remaining images

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-white">Article Images</h3>
      <div className="grid grid-cols-2 gap-2">
        {displayedImages.map((image, index) => (
          <div
            key={index}
            className={`relative aspect-square rounded-lg overflow-hidden bg-white/5 ${
              index === 2 ? "col-span-1" : ""
            }`}
          >
            <Image
              src={image.url}
              alt={image.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="relative aspect-square rounded-lg overflow-hidden bg-white/5">
            {displayedImages.length === 3 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center">
                  <Plus className="h-8 w-8 text-white mx-auto mb-2" />
                  <span className="text-sm font-medium text-white">
                    {remainingCount} more {remainingCount === 1 ? "image" : "images"}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
