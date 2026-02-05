 import { useState, useRef, useCallback } from 'react';
 import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
 import 'react-image-crop/dist/ReactCrop.css';
 import { Button } from '@/components/ui/button';
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
 import { Loader2, Check, X, RotateCcw } from 'lucide-react';
 
 interface ImageCropperProps {
   imageSrc: string;
   onCropComplete: (croppedBlob: Blob) => void;
   onCancel: () => void;
   open: boolean;
   aspectRatio?: number;
 }
 
 function centerAspectCrop(
   mediaWidth: number,
   mediaHeight: number,
   aspect: number
 ): Crop {
   return centerCrop(
     makeAspectCrop(
       {
         unit: '%',
         width: 90,
       },
       aspect,
       mediaWidth,
       mediaHeight
     ),
     mediaWidth,
     mediaHeight
   );
 }
 
 const ImageCropper = ({
   imageSrc,
   onCropComplete,
   onCancel,
   open,
   aspectRatio = 1,
 }: ImageCropperProps) => {
   const [crop, setCrop] = useState<Crop>();
   const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
   const [isProcessing, setIsProcessing] = useState(false);
   const imgRef = useRef<HTMLImageElement>(null);
 
   const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
     const { width, height } = e.currentTarget;
     setCrop(centerAspectCrop(width, height, aspectRatio));
   }, [aspectRatio]);
 
   const handleReset = useCallback(() => {
     if (imgRef.current) {
       const { width, height } = imgRef.current;
       setCrop(centerAspectCrop(width, height, aspectRatio));
     }
   }, [aspectRatio]);
 
   const getCroppedImg = useCallback(async (): Promise<Blob | null> => {
     if (!imgRef.current || !completedCrop) return null;
 
     const image = imgRef.current;
     const canvas = document.createElement('canvas');
     const ctx = canvas.getContext('2d');
 
     if (!ctx) return null;
 
     const scaleX = image.naturalWidth / image.width;
     const scaleY = image.naturalHeight / image.height;
 
     const pixelRatio = window.devicePixelRatio || 1;
     
     canvas.width = completedCrop.width * scaleX * pixelRatio;
     canvas.height = completedCrop.height * scaleY * pixelRatio;
 
     ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
     ctx.imageSmoothingQuality = 'high';
 
     ctx.drawImage(
       image,
       completedCrop.x * scaleX,
       completedCrop.y * scaleY,
       completedCrop.width * scaleX,
       completedCrop.height * scaleY,
       0,
       0,
       completedCrop.width * scaleX,
       completedCrop.height * scaleY
     );
 
     return new Promise((resolve) => {
       canvas.toBlob(
         (blob) => resolve(blob),
         'image/jpeg',
         0.9
       );
     });
   }, [completedCrop]);
 
   const handleConfirm = useCallback(async () => {
     setIsProcessing(true);
     try {
       const croppedBlob = await getCroppedImg();
       if (croppedBlob) {
         onCropComplete(croppedBlob);
       }
     } catch (error) {
       console.error('Crop error:', error);
     } finally {
       setIsProcessing(false);
     }
   }, [getCroppedImg, onCropComplete]);
 
   return (
     <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
       <DialogContent className="max-w-lg">
         <DialogHeader>
           <DialogTitle>Crop Product Image</DialogTitle>
         </DialogHeader>
         
         <div className="flex flex-col items-center gap-4">
           <p className="text-sm text-muted-foreground">
             Adjust the crop area for a perfect 1:1 square image
           </p>
           
           <div className="max-h-[400px] overflow-auto rounded-lg border">
             <ReactCrop
               crop={crop}
               onChange={(_, percentCrop) => setCrop(percentCrop)}
               onComplete={(c) => setCompletedCrop(c)}
               aspect={aspectRatio}
               className="max-w-full"
             >
               <img
                 ref={imgRef}
                 src={imageSrc}
                 alt="Crop preview"
                 onLoad={onImageLoad}
                 className="max-w-full"
                 crossOrigin="anonymous"
               />
             </ReactCrop>
           </div>
         </div>
 
         <DialogFooter className="flex gap-2 sm:gap-0">
           <Button
             type="button"
             variant="outline"
             size="sm"
             onClick={handleReset}
             disabled={isProcessing}
           >
             <RotateCcw className="h-4 w-4 mr-1" />
             Reset
           </Button>
           <div className="flex gap-2 ml-auto">
             <Button
               type="button"
               variant="ghost"
               onClick={onCancel}
               disabled={isProcessing}
             >
               <X className="h-4 w-4 mr-1" />
               Cancel
             </Button>
             <Button
               type="button"
               onClick={handleConfirm}
               disabled={isProcessing || !completedCrop}
             >
               {isProcessing ? (
                 <>
                   <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                   Processing...
                 </>
               ) : (
                 <>
                   <Check className="h-4 w-4 mr-1" />
                   Apply Crop
                 </>
               )}
             </Button>
           </div>
         </DialogFooter>
       </DialogContent>
     </Dialog>
   );
 };
 
 export default ImageCropper;