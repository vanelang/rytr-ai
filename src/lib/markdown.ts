import MarkdownIt from "markdown-it";

const md = new MarkdownIt();

export function markdownToHtml(markdown: string): string {
  return md.render(markdown);
}

export function htmlToMarkdown(html: string): string {
  return html
    .replace(/<h1[^>]*>/g, "# ")
    .replace(/<\/h1>/g, "\n\n")
    .replace(/<h2[^>]*>/g, "## ")
    .replace(/<\/h2>/g, "\n\n")
    .replace(/<h3[^>]*>/g, "### ")
    .replace(/<\/h3>/g, "\n\n")
    .replace(/<p[^>]*>/g, "")
    .replace(/<\/p>/g, "\n\n")
    .replace(/<strong[^>]*>/g, "**")
    .replace(/<\/strong>/g, "**")
    .replace(/<em[^>]*>/g, "*")
    .replace(/<\/em>/g, "*")
    .replace(/<ul[^>]*>/g, "")
    .replace(/<\/ul>/g, "\n")
    .replace(/<ol[^>]*>/g, "")
    .replace(/<\/ol>/g, "\n")
    .replace(/<li[^>]*>/g, "- ")
    .replace(/<\/li>/g, "\n")
    .replace(/<blockquote[^>]*>/g, "> ")
    .replace(/<\/blockquote>/g, "\n\n")
    .replace(/<pre><code[^>]*>/g, "```\n")
    .replace(/<\/code><\/pre>/g, "\n```\n")
    .replace(/<code[^>]*>/g, "`")
    .replace(/<\/code>/g, "`")
    .replace(/\n\n+/g, "\n\n")
    .trim();
}
