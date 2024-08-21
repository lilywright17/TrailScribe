const bcrypt = require('bcrypt');
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

// Controller for the register page
const registerUser = async (req, res) => {
    const { fullname, username, email, password, confirmPassword } = req.body;

    if (!fullname || !username || !email || !password || !confirmPassword) {
        return res.status(400).json({ 
            success: false, 
            message: 'All fields are required' 
        });
    }

    try {
        // Checking if the email exists in the database before registering
        const [existingUser] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(409).json({ 
                success: false, 
                message: 'Email is already registered' 
            });
        }

        const saltRounds = 10; // This is needed for the hashing of the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        // Inserts the entry in the database
        const result = await db.query(
            'INSERT INTO Users (fullname, username, email, pword_hash) VALUES (?, ?, ?, ?)',
            [fullname, username, email, hashedPassword]
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            userId: result[0].insertId
        });

    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during registration' 
        });
    }
};

// Controller for the login page
<<<<<<< HEAD
//See if more HTTP res code are needed
=======
>>>>>>> dev
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const invalidMsg = {
        success: false,
        message: 'Invalid email or password'
    };

    try {
        // Query to get the user by email
        const [results] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);

        // Log the results to check the output
        //console.log('Database query results:', results);

        // Check if user exists
        if (results.length === 0) {
            return res.status(401).json(invalidMsg);
        }

        const user = results[0];

        // Compare password with hashed password
        const pwMatch = await bcrypt.compare(password, user.pword_hash);
        if (!pwMatch) {
            console.warn('Login failed: Incorrect password for user with email:', email);
            return res.status(401).json(invalidMsg);
        }

        // Prepare JWT payload with userID and email
        const payload = { userID: user.userID, email: user.email };
        
        // Logging payload for debugging
        console.log('JWT Payload:', payload);
        
        // Generate JWT token
        const token = jwt.sign(
            payload,
            jwtConfig.secret,
            { expiresIn: jwtConfig.expiresIn }
        );

        // Send response with token and user info
        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.userID,
                fullname: user.fullname,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};


module.exports = { registerUser, loginUser };