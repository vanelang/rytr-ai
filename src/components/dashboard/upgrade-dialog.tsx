"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import Link from "next/link";

interface UpgradeDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpgradeDialog({ isOpen, onClose }: UpgradeDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black/95 border border-primary/20 text-white shadow-xl shadow-primary/10 backdrop-blur-sm max-w-[90vw] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Upgrade Your Plan
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <p className="text-white/70">
            You've reached your monthly article limit. Upgrade your plan to create more articles and
            unlock additional features:
          </p>

          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Create unlimited articles</span>
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Access advanced analytics</span>
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Priority support</span>
            </li>
          </ul>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto text-white hover:bg-white/10 hover:text-white border border-white/10"
            >
              Maybe Later
            </Button>
            <Link href="/pricing" className="w-full sm:w-auto">
              <Button className="w-full bg-primary hover:bg-primary/90">View Plans</Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
