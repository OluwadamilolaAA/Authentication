import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import User, { type IUser } from "../models/user.model";
import { env } from "./env";

type DoneCallback = (error: unknown, user?: IUser | false) => void;

if (env.googleClientId && env.googleClientSecret && env.googleCallbackUrl) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.googleClientId,
        clientSecret: env.googleClientSecret,
        callbackURL: env.googleCallbackUrl,
      },
      async (
        _accessToken: string,
        _refreshToken: string,
        profile: Profile,
        done: DoneCallback,
      ) => {
        try {
          const email = profile.emails?.[0].value?.toLowerCase();

          if (!email) {
            return done(new Error("No email found from Google"));
          }

          let user = await User.findOne({ email });

          if (!user) {
            user = await User.create({
              name: profile.displayName,
              email,
              googleId: profile.id,
              provider: "google",
              isVerified: true,
            });
          }

          done(null, user);
        } catch (error) {
          done(error);
        }
      },
    ),
  );
} else {
  console.warn(
    "Google OAuth is disabled. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALLBACK_URL.",
  );
}

passport.serializeUser((user: Express.User, done) => {
  const typedUser = user as IUser;
  done(null, typedUser._id?.toString());
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user ?? false);
  } catch (error) {
    done(error);
  }
});

export default passport;
