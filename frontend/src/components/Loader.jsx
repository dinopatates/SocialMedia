import React from "react";

export default function Loader() {
    return (
         <div className="loader-container">
        <div className="loader">
            <div></div>
            <div></div>
        </div>
        <div className="loading-text">
            Chargement<span className="dots"></span>
        </div>
    </div>
    )
}