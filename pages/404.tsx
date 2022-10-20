import Link from "next/link";

export default function Custom404() {
  return (
    <main>
      <h1>404 - Page does not exist =O</h1>
      <iframe
        src="https://giphy.com/embed/l2JehQ2GitHGdVG9y"
        width="480"
        height="362"
        frameBorder="0"
        allowFullScreen
      ></iframe>
      <Link href="/">
        <button className="btn-blue">Home</button>
      </Link>
    </main>
  );
}
