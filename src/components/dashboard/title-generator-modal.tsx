"use client";
import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface TitleGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTitleSelect: (title: string) => void;
}

export function TitleGeneratorModal({ isOpen, onClose, onTitleSelect }: TitleGeneratorModalProps) {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);

  const generateTitles = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call to OpenAI
      const mockTitles = [
        `10 Essential ${topic} Strategies for 2024`,
        `The Ultimate Guide to ${topic}: Tips and Tricks`,
        `How ${topic} is Transforming Modern Business`,
        `${topic} Best Practices: A Comprehensive Overview`,
        `Why ${topic} Matters More Than Ever Before`,
      ];
      setGeneratedTitles(mockTitles);
    } catch (error) {
      console.error("Error generating titles:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Generate Article Title</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What's your article about?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="e.g., Digital Marketing"
              />
              <button
                onClick={generateTitles}
                disabled={!topic || loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? "Generating..." : "Generate"}
              </button>
            </div>
          </div>

          {generatedTitles.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Choose a title:</h3>
              <div className="space-y-2">
                {generatedTitles.map((title, index) => (
                  <button
                    key={index}
                    onClick={() => onTitleSelect(title)}
                    className="w-full text-left p-3 rounded-md border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                  >
                    {title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
