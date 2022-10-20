import { FieldValue } from "firebase/firestore";

export interface Post {
  title: string;
  slug: string;
  uid: string;
  username: string;
  published: boolean;
  content: string;
  heartCount: 0;
  createdAt: FieldValue;
  updatedAt: FieldValue;
}
