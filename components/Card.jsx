/**
 * v0 by Vercel.
 * @see https://v0.dev/t/mSKYIubDbNx
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

export default function Component() {
  const [image, setImage] = useState(null)
  const [refraction, setRefraction] = useState(0.5)
  const [refractionFocus, setRefractionFocus] = useState(0.5)
  const handleImageUpload = (event) => {
    setImage(event.target.files[0])
  }
  const handleRefractionChange = (value) => {
    setRefraction(value)
  }
  const handleRefractionFocusChange = (value) => {
    setRefractionFocus(value)
  }
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <div className="max-w-2xl w-full p-6 bg-card rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-card-foreground">Image Effects</h1>
        {image ? (
          <div className="relative w-full aspect-square overflow-hidden rounded-lg">
            <img
              src="/placeholder.svg"
              alt="Uploaded Image"
              width={600}
              height={600}
              className="w-full h-full object-contain"
            //   style={{ filter: refract(${refraction}, ${refractionFocus}) }}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 bg-muted rounded-lg">
            <div className="w-12 h-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Drag and drop an image or click to upload</p>
          </div>
        )}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="refraction">Refraction</Label>
            <Slider
              id="refraction"
              min={0}
              max={1}
              step={0.01}
              value={[refraction]}
              onValueChange={handleRefractionChange}
              className="[&>span:first-child]:h-1 [&>span:first-child]:bg-primary [&[role=slider]]:bg-primary [&[role=slider]]:w-3 [&[role=slider]]:h-3 [&[role=slider]]:border-0 [&>span:first-child_span]:bg-primary [&[role=slider]:focus-visible]:ring-0 [&[role=slider]:focus-visible]:ring-offset-0 [&[role=slider]:focus-visible]:scale-105 [&[role=slider]:focus-visible]:transition-transform"
            />
          </div>
          <div>
            <Label htmlFor="refractionFocus">Refraction Focus</Label>
            <Slider
              id="refractionFocus"
              min={0}
              max={1}
              step={0.01}
              value={[refractionFocus]}
              onValueChange={handleRefractionFocusChange}
              className="[&>span:first-child]:h-1 [&>span:first-child]:bg-primary [&[role=slider]]:bg-primary [&[role=slider]]:w-3 [&[role=slider]]:h-3 [&[role=slider]]:border-0 [&>span:first-child_span]:bg-primary [&[role=slider]:focus-visible]:ring-0 [&[role=slider]:focus-visible]:ring-offset-0 [&[role=slider]:focus-visible]:scale-105 [&[role=slider]:focus-visible]:transition-transform"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-center">
          <label
            htmlFor="image-upload"
            className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors"
          >
            <div className="w-5 h-5 mr-2" />
            Upload Image
          </label>
          <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </div>
      </div>
    </div>
  )
}