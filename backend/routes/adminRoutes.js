const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');


const { getAllUsers, updateUserRole,deleteUser } = require('../controllers/adminController');


// All these routes are protected by our "Security Guards"
router.get('/users', protect, admin, getAllUsers);
router.put('/user/:id', protect, admin, updateUserRole);

// This route is only for Admins
// URL: http://localhost:5000/api/admin/users
router.get('/users', protect, admin, (req, res) => {
    res.json({ message: "Success! You are an Admin and can see all users." });
});
router.delete('/user/:id', protect, admin, deleteUser);

module.exports = router;