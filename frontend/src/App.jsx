import React from "react";
import PostList from "./components/PostList";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Nav from "./components/Nav";
import SignInPage from "./pages/SignInPage";
import LoginPage from "./pages/LoginPage";
import PostDetailsPage from "./pages/PostDetailsPage";
import ProtectedRoute from "./Providers/ProtectedRoute";
import { AuthProvider } from "./Providers/AuthProvider";
export default function App() {
  return (
    <div style={{ textAlign: "center" }}>

      <h1>Hello from React + Vite + Express + Mysql + Docker</h1>


    <AuthProvider>
      <BrowserRouter>
        <Nav />
        <Routes>
          <Route path="/" element={<PostList />}/>
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/login" element={<LoginPage/>} />

          <Route path="/post/:id" element={
            <ProtectedRoute>
              <PostDetailsPage />
            </ProtectedRoute>
            } />
  
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </div>
  );
}