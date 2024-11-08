import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypeRemark from "rehype-remark";
import remarkStringify from "remark-stringify";
import rehypeParse from "rehype-parse";

export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(markdown);

  return result.toString();
}

export async function htmlToMarkdown(html: string): Promise<string> {
  const result = await unified()
    .use(rehypeParse)
    .use(rehypeRemark)
    .use(remarkStringify)
    .process(html);

  return result.toString();
}
