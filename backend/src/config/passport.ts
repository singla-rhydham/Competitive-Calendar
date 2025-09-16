"use strict";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

export const initializePassport = () => {
  // Serialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user._id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: "/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            // Always update access token
            user.accessToken = accessToken;

            // ⚠️ Only update refreshToken if provided (don’t overwrite with undefined)
            if (refreshToken) {
              user.refreshToken = refreshToken;
            }

            await user.save();
            return done(null, user);
          }

          // Create new user if not exists
          user = new User({
            googleId: profile.id,
            email: profile.emails?.[0]?.value,
            name: profile.displayName,
            picture: profile.photos?.[0]?.value,
            accessToken,
            refreshToken, // will only be set on first consent
          });

          await user.save();
          return done(null, user);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );
};
