import { Post as PostFB } from "@modules/interfaces/firebase/Post";
import { Post } from "@modules/interfaces/post/Post";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  Timestamp,
  collection,
  collectionGroup,
  DocumentData,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  QueryDocumentSnapshot,
  QuerySnapshot,
  startAfter,
  endBefore,
  where,
  doc,
  getDoc,
  serverTimestamp,
  Query,
  setDoc,
  DocumentReference,
  updateDoc,
  increment,
  writeBatch,
} from "firebase/firestore";
import "firebase/storage";
import { getStorage, ref, uploadBytesResumable } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FB_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FB_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FB_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FB_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FB_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FB_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const fireStore = getFirestore(app);
export const storage = getStorage(app);
export const googleAuthProvider = new GoogleAuthProvider();
export const STATE_CHANGED = "state_changed";

export const signIn = async () => {
  return signInWithPopup(auth, googleAuthProvider);
};

export const logOut = async () => {
  return signOut(auth);
};

export const getUserWithUsername = async (username: string) => {
  const usersRef = collection(fireStore, "users");
  const queryObj = query(usersRef, where("username", "==", username), limit(1));
  const userDoc = (await getDocs(queryObj)).docs[0];
  return userDoc;
};

export const getPostsByUser = async (
  userDoc: QueryDocumentSnapshot
): Promise<QuerySnapshot> => {
  const postsRef = collection(userDoc.ref, "posts");
  const queryObj = query(
    postsRef,
    where("published", "==", true),
    orderBy("createdAt", "desc"),
    limit(5)
  );
  return getDocs(queryObj);
};

// Posts
export const getPostListQuery = (): Query => {
  const userCollection = collection(fireStore, "users");
  const userDocRef = doc(userCollection, auth.currentUser?.uid);
  const ref = collection(userDocRef, "posts");
  return query(ref, orderBy("createdAt"));
};

export const getPostRef = (slug: string) => {
  const userCollection = collection(fireStore, "users");
  const userDocRef = doc(userCollection, auth.currentUser?.uid);
  return doc(collection(userDocRef, "posts"), slug);
};

export const getHeartRef = (postRef: DocumentReference) => {
  return doc(collection(postRef, "hearts"), auth.currentUser?.uid);
};

export const getAllPosts = () => {
  return getDocs(collectionGroup(fireStore, "posts"));
};

export const getPosts = async (lim: number) => {
  const collectionRef = collectionGroup(fireStore, "posts");
  const queryObj = query(
    collectionRef,
    where("published", "==", true),
    orderBy("createdAt", "desc"),
    limit(lim)
  );
  return getDocs(queryObj);
};

export const getMorePostsAfter = (createdAt: any, lim: number) => {
  const collectionRef = collectionGroup(fireStore, "posts");
  const cursor =
    typeof createdAt === "number" ? Timestamp.fromMillis(createdAt) : createdAt;

  const queryObj = query(
    collectionRef,
    where("published", "==", true),
    orderBy("createdAt", "desc"),
    startAfter(cursor),
    limit(lim)
  );
  return getDocs(queryObj);
};

export const getPost = (userDocRef: DocumentReference, slug: string) => {
  const collectionRef = collection(userDocRef, "posts");
  return getDoc(doc(collectionRef, slug));
};

export const getPostRefPath = (userDocRef: DocumentReference, slug: string) => {
  return doc(collection(userDocRef, "posts"), slug).path;
};

export const postToJSON = (doc: DocumentData): Post => {
  const data = doc.data();
  return {
    ...data,
    createdAt: data.createdAt.toMillis(),
    updatedAt: data.updatedAt.toMillis(),
  };
};

export const getServerTimestamp = () => {
  return serverTimestamp();
};

export const addPost = (
  title: string,
  slug: string,
  username: string
): Promise<any> => {
  const uid = auth.currentUser!.uid;
  const userCollection = collection(fireStore, "users");
  const userDocRef = doc(userCollection, uid);
  const ref = doc(collection(userDocRef, "posts"), slug);

  const data: PostFB = {
    title,
    slug,
    uid,
    username,
    published: false,
    content: "# hello world!",
    heartCount: 0,
    createdAt: getServerTimestamp(),
    updatedAt: getServerTimestamp(),
  };
  return setDoc(ref, data);
};

export const updateUserPost = (
  postRef: DocumentReference,
  content: any,
  published: any
) => {
  return updateDoc(postRef, {
    content,
    published,
    updatedAt: getServerTimestamp(),
  });
};

export const batchUpdateHeart = async (
  postRef: DocumentReference,
  heartRef: DocumentReference,
  type: "increment" | "decrement"
) => {
  const uid = auth.currentUser!.uid;
  const batch = writeBatch(fireStore);
  batch.update(postRef, {
    heartCount: "increment" === type ? increment(1) : increment(-1),
  });
  if (type === "increment") {
    batch.set(heartRef, { uid });
  } else {
    batch.delete(heartRef);
  }
  await batch.commit();
};

export const uploadFileToStorage = (ext: string, file: File) => {
  const uploadRef = ref(
    storage,
    `uploads/${auth.currentUser!.uid}/${Date.now()}.${ext}`
  );
  return uploadBytesResumable(uploadRef, file);
};
