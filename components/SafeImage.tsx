"use client";

import Image from "next/image";
import { useState } from "react";

type SafeImageProps = {
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
    fallbackSrc?: string;
};

export default function SafeImage({
    src,
    alt,
    width,
    height,
    className,
    fallbackSrc = "https://dummyimage.com/600x400/000/fff",
}: SafeImageProps) {
    const [imgSrc, setImgSrc] = useState(src?.trim() ? src : fallbackSrc);

    return (
        <Image
            src={imgSrc}
            alt={alt}
            width={width}
            height={height}
            className={className}
            onError={() => setImgSrc(fallbackSrc)}
        />
    );
}
