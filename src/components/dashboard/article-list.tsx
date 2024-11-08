"use client";
import { useState } from "react";
import Link from "next/link";
import { TitleGeneratorModal } from "./title-generator-modal";

type Article = {
  id: string;
  title: string;
  status: "draft" | "published";
  createdAt: string;
};

export function ArticleList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTitleSelect = (title: string) => {
    const newArticle: Article = {
      id: Date.now().toString(), // Replace with proper ID generation
      title,
      status: "draft",
      createdAt: new Date().toISOString(),
    };
    setArticles([newArticle, ...articles]);
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Your Articles</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create New Article
        </button>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No articles</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new article.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {articles.map((article) => (
              <li key={article.id}>
                <Link href={`/dashboard/articles/${article.id}`} className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-indigo-600 truncate">
                        {article.title}
                      </h3>
                      <div className="ml-2 flex-shrink-0 flex">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            article.status === "published"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {article.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="text-sm text-gray-500">
                          Created {new Date(article.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <TitleGeneratorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTitleSelect={handleTitleSelect}
      />
    </>
  );
}
