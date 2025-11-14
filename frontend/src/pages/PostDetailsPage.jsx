import React from "react";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";

export default function PostDetailsPage() {
    

  const [post, setPost] = useState(null);

  const { id } = useParams();
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchPostDetails() {
      try {
        const response = await fetch(`http://localhost:3000/api/posts/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data.post);
        setPost(data.post);
      } catch (error) {
        console.log("ERROR : Issues with fetching post details.");
      }
    }
    fetchPostDetails();

    console.log(id);
  }, []);
  return (
    <div>
      <h1>Page détails</h1>
      {post ? <div>
        <p>{post.author}</p>
        <img src="{post.image_url}" alt="" />
        <p>{post.content}</p>
      </div> : <div> </div>}
    </div>
  );
}
