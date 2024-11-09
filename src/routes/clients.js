// src/routes/clients.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const db = require('../models/db');

// Get client list
router.get('/', authMiddleware(['clients.read']), (req, res) => {
  const clients = Array.from(db.clients.values());
  res.json(clients);
});

// Add a new client
router.post('/', authMiddleware(['clients.create']), (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }
  const id = uuidv4();
  const client = { id, email };
  db.clients.set(id, client);
  res.status(201).json(client);
});

module.exports = router;