const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/database");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config/jwt");
const { authenticateToken } = require("../middleware/auth");

/**
 * POST /api/auth/register - Inscription d'un nouvel utilisateur
 */
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, image_url } = req.body;

    // Validation des champs
    if (!username || !email || !password) {
      return res.status(400).json({
        error: "Champs manquants",
        message: "Les champs username, email et password sont requis",
      });
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Email invalide",
        message: "Veuillez fournir une adresse email valide",
      });
    }

    // Validation du mot de passe (minimum 6 caractères)
    if (password.length < 6) {
      return res.status(400).json({
        error: "Mot de passe trop court",
        message: "Le mot de passe doit contenir au moins 6 caractères",
      });
    }

    // Vérifier si l'email existe déjà
    const [existingUsers] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        error: "Email déjà utilisé",
        message: "Un compte existe déjà avec cet email",
      });
    }

    // Vérifier si le username existe déjà
    const [existingUsernames] = await pool.query(
      "SELECT id FROM users WHERE username = ?",
      [username]
    );

    if (existingUsernames.length > 0) {
      return res.status(409).json({
        error: "Username déjà utilisé",
        message: "Ce nom d'utilisateur est déjà pris",
      });
    }

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Créer l'utilisateur
    const [result] = await pool.query(
      "INSERT INTO users (username, email, password, image_url) VALUES (?, ?, ?, ?)",
      [username, email, hashedPassword, image_url || null]
    );

    // Générer le token JWT
    const token = jwt.sign({ userId: result.insertId }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // Récupérer l'utilisateur créé (sans le mot de passe)
    const [newUser] = await pool.query(
      "SELECT id, username, email, image_url, created_at FROM users WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      token,
      user: newUser[0],
    });
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors de l'inscription",
    });
  }
});

/**
 * POST /api/auth/login - Connexion d'un utilisateur
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation des champs
    if (!email || !password) {
      return res.status(400).json({
        error: "Champs manquants",
        message: "Les champs email et password sont requis",
      });
    }

    // Récupérer l'utilisateur par email
    const [users] = await pool.query(
      "SELECT id, username, email, password, image_url, created_at FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        error: "Identifiants invalides",
        message: "Email ou mot de passe incorrect",
      });
    }

    const user = users[0];

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Identifiants invalides",
        message: "Email ou mot de passe incorrect",
      });
    }

    // Générer le token JWT
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    // Retourner l'utilisateur sans le mot de passe
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: "Connexion réussie",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors de la connexion",
    });
  }
});

/**
 * GET /api/auth/me - Récupérer les informations de l'utilisateur connecté
 */
router.get("/me", authenticateToken, async (req, res) => {
  try {
    // L'utilisateur est déjà disponible dans req.user grâce au middleware
    res.json({
      user: req.user,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);
    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors de la récupération du profil",
    });
  }
});

/**
 * POST /api/auth/logout - Déconnexion (côté client principalement)
 */
router.post("/logout", authenticateToken, (req, res) => {
  // La déconnexion se fait principalement côté client en supprimant le token
  // Cette route peut être utilisée pour des logs ou d'autres actions
  res.json({
    message: "Déconnexion réussie",
  });
});

/**
 * PUT /api/auth/update-profile - Mettre à jour le profil utilisateur
 */
router.put("/update-profile", authenticateToken, async (req, res) => {
  try {
    const { username, image_url } = req.body;
    const userId = req.user.id;

    if (!username && image_url === undefined) {
      return res.status(400).json({
        error: "Champ manquant",
        message: "Au moins un champ (username ou image_url) est requis",
      });
    }

    // Vérifier si le nouveau username est déjà pris par un autre utilisateur
    if (username) {
      const [existingUsers] = await pool.query(
        "SELECT id FROM users WHERE username = ? AND id != ?",
        [username, userId]
      );

      if (existingUsers.length > 0) {
        return res.status(409).json({
          error: "Username déjà utilisé",
          message: "Ce nom d'utilisateur est déjà pris",
        });
      }
    }

    // Construire la requête de mise à jour dynamiquement
    const updates = [];
    const values = [];

    if (username) {
      updates.push("username = ?");
      values.push(username);
    }

    if (image_url !== undefined) {
      updates.push("image_url = ?");
      values.push(image_url || null);
    }

    values.push(userId);

    // Mettre à jour les champs
    await pool.query(
      `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    // Récupérer l'utilisateur mis à jour
    const [updatedUser] = await pool.query(
      "SELECT id, username, email, image_url, created_at FROM users WHERE id = ?",
      [userId]
    );

    res.json({
      message: "Profil mis à jour avec succès",
      user: updatedUser[0],
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors de la mise à jour du profil",
    });
  }
});

/**
 * PUT /api/auth/change-password - Changer le mot de passe
 */
router.put("/change-password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validation des champs
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: "Champs manquants",
        message: "Les champs currentPassword et newPassword sont requis",
      });
    }

    // Validation du nouveau mot de passe
    if (newPassword.length < 6) {
      return res.status(400).json({
        error: "Mot de passe trop court",
        message: "Le nouveau mot de passe doit contenir au moins 6 caractères",
      });
    }

    // Récupérer l'utilisateur avec son mot de passe
    const [users] = await pool.query(
      "SELECT password FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        error: "Utilisateur non trouvé",
        message: "L'utilisateur n'existe pas",
      });
    }

    // Vérifier le mot de passe actuel
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      users[0].password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Mot de passe incorrect",
        message: "Le mot de passe actuel est incorrect",
      });
    }

    // Hasher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Mettre à jour le mot de passe
    await pool.query("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      userId,
    ]);

    res.json({
      message: "Mot de passe changé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors du changement de mot de passe:", error);
    res.status(500).json({
      error: "Erreur serveur",
      message: "Une erreur est survenue lors du changement de mot de passe",
    });
  }
});

module.exports = router;
