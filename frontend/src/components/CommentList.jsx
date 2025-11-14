import React from "react";
import Comment from "./Comment";

export default function CommentList({ comments }) {
  return (
    <div>
      {comments.map(({ user, comment, user_image_url, created_at }, index) => (
        <Comment
          key={index}
          user_image_url={user_image_url}
          user={user}
          comment={comment}
          created_at={created_at}
        />
      ))}
    </div>
  );
}
