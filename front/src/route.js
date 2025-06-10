import { createBrowserRouter } from "react-router-dom";
import Grouping from "./App";
import About from "./About";
import Chat from "./components/Chat";

export const router = createBrowserRouter([
    {
        path: "/grouping",
        Component: Grouping,
    },
    {
        path: "/about",
        Component: About,
    },
    {
        path: "/chat",
        Component: Chat,
    },
]);