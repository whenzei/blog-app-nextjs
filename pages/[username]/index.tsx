import {
  getPostsByUser,
  getUserWithUsername,
  postToJSON,
} from "@modules/common/firbase";
import { User } from "@modules/interfaces/user/User";
import PostFeed from "@modules/post/components/PostFeed";
import UserProfile from "@modules/user/components/UserProfile";

export async function getServerSideProps({ query }: { query: any }) {
  const { username } = query;
  const userDoc = await getUserWithUsername(username);

  if (!userDoc) {
    return {
      notFound: true,
    };
  }

  let user = null;
  let posts = null;
  if (userDoc) {
    user = userDoc.data();
    posts = (await getPostsByUser(userDoc)).docs.map(postToJSON);
  }
  return {
    props: { user, posts },
  };
}

const UserProfilePage = ({ user, posts }: { user: User; posts: any }) => {
  return (
    <main>
      <UserProfile user={user} />
      <PostFeed posts={posts} />
    </main>
  );
};
export default UserProfilePage;
