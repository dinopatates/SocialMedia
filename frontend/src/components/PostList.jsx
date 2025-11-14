import React, { Suspense, useEffect, useState } from "react";
import Post from "./Post";
import { Helmet } from "react-helmet";

const api_url = import.meta.env.VITE_API_URL;

export default function PostList() {
  const [posts, setPosts] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch(`${api_url}/api/posts`, {
          method: "GET",
          headers: {
            Authorisation: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch status: ${response.status}`);
        }
        const { posts } = await response.json();

        setPosts(posts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    }

    fetchPosts();
  }, []);

  console.log(posts);
  return (
    <Suspense fallback={<div>Loading posts...</div>}>
      <Helmet>
        <title>Accueil liste des postes</title>
        <meta
          name="description"
          content="Découvrez les derniers postes publiés par notre communauté d'utilisateurs."
        />
      </Helmet>

      <div className="post-list">
        {posts.map(
          ({
            id,
            author,
            author_image_url,
            content,
            image_url,
            likes,
            comments,
          }) => (
            <Post
              key={id}
              id={id}
              author={author}
              author_image_url={author_image_url}
              content={content}
              image_url={image_url}
              likes={likes}
              comments={comments}
            />
          )
        )}
      </div>
    </Suspense>
  );
}
