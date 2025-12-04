"use client";

import { useMutation } from "@tanstack/react-query";
import {
	createContext,
	type PropsWithChildren,
	useEffect,
	useState,
} from "react";
import { createGuest } from "@/src/api";

export const AuthContext = createContext<{ userId: string }>({
	userId: "",
});

const USER_ID_STORAGE_KEY = "squad-speak-user-id";

export const AuthProvider = ({ children }: PropsWithChildren) => {
	const [userId, setUserId] = useState<string | null>(null);

	const { mutate } = useMutation({
		mutationFn: createGuest,
		onSuccess: (data) => {
			setUserId(data.id);
			localStorage.setItem(USER_ID_STORAGE_KEY, data.id);
		},
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: only run on mount
	useEffect(() => {
		if (typeof window !== "undefined") {
			const storedUserId = localStorage.getItem(USER_ID_STORAGE_KEY);
			if (storedUserId) {
				setUserId(storedUserId);
			} else {
				mutate();
			}
		}
	}, []);

	if (!userId) {
		return null;
	}

	return (
		<AuthContext.Provider value={{ userId }}>{children}</AuthContext.Provider>
	);
};
