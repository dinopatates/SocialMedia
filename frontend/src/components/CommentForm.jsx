import React, { useState } from "react";

export default function CommentForm({ post_id }) {
  const [comment, setComment] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    const token = localStorage.getItem('token')

    try {
      const response = fetch(`http://localhost:3000/api/posts/${post_id}/comments`, {
        method: "POST",
        headers : {
            "Content-type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            comment
        })
      });
        if(!response.ok) {
        throw new Error(`Failed to fetch status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data)
    } catch (error) {
      // ...gestion d'erreur...
    }
    console.log(user, comment);
  }

  return (
    <div className="comment-form-container">
      <h3>Envoyez un commentaire</h3>
      <form className="comment-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="comment"
          placeholder="Your comment"
          onChange={(e) => setComment(e.target.value)}
        />
        <button>Submit</button>
      </form>
    </div>
  );
}