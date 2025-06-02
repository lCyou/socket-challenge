import { RouterProvider } from "react-router-dom";  
import React from "react";
import { router } from "../route";
  
export default function container (){
    return (
        <RouterProvider router={router} />
    );
};
  