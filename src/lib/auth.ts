import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-config";

export async function getSession() {
  const session = await getServerSession(authOptions);
  return session;
}

export async function getCurrentUser() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/");
  }

  return session.user;
}
