import Image from "next/image";

import type { ContentBlock } from "@/lib/data/types";

export function ArticleContent({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="space-y-6 text-[1.05rem] leading-8 text-foreground">
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  );
}

function Block({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "paragraph":
      return <p className="break-words">{block.text}</p>;
    case "heading":
      return block.level === 2 ? (
        <h2 className="mt-12 break-words border-t border-border/70 pt-8 font-heading text-4xl font-semibold leading-tight tracking-tight">
          {block.text}
        </h2>
      ) : (
        <h3 className="mt-8 break-words font-heading text-2xl font-semibold leading-tight tracking-tight">
          {block.text}
        </h3>
      );
    case "blockquote":
      return (
        <blockquote className="rounded-r-2xl border-l-4 border-accent-brand bg-card/70 py-4 pl-5 pr-4 font-heading text-2xl leading-snug text-foreground">
          {block.text}
        </blockquote>
      );
    case "unordered-list":
      return (
        <ul className="list-disc space-y-2 pl-6 marker:text-accent-brand">
          {block.items.map((item, j) => (
            <li key={j} className="break-words">
              {item}
            </li>
          ))}
        </ul>
      );
    case "ordered-list":
      return (
        <ol className="list-decimal space-y-2 pl-6 marker:font-mono marker:text-muted-foreground">
          {block.items.map((item, j) => (
            <li key={j} className="break-words">
              {item}
            </li>
          ))}
        </ol>
      );
    case "image":
      return (
        <figure className="space-y-3">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border/80 bg-muted">
            <Image
              src={block.src || "/image-placeholder.svg"}
              alt={block.alt}
              fill
              sizes="(min-width: 1024px) 680px, 100vw"
              className="object-cover"
            />
          </div>
          {block.caption ? (
            <figcaption className="font-mono text-xs leading-relaxed text-muted-foreground">
              {block.caption}
            </figcaption>
          ) : null}
        </figure>
      );
  }
}
