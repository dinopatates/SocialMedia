import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Nav from "./components/nav";
import ProtectedRoute from "./Providers/ProtectedRoute";
import { AuthProvider } from "./Providers/AuthProvider";
import Loader from "./components/Loader";

const PostList = React.lazy(() => import("./components/PostList"));
const PostDetailsPage = React.lazy(() => import("./pages/PostDetailsPage"));
const SignInPage = React.lazy(() => import("./pages/SignInPage"));
const LoginPage = React.lazy(() => import("./pages/LoginPage"));
const ProfilePage = React.lazy(() => import("./pages/ProfilePage"));

export default function App() {
  return (

    <AuthProvider>
      <BrowserRouter>
        <Nav />
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<PostList />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            <Route
              path="/post/:id"
              element={
                <ProtectedRoute>
                  <PostDetailsPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
