import React from "react";
import { useState } from "react";

export default function LoginForm(e) {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [displayError, setDisplayError] = useState(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [formValidationError, setFormValidationError] = useState({
    email: null,
    password: null
  });

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      console.log("login submit");
      const response = await fetch(`${api_url}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": 'application/json',
        },
        body: JSON.stringify({
          email: formData['email'],
          password: formData['password']
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
      localStorage.setItem('token', token);

    } catch (error) {
      setDisplayError(error.message)
    }
  }

  function handleFormChange(e) {
    const inputValue = e.target.value;
    const inputName = e.target.name;

    if(inputName == "email") {
        if(inputName.length < 2) {
            const errorMessage = "Email trop court."

            setFormValidationError({...formValidationError, "email": errorMessage})
            setIsFormValid(false)
        }
    }

    setFormData({
      ...formData, [inputName]: inputValue
    });

    console.log(inputName + ': ', inputValue);

  
console.log(formData)
  }

console.log(displayError)
  return (
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
            {formValidationError.email ? <p>formValidationError.email</p> : null}
        </div>
        <input
          onChange={handleFormChange}
          type="password"
          placeholder="Password"
          name="password"
          autoComplete="current-password"
        />

        <button className={!isFormValid ? "disabled" : ""} disabled={!isFormValid} type="submit">Se connecter</button>

        {displayError ? <div>{displayError}</div> : null}
      </form>
    </div>
  );
}