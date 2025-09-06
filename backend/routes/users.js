const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../database');
const config = require('../config');

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, config.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Get user profile
router.get('/profile', authenticateToken, (req, res) => {
  const userId = req.user.userId;

  db.get('SELECT id, username, email, created_at FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  });
});

// Update user profile
router.put('/profile', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { username, email } = req.body;

  db.run(
    'UPDATE users SET username = ?, email = ? WHERE id = ?',
    [username, email, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Failed to update profile' });
      }

      res.json({ message: 'Profile updated successfully' });
    }
  );
});

// Get user cart
router.get('/cart', authenticateToken, (req, res) => {
  const userId = req.user.userId;

  db.all(
    `SELECT c.*, p.title, p.description, p.price, p.image_url, p.category 
     FROM cart c 
     JOIN products p ON c.product_id = p.id 
     WHERE c.user_id = ?`,
    [userId],
    (err, cartItems) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }
      res.json(cartItems);
    }
  );
});

// Add to cart
router.post('/cart', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required' });
  }

  // Check if item already in cart
  db.get('SELECT * FROM cart WHERE user_id = ? AND product_id = ?', [userId, productId], (err, existingItem) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (existingItem) {
      // Update quantity
      db.run(
        'UPDATE cart SET quantity = quantity + 1 WHERE user_id = ? AND product_id = ?',
        [userId, productId],
        function(err) {
          if (err) {
            return res.status(500).json({ message: 'Failed to update cart' });
          }
          res.json({ message: 'Item added to cart' });
        }
      );
    } else {
      // Add new item
      db.run(
        'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, 1)',
        [userId, productId],
        function(err) {
          if (err) {
            return res.status(500).json({ message: 'Failed to add to cart' });
          }
          res.json({ message: 'Item added to cart' });
        }
      );
    }
  });
});

// Remove from cart
router.delete('/cart/:productId', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { productId } = req.params;

  db.run('DELETE FROM cart WHERE user_id = ? AND product_id = ?', [userId, productId], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Failed to remove from cart' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    res.json({ message: 'Item removed from cart' });
  });
});

// Purchase cart
router.post('/cart/purchase', authenticateToken, (req, res) => {
  const userId = req.user.userId;

  // Get cart items
  db.all('SELECT * FROM cart WHERE user_id = ?', [userId], (err, cartItems) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Create purchases
    const purchases = cartItems.map(item => ({
      user_id: userId,
      product_id: item.product_id,
      quantity: item.quantity,
      total_price: item.quantity * item.price
    }));

    // Insert purchases
    const stmt = db.prepare('INSERT INTO purchases (user_id, product_id, quantity, total_price) VALUES (?, ?, ?, ?)');
    
    db.serialize(() => {
      purchases.forEach(purchase => {
        stmt.run([purchase.user_id, purchase.product_id, purchase.quantity, purchase.total_price]);
      });
      
      // Clear cart
      db.run('DELETE FROM cart WHERE user_id = ?', [userId], (err) => {
        if (err) {
          return res.status(500).json({ message: 'Failed to clear cart' });
        }
        
        res.json({ message: 'Purchase completed successfully', purchasedItems: purchases });
      });
    });
  });
});

// Get purchase history
router.get('/purchases', authenticateToken, (req, res) => {
  const userId = req.user.userId;

  db.all(
    `SELECT p.*, pr.title, pr.description, pr.image_url, pr.category 
     FROM purchases p 
     JOIN products pr ON p.product_id = pr.id 
     WHERE p.user_id = ? 
     ORDER BY p.purchase_date DESC`,
    [userId],
    (err, purchases) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }
      res.json(purchases);
    }
  );
});

module.exports = router;