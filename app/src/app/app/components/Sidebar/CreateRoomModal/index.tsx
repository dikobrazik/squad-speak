import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from "@heroui/modal";
import { Form } from "@heroui/react";
import { addToast } from "@heroui/toast";
import { useMutation } from "@tanstack/react-query";
import { createRoom } from "@/src/api";

export const CreateRoomModal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { mutateAsync: mutateRoom, isPending } = useMutation({
    mutationKey: ["rooms"],
    mutationFn: createRoom,
    onSuccess: (response) => {
      addToast({
        title: "Room Created",
        description: `Room "${response.name}" created successfully.`,
        color: "success",
      });
    },
  });

  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));

    try {
      await mutateRoom({
        name: String(data.name),
        password: data.password ? String(data.password) : undefined,
      });

      onClose();
    } catch {}
  };

  return (
    <>
      <Button color="primary" className="mb-2" onPress={onOpen}>
        Create Room
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Create Room</ModalHeader>
              <ModalBody>
                <Form onSubmit={onFormSubmit}>
                  <Input
                    isRequired
                    disabled={isPending}
                    placeholder="Name"
                    name="name"
                    type="text"
                    autoComplete="off"
                    fullWidth
                  />
                  <Input
                    disabled={isPending}
                    placeholder="Password"
                    name="password"
                    type="password"
                    autoComplete="off"
                    fullWidth
                  />
                  <div className="w-full gap-2 flex py-2 justify-end">
                    <Button
                      disabled={isPending}
                      type="button"
                      color="secondary"
                      onPress={onClose}
                    >
                      Cancel
                    </Button>
                    <Button disabled={isPending} type="submit" color="primary">
                      Create
                    </Button>
                  </div>
                </Form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
