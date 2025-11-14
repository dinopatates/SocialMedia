const express = require("express");
const router = express.Router();
const { pool } = require("../config/database");
const { generateMultiplePosts } = require("../jobs/postGenerator");
const { getIO } = require("../config/socket");
const { authenticateToken } = require("../middleware/auth");

// GET /api/posts - Récupérer tous les posts avec leurs commentaires
router.get("/posts", async (req, res) => {
  try {
    // Récupérer tous les posts avec les informations de l'auteur
    const [posts] = await pool.query(
      `SELECT 
        p.id, 
        p.content, 
        p.image_url, 
        p.likes, 
        p.created_at,
        p.user_id,
        u.username as author,
        u.image_url as author_image_url
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      ORDER BY p.id DESC 
      LIMIT 10`
    );

    // Pour chaque post, récupérer ses commentaires
    const postsWithComments = await Promise.all(
      posts.map(async (post) => {
        const [comments] = await pool.query(
          `SELECT 
            c.comment, 
            c.created_at,
            c.user_id,
            u.username as user,
            u.image_url as user_image_url
          FROM comments c
          LEFT JOIN users u ON c.user_id = u.id
          WHERE c.post_id = ? 
          ORDER BY c.created_at DESC`,
          [post.id]
        );

        return {
          id: post.id,
          author: post.author,
          author_image_url: post.author_image_url,
          user_id: post.user_id,
          image_url: post.image_url,
          content: post.content,
          likes: post.likes,
          created_at: post.created_at,
          comments: comments,
        };
      })
    );

    res.json({ posts: postsWithComments });
  } catch (error) {
    console.error("Erreur lors de la récupération des posts:", error);
    res.status(500).json({
      error: "Erreur lors de la récupération des posts",
      message: error.message,
    });
  }
});

// GET /api/posts/:id - Récupérer un post spécifique avec ses commentaires
router.get("/posts/:id", async (req, res) => {
  try {
    const postId = req.params.id;

    // Récupérer le post avec les informations de l'auteur
    const [posts] = await pool.query(
      `SELECT 
        p.id, 
        p.content, 
        p.image_url, 
        p.likes, 
        p.created_at,
        p.user_id,
        u.username as author,
        u.image_url as author_image_url
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = ?`,
      [postId]
    );

    if (posts.length === 0) {
      return res.status(404).json({ error: "Post non trouvé" });
    }

    // Récupérer les commentaires du post
    const [comments] = await pool.query(
      `SELECT 
        c.comment, 
        c.created_at,
        c.user_id,
        u.username as user,
        u.image_url as user_image_url
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ? 
      ORDER BY c.created_at ASC`,
      [postId]
    );
    const post = {
      id: posts[0].id,
      author: posts[0].author,
      author_image_url: posts[0].author_image_url,
      user_id: posts[0].user_id,
      image_url: posts[0].image_url,
      content: posts[0].content,
      likes: posts[0].likes,
      created_at: posts[0].created_at,
      comments: comments,
    };

    res.json({ post });
  } catch (error) {
    console.error("Erreur lors de la récupération du post:", error);
    res.status(500).json({
      error: "Erreur lors de la récupération du post",
      message: error.message,
    });
  }
});

