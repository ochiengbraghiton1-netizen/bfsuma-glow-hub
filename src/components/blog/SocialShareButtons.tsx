import { useState } from "react";
import { Facebook, Twitter, Copy, Check, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SocialShareButtonsProps {
  url: string;
  title: string;
}

const SocialShareButtons = ({ url, title }: SocialShareButtonsProps) => {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      label: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      className: "hover:bg-[#1877F2]/10 hover:text-[#1877F2] hover:border-[#1877F2]/30",
    },
    {
      label: "X (Twitter)",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      className: "hover:bg-foreground/10 hover:border-foreground/30",
    },
    {
      label: "WhatsApp",
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      className: "hover:bg-[#25D366]/10 hover:text-[#25D366] hover:border-[#25D366]/30",
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground mr-1">Share:</span>
      {shareLinks.map((link) => (
        <Button
          key={link.label}
          variant="outline"
          size="sm"
          className={`gap-2 rounded-full transition-all duration-200 ${link.className}`}
          asChild
        >
          <a href={link.href} target="_blank" rel="noopener noreferrer" aria-label={`Share on ${link.label}`}>
            <link.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{link.label}</span>
          </a>
        </Button>
      ))}
      <Button
        variant="outline"
        size="sm"
        className="gap-2 rounded-full transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
        onClick={handleCopy}
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        <span className="hidden sm:inline">{copied ? "Copied!" : "Copy Link"}</span>
      </Button>
    </div>
  );
};

export default SocialShareButtons;
