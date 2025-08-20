// Dependencies
const express = require('express');
const session = require('express-session');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcrypt');

const app = express();

// Express settings & Static files
app.use(bodyParser.json());
app.use(express.static('public'));

// Session configuration
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

// User profile picture storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/user-imgs/'),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// MySQL database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'sport_db'
});


// Signup - Register a new user
app.post('/signup', async (req, res) => {
  const { email, username, password, confirmPassword, birthdate, sex, agreed, profile_picture } = req.body;

  if (password !== confirmPassword) return res.status(400).json({ error: 'Passwords do not match' });
  if (!agreed) return res.status(400).json({ error: 'You must agree to the terms and policy' });

  const finalProfilePicture = profile_picture || null;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.query('SELECT id FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error during email check' });
    if (results.length > 0) return res.status(400).json({ error: 'Email already in use' });

    const sql = `INSERT INTO users (email, username, password, birthdate, sex, agreed_terms, profile_picture)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [email, username, hashedPassword, birthdate, sex, agreed, finalProfilePicture], (err) => {
      if (err) return res.status(500).json({ error: 'Database insert error' });
      res.status(200).json({ success: true });
    });
  });
});

// Login - Authenticate user
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.sendStatus(500);
    if (results.length === 0) return res.json({ success: false });

    const user = results[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.json({ success: false });

    req.session.userId = user.id;
    res.json({ success: true });
  });
});

// Logout - End user session
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

// Get logged-in user info
app.get('/api/user', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
  db.query('SELECT email, username, profile_picture FROM users WHERE id = ?', [req.session.userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(results[0]);
  });
});

// Edit user account
app.get('/api/user-info', (req, res) => {
  const userId = req.session.userId;
  db.query('SELECT id, email, username, password, birthdate, sex FROM users WHERE id = ?', [userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(results[0]);
  });
});

app.post('/api/update-account', upload.none(), async (req, res) => {
  const { id, email, username, password, birthdate, sex } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.query('UPDATE users SET email = ?, username = ?, password = ?, birthdate = ?, sex = ? WHERE id = ?',
    [email, username, hashedPassword, birthdate, sex, id], (err) => {
      if (err) return res.status(500).json({ error: 'Update failed' });
      res.json({ message: 'Account updated successfully' });
    });
});

// Upload profile picture
app.post('/upload-profile', upload.single('profile_image'), (req, res) => {
  const userId = req.session.userId;
  const imagePath = '/user-imgs/' + req.file.filename;
  db.query('UPDATE users SET profile_picture = ? WHERE id = ?', [imagePath, userId], (err) => {
    if (err) return res.status(500).send('Database error');
    res.redirect('dashboard.html');
  });
});


// Get sports list
app.get('/api/sports', (req, res) => {
  db.query('SELECT id, name FROM sports', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

// Subscribe to a sport
app.post('/api/subscribe', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
  const { sport_id, type, start_date } = req.body;
  db.query('INSERT INTO subscriptions (user_id, sport_id, type, start_date) VALUES (?, ?, ?, ?)',
    [req.session.userId, sport_id, type, start_date], (err) => {
      if (err) return res.status(500).json({ error: 'Database insert error' });
      res.json({ success: true });
    });
});

// Delete a subscription
app.delete('/api/subscription/:id', (req, res) => {
  const subscriptionId = req.params.id;
  db.query('DELETE FROM subscriptions WHERE id = ?', [subscriptionId], (err) => {
    if (err) return res.status(500).send('Server error');
    res.status(200).send('Subscription deleted');
  });
});

// Dashboard - get user's subscriptions
app.get('/api/dashboard', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });
  db.query(`SELECT sub.id, s.name AS sport_name, sub.type, sub.start_date
            FROM subscriptions sub
            JOIN sports s ON s.id = sub.sport_id
            WHERE sub.user_id = ?`, [req.session.userId], (err, results) => {
    if (err) return res.sendStatus(500);
    res.json({ subscriptions: results });
  });
});

// Get sports images
app.get('/sports', (req, res) => {
  db.query('SELECT name, sport_img FROM sports', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});



// Get all users
app.get('/api/admin/users', (req, res) => {
  db.query('SELECT id, email, username FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

// Delete a user and all subscriptions
app.delete('/api/admin/users/:id', (req, res) => {
  const userId = req.params.id;
  db.query('DELETE FROM subscriptions WHERE user_id = ?', [userId], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to delete subscriptions' });
    db.query('DELETE FROM users WHERE id = ?', [userId], (err) => {
      if (err) return res.status(500).json({ error: 'Failed to delete user' });
      res.status(200).json({ success: true, message: 'User and subscriptions deleted' });
    });
  });
});

// Manage sports - upload/update images
const sportStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/sports_img/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const uploadSport = multer({ storage: sportStorage });

// Get all sports
app.get('/api/admin/sports', (req, res) => {
  db.query('SELECT * FROM sports', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

// Add a new sport
app.post('/api/admin/sports', uploadSport.single('sport_img'), (req, res) => {
  const { name } = req.body;
  const imageName = req.file.filename;
  db.query('INSERT INTO sports (name, sport_img) VALUES (?, ?)', [name, imageName], (err) => {
    if (err) return res.status(500).json({ success: false, error: 'Insert failed' });
    res.json({ success: true });
  });
});

// Update sport
app.put('/api/admin/sports/:id', uploadSport.single('sport_img'), (req, res) => {
  const sportId = req.params.id;
  const { name } = req.body;
  const image = req.file ? req.file.filename : null;
  const updateQuery = image ? 'UPDATE sports SET name = ?, sport_img = ? WHERE id = ?' : 'UPDATE sports SET name = ? WHERE id = ?';
  const values = image ? [name, image, sportId] : [name, sportId];
  db.query(updateQuery, values, (err) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true });
  });
});

// Delete a sport
app.delete('/api/admin/sports/:id', (req, res) => {
  const sportId = req.params.id;
  db.query('DELETE FROM sports WHERE id = ?', [sportId], (err) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true });
  });
});

// Get all subscriptions for admin
app.get('/api/admin/subscriptions', (req, res) => {
  const sql = `
    SELECT sub.id, sub.type, sub.start_date,u.username, u.email,s.name AS sport_name
    FROM subscriptions sub
    JOIN users u ON u.id = sub.user_id
    JOIN sports s ON s.id = sub.sport_id
    ORDER BY sub.start_date DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
});

