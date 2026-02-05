 import { useState, useRef, useCallback } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 import { Button } from '@/components/ui/button';
 import { Label } from '@/components/ui/label';
 import { useToast } from '@/hooks/use-toast';
 import { Upload, X, Loader2, ImageIcon, Camera } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 interface ProductImageUploadProps {
   value: string | null;
   onChange: (url: string | null) => void;
   disabled?: boolean;
 }
 
 const ProductImageUpload = ({ value, onChange, disabled }: ProductImageUploadProps) => {
   const [uploading, setUploading] = useState(false);
   const [dragOver, setDragOver] = useState(false);
   const fileInputRef = useRef<HTMLInputElement>(null);
   const { toast } = useToast();
 
   const uploadImage = useCallback(async (file: File) => {
     // Validate file type
     if (!file.type.startsWith('image/')) {
       toast({
         title: 'Invalid file type',
         description: 'Please upload a JPG or PNG image.',
         variant: 'destructive',
       });
       return;
     }
 
     // Validate file size (max 5MB)
     if (file.size > 5 * 1024 * 1024) {
       toast({
         title: 'File too large',
         description: 'Please upload an image smaller than 5MB.',
         variant: 'destructive',
       });
       return;
     }
 
     setUploading(true);
 
     try {
       // Generate unique filename
       const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
       const fileName = `${crypto.randomUUID()}.${fileExt}`;
       const filePath = `product-images/${fileName}`;
 
       // Upload to Supabase Storage
       const { error: uploadError } = await supabase.storage
         .from('products')
         .upload(filePath, file, {
           cacheControl: '3600',
           upsert: false,
         });
 
       if (uploadError) {
         throw uploadError;
       }
 
       // Get public URL
       const { data: urlData } = supabase.storage
         .from('products')
         .getPublicUrl(filePath);
 
       onChange(urlData.publicUrl);
 
       toast({
         title: 'Image uploaded',
         description: 'Product image uploaded successfully.',
       });
     } catch (error: any) {
       console.error('Upload error:', error);
       toast({
         title: 'Upload failed',
         description: error.message || 'Failed to upload image. Please try again.',
         variant: 'destructive',
       });
     } finally {
       setUploading(false);
     }
   }, [onChange, toast]);
 
   const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (file) {
       uploadImage(file);
     }
     // Reset input so same file can be selected again
     e.target.value = '';
   }, [uploadImage]);
 
   const handleDrop = useCallback((e: React.DragEvent) => {
     e.preventDefault();
     setDragOver(false);
     const file = e.dataTransfer.files?.[0];
     if (file) {
       uploadImage(file);
     }
   }, [uploadImage]);
 
   const handleDragOver = useCallback((e: React.DragEvent) => {
     e.preventDefault();
     setDragOver(true);
   }, []);
 
   const handleDragLeave = useCallback((e: React.DragEvent) => {
     e.preventDefault();
     setDragOver(false);
   }, []);
 
   const handleRemove = useCallback(() => {
     onChange(null);
   }, [onChange]);
 
   const triggerFileSelect = useCallback(() => {
     fileInputRef.current?.click();
   }, []);
 
   return (
     <div className="space-y-2">
       <Label>Product Image</Label>
       <p className="text-xs text-muted-foreground mb-2">
         Upload a JPG or PNG image (1:1 ratio recommended, max 5MB)
       </p>
 
       <input
         ref={fileInputRef}
         type="file"
         accept="image/jpeg,image/png,image/webp"
         onChange={handleFileSelect}
         className="hidden"
         disabled={disabled || uploading}
         // Enable camera on mobile
         capture="environment"
       />
 
       {value ? (
         // Success state: show preview
         <div className="space-y-3">
           <div className="relative w-full aspect-square max-w-[200px] rounded-lg overflow-hidden border border-border bg-muted">
             <img
               src={value}
               alt="Product preview"
               className="w-full h-full object-cover"
             />
             {!disabled && (
               <Button
                 type="button"
                 variant="destructive"
                 size="icon"
                 className="absolute top-2 right-2 h-7 w-7"
                 onClick={handleRemove}
               >
                 <X className="h-4 w-4" />
               </Button>
             )}
           </div>
           <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
             <ImageIcon className="h-3 w-3" />
             Image uploaded successfully
           </p>
           {!disabled && (
             <Button
               type="button"
               variant="outline"
               size="sm"
               onClick={triggerFileSelect}
               disabled={uploading}
             >
               {uploading ? (
                 <>
                   <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                   Uploading...
                 </>
               ) : (
                 <>
                   <Upload className="h-4 w-4 mr-2" />
                   Replace image
                 </>
               )}
             </Button>
           )}
         </div>
       ) : uploading ? (
         // Uploading state
         <div className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-primary/50 rounded-lg bg-primary/5">
           <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
           <p className="text-sm text-muted-foreground">Uploading image...</p>
         </div>
       ) : (
         // Empty state: prompt to upload
         <div
           onClick={triggerFileSelect}
           onDrop={handleDrop}
           onDragOver={handleDragOver}
           onDragLeave={handleDragLeave}
           className={cn(
             "flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
             dragOver
               ? "border-primary bg-primary/10"
               : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
             disabled && "opacity-50 cursor-not-allowed"
           )}
         >
           <div className="flex flex-col items-center gap-2 text-muted-foreground">
             <div className="flex gap-2">
               <Upload className="h-6 w-6" />
               <Camera className="h-6 w-6" />
             </div>
             <p className="text-sm font-medium">Click to upload or drag and drop</p>
             <p className="text-xs">JPG, PNG or WebP</p>
           </div>
         </div>
       )}
     </div>
   );
 };
 
 export default ProductImageUpload;