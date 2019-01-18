const express = require('express');
const authRoutes=require('./routes/auth-routes');
const profileRoutes=require('./routes/profile-routes');
const app = express();
const passportSetup=require('./db/config/passport-setup');
const mongoose = require('mongoose');
const keys=require('./db/config/keys');
const cookieSession=require('cookie-session');
const passport=require('passport');
const path=require('path');
const bodyParser=require('body-parser');

const PORT=process.env.PORT||3001;

app.set('view engine','ejs');
app.use(express.static(path.join(__dirname,'public')));

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.use(cookieSession({
    maxAge:24*60*60*1000,
    keys:[keys.session.cookieKey]
}))

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth',authRoutes);
app.use('/profile',profileRoutes);

app.get('/',(req,res)=> {
    res.render('home',{user:req.user});
})

app.listen(PORT,()=>console.log(`server started on port ${PORT}`));