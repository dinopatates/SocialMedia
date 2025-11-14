import React, { createContext } from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useContext } from "react";
import Loader from "../components/Loader";

const AuthContext = createContext();
const api_url = import.meta.env.VITE_API_URL;

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);


  const token = localStorage.getItem("token");
  useEffect(() => {

    async function validateToken() {
      if (token) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`${api_url}/api/auth/me`, {
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


    validateToken();
  }, []);

  async function logout() {
    localStorage.removeItem("token");
    setCurrentUser(null);
 }

 async function login({email, password}) {
  try {
    const response = await fetch(`${api_url}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        }),
      });

      if(response.status === 400) {
        throw new Error("* Champs emails et mot de passe obligatoires");
      }

      if(response.status === 401) {
        throw new Error("Email ou mot de passe incorrecte");
      }

      if(response.status === 500) {
        throw new Error("Erreur serveur : réessayez plus tard");
      }


      const data = await response.json();
      const token = data.token;

      localStorage.setItem("token", token);

      if(token) {
         const response = await fetch(`${api_url}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const { user } = await response.json();
        setCurrentUser(user);
      }
  } catch(e){
    throw e;
  }
  
 }

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    loading,
    logout,
    login,
    setCurrentUser,
  };

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
