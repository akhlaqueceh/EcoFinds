const express = require('express');
const db = require('../database');

const router = express.Router();

// Get all products
router.get('/', (req, res) => {
  const { search, category } = req.query;
  let query = 'SELECT * FROM products WHERE is_available = 1';
  const params = [];

  if (search) {
    query += ' AND (title LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  query += ' ORDER BY created_at DESC';

  db.all(query, params, (err, products) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(products);
  });
});

// Get product by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM products WHERE id = ?', [id], (err, product) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  });
});

// Create product
router.post('/', (req, res) => {
  const { title, description, category, price, condition, image_url, seller_id } = req.body;

  if (!title || !description || !category || !price || !seller_id) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  db.run(
    'INSERT INTO products (title, description, category, price, condition, image_url, seller_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [title, description, category, price, condition || 'good', image_url, seller_id],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Failed to create product' });
      }

      res.status(201).json({
        message: 'Product created successfully',
        product: { id: this.lastID, title, description, category, price, condition, image_url, seller_id }
      });
    }
  );
});

// Update product
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, category, price, condition, image_url } = req.body;

  db.run(
    'UPDATE products SET title = ?, description = ?, category = ?, price = ?, condition = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [title, description, category, price, condition, image_url, id],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Failed to update product' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.json({ message: 'Product updated successfully' });
    }
  );
});

// Delete product
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Failed to delete product' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  });
});

// Get products by seller
router.get('/seller/:sellerId', (req, res) => {
  const { sellerId } = req.params;

  db.all('SELECT * FROM products WHERE seller_id = ? ORDER BY created_at DESC', [sellerId], (err, products) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(products);
  });
});

module.exports = router;