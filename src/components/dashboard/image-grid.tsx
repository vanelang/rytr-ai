"use client";
import Image from "next/image";
import { Plus } from "lucide-react";
import { ResearchSource } from "@/db/schema";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ImageGridProps {
  sources: ResearchSource[];
}

export function ImageGrid({ sources }: ImageGridProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
    <>
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
            <div
              className="relative aspect-square rounded-lg overflow-hidden bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => setIsDialogOpen(true)}
            >
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>All Article Images</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
            {imageUrls.map((image, index) => (
              <div key={index} className="space-y-2">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-white/5">
                  <Image
                    src={image.url}
                    alt={image.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <p className="text-sm text-gray-400 text-center line-clamp-2">{image.title}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
