import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();
//useContext is used to access data that is shared globally in your React app without passing props manually through every component.
//You create a Context once, provide a value at a high level, and consume it anywhere below

export const useAuth = () => {
  const context = useContext(AuthContext); //*useContext(AuthContext) reads what AuthProvider stored
  if (!context) {
    //Throws an error if someone tries to use useAuth without wrapping their app in AuthProvider <AuthProvider>.
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  //The whole point of the provider is to expose auth-related state and functions to the rest of the app//*{children} represents all components wrapped inside <AuthProvider>
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []); //The empty dependency array [] means:→ Run this effect only once, after the initial render

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (token && userStr) {
        const userData = JSON.parse(userStr);
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setIsAuthenticated(false);
    window.location.href = "/";
  };

  const updateUser = (updateUserData) => {
    const newUserData = { ...user, ...updateUserData };
    localStorage.setItem("user", JSON.stringify(newUserData));
    setUser(newUserData);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
  //Makes value available to all components inside <AuthProvider>
};