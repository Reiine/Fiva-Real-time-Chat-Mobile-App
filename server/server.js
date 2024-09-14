const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const http = require('http');
const socketIo = require('socket.io');
const users = require('./models/users'); // Ensure this path is correct
const admin = require("firebase-admin")


const port = process.env.PORT || 3001;
const app = express();
app.use(cors());
app.use(express.json());



admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    // Replace with your Firebase project configuration
  });


  app.post('/generate-token', async (req, res) => {
    const { fivaId } = req.body;
  
    try {
      // Verify user credentials here (e.g., check against your database)
      
      // Generate a custom Firebase token
      const customToken = await admin.auth().createCustomToken(fivaId);
  
      res.json({ token: customToken });
    } catch (error) {
      console.error('Error creating custom token:', error);
      res.status(500).send('Error creating token');
    }
  });


// Registration endpoint
app.post('/register', async (req, res) => {
    console.log('Received a request to register');
    try {
        const { username, password, fivaId } = req.body;
        const user = await users.findOne({ fivaId: fivaId });
        if (user) {
            res.status(400).json({ message: 'User already exists' });
        } else {
            const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
            const newUser = new users({ username, password: hashedPassword, fivaId });
            await newUser.save();

            // Emit a socket event to add the user to the public group
            io.emit('joinPublicGroup', { username, fivaId });

            res.status(201).json({ message: 'Registration successful' });
        }
    } catch (error) {
        console.error('Error occurred during registration:', error);
        res.status(500).json({ message: 'An error occurred. Please try again.' });
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { fivaId, password } = req.body;
    try {
        const user = await users.findOne({ fivaId: fivaId });
        if (user) {
            const passwordMatch = await bcrypt.compare(password, user.password); // Compare hashed passwords
            if (passwordMatch) {
                const token = jwt.sign({ fivaId: user.fivaId }, SECRET_KEY); // Generate JWT
                res.json({ message: 'success', token: token });
            } else {
                res.status(401).json({ message: 'Incorrect credentials' });
            }
        } else {
            res.status(404).json({ message: 'No user found with this ID. Please register.' });
        }
    } catch (error) {
        console.error('Error occurred during login:', error);
        res.status(500).json({ message: 'An error occurred. Please try again.' });
    }
});

// Middleware to authenticate JWT
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract the token from 'Authorization: Bearer <token>'

    if (token == null) return res.sendStatus(401); // If no token is present

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403); // If the token is invalid
        req.user = user; // Attach user info to the request object
        next(); // Proceed to the next middleware or route handler
    });
};

// Example of a protected route
app.get('/protected', authenticateJWT, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});

// Start the server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});
