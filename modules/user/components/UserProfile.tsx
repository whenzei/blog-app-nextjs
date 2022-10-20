import { User } from "@modules/interfaces/user/User";

export default function UserProfile({ user }: { user: User }): JSX.Element {
  return (
    <div className="box-center">
      <img src={user?.photoURL || ""} className="card-img-center" />
      <p>
        <i>@{user.username}</i>
      </p>
      <h1>{user.displayName}</h1>
    </div>
  );
}
