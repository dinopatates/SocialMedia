import React, { createContext } from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useContext } from "react";
import Loader from "../components/Loader";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    async function validateToken() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch("http://localhost:3000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const { user } = await response.json();

        setCurrentUser(user);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    }

    console.log(token);

    validateToken();
  }, []);

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    loading,
  };

  if (loading) {
    return (
      <AuthContext.Provider value={value}>
        <Loader />
      </AuthContext.Provider>
    );
  }

  console.log(currentUser);
  return (
    <div>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </div>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
