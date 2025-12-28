"use client";

import {
  createContext,
  type PropsWithChildren,
  useContext,
  useState,
} from "react";

const RoomsPasswordsStoreContext = createContext({
  passwords: {} as Record<string, string>,
  addPassword: (roomId: string, password: string) => {},
});

export const useRoomsPasswordsStore = () => {
  return useContext(RoomsPasswordsStoreContext);
};

export const RoomPasswordStore = ({ children }: PropsWithChildren) => {
  const [passwords, setPasswords] = useState<Record<string, string>>({});

  const addPassword = (roomId: string, password: string) => {
    setPasswords((prev) => ({ ...prev, [roomId]: password }));
  };

  return (
    <RoomsPasswordsStoreContext.Provider value={{ passwords, addPassword }}>
      {children}
    </RoomsPasswordsStoreContext.Provider>
  );
};
