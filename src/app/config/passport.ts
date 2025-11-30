import bcryptjs from "bcryptjs";
import passport from "passport";
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import { Role } from "../modules/auth/auth.interface";
import { IsActive } from "../modules/user/user.interface";
import { UserModel } from "../modules/user/user.model";
import { envVars } from "./env";

const normalizeUser = (user: any) => ({
  _id: user._id,
  email: user.email,
  role: user.role,
});

//  LOCAL STRATEGY (LOGIN)

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email: string, password: string, done) => {
      try {
        const user = await UserModel.findOne({ email });

        if (!user) {
          return done(null, false, { message: "User does not exist" });
        }

        if (!user.isVerified) {
          return done(null, false, { message: "User is not verified" });
        }

        if (
          user.isActive === IsActive.BLOCKED ||
          user.isActive === IsActive.INACTIVE
        ) {
          return done(null, false, { message: `User is ${user.isActive}` });
        }

        if (user.isDeleted) {
          return done(null, false, { message: "User is deleted" });
        }

        // SAFE FALLBACK

        const auths = Array.isArray(user.auths) ? user.auths : [];

        const isGoogleAuthenticated = auths.some(
          (providerObj) => providerObj?.provider === "google"
        );

        if (isGoogleAuthenticated && !user.password) {
          return done(null, false, {
            message: "You logged in with Google. Please set a password first.",
          });
        }

        const isPasswordMatched = await bcryptjs.compare(
          password,
          user.password || ""
        );

        if (!isPasswordMatched) {
          return done(null, false, { message: "Password does not match" });
        }

        return done(null, normalizeUser(user));
      } catch (error) {
        console.error("Passport Local Strategy Error:", error);
        return done(error);
      }
    }
  )
);

//  GOOGLE STRATEGY

passport.use(
  new GoogleStrategy(
    {
      clientID: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,
      callbackURL: envVars.GOOGLE_CALLBACK_URL,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) => {
      try {
        const email = profile.emails?.[0]?.value ?? "";

        if (!email) {
          return done(null, false, { message: "No email found" });
        }

        let user = await UserModel.findOne({ email });

        if (user && !user.isVerified) {
          return done(null, false, { message: "User is not verified" });
        }

        if (
          user &&
          (user.isActive === IsActive.BLOCKED ||
            user.isActive === IsActive.INACTIVE)
        ) {
          return done(null, false, {
            message: `User is ${user.isActive}`,
          });
        }

        if (user && user.isDeleted) {
          return done(null, false, { message: "User is deleted" });
        }

        // Create new user if first-time Google login
        if (!user) {
          user = await UserModel.create({
            email,
            name: profile.displayName,
            picture: profile.photos?.[0]?.value,
            role: Role.USER,
            isVerified: true,
            auths: [
              {
                provider: "google",
                providerId: profile.id,
              },
            ],
          });
        } else {
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
      } catch (error) {
        console.log("Google Strategy Error", error);
        return done(error);
      }
    }
  )
);

//  SESSIONS

passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await UserModel.findById(id);
    done(null, normalizeUser(user));
  } catch (error) {
    done(error);
  }
});

export default passport;
