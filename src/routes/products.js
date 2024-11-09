const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

router.get('/', authMiddleware(['products.read']), (req, res) => {
  const products = Array.from(db.products.values());
  res.json(products.map(product => ({
    ...product,
    _links: {
      self: `/products/${product.id}`,
      category: `/categories/${product.categoryId}`
    }
  })));
});

router.get('/:id', authMiddleware(['products.read']), (req, res) => {
  const product = db.products.get(req.params.id);
  if (!product) {
    return res.status(404).json({ error: `Product with ID ${req.params.id} not found.` });
  }
  res.json(product);
});