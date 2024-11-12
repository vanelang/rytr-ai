import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth.config";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: {
    template: "%s | AI Content Platform",
    default: "Dashboard | AI Content Platform",
  },
  description: "Create and manage AI-generated content with our powerful platform",
  keywords: [
    "AI content",
    "content generation",
    "article writing",
    "AI writing",
    "content management",
  ],
  authors: [{ name: "AI Content Platform" }],
  robots: {
    index: false,
    follow: true,
  },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/");
  }

  return <div className="min-h-screen bg-black">{children}</div>;
}
