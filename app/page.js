"use client";

import { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

function createDiamondMask(width, height, diamondSize) {
  const mask = new Float32Array(width * height);
  // Calculate diamond dimensions based on image size and diamond size
  console.log(diamondSize);
  const diamondWidth = width * diamondSize;
  const diamondHeight = height * diamondSize;

  // Calculate number of diamonds that fit in the image
  const numDiamondsX = Math.ceil(width / diamondWidth);
  const numDiamondsY = Math.ceil(height / diamondHeight);

  // Calculate centers for each diamond
  const centers = [];
  for (let i = 0; i < numDiamondsY; i++) {
    for (let j = 0; j < numDiamondsX; j++) {
      const centerX = j * diamondWidth + diamondWidth / 2;
      const centerY = i * diamondHeight + diamondHeight / 2;
      centers.push({ centerX, centerY });
    }
  }

  console.log(height, width);
  console.log(centers);

  centers.forEach(({ centerX, centerY }) => {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = Math.abs(x - centerX) / (width * diamondSize);
        const dy = Math.abs(y - centerY) / (height * diamondSize);
        if (dx + dy < 1) {
          mask[y * width + x] = 1;
        }
      }
    }
  });

  return mask;
}

function createTriangleMask(width, height, triangleBase) {
  const mask = new Float32Array(width * height);
  const centerX = width / 2;
  const centerY = height / 2;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = Math.abs(x - centerX) / (width * triangleBase);
      const dy = Math.abs(y - centerY) / (height * triangleBase);
      mask[y * width + x] = dx + dy < 1 ? 1 : 0;
    }
  }

  return mask;
}

function createCircleMask(width, height, radius) {
  const mask = new Float32Array(width * height);
  const centerX = width / 2;
  const centerY = height / 2;
  const radiusSquared = radius * radius;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      mask[y * width + x] = dx * dx + dy * dy <= radiusSquared ? 1 : 0;
    }
  }

  return mask;
}

function createSquareMask(width, height, squareSize) {
  const mask = new Float32Array(width * height);
  const startX = (width - squareSize) / 2;
  const startY = (height - squareSize) / 2;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      mask[y * width + x] =
        x >= startX &&
        x < startX + squareSize &&
        y >= startY &&
        y < startY + squareSize
          ? 1
          : 0;
    }
  }

  return mask;
}

function reflectImage(data, width, height) {
  const reflected = new Uint8ClampedArray(data.length);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcIndex = (y * width + x) * 4;
      const destIndex = ((height - y - 1) * width + (width - x - 1)) * 4;

      reflected[destIndex] = data[srcIndex];
      reflected[destIndex + 1] = data[srcIndex + 1];
      reflected[destIndex + 2] = data[srcIndex + 2];
      reflected[destIndex + 3] = data[srcIndex + 3];
    }
  }

  return reflected;
}

function applyDiamondReflectionEffect(
  data,
  reflectedData,
  mask,
  width,
  height,
  edgeSoftness
) {
  const result = new Uint8ClampedArray(data.length);
  const blurredMask = gaussianBlur(mask, width, height, edgeSoftness);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const softValue = blurredMask[y * width + x];

      result[index] =
        data[index] * softValue + reflectedData[index] * (1 - softValue);
      result[index + 1] =
        data[index + 1] * softValue +
        reflectedData[index + 1] * (1 - softValue);
      result[index + 2] =
        data[index + 2] * softValue +
        reflectedData[index + 2] * (1 - softValue);
      result[index + 3] = data[index + 3]; // alpha channel remains the same
    }
  }

  return result;
}

function gaussianBlur(data, width, height, radius) {
  const kernel = createGaussianKernel(radius);
  const temp = new Float32Array(data.length);

  // Horizontal pass
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let k = -radius; k <= radius; k++) {
        const idx = Math.min(width - 1, Math.max(0, x + k));
        sum += data[y * width + idx] * kernel[k + radius];
      }
      temp[y * width + x] = sum;
    }
  }

  // Vertical pass
  const result = new Float32Array(data.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let k = -radius; k <= radius; k++) {
        const idx = Math.min(height - 1, Math.max(0, y + k));
        sum += temp[idx * width + x] * kernel[k + radius];
      }
      result[y * width + x] = sum;
    }
  }

  return result;
}

function createGaussianKernel(radius) {
  const sigma = radius / 3;
  const kernelSize = 2 * radius + 1;
  const kernel = new Float32Array(kernelSize);
  const mean = radius;
  let sum = 0;

  for (let i = 0; i < kernelSize; i++) {
    kernel[i] =
      Math.exp(-0.5 * Math.pow((i - mean) / sigma, 2)) /
      (sigma * Math.sqrt(2 * Math.PI));
    sum += kernel[i];
  }

  // Normalize the kernel
  for (let i = 0; i < kernelSize; i++) {
    kernel[i] /= sum;
  }

  return kernel;
}

