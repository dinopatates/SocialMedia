// ...existing code...
import React, { Suspense } from "react";
import { Helmet } from "react-helmet";

export default function Comment({ user, comment, user_image_url, created_at }) {
  if (user_image_url === null) {
    user_image_url =
      'https://media.istockphoto./id/1196083861/fr/vectoriel/ensemble-simple-dic%C3%B4ne-de-%C3%AAte-dhomme.jpg?s=612x612&w=0&k=20&c=kgMygzTT32bCHK3iZQH5BrWo-ZpWPiXBw6lnPgo-scU=""';
  }

  return (
    <Suspense>

      <ul>
        <li className="comment-row">
          <img
            className="comment-avatar"
            src={user_image_url}
            alt=""
            aria-hidden="true"
          />
          <div className="comment-body">
            <div className="comment-meta">
              <h3 className="comment-user">{user}</h3>
              <time className="comment-time">{created_at}</time>
            </div>
            <p className="comment-text">{comment}</p>
          </div>
        </li>
      </ul>
    </Suspense>
  );
}
// ...existing code...
