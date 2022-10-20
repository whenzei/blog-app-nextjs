import { DocumentReference } from "firebase/firestore";
import { useDocument } from "react-firebase-hooks/firestore";
import { batchUpdateHeart, getHeartRef } from "../firbase";

export default function HeartButton({
  postRef,
}: {
  postRef: DocumentReference;
}) {
  const heartRef = getHeartRef(postRef);
  const [heartDoc] = useDocument(heartRef);

  const addHeart = async () => {
    await batchUpdateHeart(postRef, heartRef, "increment");
  };
  const removeHeart = async () => {
    await batchUpdateHeart(postRef, heartRef, "decrement");
  };
  return heartDoc?.exists() ? (
    <button onClick={removeHeart}>💔 Unheart</button>
  ) : (
    <button onClick={addHeart}>❤️ Heart</button>
  );
}
