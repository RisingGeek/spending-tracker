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
        transactions=transactions.filter(transaction => transaction.date.getMonth()===new Date().getMonth() && transaction.date.getYear()===new Date().getYear())
        transactionCrud.getIncome(req.user.googleId)
        .then(object => {
            if(!object.carryOver) {
                object.allIncome=object.allIncome.filter(income => income.date.getMonth()===new Date().getMonth() && income.date.getYear()===new Date().getYear())
            }
            res.render('transactions',{user:req.user,transactions:transactions,categories:categories,allIncome:object.allIncome});  
        })
    })
})

router.post('/transactions',authCheck,(req,res) => {
    res.redirect('/profile/transactions/add');
})

router.get('/transactions/add',authCheck,(req,res) => {
    res.render('addTransaction',{user:req.user,categories:categories});
})

router.post('/addTransaction',authCheck,(req,res) => {
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

router.get('/transactions/edit/:id',authCheck,(req,res) => {
    transactionCrud.showTransactionInfo(req.user.googleId,req.params.id)
    .then((transactionInfo) => {
        res.render('editTransaction',{user:req.user, categories:categories, transactionInfo:transactionInfo});
    })
})

router.post('/editTransaction',authCheck,(req,res) => {
    transactionCrud.editTransaction(req.user.googleId,req.body,req.query.id)
    .then(() => {
        res.redirect('/profile/transactions');
    })
})

router.get('/categories',authCheck,(req,res) => {
    res.render('categories',{user:req.user,categories:categories});
})

router.get('/spending',authCheck,(req,res) => {
    transactionCrud.getTransaction(req.user.googleId)
    .then(transactions => {
        transactions=transactions.filter(transaction => transaction.date.getMonth()===new Date().getMonth() && transaction.date.getYear()===new Date().getYear())
        let sumObject={};
        Object.keys(categories).map(category => {
            let smallTransactionArray=transactions.filter(transaction => transaction.category===category);
            sumObject[category]=smallTransactionArray.reduce((total,transaction) => total+transaction.amount,0);
        })
        let totalAmount=0;
        Object.keys(sumObject).map(category => {
            totalAmount+=sumObject[category];
        })
        transactionCrud.getIncome(req.user.googleId)
        .then(object => {
            if(!object.carryOver) {
                object.allIncome=object.allIncome.filter(income => income.date.getMonth()===new Date().getMonth() && income.date.getYear()===new Date().getYear())
            }
            let totalIncome=object.allIncome.reduce((total, income)=> total+income.salary,0);
            res.render('spending',{
                user:req.user,
                transactions:transactions,
                categories:categories,
                sumObject:sumObject,
                totalAmount:totalAmount,
                totalIncome:totalIncome
            });  
        })
    })
})

router.post('/allIncome', authCheck, (req,res) => {
    res.redirect('/profile/allIncome/add');
})

router.get('/allIncome/add',authCheck,(req,res) => {
    res.render('addIncome',{user:req.user});
})

router.post('/addIncome', authCheck, (req,res) => {
    transactionCrud.addIncome(req.body,req.user.googleId)
    .then(() => {
        res.redirect('/profile/transactions');
    })
})

module.exports=router;