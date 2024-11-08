"use client";
import { User } from "next-auth";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

interface DashboardHeaderProps {
  user: User;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/dashboard">
              <Image
                src="/rytr-logo.png"
                alt="Rytr Logo"
                width={100}
                height={30}
                className="cursor-pointer"
              />
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {user.image && (
                <Image
                  src={user.image}
                  alt={user.name || "User"}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              )}
              <span className="text-gray-700">{user.name}</span>
            </div>
            <button onClick={() => signOut()} className="text-sm text-gray-700 hover:text-gray-900">
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
