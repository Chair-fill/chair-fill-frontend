"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
  code: string;
  language?: string;
}

export default function CodeBlock({ code, language = "tsx" }: CodeBlockProps) {
  return (
    <SyntaxHighlighter
      language={language}
      style={vscDarkPlus}
      customStyle={{
        margin: 0,
        padding: "1.5rem",
        fontSize: "0.875rem",
        lineHeight: "1.5rem",
        backgroundColor: "transparent",
      }}
      codeTagProps={{
        style: {
          fontFamily: 'inherit',
        }
      }}
    >
      {code}
    </SyntaxHighlighter>
  );
}
