import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Send, Loader2, Sparkles, Phone, ArrowRight, HelpCircle, BookOpen, Briefcase, ShoppingBag, Stethoscope } from "lucide-react";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-assistant`;
const WHATSAPP_NUMBER = "254795454053";
const WHATSAPP_BASE = `https://wa.me/${WHATSAPP_NUMBER}`;

type Message = { role: "user" | "assistant"; content: string };

interface QuickReply {
  text: string;
  icon: React.ReactNode;
  action?: string;
  type: "ai" | "whatsapp" | "link";
  whatsappMsg?: string;
  linkTo?: string;
}

function getWhatsAppUrl(message: string) {
  return `${WHATSAPP_BASE}?text=${encodeURIComponent(message)}`;
}

function trackEvent(eventName: string, data?: Record<string, string>) {
  if (typeof window !== "undefined" && (window as any).dataLayer) {
    (window as any).dataLayer.push({
      event: eventName,
      ...data,
    });
  }
}

async function streamChat({
  messages,
  action,
  onDelta,
  onDone,
  onError,
}: {
  messages: Message[];
  action?: string;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (err: string) => void;
}) {
  try {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages, action }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: "Something went wrong" }));
      onError(err.error || "Something went wrong");
      return;
    }

    if (!resp.body) { onError("No response"); return; }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let idx: number;
      while ((idx = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (!line.startsWith("data: ")) continue;
        const json = line.slice(6).trim();
        if (json === "[DONE]") { onDone(); return; }
        try {
          const parsed = JSON.parse(json);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onDelta(content);
        } catch { /* partial chunk */ }
      }
    }
    onDone();
  } catch {
    onError("Connection failed. Please try again.");
  }
}

