import {createBrowserRouter, RouterProvider} from  "react-router-dom"


import UserLayout from './layouts/UserLayout'
import Home from "./components/Home"


import LoginPage from "./pages/Login"

function App() {
  const router = createBrowserRouter([
    {
      path:"/login",
      element:<LoginPage/>

    },
    {
      path:"/",
      element:<UserLayout/>,
      children:[
        {
          path:"/",
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
