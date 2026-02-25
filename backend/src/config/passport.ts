import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import User, { type IUser } from "../models/user.model";

type DoneCallback = (error: unknown, user?: IUser | false) => void;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: Profile,
      done: DoneCallback
    ) => {
      try {
        const email = profile.emails?.[0].value;

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
          });
        }

        done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.serializeUser((user: IUser, done: DoneCallback) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done: DoneCallback) => {
  try {
    const user = await User.findById(id);
    done(null, user ?? false);
  } catch (error) {
    done(error);
  }
});

export default passport;
