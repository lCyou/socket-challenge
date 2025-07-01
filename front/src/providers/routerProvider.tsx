import { RouterProvider } from "react-router-dom";  
import React from "react";
import { router } from "../route.ts";
  
const Container: React.FC = () => {
    return (
        <RouterProvider router={router} />
    );
};

export default Container;