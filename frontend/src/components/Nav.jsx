import React from "react";
import {Link} from "react-router-dom"
import { useAuth } from "../Providers/AuthProvider";


export default function Nav() {
    const {currentUser} = useAuth()

    console.log(currentUser)
    return (
        <nav className="main-nav">
            <div className="nav-container">
                {currentUser ? <img src={currentUser.image_url} alt="" /> : null}
                <Link to="/" className="nav-logo">
                    Accueil
                </Link>

                <div className="nav-links">
                    <Link to="/signin" className="nav-link">
                        SignIn
                    </Link>

                    <Link to="/login" className="nav-link">
                        Login
                    </Link>
                </div>
            </div>
        </nav>
    )
}