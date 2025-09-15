"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const router = express_1.default.Router();
// Google OAuth login route
router.get('/google', passport_1.default.authenticate('google', {
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar']
}));
// Google OAuth callback route
router.get('/google/callback', passport_1.default.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    // Successful authentication, redirect to frontend dashboard
    const user = req.user;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/dashboard?name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}&picture=${encodeURIComponent(user.picture || '')}`);
});
// Logout route
router.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ message: 'Logged out successfully' });
    });
});
// Get current user route
router.get('/me', (req, res) => {
    if (req.isAuthenticated()) {
        const user = req.user;
        res.json({
            id: user._id,
            googleId: user.googleId,
            email: user.email,
            name: user.name,
            picture: user.picture
        });
    }
    else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});
exports.default = router;
