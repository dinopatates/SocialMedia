import React from "react";
import { useAuth } from "../Providers/AuthProvider";

export default function ProfilePage() {
  const { currentUser } = useAuth();

  return <div>
    <h1>
    {currentUser.username}
    </h1>
    <p>
      Email: {currentUser.email}
    </p>
    <img src={currentUser.image_url} alt="Profile" />
    </div>;


}