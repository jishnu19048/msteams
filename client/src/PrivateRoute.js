import React,{useContext} from "react"
import { Route, Navigate } from "react-router-dom"
import { useAuth  } from "./middleware/UserProvider"

const PrivateRoute = ({ component: Component,path, ...props }) => {
    const   { currentUser } = useAuth();
    if(!currentUser) {
        return <Navigate to='/signIn' />;
    }
    return <Route path={path} element={<Component/>} />
};
export default PrivateRoute;