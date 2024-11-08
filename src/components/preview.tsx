"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface PreviewProps {
  content: string;
}

export function Preview({ content }: PreviewProps) {
  return (
    <article className="prose prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-3xl font-bold text-white mb-4 mt-8" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-2xl font-semibold text-white mb-4 mt-6" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xl font-medium text-white mb-3 mt-4" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="text-white/90 mb-4 leading-relaxed" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="text-white/90 list-disc pl-6 mb-4 space-y-2" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="text-white/90 list-decimal pl-6 mb-4 space-y-2" {...props} />
          ),
          li: ({ node, ...props }) => <li className="text-white/90" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-primary/50 bg-white/5 pl-4 py-2 mb-4 text-white/90 italic"
              {...props}
            />
          ),
          code: ({ node, inline, ...props }) =>
            inline ? (
              <code className="bg-white/5 text-white rounded px-1.5 py-0.5" {...props} />
            ) : (
              <code
                className="block bg-white/5 text-white rounded p-4 mb-4 overflow-x-auto"
                {...props}
              />
            ),
          pre: ({ node, ...props }) => (
            <pre className="bg-white/5 rounded-lg p-4 mb-4 overflow-x-auto" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="text-white font-semibold" {...props} />
          ),
          em: ({ node, ...props }) => <em className="text-white/90 italic" {...props} />,
          a: ({ node, ...props }) => (
            <a className="text-primary hover:text-primary/90 underline" {...props} />
          ),
          hr: () => <hr className="border-white/10 my-8" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
