import type { ContentBlock } from "@/lib/data/types";

const WORDS_PER_MINUTE = 220;
const WHITESPACE_RE = /\s+/;

function wordsIn(text: string): number {
  return text.trim().split(WHITESPACE_RE).filter(Boolean).length;
}

export function readMinutes(blocks: ContentBlock[]): number {
  let words = 0;
  for (const block of blocks) {
    switch (block.type) {
      case "paragraph":
      case "heading":
      case "blockquote":
        words += wordsIn(block.text);
        break;
      case "unordered-list":
      case "ordered-list":
        for (const item of block.items) words += wordsIn(item);
        break;
      case "image":
        if (block.caption) words += wordsIn(block.caption);
        break;
    }
  }
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export function firstParagraph(blocks: ContentBlock[]): string | null {
  const p = blocks.find((b) => b.type === "paragraph");
  return p ? p.text : null;
}
