import { createBrowserRouter, RouterProvider, Navigate, Outlet } from "react-router-dom";
import { ChatProvider } from "./components/utils/ChatContext";
import { AuthProvider, useAuth } from "./components/utils/AuthContext";

// user specific imports
import UserLayout from './layouts/UserLayout';
import ItemsDashboard from "./components/user/Dash";
import ItemDetails from "./components/user/ItemDetails";
import FoundItemForm from "./components/FoundItem";
import AddItem from "./components/common/InputForm";

import NotFound from "./components/common/NotFound"
// Chat components
import Chat from "./components/chat/Chat";
import List from "./components/common/ItemsListing"

import LoginPage from "./pages/Login";
import Signup from "./pages/Signup";

// Protected route wrapper component
const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

function AppRoutes() {
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
      element: <ProtectedRoute />,
      children: [
        {
          path: "",
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
              element: <AddItem />
            },
            {
              path: "chat/*",
              element: <Chat />
            },
            {
              path: "item/:itemId",
              element: <ItemDetails />
            },
            {
              path:"List",
              element:<List/>
            }
          ]
        }
      ]
    },
    {
      path: "*",
      // element: <Navigate to="/login" replace />
      element:<NotFound/>
    }
  ]);

  return <RouterProvider router={router} />;
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;