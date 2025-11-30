"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const passport_local_1 = require("passport-local");
const auth_interface_1 = require("../modules/auth/auth.interface");
const user_interface_1 = require("../modules/user/user.interface");
const user_model_1 = require("../modules/user/user.model");
const env_1 = require("./env");
const normalizeUser = (user) => ({
    _id: user._id,
    email: user.email,
    role: user.role,
});
//  LOCAL STRATEGY (LOGIN)
passport_1.default.use(new passport_local_1.Strategy({
    usernameField: "email",
    passwordField: "password",
}, async (email, password, done) => {
    try {
        const user = await user_model_1.UserModel.findOne({ email });
        if (!user) {
            return done(null, false, { message: "User does not exist" });
        }
        if (!user.isVerified) {
            return done(null, false, { message: "User is not verified" });
        }
        if (user.isActive === user_interface_1.IsActive.BLOCKED ||
            user.isActive === user_interface_1.IsActive.INACTIVE) {
            return done(null, false, { message: `User is ${user.isActive}` });
        }
        if (user.isDeleted) {
            return done(null, false, { message: "User is deleted" });
        }
        // SAFE FALLBACK
        const auths = Array.isArray(user.auths) ? user.auths : [];
        const isGoogleAuthenticated = auths.some((providerObj) => providerObj?.provider === "google");
        if (isGoogleAuthenticated && !user.password) {
            return done(null, false, {
                message: "You logged in with Google. Please set a password first.",
            });
        }
        const isPasswordMatched = await bcryptjs_1.default.compare(password, user.password || "");
        if (!isPasswordMatched) {
            return done(null, false, { message: "Password does not match" });
        }
        return done(null, normalizeUser(user));
    }
    catch (error) {
        console.error("Passport Local Strategy Error:", error);
        return done(error);
    }
}));
//  GOOGLE STRATEGY
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: env_1.envVars.GOOGLE_CLIENT_ID,
    clientSecret: env_1.envVars.GOOGLE_CLIENT_SECRET,
    callbackURL: env_1.envVars.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails?.[0]?.value ?? "";
        if (!email) {
            return done(null, false, { message: "No email found" });
        }
        let user = await user_model_1.UserModel.findOne({ email });
        if (user && !user.isVerified) {
            return done(null, false, { message: "User is not verified" });
        }
        if (user &&
            (user.isActive === user_interface_1.IsActive.BLOCKED ||
                user.isActive === user_interface_1.IsActive.INACTIVE)) {
            return done(null, false, {
                message: `User is ${user.isActive}`,
            });
        }
        if (user && user.isDeleted) {
            return done(null, false, { message: "User is deleted" });
        }
        // Create new user if first-time Google login
        if (!user) {
            user = await user_model_1.UserModel.create({
                email,
                name: profile.displayName,
                picture: profile.photos?.[0]?.value,
                role: auth_interface_1.Role.USER,
                isVerified: true,
                auths: [
                    {
                        provider: "google",
                        providerId: profile.id,
                    },
                ],
            });
        }
        else {
            // Ensure auths includes google
            const auths = user.auths || [];
            if (!auths.some((a) => a.provider === "google")) {
                auths.push({
                    provider: "google",
                    providerId: profile.id,
                });
                user.auths = auths;
                await user.save();
            }
        }
        return done(null, normalizeUser(user));
    }
    catch (error) {
        console.log("Google Strategy Error", error);
        return done(error);
    }
}));
//  SESSIONS
passport_1.default.serializeUser((user, done) => {
    done(null, user._id);
});
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const user = await user_model_1.UserModel.findById(id);
        done(null, normalizeUser(user));
    }
    catch (error) {
        done(error);
    }
});
exports.default = passport_1.default;
//# sourceMappingURL=passport.js.map