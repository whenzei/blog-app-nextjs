import { signIn, logOut, fireStore } from "@modules/common/firbase";
import { useUser } from "@modules/user/context";
import { doc, getDoc, writeBatch } from "firebase/firestore";
import { NextPage } from "next";
import React, { useCallback, useEffect, useState } from "react";
import debounce from "lodash.debounce";

const Enter: NextPage = () => {
  const { user, username } = useUser();
  let content = null;
  if (user && username) {
    content = <SignOutButton />;
  } else if (user && !username) {
    content = <UserNameForm />;
  } else {
    content = <SignInButton />;
  }

  return <main>{content}</main>;
};

function SignInButton(): JSX.Element {
  const signInWithGoogle = async () => {
    await signIn();
  };

  return (
    <button className="btn-google" onClick={signInWithGoogle}>
      <img src={"/google.png"} /> Sign in with Google
    </button>
  );
}

function SignOutButton(): JSX.Element {
  return <button onClick={() => logOut()}>Sign Out</button>;
}

function UserNameForm(): JSX.Element {
  const [formValue, setFormValue] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, username } = useUser();

  const checkUsername = useCallback(
    debounce(async (username: string) => {
      if (username.length >= 3) {
        const docRef = doc(fireStore, `usernames/${username}`);
        const docSnap = await getDoc(docRef);
        console.log("Firestore read executed");

        setIsValid(!docSnap.exists());
        setIsLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    checkUsername(formValue);
  }, [formValue, checkUsername]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase();
    const re = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/;
    if (val.length < 3) {
      setIsLoading(false);
      setFormValue(val);
      setIsValid(false);
    }

    if (re.test(val)) {
      setFormValue(val);
      setIsLoading(true);
      setIsValid(false);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const userRef = doc(fireStore, "users", user.uid);
    const usernameRef = doc(fireStore, "usernames", formValue);
    const batch = writeBatch(fireStore);

    batch.set(userRef, {
      username: formValue,
      photoURL: user.photoURL,
      displayName: user.displayName,
    });
    batch.set(usernameRef, { uid: user.uid });

    try {
      await batch.commit();
    } catch (err: any) {
      console.log(err);
    }
  };

  return (
    <>
      {!username && (
        <section>
          <h3>Choose Username</h3>
          <form onSubmit={onSubmit}>
            <input
              name="username"
              placeholder="username"
              value={formValue}
              onChange={onChange}
            />
            <UsernameMessage
              username={username}
              isValid={isValid}
              isLoading={isLoading}
            />
            <button type="submit" className="btn-green" disabled={!isValid}>
              Choose
            </button>

            <h3>Debug State</h3>
            <div>
              Username: {formValue}
              <br />
              Loading: {isLoading.toString()}
              <br />
              Valid: {isValid.toString()}
            </div>
          </form>
        </section>
      )}
    </>
  );
}

function UsernameMessage({
  username,
  isValid,
  isLoading,
}: {
  username: string;
  isValid: boolean;
  isLoading: boolean;
}): JSX.Element {
  if (isLoading) {
    return <p>Checking...</p>;
  } else if (isValid) {
    return <p className="text-success">{username} is available!</p>;
  } else if (username && !isValid) {
    return <p className="text-danger">That username is taken!</p>;
  } else {
    return <p></p>;
  }
}

export default Enter;
