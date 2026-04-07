const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// @desc    Register a new user
// @route   POST /api/auth/signup
exports.registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, phoneNumber, altPhoneNumber, address } = req.body;

        // 1. Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // 2. Hash the password (Security Pillar)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Create a unique Verification Token (Flow Pillar)
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // 4. Create the User in MongoDB
        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phoneNumber,
            altPhoneNumber,
            address, // This saves the nested DoorNo, Colony, City, etc.
            verificationToken
        });

        if (user) {
            // TODO: Send Email with Nodemailer here
            // The Professional Link: Sends them to a verification route we will build next
            const verifyUrl = `http://localhost:5173/verify/${verificationToken}`;
    
    // Fallback for plain text clients
    const message = `Please verify your email by clicking here: ${verifyUrl}`;

    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; text-align: center;">
        <h2 style="color: #1a4331; margin-bottom: 20px;">Welcome to True Eats!</h2>
        <p style="color: #64748b; font-size: 16px; margin-bottom: 30px;">
          Thank you for signing up. Please verify your email address to get started.
        </p>
        
        <!-- The Main Button -->
        <a href="${verifyUrl}" style="background-color: #1a4331; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; display: inline-block;">
          Verify My Email
        </a>

        <!-- The Fallback Link -->
        <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
          If the button doesn't work, copy and paste this link into your browser:
        </p>
        <p style="color: #1a4331; font-size: 13px; word-break: break-all; background-color: #f1f5f9; padding: 12px; border-radius: 8px;">
          ${verifyUrl}
        </p>
      </div>
    `;

    // Make sure to pass the htmlMessage as the 4th argument!
    await sendEmail(user.email, 'True Eats - Verify Your Email', message, htmlMessage);
};
    } catch (error) {
        res.status(500).json({ message: error.message });
    }   
};

// @desc    Verify email
// @route   GET /api/auth/verify/:token
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        // 1. Find the user with this specific token
        const user = await User.findOne({ verificationToken: token });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired verification token" });
        }

        // 2. Update the user: Verify them and remove the token
        user.isVerified = true;
        user.verificationToken = undefined; // Remove the token so it can't be used again
        await user.save();

        // 3. For now, send a success message (Later, we will redirect to React Login)
        res.status(200).send(`
            <h1>Email Verified Successfully!</h1>
            <p>Your True Eats account is now active. You can close this tab and log in.</p>
        `);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const generateToken = require('../utils/generateToken'); // Make sure this file exists!

// @desc    Auth user & get token
// @route   POST /api/auth/login
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find user by email
        const user = await User.findOne({ email });

        if (user) {
            // 2. Check if Email is Verified (Crucial Security Step)
            if (!user.isVerified) {
                return res.status(401).json({ message: "Please verify your email before logging in." });
            }

            // 3. Check if password matches
            const isMatch = await bcrypt.compare(password, user.password);

            if (isMatch) {
                // 4. Success! Send User Data + JWT Token
                res.json({
                    _id: user._id,
                    firstName: user.firstName,
                    email: user.email,
                    role: user.role, // This tells React if they are Admin or Customer
                    token: generateToken(user._id, user.role),
                });
            } else {
                res.status(401).json({ message: "Invalid email or password" });
            }
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
      user.altPhoneNumber = req.body.altPhoneNumber || user.altPhoneNumber;
      
      if (req.body.address) {
        user.address = {
          doorNo: req.body.address.doorNo || user.address?.doorNo,
          colony: req.body.address.colony || user.address?.colony,
          city: req.body.address.city || user.address?.city,
          pincode: req.body.address.pincode || user.address?.pincode,
        };
      }

      const updatedUser = await user.save();
      res.json({ message: 'Profile updated successfully', user: updatedUser });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: 'No user found with that email' });
    }

    // Generate a secure, random crypto token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash it and save it to the database with a 15-minute expiration
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; 
    await user.save();

    // Send the email using your existing utility
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    const message = `Please click on the following link to reset your password: ${resetUrl}`;
    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; text-align: center;">
        <h2 style="color: #1a4331; margin-bottom: 20px;">True Eats</h2>
        <p style="color: #64748b; font-size: 16px; margin-bottom: 30px;">
          We received a request to reset the password for your account. Click the button below to choose a new password.
        </p>
        
        <!-- The Main Button -->
        <a href="${resetUrl}" style="background-color: #1a4331; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; display: inline-block;">
          Reset My Password
        </a>

        <!-- The Fallback Link -->
        <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
          If the button doesn't work, copy and paste this link into your browser:
        </p>
        <p style="color: #1a4331; font-size: 13px; word-break: break-all; background-color: #f1f5f9; padding: 12px; border-radius: 8px;">
          ${resetUrl}
        </p>

        <p style="color: #94a3b8; font-size: 12px; margin-top: 30px;">
          If you did not request a password reset, you can safely ignore this email.
        </p>
      </div>
    `;

    try {
      // Pass the htmlMessage as the 4th argument
      await sendEmail(user.email, 'True Eats - Password Reset', 'message', htmlMessage);
      res.json({ message: 'Password reset link sent to your email!' });
    } catch (error) {
      // If email sending fails, clear the reset token and expiration
      user.resetPasswordToken = undefined;  
        user.resetPasswordExpire = undefined;  
        await user.save(); 
        res.status(500).json({ message: 'Failed to send email. Please try again later.' }); 
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }     
};
// @desc    Reset Password
// @route   PUT /api/auth/reset-password/:token
exports.resetPassword = async (req, res) => {
  try {
    // Re-hash the token from the URL to compare it with the database
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() } // Ensure it hasn't expired
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash the new password and save
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    
    // Clear the reset fields so the token can't be used again
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: 'Password updated successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};