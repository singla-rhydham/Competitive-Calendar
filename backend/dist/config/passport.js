import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
export const initializePassport = () => {
    // Serialize user for session
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });
    // Deserialize user from session
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        }
        catch (error) {
            done(error, null);
        }
    });
    // Google OAuth Strategy
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback"
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user already exists
            let user = await User.findOne({ googleId: profile.id });
            if (user) {
                // Update tokens if user exists
                user.accessToken = accessToken;
                user.refreshToken = refreshToken;
                await user.save();
                return done(null, user);
            }
            // Create new user
            user = new User({
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
//# sourceMappingURL=passport.js.map