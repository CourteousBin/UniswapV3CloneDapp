import "../styles/globals.css";
import NavBar from '../Components/NavBar/NavBar';
import { SwapTokenContextProvider } from "../Context/SwapContext";

const MyApp = ({ Component, pageProps }) => (
  <div>
    <SwapTokenContextProvider>
      <NavBar />
      <Component {...pageProps} />
    </SwapTokenContextProvider>
  </div>
)

export default MyApp;
