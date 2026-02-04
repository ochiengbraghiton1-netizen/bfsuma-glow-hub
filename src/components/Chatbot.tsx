import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, X, Send } from "lucide-react";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: "Hello! I'm here to help you with BF SUMA ROYAL products and business opportunities. How can I assist you today?"
    }
  ]);

  const quickReplies = [
    { text: "Product inquiries", action: "products" },
    { text: "Price list", action: "prices" },
    { text: "Join opportunity", action: "join" },
    { text: "Contact details", action: "contact" }
  ];

  const handleQuickReply = (action: string) => {
    let response = "";
    
    switch(action) {
      case "products":
        response = "We offer premium health supplements including NMN Capsules, ArthroXtra, X Power Man, Ganoderma Spores, and more. Would you like to talk directly to Braghiton on WhatsApp for detailed information?";
        break;
      case "prices":
        response = "Our products range from KSh 4,914 to KSh 22,113. For a complete price list and special offers, would you like to connect on WhatsApp?";
        break;
      case "join":
        response = "Great choice! As a BF SUMA ROYAL distributor, you can earn commissions, bonuses, and build a wellness business. Would you like to talk to Braghiton on WhatsApp to get started?";
        break;
      case "contact":
        response = "Contact Braghiton Ochieng:\n📱 WhatsApp: +254 795 454053\n✉️ Email: braghiton.ochieng.125@gmail.com\n📍 JKUAT Towers, Westlands, Nairobi";
        break;
    }

    setMessages([...messages, { type: "user", text: quickReplies.find(r => r.action === action)?.text || "" }, { type: "bot", text: response }]);
  };

  const openWhatsApp = () => {
    window.open("https://wa.me/254795454053", "_blank");
  };

  return (
    <>
      {/* Chat Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="hero"
        size="icon"
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-glow animate-float"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[500px] flex flex-col shadow-elegant animate-scale-in border-border">
          {/* Header */}
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

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
            {messages.map((message, index) => (
              <div 
                key={index}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    message.type === "user" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-card text-foreground border border-border"
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Replies */}
          <div className="p-4 border-t border-border bg-background">
            <p className="text-xs text-muted-foreground mb-3">Quick replies:</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {quickReplies.map((reply, index) => (
                <Button
                  key={index}
                  onClick={() => handleQuickReply(reply.action)}
                  variant="outline"
                  size="sm"
                  className="text-xs h-auto py-2"
                >
                  {reply.text}
                </Button>
              ))}
            </div>
            
            <Button 
              onClick={openWhatsApp}
              variant="hero"
              className="w-full"
            >
              <Send className="w-4 h-4" />
              Talk to Braghiton on WhatsApp
            </Button>
          </div>
        </Card>
      )}
    </>
  );
};

export default Chatbot;
