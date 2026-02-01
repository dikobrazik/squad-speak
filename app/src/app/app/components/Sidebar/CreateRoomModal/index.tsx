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
import { createRoom } from "api";
import { I18n } from "components/I18n";
import { useTranslations } from "next-intl";

export const CreateRoomModal = () => {
  const t = useTranslations();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { mutateAsync: mutateRoom, isPending } = useMutation({
    mutationKey: ["rooms"],
    mutationFn: createRoom,
    onSuccess: (response) => {
      addToast({
        title: <I18n id="createRoomModal.roomCreatedToast.title" />,
        description: (
          <I18n
            id="createRoomModal.roomCreatedToast.description"
            params={{ name: response.name }}
          />
        ),
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
        <I18n id="sidebar.create-room-button" />
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <I18n id="createRoomModal.create-room-header" />
              </ModalHeader>
              <ModalBody>
                <Form onSubmit={onFormSubmit}>
                  <Input
                    isRequired
                    disabled={isPending}
                    placeholder={t("createRoomModal.room-name-placeholder")}
                    name="name"
                    type="text"
                    autoComplete="off"
                    fullWidth
                  />
                  <Input
                    disabled={isPending}
                    placeholder={t("createRoomModal.room-password-placeholder")}
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
                      <I18n id="createRoomModal.cancel-button" />
                    </Button>
                    <Button disabled={isPending} type="submit" color="primary">
                      <I18n id="createRoomModal.create-button" />
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
