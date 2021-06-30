import React from "react"
import { Route, Navigate } from "react-router-dom"
import { useAuth  } from "./middleware/UserProvider"

const PrivateRoute = ({ component: Component,path, ...props }) => {
    const   { currentUser } = useAuth();
    console.log(currentUser);
    if(path=='/join/*'){
        localStorage.setItem('path', location.pathname);
    }
    if(!currentUser) {
        return <Navigate to='/signIn' />;
    }
    return <Route path={path} element={<Component{...props}/>} />
};
export default PrivateRoute;