import {createBrowserRouter, RouterProvider} from  "react-router-dom"


import UserLayout from './layouts/UserLayout'
import Home from "./components/Home"


import LoginPage from "./pages/Login"
import Signup from "./pages/Signup"

function App() {
  const router = createBrowserRouter([
    {
      path:"/login",
      element:<LoginPage/>

    },
    {
      path: "/signup",
      element : <Signup/>
    },
    {
      path:"/",
      element:<UserLayout/>,
      children:[
        {
          path:"/user/home",
          element:<Home/>
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
