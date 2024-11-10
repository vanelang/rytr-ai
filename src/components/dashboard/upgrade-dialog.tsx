"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Plan {
  id: number;
  name: string;
  type: "free" | "starter" | "unlimited";
  price: number;
  features: {
    articleLimit: number;
    customBranding: boolean;
    prioritySupport: boolean;
    analytics: boolean;
    apiAccess: boolean;
  };
}

interface UpgradeDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpgradeDialog({ isOpen, onClose }: UpgradeDialogProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch("/api/plans");
        if (!response.ok) throw new Error("Failed to fetch plans");
        const data = await response.json();
        // Filter out the free plan
        const paidPlans = data.plans.filter((plan: Plan) => plan.type !== "free");
        setPlans(paidPlans);
      } catch (error) {
        console.error("Error fetching plans:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchPlans();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black/95 border border-primary/20 text-white shadow-xl shadow-primary/10 backdrop-blur-sm max-w-[90vw] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Upgrade Your Plan
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          <p className="text-white/70">
            You've reached your monthly article limit. Choose a plan to continue creating amazing
            content:
          </p>

          <div className="grid gap-6 sm:grid-cols-2">
            {loading
              ? // Loading skeleton
                [...Array(2)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-white/10 bg-white/5 p-6 animate-pulse"
                  >
                    <div className="h-7 w-1/2 bg-white/10 rounded mb-4" />
                    <div className="space-y-3">
                      {[...Array(4)].map((_, j) => (
                        <div key={j} className="h-5 w-full bg-white/10 rounded" />
                      ))}
                    </div>
                  </div>
                ))
              : // Actual plans
                plans.map((plan) => (
                  <div
                    key={plan.id}
                    className="rounded-lg border border-white/10 bg-white/5 p-6 flex flex-col"
                  >
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold">{plan.name}</h3>
                      <div className="mt-2">
                        <span className="text-2xl font-bold">${plan.price / 100}</span>
                        <span className="text-white/70">/month</span>
                      </div>
                    </div>

                    <ul className="space-y-3 text-sm flex-1">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span>
                          {plan.features.articleLimit === -1
                            ? "Unlimited articles"
                            : `${plan.features.articleLimit} articles per month`}
                        </span>
                      </li>
                      {plan.features.customBranding && (
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          <span>Custom branding</span>
                        </li>
                      )}
                      {plan.features.prioritySupport && (
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          <span>Priority support</span>
                        </li>
                      )}
                      {plan.features.analytics && (
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          <span>Advanced analytics</span>
                        </li>
                      )}
                      {plan.features.apiAccess && (
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary" />
                          <span>API access</span>
                        </li>
                      )}
                    </ul>

                    <Link href={`/checkout?plan=${plan.id}`} className="mt-6">
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white font-medium">
                        Upgrade to {plan.name}
                      </Button>
                    </Link>
                  </div>
                ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
