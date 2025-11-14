// ...existing code...
import React, { useState } from "react";
import CommentList from "./CommentList";
import CommentForm from "./CommentForm";
import { Link } from "react-router-dom";

export default function Post({ id, author, author_image_url, image_url, content, likes, comments }) {
  const [likeCount, setLikeCount] = useState(likes);

  async function handleClickOnLike() {
    console.log("clicked");
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3000/api/posts/${id}/like`, {
        method: "PUT",
        headers: {
              Authorization: `Bearer ${token}`,
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch status: ${response.status}`);
      }
      setLikeCount((prev) => prev + 1);
    } catch (error) {
      console.error("Error fetching likes:", error);
    }
  }
console.log(image_url)
  return (
    <article className="post-card" aria-labelledby={`post-${id}-author`}>
      <header className="post-header">
        <div className="post-header-left">
          <img
            className="post-avatar"
            src={author_image_url}
            alt={author ? `${author} avatar` : "author avatar"}
            width="56"
            height="56"
          />
          <div className="post-meta">
            <h2 id={`post-${id}-author`} className="post-author">{author}</h2>
          </div>
        </div>

        <div className="post-actions">
          <button className="like-btn" onClick={handleClickOnLike} aria-pressed="false" aria-label="Like post">
            Like <span className="like-count">{likeCount}</span>
          </button>
        </div>
      </header>

      <div className="post-media">
        <img
          className="post-image"
          src={image_url}
          alt={content ? content.slice(0, 50) : "Post image"}
        />
      </div>

      <p className="post-content">{content}</p>

      <footer className="post-footer">
        <Link to={`post/${id}`} className="post-link">details</Link>
        <CommentList comments={comments} />
        <CommentForm post_id={id} />
      </footer>
    </article>
  );
}
// ...existing code...