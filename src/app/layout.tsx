import { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "AI Content Platform | Create Engaging Articles with AI",
    template: "%s | AI Content Platform",
  },
  description:
    "Create high-quality, engaging articles with AI assistance. Our platform helps you generate, edit, and manage content efficiently with advanced AI technology.",
  keywords: [
    "AI content generation",
    "article writing",
    "content creation",
    "AI writing assistant",
    "content management",
    "SEO content",
    "automated writing",
    "content platform",
  ],
  authors: [{ name: "AI Content Platform" }],
  creator: "AI Content Platform",
  publisher: "AI Content Platform",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "AI Content Platform",
    title: "AI Content Platform | Create Engaging Articles with AI",
    description:
      "Create high-quality, engaging articles with AI assistance. Our platform helps you generate, edit, and manage content efficiently.",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Content Platform | Create Engaging Articles with AI",
    description:
      "Create high-quality, engaging articles with AI assistance. Our platform helps you generate, edit, and manage content efficiently.",
    creator: "@aicontentplatform",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
    other: {
      rel: "apple-touch-icon-precomposed",
      url: "/apple-touch-icon-precomposed.png",
    },
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: "/",
    languages: {
      "en-IN": "/en-IN",
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
      </head>
      <body className={poppins.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
