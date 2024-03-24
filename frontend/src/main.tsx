import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './_app'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import Home from './pages';
import Explore from './explorer';

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/explore",
        element: <Explore />
      }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
