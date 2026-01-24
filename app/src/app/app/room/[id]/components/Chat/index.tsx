import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { cn } from "@heroui/theme";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { getProfilePhotoUrl } from "@/src/api/telegram";
import { EmptyAvatar } from "@/src/components/EmptyAvatar";
import { ExternalImage } from "@/src/components/ExternalImage";
import { useAuthContext } from "@/src/providers/Auth/hooks";
import type { DataChannel } from "@/src/services/DataChannel";
import { useMessages } from "../../hooks/useMessages";

export const Chat = ({
  dataChannel,
  controls,
}: {
  dataChannel: DataChannel;
  controls: ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { userId } = useAuthContext();

  const { messages, add: addMessage } = useMessages();
  const [value, setValue] = useState("");

  useEffect(() => {
    dataChannel.addEventListener("message", (message) => {
      addMessage(message);

      requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      });
    });
  }, []);

  const onSendPress = () => {
    dataChannel.send(value);
    setValue("");
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSendPress();
    }
  };

  return (
    <>
      <div className="max-h-[calc(100%-40px)] flex-1">
        <div
          className="flex flex-col h-full w-full p-4 overflow-y-auto scroll-smooth"
          ref={containerRef}
        >
          {messages.map(({ id, data, from }) => (
            <div
              key={`${id}`}
              className={cn("flex gap-2 items-center max-w-3/4  mb-2", {
                "self-end flex-row-reverse": from === userId,
              })}
            >
              <ExternalImage
                fallback={<EmptyAvatar />}
                src={getProfilePhotoUrl(from)}
                alt={`${from}'s profile photo`}
                width={40}
                height={40}
              />
              <div className="bg-gray-200 p-2 rounded">{data}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-none flex gap-2">
        {controls}
        <Input
          onValueChange={setValue}
          value={value}
          onKeyDown={onInputKeyDown}
        />
        <Button color="primary" onPress={onSendPress}>
          Send
        </Button>
      </div>
    </>
  );
};
