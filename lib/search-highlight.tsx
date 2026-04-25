import type { ReactNode } from "react";

/**
 * Highlight matched text within a string.
 * Returns array of ReactNode with matched parts wrapped in <mark>.
 */
export function HighlightMatch({
  text,
  query,
}: {
  text: string;
  query: string | undefined;
}): ReactNode {
  if (!query?.trim() || !text) {
    return text;
  }

  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) => {
        const isMatch = part.toLowerCase() === query.trim().toLowerCase();
        const key = `${part}-${i}`;
        if (isMatch) {
          return (
            <mark
              key={key}
              className="bg-yellow-200 dark:bg-yellow-800/60 text-inherit rounded-sm px-0.5"
            >
              {part}
            </mark>
          );
        }
        return <span key={key}>{part}</span>;
      })}
    </>
  );
}
