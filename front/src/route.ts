import { createBrowserRouter } from "react-router-dom";

import HomePage from "./pages/Home.tsx";
import GameRoom from "./pages/GameRoom.tsx";

export const router = createBrowserRouter([
    {
        path: "/",
        Component: HomePage,
    },
    {
        path: "/room/:roomId",
        Component: GameRoom,
    },
]);