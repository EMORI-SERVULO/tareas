import Login from "./routes/Login.tsx";
import Signup from "./routes/Signup.tsx";
import Dashboard from "./routes/Dashboard.tsx";
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import ReactDOM from "react-dom/client";
import React from "react";
import RouteMiddle from "./routes/RouteMiddle.tsx"
import { AuthProvider } from "./auth/AuthProvider.tsx";
import './index.css';
import Categoria from "./routes/Categoria.tsx";
const router = createBrowserRouter([
  {
    path: "/",
    element: <Login/>,
  },
  {
    path: "/signup",
    element:<Signup/>,
  },
  {
    path:"/",
    element:<RouteMiddle/>,
    children: [
      {
        path: "/dashboard",
        element: <Dashboard/>
      },
      {
        path: "/categoria",
        element: <Categoria />,
      },
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
        <RouterProvider router = {router} />
    </AuthProvider>
    
  </React.StrictMode>,
);
