"use client";

import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { Form } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useParams, useRouter } from "next/navigation";
import { type PropsWithChildren, useState } from "react";
import { checkRoomPassword, getRoom } from "@/src/api";
import { LoadingPage } from "@/src/components/LoadingPage";
import {
  RoomPasswordStore,
  useRoomsPasswordsStore,
} from "@/src/providers/RoomPasswordStore";

export default function Layout({ children }: PropsWithChildren) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { passwords, addPassword } = useRoomsPasswordsStore();
  const roomId = String(useParams().id);
  const { data: room, isLoading } = useQuery({
    queryKey: ["room", roomId],
    queryFn: () => getRoom(roomId),
  });

  const onJoinProtectedRoom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;

    try {
      await checkRoomPassword(roomId, password);
    } catch (e) {
      if (isAxiosError(e) && e.response?.data.error === "invalid_password") {
        setErrors({ password: "Invalid password" });
        return;
      }
    }

    addPassword(roomId, password);
  };

  if (isLoading || !room) {
    return <LoadingPage />;
  }

  if (room.protected && passwords[roomId] === undefined) {
    return (
      <div>
        <Modal isOpen onClose={() => router.push("/app")}>
          <ModalContent>
            {() => (
              <>
                <ModalHeader>Protected Room</ModalHeader>
                <ModalBody>
                  <Form
                    validationErrors={errors}
                    onSubmit={onJoinProtectedRoom}
                  >
                    <p>
                      This room is protected. Please enter the password to join.
                    </p>
                    <Input
                      isRequired
                      type="password"
                      name="password"
                      placeholder="Enter room password"
                    />
                    <div className="w-full flex justify-end items-center">
                      <Button type="submit" color="primary">
                        Join Room
                      </Button>
                    </div>
                  </Form>
                </ModalBody>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    );
  }

  return children;
}
