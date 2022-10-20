import Link from "next/link";
import { useUser } from "@modules/user/context";

export default function AuthCheck({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: JSX.Element;
}): JSX.Element {
  const { username } = useUser();
  return username ? (
    <>{children}</>
  ) : fallback ? (
    fallback
  ) : (
    <Link href="/enter">You must be signed in</Link>
  );
}
