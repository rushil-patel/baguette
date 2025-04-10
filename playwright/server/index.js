const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory user database for demo purposes
const users = {};

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Create HTML files
const indexHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Authentication Demo</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      border: 1px solid #ddd;
      padding: 20px;
      border-radius: 5px;
    }
    .form-group {
      margin-bottom: 15px;
    }
    label {
      display: block;
      margin-bottom: 5px;
    }
    input {
      width: 100%;
      padding: 8px;
      box-sizing: border-box;
    }
    button {
      background-color: #4CAF50;
      color: white;
      padding: 10px 15px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .error {
      color: red;
      margin-bottom: 10px;
    }
    .success {
      color: green;
      margin-bottom: 10px;
    }
    .nav {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="nav">
      <h1>Welcome</h1>
      <div>
        <a href="/login.html">Login</a> | 
        <a href="/signup.html">Sign Up</a>
      </div>
    </div>
    <p>This is a simple authentication demo for Playwright testing.</p>
    <p>Please sign up or log in to continue.</p>
  </div>
</body>
</html>
`;

const loginHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      border: 1px solid #ddd;
      padding: 20px;
      border-radius: 5px;
    }
    .form-group {
      margin-bottom: 15px;
    }
    label {
      display: block;
      margin-bottom: 5px;
    }
    input {
      width: 100%;
      padding: 8px;
      box-sizing: border-box;
    }
    button {
      background-color: #4CAF50;
      color: white;
      padding: 10px 15px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .error {
      color: red;
      margin-bottom: 10px;
    }
    .nav {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="nav">
      <h1>Login</h1>
      <div>
        <a href="/">Home</a> | 
        <a href="/signup.html">Sign Up</a>
      </div>
    </div>
    <div id="error-message" class="error"></div>
    <form id="login-form">
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" name="email" required>
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <input type="password" id="password" name="password" required>
      </div>
      <button type="submit">Login</button>
    </form>
  </div>

  <script>
    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
          window.location.href = '/dashboard.html';
        } else {
          document.getElementById('error-message').textContent = data.message;
        }
      } catch (error) {
        document.getElementById('error-message').textContent = 'An error occurred. Please try again.';
      }
    });
  </script>
</body>
</html>
`;

const signupHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign Up</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      border: 1px solid #ddd;
      padding: 20px;
      border-radius: 5px;
    }
    .form-group {
      margin-bottom: 15px;
    }
    label {
      display: block;
      margin-bottom: 5px;
    }
    input {
      width: 100%;
      padding: 8px;
      box-sizing: border-box;
    }
    button {
      background-color: #4CAF50;
      color: white;
      padding: 10px 15px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .error {
      color: red;
      margin-bottom: 10px;
    }
    .success {
      color: green;
      margin-bottom: 10px;
    }
    .nav {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="nav">
      <h1>Sign Up</h1>
      <div>
        <a href="/">Home</a> | 
        <a href="/login.html">Login</a>
      </div>
    </div>
    <div id="error-message" class="error"></div>
    <div id="success-message" class="success"></div>
    <form id="signup-form">
      <div class="form-group">
        <label for="name">Name:</label>
        <input type="text" id="name" name="name" required>
      </div>
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" name="email" required>
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <input type="password" id="password" name="password" required minlength="6">
      </div>
      <div class="form-group">
        <label for="confirm-password">Confirm Password:</label>
        <input type="password" id="confirm-password" name="confirmPassword" required minlength="6">
      </div>
      <button type="submit">Sign Up</button>
    </form>
  </div>

  <script>
    document.getElementById('signup-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      
      // Clear previous messages
      document.getElementById('error-message').textContent = '';
      document.getElementById('success-message').textContent = '';
      
      // Validate passwords match
      if (password !== confirmPassword) {
        document.getElementById('error-message').textContent = 'Passwords do not match';
        return;
      }
      
      try {
        const response = await fetch('/api/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, email, password }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
          document.getElementById('success-message').textContent = data.message;
          document.getElementById('signup-form').reset();
          setTimeout(() => {
            window.location.href = '/login.html';
          }, 2000);
        } else {
          document.getElementById('error-message').textContent = data.message;
        }
      } catch (error) {
        document.getElementById('error-message').textContent = 'An error occurred. Please try again.';
      }
    });
  </script>
</body>
</html>
`;

const dashboardHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      border: 1px solid #ddd;
      padding: 20px;
      border-radius: 5px;
    }
    .nav {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    button {
      background-color: #f44336;
      color: white;
      padding: 10px 15px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="nav">
      <h1>Dashboard</h1>
      <button id="logout-btn">Logout</button>
    </div>
    <div id="user-info">
      <p>Loading user information...</p>
    </div>
  </div>

  <script>
    // Check if user is logged in
    async function checkAuth() {
      try {
        const response = await fetch('/api/user');
        
        if (!response.ok) {
          window.location.href = '/login.html';
          return;
        }
        
        const user = await response.json();
        document.getElementById('user-info').innerHTML = `
          <h2>Welcome, ${user.name}!</h2>
          <p>Email: ${user.email}</p>
          <p>You have successfully logged in.</p>
        `;
      } catch (error) {
        window.location.href = '/login.html';
      }
    }
    
    // Logout function
    document.getElementById('logout-btn').addEventListener('click', async () => {
      try {
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = '/';
      } catch (error) {
        console.error('Logout failed:', error);
      }
    });
    
    // Check authentication on page load
    checkAuth();
  </script>
</body>
</html>
`;

// Write HTML files to public directory
fs.writeFileSync(path.join(publicDir, 'index.html'), indexHtml);
fs.writeFileSync(path.join(publicDir, 'login.html'), loginHtml);
fs.writeFileSync(path.join(publicDir, 'signup.html'), signupHtml);
fs.writeFileSync(path.join(publicDir, 'dashboard.html'), dashboardHtml);

// API Routes
app.post('/api/signup', (req, res) => {
  const { name, email, password } = req.body;
  
  // Validate input
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  // Check if user already exists
  if (users[email]) {
    return res.status(400).json({ message: 'User already exists with this email' });
  }
  
  // Create new user
  users[email] = { name, email, password };
  
  res.status(201).json({ message: 'User registered successfully' });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  // Check if user exists and password matches
  const user = users[email];
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  
  // Set user in session
  req.session.user = { name: user.name, email: user.email };
  
  res.json({ message: 'Login successful' });
});

app.get('/api/user', (req, res) => {
  // Check if user is logged in
  if (!req.session.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  res.json(req.session.user);
});

app.post('/api/logout', (req, res) => {
  // Destroy session
  req.session.destroy();
  res.json({ message: 'Logged out successfully' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
