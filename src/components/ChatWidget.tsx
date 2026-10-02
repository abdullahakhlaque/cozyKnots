import React, { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Trash2,
  Bot,
  User,
  ChevronDown,
  ExternalLink,
  HelpCircle,
  Scissors,
} from "lucide-react";

interface ActionLink {
  label: string;
  url: string;
}

interface Message {
  id: string;
  sender: "bot" | "user";
  senderName: string;
  text: string;
  timestamp: string;
  actions?: ActionLink[];
  suggestions?: string[];
}

const DEFAULT_WELCOME_MESSAGE: Message = {
  id: "welcome-0",
  sender: "bot",
  senderName: "Knotty 🧸",
  text: "Hi! I'm **Knotty**, your CozyKnots craft & shop assistant 🧶! How can I help you today? Ask me about crochet stitches, tutorials, product recommendations, or order shipping!",
  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  actions: [
    { label: "Explore Classroom 🎬", url: "/tutorials" },
    { label: "Browse Shop 🛍️", url: "/shop" },
  ],
  suggestions: [
    "What hook size do I start with?",
    "Recommend a plushie gift under ₹1,000",
    "What is a Magic Ring (MR)?",
    "How to download pattern PDFs?",
  ],
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [messages, setMessages] = useState<Message[]>([DEFAULT_WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      senderName: "You",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsLoading(true);

    try {
      // Determine host for API request
      const apiHost = typeof window !== "undefined" ? window.location.hostname : "localhost";
      const res = await fetch(`http://${apiHost}:5000/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          senderName: data.sender || "Knotty 🧸",
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          actions: data.actions || [],
          suggestions: data.suggestions || [],
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error("API server response issue");
      }
    } catch (err) {
      // Offline / Local Fallback Helper logic
      const fallbackReply = generateFallbackReply(text);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        senderName: "Knotty 🧸",
        text: fallbackReply.text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        actions: fallbackReply.actions,
        suggestions: fallbackReply.suggestions,
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([DEFAULT_WELCOME_MESSAGE]);
  };

  // Quick helper to format basic bold and linebreaks into clean HTML/JSX
  const renderFormattedText = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, idx) => {
      // Replace **text** with bold
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <React.Fragment key={idx}>
          {parts.map((part, pIdx) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return <strong key={pIdx} className="font-semibold text-primary">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
          {idx < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {/* ================= CHAT WINDOW ================= */}
      {isOpen && (
        <div className="mb-4 flex h-[530px] w-[350px] sm:w-[400px] flex-col rounded-3xl border border-border bg-card shadow-soft overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-amber-50/60 dark:bg-muted/40 px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-sm">
                <Scissors className="h-5 w-5 rotate-45" />
                <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display font-semibold text-base text-foreground">Knotty 🧸</h3>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    Cozy AI Assistant
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Ask anything about crochet & shop</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearHistory}
                title="Clear chat history"
                className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-destructive transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Minimize chat"
                className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-xs ${
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                  }`}
                >
                  {msg.sender === "user" ? <User className="h-4 w-4" /> : "🧶"}
                </div>

                {/* Bubble */}
                <div className="max-w-[80%] space-y-2">
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-xs shadow-cozy"
                        : "bg-card border border-border/80 text-foreground rounded-tl-xs shadow-xs"
                    }`}
                  >
                    <div className="whitespace-pre-line">{renderFormattedText(msg.text)}</div>
                  </div>

                  {/* Actions Links if any */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.actions.map((act, idx) => (
                        <Link
                          key={idx}
                          to={act.url}
                          onClick={() => setIsOpen(true)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          <span>{act.label}</span>
                          <ExternalLink className="h-3 w-3 opacity-70" />
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Suggestions Chips if any */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-amber-500" /> Suggested questions:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestions.map((sug, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(sug)}
                            className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs text-foreground/80 hover:bg-primary/15 hover:border-primary/40 hover:text-primary transition-all text-left"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <p
                    className={`text-[10px] text-muted-foreground ${
                      msg.sender === "user" ? "text-right px-1" : "px-1"
                    }`}
                  >
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            ))}

            {/* Loading Typing Indicator */}
            {isLoading && (
              <div className="flex gap-2.5 items-center">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs">
                  🧶
                </div>
                <div className="rounded-2xl rounded-tl-xs border border-border bg-card px-4 py-3 text-xs text-muted-foreground flex items-center gap-1.5 shadow-xs">
                  <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce"></span>
                  <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="h-2 w-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0.4s]"></span>
                  <span className="ml-1">Knotty is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Starter Pills */}
          {messages.length === 1 && (
            <div className="px-3 py-2 bg-amber-50/40 dark:bg-muted/20 border-t border-border/50">
              <p className="text-[11px] font-semibold text-muted-foreground mb-1.5 flex items-center gap-1">
                <HelpCircle className="h-3 w-3" /> Quick craft prompts:
              </p>
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                <button
                  onClick={() => handleSendMessage("What hook size do I need?")}
                  className="whitespace-nowrap rounded-full bg-card border border-border px-2.5 py-1 text-xs hover:border-primary hover:text-primary transition-colors"
                >
                  🪡 Hook Guide
                </button>
                <button
                  onClick={() => handleSendMessage("Recommend a plushie gift")}
                  className="whitespace-nowrap rounded-full bg-card border border-border px-2.5 py-1 text-xs hover:border-primary hover:text-primary transition-colors"
                >
                  🧸 Plushies
                </button>
                <button
                  onClick={() => handleSendMessage("What is a Magic Ring?")}
                  className="whitespace-nowrap rounded-full bg-card border border-border px-2.5 py-1 text-xs hover:border-primary hover:text-primary transition-colors"
                >
                  🧶 Magic Ring
                </button>
              </div>
            </div>
          )}

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 border-t border-border bg-card p-3"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Knotty a question..."
              className="flex-1 rounded-2xl border border-input bg-background px-3.5 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 shadow-xs"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* ================= FLOATING TRIGGER BUTTON ================= */}
      <div className="relative">
        {hasUnread && !isOpen && (
          <div className="absolute -top-10 right-0 animate-bounce">
            <div className="rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground shadow-cozy flex items-center gap-1 whitespace-nowrap">
              <span>Ask Knotty! 🧶</span>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-cozy transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-primary/30"
          aria-label="Toggle Crochet Assistant"
        >
          {isOpen ? (
            <X className="h-6 w-6 transition-transform duration-200 rotate-90" />
          ) : (
            <div className="relative flex items-center justify-center">
              <MessageCircle className="h-7 w-7 transition-transform group-hover:scale-110" />
              <span className="absolute -top-1 -right-1 text-xs">🧸</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}

// Fallback logic in case backend network port is offline
function generateFallbackReply(message: string): {
  text: string;
  actions?: ActionLink[];
  suggestions?: string[];
} {
  const query = message.toLowerCase();
  if (query.includes("magic ring") || query.includes("mr")) {
    return {
      text: "🧶 **Magic Ring (MR)** is the secret to starting amigurumi plushies without a center hole! Wrap yarn into a loop, work your stitches into the loop, and pull the tail tight.",
      actions: [{ label: "Watch Stitches Video 🎬", url: "/tutorials" }],
      suggestions: ["What is a single crochet?", "Recommend a plushie"],
    };
  }
  if (query.includes("hook") || query.includes("size")) {
    return {
      text: "🪡 **Hook Size Guide**: Use 3.5mm–4mm for plushies, 4.5mm–5.5mm for cotton totes, and 6mm+ for thick blankets!",
      actions: [{ label: "View Tutorials 🎬", url: "/tutorials" }],
      suggestions: ["What yarn to buy?", "What is a single crochet?"],
    };
  }
  if (query.includes("plushie") || query.includes("gift") || query.includes("bunny")) {
    return {
      text: "🧸 Our top handmade gift is the **Amigurumi Cozy Bunny** (₹899), hand-stitched with ultra-soft plush velvet yarn!",
      actions: [{ label: "Browse Shop 🛍️", url: "/shop" }],
      suggestions: ["Recommend a tote bag", "How is shipping handled?"],
    };
  }
  return {
    text: `🧶 Thanks for asking about "${message}"! Check out our craft tutorials or shop catalog to explore our handmade items!`,
    actions: [
      { label: "Browse Shop 🛍️", url: "/shop" },
      { label: "View Tutorials 🎬", url: "/tutorials" },
    ],
    suggestions: ["What hook size do I need?", "What is a Magic Ring?"],
  };
}
