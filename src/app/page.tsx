"use client";
import Image from "next/image";
import { signIn } from "next-auth/react";

export default function Home() {
  const handleGoogleSignIn = async () => {
    try {
      await signIn("google", {
        callbackUrl: "/dashboard",
      });
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <Image
            src="/rytr-logo.png"
            alt="Rytr Logo"
            width={180}
            height={38}
            priority
            className="mx-auto"
          />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Welcome to Rytr</h2>
          <p className="mt-2 text-sm text-gray-600">AI-Powered SEO Blog Writing Platform</p>
        </div>

        <div className="mt-8">
          <button
            className="w-full flex items-center justify-center gap-3 bg-white px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            onClick={handleGoogleSignIn}
          >
            <Image src="/google-logo.svg" alt="Google Logo" width={20} height={20} />
            Continue with Google
          </button>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          By continuing, you agree to Rytr's{" "}
          <a href="/terms" className="text-indigo-600 hover:text-indigo-500">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-indigo-600 hover:text-indigo-500">
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
}
