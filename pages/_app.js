import Head from "next/head";

import { ThirdwebWeb3Provider } from "@3rdweb/hooks";

import "../styles/main.scss";

// Include what chains we want to support.
// 4 = Rinkeby.
const supportedChainIds = [4];

// Include what type of wallet we want to support.
// In this case, we support Metamask which is an "injected wallet".
const connectors = {
  injected: {},
};

function MyApp({ Component, pageProps }) {
  return (
    <ThirdwebWeb3Provider
      connectors={connectors}
      supportedChainIds={supportedChainIds}
    >
      <Head>
        <title>Recipe Dao</title>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="shortcut icon" href="/android-chrome-256x256" />
      </Head>

      <div className="background-image" />

      <Component {...pageProps} />
    </ThirdwebWeb3Provider>
  );
}

export default MyApp;
