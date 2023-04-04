import { type AppType } from "next/app";

import { api } from "@/utils/api";

import "@/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider {...pageProps}>
    <main 
    className="flex flex-col items-center overflow-y-auto h-full w-full"
    data-theme="halloween">
      <Component {...pageProps} />
    </main>
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
