import { useContext } from "react";
import { AuthContext } from ".";

export const useAuthContext = () => {
	const { userId } = useContext(AuthContext);
	return { userId };
};
