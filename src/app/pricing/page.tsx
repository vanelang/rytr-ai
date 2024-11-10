import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { db } from "@/db";
import { plans, users, type PlanFeatures } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";

async function getPlans() {
  return await db.query.plans.findMany({
    orderBy: (plans, { asc }) => [asc(plans.price)],
  });
}

async function getUserPlan() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.email, session.user.email),
    with: {
      plan: true,
    },
  });

  return user?.planId || null;
}

export default async function PricingPage() {
  const plans = await getPlans();
  const userPlanId = await getUserPlan();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-lg text-gray-600">Choose the plan that best fits your needs</p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {plans.map((plan) => {
            const isCurrentPlan = plan.id === userPlanId;
            const features = plan.features as PlanFeatures;
            const isUnlimited = plan.type === "unlimited";

            return (
              <div
                key={plan.id}
                className={`rounded-lg border ${
                  isUnlimited ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-white"
                } p-8 shadow-sm`}
              >
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                    <p className="mt-4">
                      <span className="text-4xl font-bold tracking-tight text-gray-900">
                        ${plan.price / 100}
                      </span>
                      <span className="text-base font-medium text-gray-500">/month</span>
                    </p>
                    <ul className="mt-8 space-y-4">
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-green-500" />
                        <span className="ml-3 text-gray-700">
                          {features.articleLimit === -1
                            ? "Unlimited articles"
                            : `${features.articleLimit} articles per month`}
                        </span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-green-500" />
                        <span className="ml-3 text-gray-700">
                          {features.customBranding ? "Custom branding" : "Basic branding"}
                        </span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-green-500" />
                        <span className="ml-3 text-gray-700">
                          {features.prioritySupport ? "Priority support" : "Standard support"}
                        </span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-green-500" />
                        <span className="ml-3 text-gray-700">
                          {features.analytics ? "Advanced analytics" : "Basic analytics"}
                        </span>
                      </li>
                      <li className="flex items-center">
                        <Check className="h-5 w-5 text-green-500" />
                        <span className="ml-3 text-gray-700">
                          {features.apiAccess ? "API access" : "No API access"}
                        </span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-8">
                    {isCurrentPlan ? (
                      <Button className="w-full" variant="outline" disabled>
                        Current Plan
                      </Button>
                    ) : (
                      <Link href={`/checkout?plan=${plan.id}`} className="w-full">
                        <Button
                          className={`w-full ${isUnlimited ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                        >
                          {plan.type === "free" ? "Get Started" : "Upgrade"}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
