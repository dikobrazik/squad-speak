"use client";

import { Skeleton } from "@heroui/skeleton";
import { cn } from "@heroui/theme";
import { useQuery } from "@tanstack/react-query";
import ms from "ms";
import { getRooms } from "@/src/api";
import { EmptyAvatar } from "@/src/components/EmptyAvatar";
import { ExternalImage } from "@/src/components/ExternalImage";
import { useProfile } from "@/src/hooks/useProfile";
import { useAuthContext } from "@/src/providers/Auth/hooks";
import { CreateRoomModal } from "./CreateRoomModal";
import { RoomLink } from "./RoomLink";

export const Sidebar = ({ className }: { className?: string }) => {
  const { userId } = useAuthContext();

  const { profile, isLoading } = useProfile(userId);

  const { data } = useQuery({
    queryKey: ["rooms"],
    queryFn: getRooms,
    refetchInterval: ms("10s"),
    refetchOnWindowFocus: true,
  });

  return (
    <aside className={cn(className, "flex h-full flex-col border-r")}>
      <div className="flex flex-col flex-1 overflow-hidden p-4">
        <CreateRoomModal />
        <h2 className="w-full text-xl font-bold mb-4">Rooms</h2>
        <div className="w-full flex-1 flex flex-col overflow-y-scroll">
          {data?.map((room) => (
            <RoomLink room={room} key={room.id} />
          ))}
        </div>
      </div>
      <div className="py-4 pl-4 border-t flex items-center">
        <Skeleton isLoaded={!isLoading}>
          {profile.photoUrl && (
            <ExternalImage
              fallback={<EmptyAvatar />}
              src={profile.photoUrl}
              alt={profile?.name || "User Photo"}
              width={50}
              height={50}
            />
          )}
        </Skeleton>
        <Skeleton className="ml-2" isLoaded={!isLoading}>
          {profile?.name}
        </Skeleton>
      </div>
    </aside>
  );
};