/** Detect page context from current URL */
function usePageContext() {
  const location = useLocation();
  const path = location.pathname;

  if (path.startsWith("/product/")) {
    const slug = path.replace("/product/", "");
    const name = slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    return { type: "product" as const, slug, name };
  }
  if (path.startsWith("/category")) {
    return { type: "category" as const, slug: "", name: "" };
  }
  return { type: "general" as const, slug: "", name: "" };
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const [showFallback, setShowFallback] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pageContext = usePageContext();

  // Build welcome message based on page context
  const getWelcomeMessage = useCallback((): string => {
    if (pageContext.type === "product") {
      return `Hi! 👋 I see you're looking at ${pageContext.name}. Need help with this product, or want guidance choosing the right supplement?`;
    }
    if (pageContext.type === "category") {
      return "Hi! 👋 Not sure what to choose? I can help you find the right supplement for your needs, or connect you with our team.";
    }
    return "Hi! 👋 Welcome to BF SUMA Royal. I can help you find the right supplement, check prices, or connect you with our wellness team. How can I help?";
  }, [pageContext.type, pageContext.name]);

  // Reset messages when context changes or chat opens
  useEffect(() => {
    if (isOpen) {
      setMessages([{ role: "assistant", content: getWelcomeMessage() }]);
      setShowFallback(false);
    }
  }, [isOpen, getWelcomeMessage]);

  // Fallback CTA after inactivity
  useEffect(() => {
    if (isOpen && messages.length <= 1) {
      fallbackTimerRef.current = setTimeout(() => setShowFallback(true), 8000);
    }
    return () => {
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    };
  }, [isOpen, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Build quick replies based on context
  const quickReplies: QuickReply[] = (() => {
    const base: QuickReply[] = [
      {
        text: "Help me choose a product",
        icon: <ShoppingBag className="w-3.5 h-3.5" />,
        action: "products",
        type: "ai",
      },
      {
        text: "View price list",
        icon: <BookOpen className="w-3.5 h-3.5" />,
        action: "prices",
        type: "ai",
      },
      {
        text: "Which product solves my issue?",
        icon: <HelpCircle className="w-3.5 h-3.5" />,
        action: "health_issue",
        type: "ai",
      },
      {
        text: "Book consultation",
        icon: <Stethoscope className="w-3.5 h-3.5" />,
        type: "whatsapp",
        whatsappMsg: "Hi, I'd like to book a free health consultation.",
      },
      {
        text: "Join business opportunity",
        icon: <Briefcase className="w-3.5 h-3.5" />,
        type: "link",
        linkTo: "/join-business",
      },
    ];

    if (pageContext.type === "product") {
      base.unshift({
        text: `Tell me about ${pageContext.name}`,
        icon: <HelpCircle className="w-3.5 h-3.5" />,
        action: "products",
        type: "ai",
      });
    }

    return base;
  })();

  const handleQuickReply = (reply: QuickReply) => {
    trackEvent("chatbot_quick_reply", { reply_text: reply.text, reply_type: reply.type });

    if (reply.type === "whatsapp") {
      trackEvent("chatbot_whatsapp_redirect", { source: "quick_reply", message: reply.whatsappMsg || "" });
      window.open(getWhatsAppUrl(reply.whatsappMsg || "Hi, I'd like help choosing the right supplement for my needs."), "_blank");
      return;
    }
    if (reply.type === "link" && reply.linkTo) {
      window.location.href = reply.linkTo;
      return;
    }
    sendMessage(reply.text, reply.action);
  };

  const sendMessage = (userText: string, action?: string) => {
    if (isLoading || !userText.trim()) return;
    setShowFallback(false);
    const userMsg: Message = { role: "user", content: userText.trim() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setInput("");

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length > 1 && prev[prev.length - 2]?.content === userText.trim()) {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    streamChat({
      messages: [...messages, userMsg],
      action,
      onDelta: upsertAssistant,
      onDone: () => setIsLoading(false),
      onError: (err) => {
        setMessages(prev => [...prev, { role: "assistant", content: err }]);
        setIsLoading(false);
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const openWhatsApp = () => {
    const msg = pageContext.type === "product"
      ? `Hi, I'm interested in ${pageContext.name}. Can you guide me?`
      : "Hi, I'd like help choosing the right supplement for my needs.";
    trackEvent("chatbot_whatsapp_redirect", { source: "talk_to_us", page_context: pageContext.type });
    window.open(getWhatsAppUrl(msg), "_blank");
  };

  const showQuickReplies = messages.length <= 1;

  // Don't show on admin pages
  const location = useLocation();
  if (location.pathname.startsWith("/admin")) return null;

  return (
    <>
      {/* Floating button — distinct from WhatsApp */}
      <Button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) trackEvent("chatbot_opened", { page: location.pathname });
        }}
        size="icon"
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-[0_4px_24px_hsl(var(--primary)/0.4)] hover:shadow-[0_4px_32px_hsl(var(--primary)/0.6)] bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 animate-float"
        aria-label={isOpen ? "Close assistant" : "Open assistant"}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
      </Button>

      {isOpen && (
        <Card className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[520px] flex flex-col shadow-elegant animate-scale-in border-border overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 p-4 rounded-t-2xl text-primary-foreground">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm">BF SUMA Royal Assistant</h3>
                <p className="text-xs text-primary-foreground/70">Need help? Chat with us or get a free consultation</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm whitespace-pre-line ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-foreground border border-border"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start">
                <div className="bg-card text-foreground border border-border p-3 rounded-2xl">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}

            {/* Fallback CTA after inactivity */}
            {showFallback && !isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-card border border-border rounded-2xl p-3 space-y-2 max-w-[85%]">
                  <p className="text-sm text-foreground">Want to talk to a real person? Tap below 👇</p>
                  <Button
                    onClick={openWhatsApp}
                    size="sm"
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-xs h-8 gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Chat on WhatsApp
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-border bg-background space-y-2">
            {showQuickReplies && (
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground font-medium">How can we help?</p>
                <div className="flex flex-wrap gap-1.5">
                  {quickReplies.map((reply, index) => (
                    <Button
                      key={index}
                      onClick={() => handleQuickReply(reply)}
                      variant="outline"
                      size="sm"
                      className="text-xs h-auto py-1.5 px-2.5 gap-1.5"
                      disabled={isLoading}
                    >
                      {reply.icon}
                      {reply.text}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question..."
                disabled={isLoading}
                className="flex-1 h-9 rounded-full border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              />
              <Button
                type="submit"
                size="icon"
                className="h-9 w-9 rounded-full shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isLoading || !input.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>

            <Button
              onClick={openWhatsApp}
              variant="outline"
              size="sm"
              className="w-full text-xs gap-1.5 border-accent/30 text-accent-foreground hover:bg-accent/10"
            >
              <Phone className="w-3.5 h-3.5 text-accent" />
              Talk to our team on WhatsApp
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        </Card>
      )}
    </>
  );
};

export default Chatbot;