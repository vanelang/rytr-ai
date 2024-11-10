import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, session.user.email),
      with: {
        plan: true,
      },
    });

    if (!user || !user.plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    return NextResponse.json({ plan: user.plan });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch user plan" }, { status: 500 });
  }
}
