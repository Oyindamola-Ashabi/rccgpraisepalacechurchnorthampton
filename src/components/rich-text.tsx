import type { ReactNode } from "react";

/**
 * Renders admin-editable copy while keeping the original design treatment:
 * text wrapped in *asterisks* becomes the brand gradient highlight and
 * blank lines become separate paragraphs.
 */
export function Highlight({ text, className = "" }: { text: string; className?: string }) {
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean);
  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.startsWith("*") && part.endsWith("*") ? (
          <span key={i} className="text-gradient-brand">
            {part.slice(1, -1)}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  );
}

/** Same as Highlight but tinted gold — used over the dark hero image. */
export function HighlightGold({ text }: { text: string }): ReactNode {
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("*") && part.endsWith("*") ? (
          <span key={i} className="text-[#F0DE51]">
            {part.slice(1, -1)}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

/** Splits admin copy on blank lines into paragraphs. */
export function Paragraphs({ text, className = "" }: { text: string; className?: string }) {
  const paras = text.split(/\n\s*\n|\n/).map((p) => p.trim()).filter(Boolean);
  return (
    <>
      {paras.map((p, i) => (
        <p key={i} className={`${className} ${i > 0 ? "mt-3" : ""}`}>
          {p}
        </p>
      ))}
    </>
  );
}
