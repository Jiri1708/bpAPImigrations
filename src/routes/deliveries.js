// src/routes/deliveries.js
const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
const { v4: uuidv4 } = require("uuid");
const db = require("../models/db");

// Schedule a delivery
router.post("/", authMiddleware(["deliveries.schedule"]), (req, res) => {
  const { orderId, deliveryDate } = req.body;
  if (!orderId || !deliveryDate) {
    return res.status(400).json({ error: "Missing required fields." });
  }
  if (!db.orders.has(orderId)) {
    return res.status(404).json({ error: "Order not found." });
  }
  const id = uuidv4();
  const delivery = { id, orderId, deliveryDate };
  db.deliveries.set(id, delivery);
  res.status(201).json(delivery);
});

// Get delivery details
router.get("/:deliveryId", authMiddleware([]), (req, res) => {
  const delivery = db.deliveries.get(req.params.deliveryId);
  if (!delivery) {
    return res.status(404).json({ error: "Delivery not found." });
  }
  res.json(delivery);
});

// Cancel a delivery
router.post("/:deliveryId/cancel", authMiddleware([]), (req, res) => {
  const delivery = db.deliveries.get(req.params.deliveryId);
  if (!delivery) {
    return res.status(404).json({ error: "Delivery not found." });
  }
  delivery.status = "CANCELLED";
  db.deliveries.set(req.params.deliveryId, delivery);
  res.json({ message: "Delivery cancelled successfully." });
});

module.exports = router;
