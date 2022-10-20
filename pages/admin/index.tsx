import { addPost, getPostListQuery } from "@modules/common/firbase";
import PostFeed from "@modules/post/components/PostFeed";
import AuthCheck from "@modules/user/components/AuthCheck";
import { useUser } from "@modules/user/context";
import kebabCase from "lodash.kebabcase";
import { useRouter } from "next/router";
import { useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import toast from "react-hot-toast";

export default function AdminPage(): JSX.Element {
  return (
    <main>
      <AuthCheck>
        <PostList />
        <CreateNewPost />
      </AuthCheck>
    </main>
  );
}

function PostList(): JSX.Element {
  const [querySnapshot] = useCollection(getPostListQuery());
  const posts = querySnapshot?.docs.map((doc) => doc.data());

  return (
    <>
      <h1>Manage your Posts</h1>
      <PostFeed posts={posts} admin />
    </>
  );
}

function CreateNewPost(): JSX.Element {
  const router = useRouter();
  const { username } = useUser();
  const [title, setTitle] = useState("");

  const slug = encodeURI(kebabCase(title));
  const isValid = title.length > 3 && title.length < 100;

  const createPost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await addPost(title, slug, username);

    toast.success("Post created!");
    router.push(`/admin/${slug}`);
  };

  return (
    <form onSubmit={createPost}>
      <input
        value={title}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setTitle(e.target.value)
        }
        placeholder="My Article!!"
      />
      <p>
        <strong>Slug: </strong> {slug}
      </p>
      <button type="submit" disabled={!isValid} className="btn-green">
        Create New Post
      </button>
    </form>
  );
}
