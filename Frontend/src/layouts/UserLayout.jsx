import  {Outlet} from "react-router-dom"
import NavBar from "../components/NavBar.jsx"

const UserLayout = () => {
  return (
    <>
    <NavBar/>
    <Outlet/>
    </>
  )
}

export default UserLayout