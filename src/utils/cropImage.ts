import { Area } from 'react-easy-crop';

export default async function getCroppedImg(imageSrc: string | ArrayBuffer | null, pixelCrop: Area) {
  const image = new Image();
  image.src = imageSrc as string;
  await new Promise((resolve) => {
    image.onload = resolve;
  });
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise<string>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const fileUrl = URL.createObjectURL(blob);
        resolve(fileUrl);
      } else {
        reject(new Error('Canvas is empty'));
      }
    }, 'image/jpeg');
  });
}
