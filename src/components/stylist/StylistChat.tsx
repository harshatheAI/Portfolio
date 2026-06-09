"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, X } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  "Wedding guest outfit under ₹8,000",
  "Diwali look — festive & comfortable",
  "Everyday office kurta",
  "Men's sherwani for a wedding",
  "Light saree for summer event",
  "Kids' outfit for a festive occasion",
];

export default function StylistChat({ initialProduct }: { initialProduct?: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hi! I'm Priya 👋 I'm your personal stylist for Indian ethnic fashion.\n\nWhether you're dressing for a wedding in Houston, Diwali in London, or just want a gorgeous everyday kurta — I'm here to help.\n\n${initialProduct ? `I see you're looking at a specific piece! Tell me more about the occasion you have in mind, your budget, and where you're based, and I'll curate the perfect look around it.` : `Tell me about your occasion, budget, and where you live — let's find you the perfect outfit! ✨`}`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/stylist/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          productContext: initialProduct,
        }),
      });

      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "I'm having a little trouble right now. Please try again in a moment! 🙏",
      }]);
    } finally {
      setLoading(false);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-3`}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-[#8B1A1A] flex items-center justify-center text-white text-xs font-bold shrink-0 mt-1">
                P
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-[#8B1A1A] text-white rounded-tr-sm"
                  : "bg-[#F5F0E8] text-[#2C2C2C] rounded-tl-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-[#8B1A1A] flex items-center justify-center text-white text-xs font-bold shrink-0">P</div>
            <div className="bg-[#F5F0E8] rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1.5">
                {[0, 0.2, 0.4].map((delay) => (
                  <div
                    key={delay}
                    className="w-2 h-2 bg-[#D4A843] rounded-full animate-bounce"
                    style={{ animationDelay: `${delay}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <div className="px-4 pb-3">
          <p className="text-xs text-[#8A8A8A] mb-2 font-medium">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="text-xs bg-white border border-[#EDE5D8] hover:border-[#8B1A1A] hover:text-[#8B1A1A] px-3 py-1.5 rounded-full transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-[#EDE5D8]">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Priya anything about Indian ethnic wear..."
            rows={1}
            className="flex-1 resize-none bg-[#F5F0E8] rounded-2xl px-4 py-3 text-sm text-[#2C2C2C] placeholder-[#8A8A8A] outline-none focus:ring-2 focus:ring-[#8B1A1A]/20 max-h-32 overflow-y-auto"
            style={{ minHeight: "44px" }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="w-11 h-11 bg-[#8B1A1A] text-white rounded-full flex items-center justify-center hover:bg-[#A52929] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
