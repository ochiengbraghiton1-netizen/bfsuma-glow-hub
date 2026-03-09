import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-assistant`;

type Message = { role: "user" | "assistant"; content: string };

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

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! Welcome to BF SUMA Royal. I'm here to help you learn about our wellness products, pricing, and business opportunities. How can I assist you today?"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickReplies = [
    { text: "Product inquiries", action: "products" },
    { text: "Price list", action: "prices" },
    { text: "Join opportunity", action: "join" },
    { text: "Contact details", action: "contact" }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (userText: string, action?: string) => {
    if (isLoading || !userText.trim()) return;
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
    window.open("https://wa.me/254795454053", "_blank");
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="hero"
        size="icon"
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-glow animate-float"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </Button>

      {isOpen && (
        <Card className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[500px] flex flex-col shadow-elegant animate-scale-in border-border">
          <div className="bg-gradient-to-r from-primary to-accent p-4 rounded-t-2xl text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold">BF SUMA ROYAL Assistant</h3>
                <p className="text-sm text-white/80">Online</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-foreground border border-border"
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
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
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-border bg-background space-y-2">
            {messages.length <= 1 && (
              <>
                <p className="text-xs text-muted-foreground">Quick replies:</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {quickReplies.map((reply, index) => (
                    <Button
                      key={index}
                      onClick={() => sendMessage(reply.text, reply.action)}
                      variant="outline"
                      size="sm"
                      className="text-xs h-auto py-1.5"
                      disabled={isLoading}
                    >
                      {reply.text}
                    </Button>
                  ))}
                </div>
              </>
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
                variant="hero"
                size="icon"
                className="h-9 w-9 rounded-full shrink-0"
                disabled={isLoading || !input.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>

            <Button
              onClick={openWhatsApp}
              variant="outline"
              size="sm"
              className="w-full text-xs"
            >
              <Send className="w-3 h-3" />
              Chat with our team on WhatsApp
            </Button>
          </div>
        </Card>
      )}
    </>
  );
};

export default Chatbot;