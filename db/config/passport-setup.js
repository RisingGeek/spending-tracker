const passport=require('passport');
const GoogleStrategy=require('passport-google-oauth20');
const User=require('../models/user-model');

passport.serializeUser((user,done)=> {
    done(null,user.id)
})

passport.deserializeUser((id,done)=> {
    User.findById(id).then((user)=> {
        done(null,user);
    })
})

passport.use(new GoogleStrategy({
    callbackURL:'/auth/google/redirect',
    clientID:process.env.CLIENT_ID,
    clientSecret:process.env.CLIENT_SECRET
},(accessToken,refreshToken,profile,done)=> {
    //passport callback function
    console.log("passport callback")
    User.findOne({googleId:profile.id})
    .then((currentUser)=> {
        if(currentUser) {
            console.log('current user',currentUser);
            done(null,currentUser);
        }
        else {
            new User({
                username:profile.displayName,
                googleId:profile.id,
                photo:profile.photos[0].value,
                transactions:[]
            }).save().then((newUser)=> {
                console.log('profile saved',newUser);
                done(null,newUser);
            })
        }
    })
})
)