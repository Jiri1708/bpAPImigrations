// src/routes/orders.js
const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth");
const { v4: uuidv4 } = require("uuid");
const db = require("../models/db");

// Get order details
router.get("/:orderId", authMiddleware(["orders.read"]), (req, res) => {
  const order = db.orders.get(req.params.orderId);
  if (!order) {
    return res.status(404).json({ error: "Order not found." });
  }
  res.json(order);
});

// Cancel an order
router.post(
  "/:orderId/cancel",
  authMiddleware(["orders.update"]),
  (req, res) => {
    const order = db.orders.get(req.params.orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }
    order.status = "CANCELLED";
    db.orders.set(req.params.orderId, order);
    res.json({ message: "Order cancelled successfully." });
  }
);

module.exports = router;
