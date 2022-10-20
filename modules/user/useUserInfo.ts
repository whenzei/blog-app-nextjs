import { onSnapshot, doc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { fireStore, auth } from "@modules/common/firbase";
import { useAuthState } from "react-firebase-hooks/auth";

const useUserInfo = () => {
  const [user] = useAuthState(auth);
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    let unsubscribe;
    if (user) {
      unsubscribe = onSnapshot(doc(fireStore, "users", user.uid), (doc) => {
        setUsername(doc.data()?.username);
      });
    } else {
      setUsername("");
    }

    return unsubscribe;
  }, [user]);

  return { user, username };
};

export default useUserInfo;
