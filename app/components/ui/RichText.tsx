'use client';

/**
 * Renders plain text with line breaks, **bold**, and list items (- or *).
 * Use in service descriptions and other short rich text.
 */
export default function RichText({ text, className = '' }: { text: string; className?: string }) {
  if (!text?.trim()) return null;

  const lines = text.split(/\r?\n/);

  function renderInline(content: string) {
    const segments: React.ReactNode[] = [];
    let remaining = content;
    let key = 0;
    const boldRegex = /\*\*(.+?)\*\*/g;
    let match = boldRegex.exec(remaining);
    while (match) {
      if (match.index > 0) {
        segments.push(<span key={key++}>{remaining.slice(0, match.index)}</span>);
      }
      segments.push(<strong key={key++} className="font-semibold text-zinc-900 dark:text-zinc-50">{match[1]}</strong>);
      remaining = remaining.slice(match.index + match[0].length);
      match = boldRegex.exec(remaining);
    }
    if (remaining) segments.push(<span key={key++}>{remaining}</span>);
    return segments.length === 1 ? segments[0] : <span>{segments}</span>;
  }

  const nodes: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];

  function flushList() {
    if (listItems.length > 0) {
      nodes.push(
        <ul key={nodes.length} className="list-disc pl-4 my-1 space-y-0.5">
          {listItems}
        </ul>
      );
      listItems = [];
    }
  }

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      nodes.push(<br key={nodes.length} />);
      return;
    }
    const isListItem = /^[\-\*]\s+/.test(trimmed);
    const content = isListItem ? trimmed.replace(/^[\-\*]\s+/, '') : trimmed;
    if (isListItem) {
      listItems.push(
        <li key={listItems.length} className="text-inherit">
          {renderInline(content)}
        </li>
      );
    } else {
      flushList();
      nodes.push(
        <span key={nodes.length} className="block">
          {renderInline(trimmed)}
        </span>
      );
    }
  });
  flushList();

  return <div className={`text-sm text-zinc-600 dark:text-zinc-400 ${className}`}>{nodes}</div>;
}
