import React, { useContext, useState, useEffect } from "react"
import {Navigate } from "react-router-dom"
import { auth } from "../firebase"

const AuthContext = React.createContext()

export function useAuth() {
  return useContext(AuthContext)
}
export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState()
  useEffect(() => {
    auth.onAuthStateChanged(user => {
      setCurrentUser(user)
      // console.log(user.email);
    })
  })
  const value = {
    currentUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}