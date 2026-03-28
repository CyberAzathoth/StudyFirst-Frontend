import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./app/App.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId="551585504334-lj19g8dubm8hducajomkvomf8tte7a1a.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
);