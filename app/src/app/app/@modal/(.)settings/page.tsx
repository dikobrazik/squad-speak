"use client";

import { Link } from "@heroui/link";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/modal";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AudioSettings from "../../settings/audio/page";
import ProfileSettings from "../../settings/page";
import SessionsSettings from "../../settings/sessions/page";
import css from "./Layout.module.scss";

export default function SettingsModal() {
  const [activePage, setActivePage] = useState("profile");
  const router = useRouter();

  return (
    <Modal isOpen onClose={() => router.back()} size="4xl">
      <ModalContent>
        <ModalHeader className="border-b-1">Settings</ModalHeader>
        <ModalBody className={css.content}>
          <aside className="border-r-1 flex flex-col p-3">
            <Link
              onClick={() => setActivePage("profile")}
              color={activePage === "profile" ? "primary" : "foreground"}
              className="p-3 cursor-pointer"
            >
              Profile
            </Link>
            <Link
              onClick={() => setActivePage("audio")}
              color={activePage === "audio" ? "primary" : "foreground"}
              className="p-3 cursor-pointer"
            >
              Audio
            </Link>
            <Link
              onClick={() => setActivePage("sessions")}
              color={activePage === "sessions" ? "primary" : "foreground"}
              className="p-3 cursor-pointer"
            >
              Active Sessions
            </Link>
          </aside>
          <div className="p-3">
            {activePage === "profile" && <ProfileSettings />}
            {activePage === "audio" && <AudioSettings />}
            {activePage === "sessions" && <SessionsSettings />}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
