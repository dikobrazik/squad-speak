"use client";

import { Skeleton } from "@heroui/skeleton";
import { cn } from "@heroui/theme";
import { ExternalImage } from "@/src/components/ExternalImage";
import { Icon } from "@/src/components/Icon";
import { useProfile } from "@/src/hooks/useProfile";
import { useVolumeAnimation } from "../../hooks/useVolumeAnimation";
import { AudioPlayer } from "../AudioPlayer";
import css from "./Participant.module.scss";

export const Participant = ({
  userId,
  stream,
  isLocal,
  muted,
}: {
  isLocal?: boolean;
  muted?: boolean;
  userId: string;
  stream: MediaStream;
}) => {
  const { profile, isLoading } = useProfile(userId);

  const isLoaded = Boolean(!isLoading && profile);

  const barRef = useVolumeAnimation({ stream });

  return (
    <div className="flex flex-col">
      <div key={userId} className="flex items-center">
        <div className="flex h-[50px]">
          <div className={cn(css.meter, "self-stretch")}>
            <div ref={barRef} className={css.bar}></div>
          </div>
          <Skeleton classNames={{ content: "relative" }} isLoaded={isLoaded}>
            {profile.photoUrl && (
              <>
                <ExternalImage
                  src={profile.photoUrl}
                  alt={profile?.name || "User Photo"}
                  width={50}
                  height={50}
                />
                {muted && (
                  <div className="absolute right-0 bottom-0 bg-danger">
                    <Icon size={16} name="microMuted" className="text-danger" />
                  </div>
                )}
              </>
            )}
          </Skeleton>
        </div>
        <Skeleton className="ml-2" isLoaded={isLoaded}>
          {profile?.name}
        </Skeleton>
      </div>
      {!isLocal && <AudioPlayer stream={stream} />}
    </div>
  );
};
