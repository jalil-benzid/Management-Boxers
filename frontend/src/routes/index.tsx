import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/home/index";
import NotFound from "../pages/notfound/index";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
