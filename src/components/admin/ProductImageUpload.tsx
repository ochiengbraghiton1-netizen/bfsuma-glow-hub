 import { useState, useRef, useCallback, useMemo } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 import { Button } from '@/components/ui/button';
 import { Label } from '@/components/ui/label';
 import { useToast } from '@/hooks/use-toast';
 import { Upload, X, Loader2, ImageIcon, Camera, Plus, Check, Crop } from 'lucide-react';
 import { cn } from '@/lib/utils';
 import { compressImage, formatFileSize } from '@/lib/image-compression';
 import ImageCropper from './ImageCropper';
 
 interface ProductImageUploadProps {
   value: string | null;
   onChange: (url: string | null) => void;
   disabled?: boolean;
   multiple?: boolean;
   onMultipleChange?: (urls: string[]) => void;
   existingUrls?: string[];
 }
 
 interface UploadProgress {
   file: File;
   status: 'pending' | 'compressing' | 'uploading' | 'done' | 'error';
   progress: number;
   url?: string;
   originalSize: number;
   compressedSize?: number;
   error?: string;
 }
 
 const ProductImageUpload = ({ 
   value, 
   onChange, 
   disabled,
   multiple = false,
   onMultipleChange,
   existingUrls = []
 }: ProductImageUploadProps) => {
   const [uploading, setUploading] = useState(false);
   const [dragOver, setDragOver] = useState(false);
   const [uploadQueue, setUploadQueue] = useState<UploadProgress[]>([]);
   const [cropperOpen, setCropperOpen] = useState(false);
   const [imageToCrop, setImageToCrop] = useState<string | null>(null);
   const [pendingFile, setPendingFile] = useState<File | null>(null);
   const fileInputRef = useRef<HTMLInputElement>(null);
   const { toast } = useToast();
 
   const uploadSingleImage = useCallback(async (
     file: File, 
     updateProgress: (update: Partial<UploadProgress>) => void
   ): Promise<string | null> => {
     if (!file.type.startsWith('image/')) {
       toast({
         title: 'Invalid file type',
         description: 'Please upload a JPG or PNG image.',
         variant: 'destructive',
       });
       return null;
     }
 
     if (file.size > 5 * 1024 * 1024) {
       toast({
         title: 'File too large',
         description: 'Please upload an image smaller than 5MB.',
         variant: 'destructive',
       });
       return null;
     }
 
     try {
       updateProgress({ status: 'compressing', progress: 20 });
       const compressedFile = await compressImage(file, 1200, 1200, 0.8);
       updateProgress({ 
         status: 'uploading', 
         progress: 40,
         compressedSize: compressedFile.size 
       });
 
       const fileExt = compressedFile.name.split('.').pop()?.toLowerCase() || 'jpg';
       const fileName = `${crypto.randomUUID()}.${fileExt}`;
       const filePath = `product-images/${fileName}`;
 
       const { error: uploadError } = await supabase.storage
         .from('products')
         .upload(filePath, compressedFile, {
           cacheControl: '3600',
           upsert: false,
         });
 
       if (uploadError) throw uploadError;
 
       updateProgress({ progress: 80 });
 
       const { data: urlData } = supabase.storage
         .from('products')
         .getPublicUrl(filePath);
 
       updateProgress({ status: 'done', progress: 100, url: urlData.publicUrl });
       return urlData.publicUrl;
     } catch (error: any) {
       console.error('Upload error:', error);
       updateProgress({ status: 'error', error: error.message });
       return null;
     }
   }, [toast]);
 
   const uploadImage = useCallback(async (file: File) => {
     setUploading(true);
     try {
       const url = await uploadSingleImage(file, () => {});
       if (url) {
         onChange(url);
         toast({
           title: 'Image uploaded',
           description: 'Product image compressed & uploaded successfully.',
         });
       }
     } catch (error: any) {
       console.error('Upload error:', error);
       toast({
         title: 'Upload failed',
         description: error.message || 'Failed to upload image.',
         variant: 'destructive',
       });
     } finally {
       setUploading(false);
     }
   }, [onChange, toast, uploadSingleImage]);
 
   const uploadMultipleImages = useCallback(async (files: File[]) => {
     const queue: UploadProgress[] = files.map(file => ({
       file,
       status: 'pending',
       progress: 0,
       originalSize: file.size,
     }));
     setUploadQueue(queue);
     setUploading(true);
 
     const uploadedUrls: string[] = [...existingUrls];
 
     for (let i = 0; i < files.length; i++) {
       const file = files[i];
       const updateProgress = (update: Partial<UploadProgress>) => {
         setUploadQueue(prev => prev.map((item, idx) => 
           idx === i ? { ...item, ...update } : item
         ));
       };
 
       const url = await uploadSingleImage(file, updateProgress);
       if (url) uploadedUrls.push(url);
     }
 
     setUploading(false);
 
     if (onMultipleChange && uploadedUrls.length > existingUrls.length) {
       onMultipleChange(uploadedUrls);
       const newCount = uploadedUrls.length - existingUrls.length;
       toast({
         title: 'Images uploaded',
         description: `Successfully uploaded ${newCount} image${newCount > 1 ? 's' : ''}.`,
       });
     }
 
     setTimeout(() => setUploadQueue([]), 3000);
   }, [existingUrls, onMultipleChange, toast, uploadSingleImage]);
 
   const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
     const files = e.target.files;
     if (!files || files.length === 0) return;
 
     if (multiple && files.length > 1) {
       uploadMultipleImages(Array.from(files));
     } else if (files[0] && !multiple) {
       // For single image, open cropper first
       const file = files[0];
       setPendingFile(file);
       const reader = new FileReader();
       reader.onload = () => {
         setImageToCrop(reader.result as string);
         setCropperOpen(true);
       };
       reader.readAsDataURL(file);
     } else if (files[0]) {
       uploadImage(files[0]);
     }
     e.target.value = '';
   }, [multiple, uploadImage, uploadMultipleImages]);
 
   const handleDrop = useCallback((e: React.DragEvent) => {
     e.preventDefault();
     setDragOver(false);
     const files = e.dataTransfer.files;
     if (!files || files.length === 0) return;
 
     if (multiple && files.length > 1) {
       uploadMultipleImages(Array.from(files));
     } else if (files[0] && !multiple) {
       // For single image, open cropper first
       const file = files[0];
       setPendingFile(file);
       const reader = new FileReader();
       reader.onload = () => {
         setImageToCrop(reader.result as string);
         setCropperOpen(true);
       };
       reader.readAsDataURL(file);
     } else if (files[0]) {
       uploadImage(files[0]);
     }
   }, [multiple, uploadImage, uploadMultipleImages]);
 
   const handleCropComplete = useCallback(async (croppedBlob: Blob) => {
     setCropperOpen(false);
     setImageToCrop(null);
     
     // Create a File from the cropped blob
     const fileName = pendingFile?.name || 'cropped-image.jpg';
     const croppedFile = new File([croppedBlob], fileName, { type: 'image/jpeg' });
     setPendingFile(null);
     
     await uploadImage(croppedFile);
   }, [pendingFile, uploadImage]);
 
   const handleCropCancel = useCallback(() => {
     setCropperOpen(false);
     setImageToCrop(null);
     setPendingFile(null);
   }, []);
 
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
 
   const compressionStats = useMemo(() => {
     const completedUploads = uploadQueue.filter(u => u.status === 'done' && u.compressedSize);
     if (completedUploads.length === 0) return null;
     
     const totalOriginal = completedUploads.reduce((sum, u) => sum + u.originalSize, 0);
     const totalCompressed = completedUploads.reduce((sum, u) => sum + (u.compressedSize || 0), 0);
     const saved = totalOriginal - totalCompressed;
     const percentage = Math.round((saved / totalOriginal) * 100);
     
     return { saved, percentage };
   }, [uploadQueue]);
 
   // Bulk upload progress view
   if (multiple && uploadQueue.length > 0) {
     return (
       <div className="space-y-2">
         <Label>Product Images (Bulk Upload)</Label>
         <div className="border rounded-lg p-4 space-y-3">
           {uploadQueue.map((item, idx) => (
             <div key={idx} className="flex items-center gap-3">
               <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                 {item.status === 'done' ? (
                   <Check className="h-5 w-5 text-green-500" />
                 ) : item.status === 'error' ? (
                   <X className="h-5 w-5 text-destructive" />
                 ) : (
                   <Loader2 className="h-5 w-5 animate-spin text-primary" />
                 )}
               </div>
               <div className="flex-1 min-w-0">
                 <p className="text-sm font-medium truncate">{item.file.name}</p>
                 <div className="flex items-center gap-2 text-xs text-muted-foreground">
                   <span>{formatFileSize(item.originalSize)}</span>
                   {item.compressedSize && item.compressedSize < item.originalSize && (
                     <>
                       <span>→</span>
                       <span className="text-green-600">{formatFileSize(item.compressedSize)}</span>
                     </>
                   )}
                 </div>
                 {item.error && <p className="text-xs text-destructive">{item.error}</p>}
               </div>
               <div className="w-16 text-right">
                 <span className="text-xs text-muted-foreground">
                   {item.status === 'pending' && 'Waiting...'}
                   {item.status === 'compressing' && 'Compressing'}
                   {item.status === 'uploading' && 'Uploading'}
                   {item.status === 'done' && 'Done'}
                   {item.status === 'error' && 'Failed'}
                 </span>
               </div>
             </div>
           ))}
           {compressionStats && compressionStats.saved > 0 && (
             <p className="text-xs text-green-600 pt-2 border-t">
               💾 Saved {formatFileSize(compressionStats.saved)} ({compressionStats.percentage}% reduction)
             </p>
           )}
         </div>
       </div>
     );
   }
 
   return (
     <div className="space-y-2">
       <Label>Product Image</Label>
       <p className="text-xs text-muted-foreground mb-2">
         Upload a JPG or PNG image (auto-cropped to 1:1 square, max 5MB)
         {multiple && ' - Select multiple files for bulk upload'}
       </p>
 
       {/* Image Cropper Modal */}
       {imageToCrop && (
         <ImageCropper
           imageSrc={imageToCrop}
           onCropComplete={handleCropComplete}
           onCancel={handleCropCancel}
           open={cropperOpen}
           aspectRatio={1}
         />
       )}
 
       <input
         ref={fileInputRef}
         type="file"
         accept="image/jpeg,image/png,image/webp"
         onChange={handleFileSelect}
         className="hidden"
         disabled={disabled || uploading}
         multiple={multiple}
         capture="environment"
       />
 
       {value ? (
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
         <div className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-primary/50 rounded-lg bg-primary/5">
           <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
           <p className="text-sm text-muted-foreground">Compressing & uploading...</p>
         </div>
       ) : (
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
               {multiple && <Plus className="h-6 w-6" />}
             </div>
             <p className="text-sm font-medium">
               {multiple ? 'Click to upload or drag multiple images' : 'Click to upload or drag and drop'}
             </p>
             <p className="text-xs">JPG, PNG or WebP • Auto-cropped & compressed</p>
           </div>
         </div>
       )}
     </div>
   );
 };
 
 export default ProductImageUpload;