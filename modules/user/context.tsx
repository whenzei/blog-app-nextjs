import { createContext, useContext } from "react";
import useUserInfo from "@modules/user/useUserInfo";

interface UserContextInterface {
  user: any;
  username: string;
}

const UserContext = createContext<UserContextInterface>({
  user: null,
  username: "",
});

interface UserProviderProps {
  children: JSX.Element[];
}

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }: UserProviderProps) {
  const { user, username } = useUserInfo();

  return (
    <UserContext.Provider value={{ user, username }}>
      {children}
    </UserContext.Provider>
  );
}
