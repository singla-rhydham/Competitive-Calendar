"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializePassport = void 0;
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const User_js_1 = __importDefault(require("../models/User.js"));
const initializePassport = () => {
    // Serialize user for session
    passport_1.default.serializeUser((user, done) => {
        done(null, user._id);
    });
    // Deserialize user from session
    passport_1.default.deserializeUser(async (id, done) => {
        try {
            const user = await User_js_1.default.findById(id);
            done(null, user);
        }
        catch (error) {
            done(error, null);
        }
    });
    // Google OAuth Strategy
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback"
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user already exists
            let user = await User_js_1.default.findOne({ googleId: profile.id });
            if (user) {
                // Update tokens if user exists
                user.accessToken = accessToken;
                user.refreshToken = refreshToken;
                await user.save();
                return done(null, user);
            }
            // Create new user
            user = new User_js_1.default({
                googleId: profile.id,
                email: profile.emails?.[0]?.value,
                name: profile.displayName,
                picture: profile.photos?.[0]?.value,
                accessToken,
                refreshToken
            });
            await user.save();
            return done(null, user);
        }
        catch (error) {
            return done(error, false);
        }
    }));
};
exports.initializePassport = initializePassport;
