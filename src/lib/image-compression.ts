 /**
  * Compresses an image file using the Canvas API
  * @param file - The image file to compress
  * @param maxWidth - Maximum width of the output image (default: 1200)
  * @param maxHeight - Maximum height of the output image (default: 1200)
  * @param quality - JPEG/WebP quality (0-1, default: 0.8)
  * @returns Promise<File> - The compressed image file
  */
 export async function compressImage(
   file: File,
   maxWidth: number = 1200,
   maxHeight: number = 1200,
   quality: number = 0.8
 ): Promise<File> {
   return new Promise((resolve, reject) => {
     const img = new Image();
     const canvas = document.createElement('canvas');
     const ctx = canvas.getContext('2d');
 
     if (!ctx) {
       reject(new Error('Could not get canvas context'));
       return;
     }
 
     img.onload = () => {
       // Calculate new dimensions while maintaining aspect ratio
       let { width, height } = img;
       
       if (width > maxWidth) {
         height = (height * maxWidth) / width;
         width = maxWidth;
       }
       
       if (height > maxHeight) {
         width = (width * maxHeight) / height;
         height = maxHeight;
       }
 
       canvas.width = width;
       canvas.height = height;
 
       // Draw the image with high-quality scaling
       ctx.imageSmoothingEnabled = true;
       ctx.imageSmoothingQuality = 'high';
       ctx.drawImage(img, 0, 0, width, height);
 
       // Convert to blob
       const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
       const outputQuality = file.type === 'image/png' ? undefined : quality;
 
       canvas.toBlob(
         (blob) => {
           if (!blob) {
             reject(new Error('Could not compress image'));
             return;
           }
 
           // Create a new file with the compressed data
           const compressedFile = new File(
             [blob],
             file.name.replace(/\.[^.]+$/, outputType === 'image/png' ? '.png' : '.jpg'),
             { type: outputType }
           );
 
           // Only use compressed version if it's actually smaller
           if (compressedFile.size < file.size) {
             resolve(compressedFile);
           } else {
             resolve(file);
           }
         },
         outputType,
         outputQuality
       );
     };
 
     img.onerror = () => {
       reject(new Error('Could not load image for compression'));
     };
 
     // Load the image from the file
     img.src = URL.createObjectURL(file);
   });
 }
 
 /**
  * Format file size for display
  */
 export function formatFileSize(bytes: number): string {
   if (bytes < 1024) return bytes + ' B';
   if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
   return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
 }