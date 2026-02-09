import { cn } from '@/lib/utils';

interface RichTextContentProps {
  content: string;
  className?: string;
}

/**
 * RichTextContent component for rendering HTML content from the rich text editor.
 * Uses Tailwind Typography (prose) classes for proper formatting of headings, lists, etc.
 */
const RichTextContent = ({ content, className }: RichTextContentProps) => {
  if (!content) return null;

  return (
    <div
      className={cn(
        'prose prose-sm dark:prose-invert max-w-none',
        // Headings
        'prose-h1:text-2xl prose-h1:font-bold prose-h1:mb-4 prose-h1:mt-6',
        'prose-h2:text-xl prose-h2:font-semibold prose-h2:mb-3 prose-h2:mt-5',
        'prose-h3:text-lg prose-h3:font-semibold prose-h3:mb-2 prose-h3:mt-4',
        // Paragraphs
        'prose-p:my-2 prose-p:leading-relaxed',
        // Lists
        'prose-ul:my-3 prose-ul:pl-6 prose-ul:list-disc',
        'prose-ol:my-3 prose-ol:pl-6 prose-ol:list-decimal',
        'prose-li:my-1',
        // Blockquotes
        'prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:my-4',
        // Links
        'prose-a:text-primary prose-a:underline prose-a:hover:text-primary/80',
        // Code
        'prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm',
        // Images
        'prose-img:rounded-lg prose-img:my-4',
        // Strong/Bold
        'prose-strong:font-bold',
        // Strikethrough
        '[&_s]:line-through',
        className
      )}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default RichTextContent;
