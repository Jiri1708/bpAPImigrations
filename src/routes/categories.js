// src/routes/categories.js
const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
const { v4: uuidv4 } = require("uuid");
const db = require("../models/db");

// Get category list
router.get("/", authMiddleware(["categories.read"]), (req, res) => {
  const categories = Array.from(db.categories.values());
  res.json(categories);
});

// Add a new category
router.post("/", authMiddleware(["categories.create"]), (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Name is required." });
  }
  const id = uuidv4();
  const category = { id, name };
  db.categories.set(id, category);
  res.status(201).json(category);
});

module.exports = router;
