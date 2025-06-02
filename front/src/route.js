import { createBrowserRouter } from "react-router-dom";
import Home from "./App";
import About from "./About";

export const router = createBrowserRouter([
    {
        path: "/",
        Component: Home,
    },
    {
        path: "/about",
        Component: About,
    },
]);