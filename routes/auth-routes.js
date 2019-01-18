const router=require('express').Router();
const passport=require('passport');

router.get('/google',passport.authenticate('google',{
    scope:['profile']
}))

router.get('/logout',(req,res)=> {
    //res.send('logging out')
    req.logout();
    res.redirect('/');
})

router.get('/google/redirect',passport.authenticate('google'),(req,res)=> {
    //res.send(req.user)
    res.redirect('/');
})

module.exports=router;