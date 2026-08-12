"use client";

import { useState } from "react";
import Image from "next/image";

type Props = {
  images: string[];
  name: string;
};

export default function PrebuiltImageGallery({ images, name }: Props) {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  return (
    <div>
      <div className="group relative h-[520px] w-full overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900">
        <div className="absolute inset-0 bg-gradient-to-tr from-neutral-900 to-neutral-800 opacity-50" />

        <Image
          src={selectedImage}
          alt={name}
          fill
          className="relative z-10 object-contain p-6 transition duration-300 group-hover:scale-110"
        />
      </div>

      {images.length > 1 ? (
        <div className="mt-4 grid grid-cols-2 gap-4">
          {images.map((image, index) => {
            const isActive = image === selectedImage;

            return (
              <button
                key={image}
                type="button"
                onClick={() => setSelectedImage(image)}
                className={`relative h-28 overflow-hidden rounded-2xl border transition ${
                  isActive
                    ? "border-white"
                    : "border-neutral-700 hover:border-neutral-500"
                }`}
              >
                <Image
                  src={image}
                  alt={`${name} view ${index + 1}`}
                  fill
                  className="object-contain bg-neutral-900 p-2"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}