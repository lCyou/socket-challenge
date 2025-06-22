import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import About from "./About";
import Chat from "./components/Chat";
import DndContainer from "./pages/reDnD";

export const router = createBrowserRouter([
    {
        path: "/grouping",
        Component: App
    },
    {
        path: "/about",
        Component: About,
    },
    {
        path: "/chat",
        Component: Chat,
    },
    {   
        path: "re",
        Component: DndContainer,
    },
]);