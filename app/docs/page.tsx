import fs from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";
import { ChevronLeft, BookOpen, Hash, Component, Activity, Layout as LayoutIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import CodeBlock from "./components/CodeBlock";

export default function DocsPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  let content = "";
  try {
    const filePath = path.join(process.cwd(), "docs", "ui-library.md");
    content = fs.readFileSync(filePath, "utf8");
  } catch (err) {
    console.error("Failed to read docs file:", err);
    content = "# Error\nCould not load documentation.";
  }

  // Extract H2 headings for navigation
  const headingRegex = /^##\s+(.+)$/gm;
  const headingMatches = Array.from(content.matchAll(headingRegex));
  const dynamicSections = headingMatches.map((match, index) => {
    const rawTitle = match[1];
    const cleanTitle = rawTitle.split("(")[0].trim();
    const id = cleanTitle.toLowerCase().replace(/\s+/g, "-");
    
    // Pick an icon based on title keywords
    let Icon = BookOpen;
    if (cleanTitle.toLowerCase().includes("ui")) Icon = Component;
    if (cleanTitle.toLowerCase().includes("layout")) Icon = LayoutIcon;
    if (cleanTitle.toLowerCase().includes("hook")) Icon = Activity;
    
    return { id, label: cleanTitle, icon: Icon };
  });

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 selection:bg-primary/30 flex flex-col sm:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full sm:w-72 bg-black/40 border-r border-white/5 p-8 flex flex-col gap-10">
        <div className="space-y-4">
          <Link 
            href="/bookings" 
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-primary transition-colors text-[10px] font-black uppercase tracking-widest group"
          >
            <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-xl font-black tracking-tight text-zinc-50">System Docs</h2>
          </div>
        </div>

        <nav className="space-y-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-6 px-1">Navigation</p>
            <ul className="space-y-2">
              {dynamicSections.map((section) => (
                <li key={section.id}>
                  <a 
                    href={`#${section.id}`}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-zinc-400 hover:text-primary hover:bg-primary/5 transition-all group"
                  >
                    <section.icon className="w-4 h-4 text-zinc-600 group-hover:text-primary transition-colors" />
                    {section.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-8 border-t border-white/5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-4 px-1">Resources</p>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Documentation generated from <code className="text-primary/60 font-mono">docs/ui-library.md</code>.
              </p>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-screen p-6 sm:p-12 sm:pb-32 scroll-smooth">
        <div className="max-w-4xl mx-auto">
          <div className="mb-16">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-3">Internal Resource</p>
            <h1 className="text-5xl font-black tracking-tight text-zinc-50 mb-4">UI Library</h1>
            <p className="text-zinc-500 text-lg max-w-2xl">
              A comprehensive guide to the design system, components, and patterns used in the ChairFill frontend.
            </p>
          </div>

          <article className="space-y-4">
            <ReactMarkdown
              components={{
                h1: ({ ...props }) => (
                  <h1 className="hidden" {...props} /> 
                ),
                h2: ({ ...props }) => {
                  const rawText = String(props.children);
                  const cleanText = rawText.split("(")[0].trim();
                  const id = cleanText.toLowerCase().replace(/\s+/g, "-");
                  return (
                    <h2 
                      id={id}
                      className="text-2xl font-black mt-24 mb-8 text-zinc-50 flex items-center gap-4 scroll-mt-12 group" 
                      {...props} 
                    >
                      <span className="w-1.5 h-8 bg-primary rounded-full" />
                      {props.children}
                      <a href={`#${id}`} className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Hash className="w-4 h-4 text-zinc-700 hover:text-primary" />
                      </a>
                    </h2>
                  );
                },
                h3: ({ ...props }) => (
                  <h3 className="text-lg font-black mt-12 mb-5 text-zinc-200 border-l-2 border-white/10 pl-4" {...props} />
                ),
                p: ({ ...props }) => (
                  <p className="text-zinc-400 leading-relaxed mb-6 text-[15px]" {...props} />
                ),
                ul: ({ ...props }) => (
                  <ul className="list-none pl-0 space-y-4 mb-8" {...props} />
                ),
                li: ({ ...props }) => (
                  <li className="flex gap-4 text-zinc-400 group items-start" {...props}>
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-2 flex-shrink-0" />
                    <span className="flex-1">{props.children}</span>
                  </li>
                ),
                code: ({ children, className }) => {
                  const match = /language-(\w+)/.exec(className || "");
                  const isBlock = match || String(children).includes("\n");
                  
                  if (isBlock) {
                    return (
                      <div className="my-8 rounded-2xl overflow-hidden border border-white/10 bg-[#0d0d0d] shadow-2xl group/code">
                        {/* Editor Header */}
                        <div className="bg-white/[0.03] border-b border-white/5 px-4 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                            <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 font-mono">
                            {match ? match[1] : "tsx"}
                          </span>
                        </div>
                        {/* Code Content */}
                        <CodeBlock 
                          code={String(children).replace(/\n$/, "")} 
                          language={match ? match[1] : "tsx"} 
                        />
                      </div>
                    );
                  }
                  
                  return (
                    <code className="bg-white/5 px-2 py-0.5 rounded-md text-primary/80 font-mono text-sm font-bold border border-white/5">
                      {children}
                    </code>
                  );
                },
                hr: () => <hr className="border-white/5 my-20" />,
              }}
            >
              {content}
            </ReactMarkdown>
          </article>
        </div>
      </main>
    </div>
  );
}
