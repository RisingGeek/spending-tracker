const router=require('express').Router();
const fs=require('fs');
const transactionCrud=require('../db/transactionCrud');
const categories = require('../db/categories');

const authCheck = (req,res,next)=> {
    if(!req.user) {
        res.redirect('/auth/google');
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
    .then(transactionObject => {
        if(!transactionObject.carryOver) {
            transactionObject.transactions=transactionObject.transactions.filter(transaction => transaction.date.getMonth()===new Date().getMonth() && transaction.date.getYear()===new Date().getYear())
        }
        transactionCrud.getIncome(req.user.googleId)
        .then(object => {
            if(!object.carryOver) {
                object.allIncome=object.allIncome.filter(income => income.date.getMonth()===new Date().getMonth() && income.date.getYear()===new Date().getYear())
            }
            res.render('transactions',{user:req.user,transactions:transactionObject.transactions,categories:categories,allIncome:object.allIncome});  
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
    .then((response) => {
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
    .then(transactionObject => {
        if(!transactionObject.carryOver) {
            transactionObject.transactions=transactionObject.transactions.filter(transaction => transaction.date.getMonth()===new Date().getMonth() && transaction.date.getYear()===new Date().getYear())
        }
        let sumObject={};
        Object.keys(categories).map(category => {
            let smallTransactionArray=transactionObject.transactions.filter(transaction => transaction.category===category);
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
                transactions:transactionObject.transactions,
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

router.post('/allIncome/delete', authCheck, (req,res) => {
    transactionCrud.deleteIncome(req.user.googleId,req.query.id)
    .then(() => {
        res.redirect('/profile/transactions');
    })
})

router.get('/allIncome/edit/:id', authCheck, (req,res) => {
    transactionCrud.showIncomeInfo(req.user.googleId,req.params.id)
    .then((incomeInfo) => {
        res.render('editIncome',{user:req.user, incomeInfo:incomeInfo});
    })
})

router.post('/editIncome', authCheck, (req,res) => {
    transactionCrud.editIncome(req.user.googleId,req.body,req.query.id)
    .then(() => {
        res.redirect('/profile/transactions');
    })
})

router.get('/settings', authCheck, (req,res) => {
    res.render('settings',{user:req.user});
})

router.post('/save', authCheck, (req,res) => {
    transactionCrud.saveProfile(req.user.googleId,req.body.carryOver)
    .then(() => {
        res.redirect('/profile/settings');
    })
})

router.get('/graph',authCheck, (req,res) => {
    res.render('graph', {user:req.user});
})
router.get('/expenseCategoryCount', authCheck, (req,res) => {
    let labels=[];
    let costs=[];
    function loop() {
    const promises=Object.keys(categories).map(async (category,i) => {
        await new Promise((resolve,reject) => {
        transactionCrud.getIndividualInfo(req.user.googleId, category)
        .then((response) => {
            resolve();
            labels.push(category);
            costs.push(response);
            // if(i===Object.keys(categories).length-1) {
            //     res.send({labels: labels, costs: costs});
            // }
        })
    })
    })
    return Promise.all(promises);
}
loop().then(()=>res.send({labels:labels,costs:costs}));
})

// router.get('/totalIncome', (req,res) => {
//     transactionCrud.getTotalIncome('116149357991206037514')
//     .then((response) => {
//         res.send({totalIncome:response});
//     })
// })

module.exports=router;