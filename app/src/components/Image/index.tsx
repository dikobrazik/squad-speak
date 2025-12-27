import NextImage, { type ImageProps } from "next/image";

export const ExternalImage = (props: ImageProps) => {
  return (
    <NextImage
      data-loaded="false"
      onLoad={(event) => {
        event.currentTarget.setAttribute("data-loaded", "true");
      }}
      className="data-[loaded=false]:animate-pulse data-[loaded=false]:bg-gray-100/10"
      {...props}
    />
  );
};
