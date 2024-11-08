"use client";
import * as React from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText, LogOut, Plus, Settings, Sparkles } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";

type Article = {
  id: string;
  title: string;
  status: "draft" | "published";
  createdAt: string;
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [titleCount, setTitleCount] = useState<number>(1);
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);

  const generateTitle = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/generate-title", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic, count: titleCount }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate titles");
      }

      const data = await response.json();
      setGeneratedTitles(data.titles);
    } catch (error) {
      console.error("Error generating titles:", error);
      alert("Failed to generate titles. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const createArticle = (selectedTitle: string) => {
    const newArticle: Article = {
      id: Date.now().toString(),
      title: selectedTitle,
      status: "draft",
      createdAt: new Date().toISOString(),
    };
    setArticles([newArticle, ...articles]);
    setGeneratedTitles([]);
    setOpen(false);
    setTopic("");
  };

  const userInitials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
        <div className="container flex h-16 items-center">
          <a className="flex items-center gap-2 font-semibold" href="#">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Rytr
            </span>
          </a>

          <div className="ml-auto flex items-center gap-4">
            <Button variant="ghost" className="text-sm text-white/70 hover:text-white">
              Dashboard
            </Button>
            <Button variant="ghost" className="text-sm text-white/70 hover:text-white">
              Analytics
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full border border-white/10 bg-black"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session?.user?.image || ""} alt="User" />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 bg-black/95 backdrop-blur"
                align="end"
                forceMount
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-white">
                      {session?.user?.name}
                    </p>
                    <p className="text-xs leading-none text-white/70">{session?.user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem className="text-white/70 hover:text-white focus:bg-white/10">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-400 hover:text-red-300 focus:bg-white/10"
                  onClick={() => signOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Your Articles</h1>
              <p className="mt-1 text-sm text-white/70">
                Create and manage your AI-powered content
              </p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Article
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black/95 backdrop-blur">
                <DialogHeader>
                  <DialogTitle className="text-white">Generate Article Title</DialogTitle>
                  <DialogDescription className="text-white/70">
                    Enter a topic and choose how many titles to generate (1-3).
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Input
                      id="topic"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g., Digital Marketing"
                      className="h-12 bg-black/50 text-white border-white/10"
                    />
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-white/70">Number of titles:</label>
                      <select
                        value={titleCount}
                        onChange={(e) => setTitleCount(Number(e.target.value))}
                        className="h-8 bg-black/50 text-white border-white/10 rounded-md"
                      >
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                      </select>
                    </div>
                  </div>
                  <Button
                    onClick={generateTitle}
                    disabled={!topic || loading}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {loading ? "Generating..." : "Generate Titles"}
                  </Button>

                  {generatedTitles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h3 className="text-sm font-medium text-white">Select a title to use:</h3>
                      {generatedTitles.map((title, index) => (
                        <div
                          key={index}
                          className="rounded-lg border border-white/10 p-4 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                          onClick={() => createArticle(title)}
                        >
                          <p className="text-white">{title}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {articles.length === 0 ? (
            <div className="mt-16 flex flex-col items-center justify-center gap-4">
              <div className="relative w-60 h-60">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 blur-3xl" />
                <div className="relative flex h-full items-center justify-center rounded-xl border border-white/10 bg-black/50 p-8 backdrop-blur">
                  <FileText className="h-20 w-20 text-white/20" />
                </div>
              </div>
              <h2 className="text-xl font-semibold">No articles yet</h2>
              <p className="text-center text-white/70">
                Get started by creating a new article.
                <br />
                Your AI-powered writing journey begins here.
              </p>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              {articles.map((article) => (
                <div
                  key={article.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-colors hover:bg-white/10"
                >
                  <div>
                    <h3 className="font-medium text-white">{article.title}</h3>
                    <p className="mt-1 text-sm text-white/70">
                      Created {new Date(article.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      article.status === "published"
                        ? "bg-green-500/10 text-green-400"
                        : "bg-yellow-500/10 text-yellow-400"
                    }`}
                  >
                    {article.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
