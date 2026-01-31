import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { Chip, cn } from "@heroui/react";
import type { Room } from "api";
import { Icon } from "components/Icon";
import { useParams } from "next/navigation";

export const RoomLink = ({ room }: { room: Room }) => {
  const roomId = (useParams()?.id as string) || null;

  return (
    <Button
      as={Link}
      href={`/app/room/${room.id}`}
      className={cn(
        "mb-2 border border-primary flex items-center justify-between text-white bg-transparent",
        {
          "border-2 bg-primary-50 text-foreground font-bold":
            room.id === roomId,
        },
      )}
    >
      <span>{room.name}</span>

      <div className="flex gap-1 items-center">
        {room.protected && (
          <Chip
            variant="faded"
            size="sm"
            classNames={{ content: "p-0", base: "p-1" }}
          >
            <Icon name="lock" size={12} />
          </Chip>
        )}

        <Chip>{room.usersIdsInRoom.length}</Chip>
      </div>
    </Button>
  );
};
