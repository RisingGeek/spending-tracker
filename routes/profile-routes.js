const router=require('express').Router();
const fs=require('fs');
const transactionCrud=require('../db/transactionCrud');
const categories = require('../db/categories');

const authCheck = (req,res,next)=> {
    if(!req.user) {
        res.redirect('/');
    }
    else {
        next();
    }
}

/*router.get('/',authCheck,(req,res)=> {
    res.render('profile',{user:req.user});
});*/

router.get('/transactions',authCheck,(req,res)=> {
    transactionCrud.getTransaction(req.user.googleId)
    .then(transactions => {
        res.render('transactions',{user:req.user,transactions:transactions,categories:categories});  
    })
})

router.post('/transactions',authCheck,(req,res) => {
    res.redirect('/profile/transactions/add');
})

router.get('/transactions/add',authCheck,(req,res) => {
    res.render('addTransaction',{user:req.user,categories:categories});
})

router.post('/addTransaction',authCheck,(req,res) => {
    console.log(req.body)
    transactionCrud.addTransaction(req.body,req.user.googleId)
    .then(() => {
        res.redirect('/profile/transactions');
    })
})

router.post('/transactions/delete',authCheck,(req,res) => {
    transactionCrud.deleteTransaction(req.user.googleId,req.query.id)
    .then(() => {
        res.redirect('/profile/transactions');
    })
})

module.exports=router;