// Delete a subscription
app.delete('/api/admin/subscriptions/:id', (req, res) => {
  const subscriptionId = req.params.id;
  db.query('DELETE FROM subscriptions WHERE id = ?', [subscriptionId], (err) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true });
  });
});

// Admin stats
app.get('/api/admin/stats', (req, res) => {
  const stats = {};
  db.query('SELECT COUNT(*) AS userCount FROM users', (err, result) => {
    if (err) return res.status(500).json({ error: 'User count error' });
    stats.userCount = result[0].userCount;

    db.query('SELECT COUNT(*) AS subscriptionCount FROM subscriptions', (err, result) => {
      if (err) return res.status(500).json({ error: 'Subscription count error' });
      stats.subscriptionCount = result[0].subscriptionCount;

      db.query('SELECT COUNT(*) AS sportCount FROM sports', (err, result) => {
        if (err) return res.status(500).json({ error: 'Sport count error' });
        stats.sportCount = result[0].sportCount;
        res.json(stats);
      });
    });
  });
});

// Top 5 sports by subscription
app.get('/api/admin/top-sports', (req, res) => {
  const sql = `
    SELECT s.name, COUNT(sub.id) AS total
    FROM subscriptions sub
    JOIN sports s ON s.id = sub.sport_id
    GROUP BY sub.sport_id
    ORDER BY total DESC
    LIMIT 5
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Top sports error' });
    res.json(results);
  });
});

// Start server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});






