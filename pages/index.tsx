import styles from "@styles/Home.module.css";
import Loader from "@modules/common/components/Loader";
import {
  getMorePostsAfter,
  getPosts,
  postToJSON,
} from "@modules/common/firbase";
import { useState } from "react";
import PostFeed from "@modules/post/components/PostFeed";
import { Post } from "@modules/interfaces/post/Post";

const LIMIT = 1;

export async function getServerSideProps(context: any) {
  const posts: Post[] = (await getPosts(LIMIT)).docs.map(postToJSON);
  return {
    props: { initialPosts: posts },
  };
}

export default function Home({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [loading, setLoading] = useState(false);
  const [postsEnd, setPostsEnd] = useState(false);

  const getMorePosts = async () => {
    setLoading(true);
    let newPosts = [];
    if (posts && posts.length > 0) {
      const resPosts = await getMorePostsAfter(
        posts[posts.length - 1].createdAt,
        LIMIT
      );
      newPosts = resPosts.docs.map(postToJSON);
      console.log(newPosts);
      setPosts([...posts, ...newPosts]);
    }
    setLoading(false);
    if (newPosts.length < LIMIT) {
      setPostsEnd(true);
    }
  };

  return (
    <div className={styles.container}>
      <PostFeed posts={posts} />
      {!loading && !postsEnd && (
        <button onClick={getMorePosts}>Load more</button>
      )}
      <Loader show={loading} />
      {postsEnd && "You have reached the end!"}
    </div>
  );
}
