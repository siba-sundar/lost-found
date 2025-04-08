import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { ChatProvider } from "./components/chat/ChatContext.jsx";

// user specific imports
import UserLayout from './layouts/UserLayout';
import ItemsDashboard from "./components/user/Dash";
import FoundItemForm from "./components/FoundItem";
import ItemDetails from "./components/common/InputForm.jsx";
import Chat from "./components/common/chat.jsx";

import LoginPage from "./pages/Login";
import Signup from "./pages/Signup";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Navigate to="/login" replace />
    },
    {
      path: "/login",
      element: <LoginPage />
    },
    {
      path: "/signup",
      element: <Signup />
    },
    {
      path: "/user",
      element: (
        <ChatProvider>
          <UserLayout />
        </ChatProvider>
      ),
      children: [
        {
          path: "home",
          element: <ItemsDashboard />
        },
        {
          path: "foundItem",
          element: <FoundItemForm />
        },
        {
          path: "add-item",
          element: <ItemDetails />
        },
        {
          path: "chat",
          element: <Chat />
        }
      ]
    }
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;