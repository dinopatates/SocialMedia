import React, { Suspense, use } from "react";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../Providers/AuthProvider";
import { Helmet } from "react-helmet";

const api_url = import.meta.env.VITE_API_URL;

export default function LoginForm(e) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [displayError, setDisplayError] = useState(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [formValidationError, setFormValidationError] = useState({
    email: null,
    password: null,
  });

  const { login } = useAuth();

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      console.log("login submit");
      await login({
        email: formData["email"],
        password: formData["password"],
      });

      navigate("/");
    } catch (error) {
      setDisplayError(error.message);
    }
  }

  function handleFormChange(e) {
    const inputValue = e.target.value;
    const inputName = e.target.name;

    if (inputName == "email") {
      if (inputName.length < 2) {
        const errorMessage = "Email trop court.";

        setFormValidationError({ ...formValidationError, email: errorMessage });
        setIsFormValid(false);
        return;
      }
      setIsFormValid(true);
    }

    if (inputName == "password") {
      if (inputName.length < 2) {
        const errorMessage = "Mot de passe trop court.";

        setFormValidationError({ ...formValidationError, email: errorMessage });
        setIsFormValid(false);
        return;
      }
      setIsFormValid(true);
    }

    setFormData({
      ...formData,
      [inputName]: inputValue,
    });

    console.log(inputName + ": ", inputValue);
  }

  return (
    <Suspense>
      <Helmet>
        <title>Connexion</title>
        <meta
          name="description"
          content="Connexion de l'utilisateur"
        />
      </Helmet>

      <div className="login-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            onChange={handleFormChange}
            type="text"
            placeholder="Email"
            name="email"
            autoComplete="username"
          />
          <div className="error-email">
            {formValidationError.email ? (
              <p>formValidationError.email</p>
            ) : null}
          </div>
          <input
            onChange={handleFormChange}
            type="password"
            placeholder="Password"
            name="password"
            autoComplete="current-password"
          />

          <button
            className={!isFormValid ? "disabled" : ""}
            disabled={!isFormValid}
            type="submit"
          >
            Se connecter
          </button>

          {/* {displayError ? <div>{displayError}</div> : null} */}
        </form>
      </div>
    </Suspense>
  );
}
