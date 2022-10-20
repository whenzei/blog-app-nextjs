import {
  fireStore,
  getAllPosts,
  getPost,
  getPostRefPath,
  getUserWithUsername,
  postToJSON,
} from "@modules/common/firbase";
import PostContent from "@modules/post/components/PostContent";
import { doc } from "firebase/firestore";
import { useDocumentData } from "react-firebase-hooks/firestore";
import styles from "@styles/Post.module.css";
import AuthCheck from "@modules/user/components/AuthCheck";
import HeartButton from "@modules/common/components/HeartButton";
import Link from "next/link";

export async function getStaticProps({ params }: { params: any }) {
  const { username, slug } = params;
  const userDoc = await getUserWithUsername(username);

  let post = null;
  let path = null;
  if (userDoc) {
    const postRes = await getPost(userDoc.ref, slug);
    if (postRes.data() === undefined)
      return {
        notFound: true,
      };
    post = postToJSON(postRes);
    path = getPostRefPath(userDoc.ref, slug);
  }

  return {
    props: { post, path },
    revalidate: 5000,
  };
}

export async function getStaticPaths() {
  const snapshot = await getAllPosts();
  const paths = snapshot.docs.map((doc) => {
    const { slug, username } = doc.data();
    return {
      params: { username, slug },
    };
  });

  return {
    paths,
    fallback: "blocking",
  };
}

export default function Post({ post, path }: { post: any; path: string }) {
  const postRef = doc(fireStore, path);
  const [realtimePost] = useDocumentData(postRef);

  const mainPost = realtimePost || post;

  return (
    <main className={styles.container}>
      <section>
        <PostContent post={mainPost} />
      </section>

      <aside className="card">
        <p>
          <strong>{mainPost.heartCount || 0} ❤️</strong>
        </p>
        <AuthCheck fallback={<Link href="/enter">❤️ Sign Up</Link>}>
          <HeartButton postRef={postRef} />
        </AuthCheck>
      </aside>
    </main>
  );
}
