import { createBrowserRouter } from "react-router-dom";
// import Home from "../pages/home/index";
import NotFound from "../pages/notfound/index";
import LandingPage from "../pages/public/landingPage";
import Login from "../pages/public/auth/login/Login";

import CoachDashboard from "../pages/coach/dashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/coach/dashboard",
    element: <CoachDashboard />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);