export default function Home() {
  const [imageFile, setImageFile] = useState(null);
  const [refraction, setRefraction] = useState(0.5);
  const [refractionFocus, setRefractionFocus] = useState(20);
  const canvasRef = useRef(null);
  const [isFilterLoading, setIsFilterLoading] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // const imageUrl = URL.createObjectURL(file);
    }
  };

  console.log(isFilterLoading);
  useEffect(() => {
    if (Boolean(imageFile)) {
      handleImage();
    }
  }, [refraction, refractionFocus]);

  const handleImage = async () => {
    setIsFilterLoading(true);
    const reader = new FileReader();
    reader.onload = function (event) {
      const img = new Image();

      img.onload = function () {
        const canvas = canvasRef.current;

        if (canvas) {
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          canvas.width = img.width;
          canvas.height = img.height;

          // Draw the original image
          ctx.drawImage(img, 0, 0, img.width, img.height);

          // Get image data
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const data = imageData.data;

          // Create the diamond mask
          const mask = createDiamondMask(img.width, img.height, refraction);

          // Reflect image
          const reflectedData = reflectImage(data, img.width, img.height);

          // Apply the diamond reflection effect
          const resultData = applyDiamondReflectionEffect(
            data,
            reflectedData,
            mask,
            img.width,
            img.height,
            refractionFocus
          );

          // Put the modified data back to canvas
          ctx.putImageData(
            new ImageData(resultData, img.width, img.height),
            0,
            0
          );
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(imageFile);
    // await new Promise((resolve, reject) => setTimeout(resolve, 100));
    setIsFilterLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-12">
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        <div className="w-full p-6 bg-card rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-4 text-card-foreground">
            Image Effects
          </h1>
          <div className="flex">
            {imageFile ? (
              <img
                className="size-[600px] object-contain"
                src={URL.createObjectURL(imageFile)}
              />
            ) : (
              <>
                <div className="flex flex-col items-center justify-center h-64 bg-muted rounded-lg">
                  <div className="w-12 h-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">
                    Drag and drop an image or click to upload
                  </p>
                </div>
              </>
            )}

            <div className="relative size-[600px] aspect-square overflow-hidden rounded-lg">
              {isFilterLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-35 flex items-center justify-center">
                  <div className="animate-spin size-20 border-4 border-white"></div>
                </div>
              )}
              <canvas
                ref={canvasRef}
                id="canvas"
                className="w-full h-full object-contain"
              ></canvas>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="refraction">Refraction</Label>
              <Slider
                id="refraction"
                min={0}
                max={1}
                step={0.1}
                value={[refraction]}
                onValueChange={([value]) => setRefraction(value)}
                className="[&>span:first-child]:h-1 [&>span:first-child]:bg-primary [&[role=slider]]:bg-primary [&[role=slider]]:w-3 [&[role=slider]]:h-3 [&[role=slider]]:border-0 [&>span:first-child_span]:bg-primary [&[role=slider]:focus-visible]:ring-0 [&[role=slider]:focus-visible]:ring-offset-0 [&[role=slider]:focus-visible]:scale-105 [&[role=slider]:focus-visible]:transition-transform"
              />
            </div>
            <div>
              <Label htmlFor="refractionFocus">Refraction Focus</Label>
              <Slider
                id="refractionFocus"
                min={10}
                max={100}
                step={10}
                value={[refractionFocus]}
                onValueChange={([value]) => setRefractionFocus(value)}
                className="[&>span:first-child]:h-1 [&>span:first-child]:bg-primary [&[role=slider]]:bg-primary [&[role=slider]]:w-3 [&[role=slider]]:h-3 [&[role=slider]]:border-0 [&>span:first-child_span]:bg-primary [&[role=slider]:focus-visible]:ring-0 [&[role=slider]:focus-visible]:ring-offset-0 [&[role=slider]:focus-visible]:scale-105 [&[role=slider]:focus-visible]:transition-transform"
              />
            </div>
          </div>
          <div className="mt-6 flex gap-3 justify-center">
            <label
              htmlFor="image-upload"
              className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors"
            >
              <div className="w-5 h-5 mr-2" />
              Upload Image
            </label>
            <input
              id="image-upload"
              type="file"
              className="hidden"
              onChange={handleImageUpload}
            />
            <button
              className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors"
              disabled={!Boolean(imageFile)}
              onClick={handleImage}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
