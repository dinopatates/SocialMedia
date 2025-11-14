import React, { useState } from "react";

const api_url = import.meta.env.VITE_API_URL;

export default function SignInForm() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      console.log("form submitted");
      const response = await fetch("${api_url}/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData["username"],
          email: formData["email"],
          password: formData["password"],
        }),
      });
      const data = await response.json();
      const token = data.token;
      localStorage.setItem("token", token);

      console.log(token);
    } catch (error) {
      console.log("submit failed");
    }
  }

  function handleFormChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    console.log(e.target.name, e.target.value);
  }

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <input
          onChange={handleFormChange}
          type="text"
          placeholder="Username"
          name="username"
          autoComplete="username"
        />
        <input
          onChange={handleFormChange}
          type="text"
          placeholder="Email"
          name="email"
          autoComplete="email"
        />
        <input
          onChange={handleFormChange}
          type="password"
          placeholder="Password"
          name="password"
          autoComplete="new-password"
        />
        <button type="submit">S'inscrire</button>
      </form>
    </div>
  );
}