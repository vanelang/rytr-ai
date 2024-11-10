"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
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
  onUpgradeComplete: () => void;
}

export function UpgradeDialog({ isOpen, onClose, onUpgradeComplete }: UpgradeDialogProps) {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [changingPlan, setChangingPlan] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const [plansResponse, userPlanResponse] = await Promise.all([
          fetch("/api/plans"),
          fetch("/api/user/plan"),
        ]);

        if (!plansResponse.ok || !userPlanResponse.ok) {
          throw new Error("Failed to fetch plans");
        }

        const plansData = await plansResponse.json();
        const userPlanData = await userPlanResponse.json();

        setPlans(plansData.plans);
        setCurrentPlan(userPlanData.plan);
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

  const handlePlanChange = async (planId: number) => {
    try {
      setError(null);
      setChangingPlan(planId);
      const response = await fetch("/api/user/change-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to change plan");
      }

      onUpgradeComplete();
    } catch (error) {
      console.error("Error changing plan:", error);
      setError(error instanceof Error ? error.message : "Failed to change plan");
    } finally {
      setChangingPlan(null);
    }
  };

  const getPlanAction = (plan: Plan) => {
    if (!currentPlan) return { text: "Select Plan", action: "upgrade" };

    if (plan.id === currentPlan.id) {
      return { text: "Current Plan", action: "current" };
    }

    const currentPriceIndex = plans.findIndex((p) => p.id === currentPlan.id);
    const newPlanIndex = plans.findIndex((p) => p.id === plan.id);

    return newPlanIndex > currentPriceIndex
      ? { text: `Upgrade to ${plan.name}`, action: "upgrade" }
      : { text: `Downgrade to ${plan.name}`, action: "downgrade" };
  };

  const PlanSkeleton = () => (
    <div className="rounded-lg border border-white/10 bg-white/5 p-6 flex flex-col animate-pulse">
      <div className="mb-4">
        <div className="h-6 w-24 bg-white/10 rounded mb-2" />
        <div className="h-8 w-32 bg-white/10 rounded mt-2" />
      </div>
      <div className="space-y-3 flex-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-white/10" />
            <div className="h-4 w-48 bg-white/10 rounded" />
          </div>
        ))}
      </div>
      <div className="h-10 w-full bg-white/10 rounded mt-6" />
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black/95 border border-primary/20 text-white shadow-xl shadow-primary/10 backdrop-blur-sm max-w-[90vw] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Change Plan
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="mt-4 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <>
                <PlanSkeleton />
                <PlanSkeleton />
                <PlanSkeleton />
              </>
            ) : (
              plans.map((plan) => {
                const { text, action } = getPlanAction(plan);
                const isCurrentPlan = currentPlan?.id === plan.id;
                const isProcessing = changingPlan === plan.id;

                return (
                  <div
                    key={plan.id}
                    className={`rounded-lg border ${
                      isCurrentPlan ? "border-primary/50" : "border-white/10"
                    } bg-white/5 p-6 flex flex-col relative`}
                  >
                    {isCurrentPlan && (
                      <div className="absolute -top-3 left-4 px-2 py-0.5 bg-primary text-xs font-medium rounded-full text-white">
                        Current Plan
                      </div>
                    )}
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

                    <Button
                      className={`w-full mt-6 ${
                        isCurrentPlan
                          ? "bg-white/10 text-white cursor-default"
                          : action === "downgrade"
                          ? "bg-white/10 hover:bg-white/20 text-white"
                          : "bg-primary hover:bg-primary/90 text-white"
                      } font-medium`}
                      onClick={() => !isCurrentPlan && handlePlanChange(plan.id)}
                      disabled={isCurrentPlan || isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        text
                      )}
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
