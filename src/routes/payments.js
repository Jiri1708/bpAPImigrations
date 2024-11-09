// src/routes/payments.js
const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
const { v4: uuidv4 } = require("uuid");
const db = require("../models/db");

// Create a payment
router.post("/", authMiddleware(["payments.create"]), (req, res) => {
  const { orderId, method, amount } = req.body;
  if (!orderId || !method || !amount) {
    return res.status(400).json({ error: "Missing required fields." });
  }
  if (!db.orders.has(orderId)) {
    return res.status(404).json({ error: "Order not found." });
  }
  const id = uuidv4();
  const payment = { id, orderId, method, amount };
  db.payments.set(id, payment);
  res.status(201).json(payment);
});

module.exports = router;
