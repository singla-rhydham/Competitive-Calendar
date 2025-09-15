"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_js_1 = __importDefault(require("../models/User.js"));
const googleCalendar_js_1 = __importDefault(require("../services/googleCalendar.js"));
const router = express_1.default.Router();
// Subscribe to contest notifications
router.post('/subscribe', async (req, res) => {
    try {
        console.log('Subscribe endpoint called');
        console.log('Headers:', req.headers);
        console.log('Session:', req.session);
        console.log('User:', req.user);
        console.log('Is authenticated:', req.isAuthenticated());
        if (!req.isAuthenticated()) {
            console.log('User not authenticated, returning 401');
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const user = req.user;
        const userId = user._id;
        console.log('User ID:', userId);
        // Update user subscription status
        await User_js_1.default.findByIdAndUpdate(userId, { subscribed: true });
        // Add contests to user's Google Calendar
        const result = await googleCalendar_js_1.default.addContestsToUserCalendar(userId);
        if (result.success) {
            res.json({
                success: true,
                message: result.message,
                addedCount: result.addedCount
            });
        }
        else {
            res.status(400).json({
                success: false,
                message: result.message
            });
        }
    }
    catch (error) {
        console.error('Error in subscribe endpoint:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Unsubscribe from contest notifications
router.post('/unsubscribe', async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const user = req.user;
        const userId = user._id;
        // Update user subscription status
        await User_js_1.default.findByIdAndUpdate(userId, { subscribed: false });
        // Remove contests from user's Google Calendar
        const result = await googleCalendar_js_1.default.removeContestsFromUserCalendar(userId);
        if (result.success) {
            res.json({
                success: true,
                message: result.message
            });
        }
        else {
            res.status(400).json({
                success: false,
                message: result.message
            });
        }
    }
    catch (error) {
        console.error('Error in unsubscribe endpoint:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Get user subscription status
router.get('/status', async (req, res) => {
    try {
        console.log('Status endpoint called');
        console.log('Headers:', req.headers);
        console.log('Session:', req.session);
        console.log('User:', req.user);
        console.log('Is authenticated:', req.isAuthenticated());
        if (!req.isAuthenticated()) {
            console.log('User not authenticated, returning 401');
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const user = req.user;
        const userId = user._id;
        console.log('User ID:', userId);
        const userDoc = await User_js_1.default.findById(userId);
        if (!userDoc) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            subscribed: userDoc.subscribed,
            reminderPreference: userDoc.reminderPreference
        });
    }
    catch (error) {
        console.error('Error in status endpoint:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Get upcoming contests
router.get('/contests', async (req, res) => {
    try {
        const Contest = (await Promise.resolve().then(() => __importStar(require('../models/Contest.js')))).default;
        const upcomingContests = await Contest.find({
            startTime: { $gte: new Date() }
        }).sort({ startTime: 1 }).limit(100);
        // Transform contests to include all necessary fields
        const transformedContests = upcomingContests.map(contest => ({
            _id: contest._id,
            id: contest.id,
            platform: contest.platform,
            name: contest.name,
            startTime: contest.startTime.toISOString(),
            endTime: contest.endTime.toISOString(),
            url: contest.url,
            createdAt: contest.createdAt,
            updatedAt: contest.updatedAt
        }));
        console.log(`Returning ${transformedContests.length} upcoming contests`);
        res.json({
            success: true,
            contests: transformedContests,
            total: transformedContests.length,
            lastUpdated: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Error fetching contests:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
exports.default = router;
