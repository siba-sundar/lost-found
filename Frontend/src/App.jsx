import {createBrowserRouter, RouterProvider, Navigate, replace} from  "react-router-dom"

// user specific imports
import UserLayout from './layouts/UserLayout'
// import Home from "./components/Home"
import ItemsDashboard from "./components/user/Dash"
import FoundItemForm from "./components/FoundItem"
import ItemDetails from  "./components/common/InputForm.jsx"
import Chat from "./components/common/chat.jsx"



// const ProtectedRoute = ({children}) => {
//   const user = localStorage.getItem("user");
//   const token = localStorage.getItem("token");
// //           console.error('Error getting token:', error);
// //           delete axios.defaults.headers.common['Authorization'];
//   if(!user || !token){
//     return <Navigate to="/login" replace/>
//   }
//   return children
// });

// const UserSpecificRoute = ({children}) => {
//   const user = localStorage.getItem("user");
//   const token = localStorage.getItem("token");

//   if(!user || !token){
//     return <Navigate to="/login" replace/>
//   }
//   return children
// }

import LoginPage from "./pages/Login"
import Signup from "./pages/Signup"

function App() {
  const router = createBrowserRouter([
    {
      path:"/",
      element:<Navigate to="/login" replace/>
    },
    {
      path:"/login",
      element:<LoginPage/>

    },
    {
      path: "/signup",
      element : <Signup/>
    },
    {
      path:"/user",
      element:<UserLayout/>,
      children:[
        {
          path:"home",
          element:<ItemsDashboard/>
        },
        {
          path:"foundItem",
          element:<FoundItemForm/>
        },
        {
          path:"add-item",
          element:<ItemDetails/>
        },
        {
          path:"chat",
          element:<Chat/>
        }
      ]
    }
  ])


  return (
    <>
      <RouterProvider router={router}/>
    </>
  )
}

export default App
