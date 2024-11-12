import { Metadata } from "next";
import { DashboardContent } from "./dashboard-content";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your AI-generated articles and content in one place",
  openGraph: {
    title: "Dashboard",
    description: "Manage your AI-generated articles and content in one place",
    type: "website",
  },
};

export default function DashboardPage() {
  return <DashboardContent />;
}
