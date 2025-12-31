import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import type { ReactNode } from "react";

export const Chat = ({ controls }: { controls: ReactNode }) => {
  return (
    <>
      <div className="flex-1"></div>

      <div className="flex-none flex gap-2">
        {controls}
        <Input />
        <Button color="primary">Send</Button>
      </div>
    </>
  );
};
