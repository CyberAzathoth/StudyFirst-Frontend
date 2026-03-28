import { createBrowserRouter } from "react-router";
import Root from "./components/Root";
import SplashScreen from "./components/SplashScreen";
import WelcomeScreen from "./components/WelcomeScreen";
import AuthScreen from "./components/AuthScreen";
import Dashboard from "./components/Dashboard";
import AssignmentsScreen from "./components/AssignmentsScreen";
import ProgressScreen from "./components/ProgressScreen";
import SettingsScreen from "./components/SettingsScreen";
import NotFound from "./components/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: SplashScreen },
      { path: "welcome", Component: WelcomeScreen },
      { path: "auth", Component: AuthScreen },
      { path: "dashboard", Component: Dashboard },
      { path: "assignments", Component: AssignmentsScreen },
      { path: "progress", Component: ProgressScreen },
      { path: "settings", Component: SettingsScreen },
      { path: "*", Component: NotFound },
    ],
  },
]);