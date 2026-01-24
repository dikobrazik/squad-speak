"use client";

import NextImage, { type ImageProps } from "next/image";
import { type ReactNode, useCallback, useState } from "react";

type ExternalImageProps = ImageProps & {
  fallback: ReactNode;
};

export const ExternalImage = (props: ExternalImageProps) => {
  const [showFallback, setShowFallback] = useState(false);

  const onLoadingError = useCallback(() => {
    setShowFallback(true);
  }, []);

  if (showFallback) {
    return props.fallback;
  }

  return (
    <NextImage
      data-loaded="false"
      onError={onLoadingError}
      onLoad={(event) => {
        event.currentTarget.setAttribute("data-loaded", "true");
      }}
      className="data-[loaded=false]:animate-pulse data-[loaded=false]:bg-gray-100/10"
      {...props}
    />
  );
};
