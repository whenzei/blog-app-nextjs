import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";
import Navbar from "@modules/navigation/components/Navbar";
import { UserProvider } from "@modules/user/context";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <Navbar />
      <Component {...pageProps} />
      <Toaster />
    </UserProvider>
  );
}

export default MyApp;