// POST /api/posts - Créer un nouveau post (authentification requise)
router.post("/posts", authenticateToken, async (req, res) => {
  try {
    const { image_url, content } = req.body;
    const user_id = req.user.id;

    if (!content) {
      return res.status(400).json({
        error: "Le champ content est requis",
      });
    }

    const [result] = await pool.query(
      "INSERT INTO posts (image_url, content, likes, user_id) VALUES (?, ?, 0, ?)",
      [image_url || null, content, user_id]
    );

    const [newPost] = await pool.query(
      `SELECT 
        p.id, 
        p.content, 
        p.image_url, 
        p.likes, 
        p.created_at,
        p.user_id,
        u.username as author,
        u.image_url as author_image_url
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = ?`,
      [result.insertId]
    );

    const postWithComments = {
      id: newPost[0].id,
      author: newPost[0].author,
      author_image_url: newPost[0].author_image_url,
      user_id: newPost[0].user_id,
      image_url: newPost[0].image_url,
      content: newPost[0].content,
      likes: newPost[0].likes,
      created_at: newPost[0].created_at,
      comments: [],
    };

    // Émettre l'événement Socket.IO pour notifier les clients
    try {
      const io = getIO();
      io.emit("newPost", postWithComments);
      console.log(
        `📡 Notification Socket.IO envoyée pour le nouveau post #${result.insertId}`
      );
    } catch (error) {
      console.log("⚠️ Socket.IO pas disponible, notification ignorée");
    }

    res.status(201).json({
      message: "Post créé avec succès",
      post: postWithComments,
    });
  } catch (error) {
    console.error("Erreur lors de la création du post:", error);
    res.status(500).json({
      error: "Erreur lors de la création du post",
      message: error.message,
    });
  }
});

// POST /api/posts/:id/comments - Ajouter un commentaire à un post (authentification requise)
router.post("/posts/:id/comments", authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const { comment } = req.body;
    const userId = req.user.id;

    if (!comment) {
      return res.status(400).json({
        error: "Le champ comment est requis",
      });
    }

    // Vérifier que le post existe
    const [posts] = await pool.query("SELECT id FROM posts WHERE id = ?", [
      postId,
    ]);

    if (posts.length === 0) {
      return res.status(404).json({ error: "Post non trouvé" });
    }

    // Ajouter le commentaire
    const [result] = await pool.query(
      "INSERT INTO comments (post_id, user_id, comment) VALUES (?, ?, ?)",
      [postId, userId, comment]
    );

    const [newComment] = await pool.query(
      `SELECT 
        c.comment, 
        c.created_at,
        c.user_id,
        u.username as user,
        u.image_url as user_image_url
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: "Commentaire ajouté avec succès",
      comment: newComment[0],
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout du commentaire:", error);
    res.status(500).json({
      error: "Erreur lors de l'ajout du commentaire",
      message: error.message,
    });
  }
});

// PUT /api/posts/:id/like - Incrémenter les likes d'un post (authentification requise)
router.put("/posts/:id/like", authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;

    // Vérifier que le post existe
    const [posts] = await pool.query(
      "SELECT id, likes FROM posts WHERE id = ?",
      [postId]
    );

    if (posts.length === 0) {
      return res.status(404).json({ error: "Post non trouvé" });
    }

    // Incrémenter les likes
    await pool.query("UPDATE posts SET likes = likes + 1 WHERE id = ?", [
      postId,
    ]);

    const [updatedPost] = await pool.query(
      `SELECT 
        p.id, 
        p.content, 
        p.image_url, 
        p.likes, 
        p.created_at,
        p.user_id,
        u.username as author,
        u.image_url as author_image_url
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = ?`,
      [postId]
    );

    res.json({
      message: "Like ajouté avec succès",
      post: {
        id: updatedPost[0].id,
        author: updatedPost[0].author,
        author_image_url: updatedPost[0].author_image_url,
        user_id: updatedPost[0].user_id,
        image_url: updatedPost[0].image_url,
        content: updatedPost[0].content,
        likes: updatedPost[0].likes,
        created_at: updatedPost[0].created_at,
      },
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout du like:", error);
    res.status(500).json({
      error: "Erreur lors de l'ajout du like",
      message: error.message,
    });
  }
});

// POST /api/posts/generate - Générer manuellement des posts
router.post("/posts/generate", async (req, res) => {
  try {
    const count = req.body.count || 10;

    if (count < 1 || count > 100) {
      return res.status(400).json({
        error: "Le nombre de posts doit être entre 1 et 100",
      });
    }

    await generateMultiplePosts(count);

    res.json({
      message: `${count} posts générés avec succès`,
      count: count,
    });
  } catch (error) {
    console.error("Erreur lors de la génération manuelle des posts:", error);
    res.status(500).json({
      error: "Erreur lors de la génération des posts",
      message: error.message,
    });
  }
});

module.exports = router;
