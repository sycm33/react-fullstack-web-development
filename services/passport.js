const passport = require('passport');

// import or require in the strategy that we just installed as well
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const keys = require('../config/keys');

const User = mongoose.model('users');

passport.serializeUser((user, done) => {
    done(null, user.id);
});


//cookie to keep tracking
passport.deserializeUser((id, done) => {
    User.findById(id).then(user => {
            done(null, user);
        });
});

//to take our passport library and to inform it or tell it that it
//it should understand how to make use of the Google strategy inside
//of our application.
passport.use(
    new GoogleStrategy(
        {
        clientID: keys.googleClientID,
        clientSecret: keys.googleClientSecret,
        callbackURL: '/auth/google/callback',
        proxy: true
        },
        async (accessToken, refreshToken, profile, done) => {
             const existingUser = await User.findOne({ googleId: profile.id });

                if (existingUser) {
                    // we already have a record with the given profile ID
                    return done(null, existingUser);
                }
                    // we dont have a user record with this ID, make a new record
                    const user = await new User({ googleId: profile.id }).save();
                    done(null, user);
        }
    )
);
