import { NextResponse } from "next/server";
import { db } from "@/db";
import { plans } from "@/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  try {
    const allPlans = await db.query.plans.findMany({
      orderBy: [asc(plans.price)],
    });

    return NextResponse.json({ plans: allPlans });
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 });
  }
}
