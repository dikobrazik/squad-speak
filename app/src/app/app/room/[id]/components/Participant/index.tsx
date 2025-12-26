"use client";

import { Skeleton } from "@heroui/skeleton";
import { cn } from "@heroui/theme";
import { useQuery } from "@tanstack/react-query";
import { getProfile, getProfilePhotoUrl } from "@/src/api/telegram";
import { Image } from "@/src/components/Image";
import { useVolumeAnimation } from "../../hooks/useVolumeAnimation";
import { AudioPlayer } from "../AudioPlayer";
import css from "./Participant.module.scss";

export const Participant = ({
  userId,
  stream,
}: {
  userId: string;
  stream: MediaStream;
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ["telegram", "profile", userId],
    queryFn: () => getProfile(userId),
  });

  const isLoaded = Boolean(!isLoading && data);

  const barRef = useVolumeAnimation({ stream });

  return (
    <div className="flex flex-col">
      <div key={userId} className="flex items-center">
        <div className="flex h-[50px]">
          <div className={cn(css.meter, "self-stretch")}>
            <div ref={barRef} className={css.bar}></div>
          </div>
          <Skeleton isLoaded={isLoaded}>
            <Image
              src={getProfilePhotoUrl(userId)}
              alt={data?.name || "User Photo"}
              width={50}
              height={50}
            />
          </Skeleton>
        </div>
        <Skeleton className="ml-2" isLoaded={isLoaded}>
          {data?.name}
        </Skeleton>
      </div>
      <AudioPlayer stream={stream} />
    </div>
  );
};
