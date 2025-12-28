"use client";

import { Skeleton } from "@heroui/skeleton";
import { cn } from "@heroui/theme";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { getRooms } from "@/src/api";
import { ExternalImage } from "@/src/components/ExternalImage";
import { Icon } from "@/src/components/Icon";
import { useProfile } from "@/src/hooks/useProfile";
import { useAuthContext } from "@/src/providers/Auth/hooks";
import { CreateRoomModal } from "./CreateRoomModal";

export const Sidebar = ({ className }: { className?: string }) => {
  const { userId } = useAuthContext();

  const { profile, isLoading } = useProfile(userId);

  const { data } = useQuery({
    queryKey: ["rooms"],
    queryFn: getRooms,
  });

  return (
    <aside className={cn(className, "flex h-full flex-col border-r")}>
      <div className="flex flex-col flex-1 overflow-hidden p-4">
        <h2 className="w-full text-xl font-bold mb-4">Rooms</h2>
        <CreateRoomModal />
        <div className="w-full flex-1 flex flex-col overflow-y-scroll">
          {data?.map((room) => (
            <Link
              key={room.id}
              href={`/app/room/${room.id}`}
              className="mb-2 p-2 border border-primary rounded flex items-center justify-between"
            >
              <span>{room.name}</span>

              {room.protected && <Icon name="lock" size={16} color="gray" />}
            </Link>
          ))}
        </div>
      </div>
      <div className="py-4 pl-4 border-t flex items-center">
        <Skeleton isLoaded={!isLoading}>
          {profile.photoUrl && (
            <ExternalImage
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
