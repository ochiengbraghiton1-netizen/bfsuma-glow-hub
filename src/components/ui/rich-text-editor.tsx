import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Link as LinkIcon,
  Image as ImageIcon,
  Youtube as YoutubeIcon,
  Undo,
  Redo,
  Quote,
  Code,
  Strikethrough,
  Upload,
  Loader2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  FileCode,
} from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

const MenuButton = ({
  onClick,
  isActive,
  children,
  title,
  disabled,
}: {
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  title: string;
  disabled?: boolean;
}) => (
  <Button
    type="button"
    variant="ghost"
    size="sm"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      'h-8 w-8 p-0 shrink-0',
      isActive && 'bg-primary/15 text-primary ring-1 ring-primary/30'
    )}
    title={title}
  >
    {children}
  </Button>
);

const Divider = () => <div className="w-px h-6 bg-border mx-0.5 shrink-0" />;

const RichTextEditor = ({
  content,
  onChange,
  placeholder = 'Start writing...',
  className,
  minHeight = '200px',
}: RichTextEditorProps) => {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [youtubeDialogOpen, setYoutubeDialogOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        codeBlock: false, // we use our own or StarterKit's built-in
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: true,
        autolink: true,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
          rel: 'noopener noreferrer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
      }),
      Youtube.configure({
        width: 640,
        height: 360,
        HTMLAttributes: {
          class: 'rounded-lg my-4',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      isInternalUpdate.current = true;
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none focus:outline-none px-6 py-4',
          'prose-headings:font-bold',
          'prose-h1:text-3xl prose-h1:mb-4 prose-h1:mt-6',
          'prose-h2:text-2xl prose-h2:mb-3 prose-h2:mt-5',
          'prose-h3:text-xl prose-h3:mb-2 prose-h3:mt-4',
          'prose-h4:text-lg prose-h4:mb-2 prose-h4:mt-3',
          'prose-h5:text-base prose-h5:font-bold prose-h5:mb-1 prose-h5:mt-3',
          'prose-h6:text-sm prose-h6:font-bold prose-h6:mb-1 prose-h6:mt-2',
          'prose-p:my-2 prose-p:leading-relaxed',
          'prose-ul:my-3 prose-ol:my-3',
          'prose-ul:list-disc prose-ol:list-decimal prose-ul:pl-6 prose-ol:pl-6',
          'prose-li:my-1 prose-li:leading-relaxed',
          'prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:my-4',
          'prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm',
          'prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-pre:my-4',
        ),
      },
    },
  });

  // Only sync external content changes (e.g., when opening edit dialog with new data)
  // Use a ref to track whether this is an external update vs internal typing
  const isInternalUpdate = useRef(false);

  useEffect(() => {
    if (editor && !isInternalUpdate.current && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
    isInternalUpdate.current = false;
  }, [content, editor]);

  const addLink = useCallback(() => {
    if (linkUrl && editor) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setLinkDialogOpen(false);
    }
  }, [editor, linkUrl]);

  const addImageByUrl = useCallback(() => {
    if (imageUrl && editor) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
      setImageDialogOpen(false);
    }
  }, [editor, imageUrl]);

  const addYoutube = useCallback(() => {
    if (youtubeUrl && editor) {
      editor.chain().focus().setYoutubeVideo({ src: youtubeUrl }).run();
      setYoutubeUrl('');
      setYoutubeDialogOpen(false);
    }
  }, [editor, youtubeUrl]);

  const handleImageUpload = useCallback(async (file: File) => {
    if (!editor) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file type', description: 'Please upload an image file', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please upload an image smaller than 5MB', variant: 'destructive' });
      return;
    }
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `blog-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `blog-images/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('products').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(filePath);
      editor.chain().focus().setImage({ src: publicUrl }).run();
      toast({ title: 'Image uploaded', description: 'Image has been added to the content' });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({ title: 'Upload failed', description: 'Failed to upload image. Please try again.', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  }, [editor, toast]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [handleImageUpload]);

  if (!editor) return null;

  return (
    <div className={cn('border border-input rounded-lg bg-background shadow-sm', className)}>
      <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />

      {/* Sticky Toolbar */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 p-2 border-b border-input bg-muted/50 backdrop-blur-sm rounded-t-lg">
        {/* Text formatting */}
        <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold (Ctrl+B)">
          <Bold className="h-4 w-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic (Ctrl+I)">
          <Italic className="h-4 w-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline (Ctrl+U)">
          <UnderlineIcon className="h-4 w-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strikethrough">
          <Strikethrough className="h-4 w-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} title="Inline Code">
          <Code className="h-4 w-4" />
        </MenuButton>

        <Divider />

        {/* Headings */}
        <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="Heading 1">
          <Heading1 className="h-4 w-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Heading 2">
          <Heading2 className="h-4 w-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="Heading 3">
          <Heading3 className="h-4 w-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} isActive={editor.isActive('heading', { level: 4 })} title="Heading 4">
          <Heading4 className="h-4 w-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()} isActive={editor.isActive('heading', { level: 5 })} title="Heading 5">
          <Heading5 className="h-4 w-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()} isActive={editor.isActive('heading', { level: 6 })} title="Heading 6">
          <Heading6 className="h-4 w-4" />
        </MenuButton>

        <Divider />

        {/* Lists & blocks */}
        <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List">
          <List className="h-4 w-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Numbered List">
          <ListOrdered className="h-4 w-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Quote">
          <Quote className="h-4 w-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} title="Code Block">
          <FileCode className="h-4 w-4" />
        </MenuButton>

        <Divider />

        {/* Alignment */}
        <MenuButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Align Left">
          <AlignLeft className="h-4 w-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Align Center">
          <AlignCenter className="h-4 w-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Align Right">
          <AlignRight className="h-4 w-4" />
        </MenuButton>

        <Divider />

        {/* Media & links */}
        <MenuButton onClick={() => setLinkDialogOpen(true)} title="Add Link">
          <LinkIcon className="h-4 w-4" />
        </MenuButton>
        <MenuButton onClick={() => fileInputRef.current?.click()} title="Upload Image" disabled={uploading}>
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        </MenuButton>
        <MenuButton onClick={() => setImageDialogOpen(true)} title="Add Image by URL">
          <ImageIcon className="h-4 w-4" />
        </MenuButton>
        <MenuButton onClick={() => setYoutubeDialogOpen(true)} title="Add YouTube Video">
          <YoutubeIcon className="h-4 w-4" />
        </MenuButton>

        <Divider />

        {/* Undo/Redo */}
        <MenuButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
          <Undo className="h-4 w-4" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
          <Redo className="h-4 w-4" />
        </MenuButton>
      </div>

      {/* Editor content area - desktop optimized */}
      <div style={{ minHeight }} className="overflow-auto max-h-[70vh]">
        <div className="max-w-[900px] mx-auto">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="z-50">
          <DialogHeader>
            <DialogTitle>Add Link</DialogTitle>
            <DialogDescription>Enter the URL for the link</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="link-url">URL</Label>
              <Input id="link-url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://example.com" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>Cancel</Button>
            <Button onClick={addLink}>Add Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image URL Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="z-50">
          <DialogHeader>
            <DialogTitle>Add Image by URL</DialogTitle>
            <DialogDescription>Enter the URL of an image to embed</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-url">Image URL</Label>
              <Input id="image-url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageDialogOpen(false)}>Cancel</Button>
            <Button onClick={addImageByUrl}>Add Image</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* YouTube Dialog */}
      <Dialog open={youtubeDialogOpen} onOpenChange={setYoutubeDialogOpen}>
        <DialogContent className="z-50">
          <DialogHeader>
            <DialogTitle>Add YouTube Video</DialogTitle>
            <DialogDescription>Enter the YouTube video URL</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="youtube-url">YouTube URL</Label>
              <Input id="youtube-url" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setYoutubeDialogOpen(false)}>Cancel</Button>
            <Button onClick={addYoutube}>Add Video</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RichTextEditor;
