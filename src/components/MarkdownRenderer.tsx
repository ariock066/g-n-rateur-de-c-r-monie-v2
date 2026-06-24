import React from "react";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  // Split content into paragraphs or logical sections
  const lines = content.split("\n");
  const parsedElements: React.ReactNode[] = [];

  let inList = false;
  let listItems: string[] = [];
  let listKey = 0;

  const flushList = () => {
    if (listItems.length > 0) {
      const itemsToRender = [...listItems];
      const key = `list-${listKey++}`;
      parsedElements.push(
        <ul key={key} className="list-disc pl-6 mb-6 space-y-2 text-[#2a2a2a] font-serif">
          {itemsToRender.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {renderInlineStyles(item)}
            </li>
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  // Helper to render basic inline styles (**bold**, *italic*)
  const renderInlineStyles = (text: string): React.ReactNode[] => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index} className="font-sans font-bold text-[#1a1a1a]">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={index} className="italic font-serif text-red-900">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      flushList();
      continue;
    }

    // Bullet points
    if (line.startsWith("- ") || line.startsWith("* ")) {
      inList = true;
      listItems.push(line.substring(2));
      continue;
    }

    // If we were in a list but current line is not a bullet point, flush list
    if (inList) {
      flushList();
    }

    // Headings
    if (line.startsWith("### ")) {
      parsedElements.push(
        <h3 key={i} className="text-sm uppercase tracking-wider font-sans font-bold text-red-900 mt-6 mb-2 border-l-2 border-red-700 pl-3">
          {renderInlineStyles(line.substring(4))}
        </h3>
      );
    } else if (line.startsWith("## ")) {
      parsedElements.push(
        <h2 key={i} className="text-lg font-serif font-bold text-[#1a1a1a] mt-8 mb-3 border-b border-[#1a1a1a]/10 pb-2 italic">
          {renderInlineStyles(line.substring(3))}
        </h2>
      );
    } else if (line.startsWith("# ")) {
      parsedElements.push(
        <h1 key={i} className="text-2xl font-serif font-light text-[#1a1a1a] mt-10 mb-4 tracking-tight border-b border-[#1a1a1a]/20 pb-3">
          {renderInlineStyles(line.substring(2))}
        </h1>
      );
    }
    // Blockquotes
    else if (line.startsWith("> ")) {
      parsedElements.push(
        <blockquote key={i} className="border-l-4 border-red-800 bg-[#f9f6f0] italic font-serif text-[#2a2a2a] pl-5 py-3 pr-3 my-5 rounded-sm">
          {renderInlineStyles(line.substring(2))}
        </blockquote>
      );
    }
    // Normal paragraphs
    else {
      parsedElements.push(
        <p key={i} className="text-[#2a2a2a] font-serif leading-relaxed mb-4 text-[15px]">
          {renderInlineStyles(line)}
        </p>
      );
    }
  }

  // Flush any remaining list items at the end
  flushList();

  return <div className="space-y-1 font-serif">{parsedElements}</div>;
}

// Function to parse Markdown to standard HTML for the Word Export format
export function parseMarkdownToHtmlForWord(markdown: string): string {
  if (!markdown) return "";
  
  const lines = markdown.split("\n");
  let html = "";
  let inList = false;

  const flushListWord = () => {
    if (inList) {
      html += "</ul>";
      inList = false;
    }
  };

  const processInline = (text: string): string => {
    // Basic bold and italic parsing for Word compatibility
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>");
    return formatted;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      flushListWord();
      continue;
    }

    if (line.startsWith("- ") || line.startsWith("* ")) {
      if (!inList) {
        html += "<ul style='margin-bottom: 12px; padding-left: 20px;'>";
        inList = true;
      }
      html += `<li style='margin-bottom: 6px; font-size: 11pt; font-family: Georgia, serif; color: #2a2a2a;'>${processInline(line.substring(2))}</li>`;
      continue;
    }

    if (inList) {
      flushListWord();
    }

    if (line.startsWith("### ")) {
      html += `<h3 style='color: #991b1b; font-family: Arial, sans-serif; font-size: 11pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-top: 18px; border-left: 3px solid #991b1b; padding-left: 10px;'>${processInline(line.substring(4))}</h3>`;
    } else if (line.startsWith("## ")) {
      html += `<h2 style='color: #1a1a1a; font-family: Georgia, serif; font-size: 15pt; font-style: italic; font-weight: bold; margin-top: 28px; border-bottom: 1px solid #e5e5e5; padding-bottom: 5px;'>${processInline(line.substring(3))}</h2>`;
    } else if (line.startsWith("# ")) {
      html += `<h1 style='color: #1a1a1a; font-family: Georgia, serif; font-size: 22pt; font-weight: normal; margin-top: 35px; margin-bottom: 15px; border-bottom: 2px solid #1a1a1a; padding-bottom: 8px;'>${processInline(line.substring(2))}</h1>`;
    } else if (line.startsWith("> ")) {
      html += `<blockquote style='margin: 18px 0; padding: 12px 18px; border-left: 4px solid #991b1b; background-color: #fcfaf7; color: #2a2a2a; font-style: italic; font-family: Georgia, serif;'>${processInline(line.substring(2))}</blockquote>`;
    } else {
      html += `<p style='margin-bottom: 14px; font-size: 11pt; line-height: 1.6; color: #2a2a2a; font-family: Georgia, serif;'>${processInline(line)}</p>`;
    }
  }

  flushListWord();
  return html;
}
