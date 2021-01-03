const User=require('./models/user-model');
const transactionCrud = {
    addTransaction: (transaction,googleId) => {
        return new Promise((resolve,reject) => {
            User.findOne({googleId:googleId})
            .then(user => {
                user.transactions.unshift({category:transaction.category,amount:transaction.amount,date:new Date()});
                new User(user).save().then(newTransaction => {
                    resolve({valid:true,msg:''});
                })
            })
        })
    },
    getTransaction: (googleId) => {
        return new Promise((resolve,reject) => {
            User.findOne({googleId:googleId})
            .then(user => {
                resolve({transactions:user.transactions, carryOver: user.carryOver});
            })
        })
    },
    deleteTransaction: (googleId,transactionId) => {
        return new Promise((resolve,reject) => {
            User.updateOne(
                {googleId:googleId},
                {$pull: {'transactions': {_id: transactionId}}}
            )
            .then((user) => {
                resolve()
            });
        })
    },
    showTransactionInfo: (googleId,transactionId) => {
        return new Promise((resolve,reject) => {
            User.findOne(
                {googleId:googleId},
                {transactions: {$elemMatch: {_id:transactionId}}}
            )
            .then(transaction => {
                resolve(transaction.transactions[0]);
            })
        })
    },
    editTransaction: (googleId,transaction,transactionId) => {
        return new Promise((resolve,reject) => {
            User.updateOne(
                {googleId:googleId,'transactions._id': transactionId},
                {$set: {
                    'transactions.$.category': transaction.category,
                    'transactions.$.amount': transaction.amount
                }}
            )
            .then((res) => {
                resolve();
            })
        })
    },
    getTransactionApi: (googleId) => {
        return new Promise((resolve,reject) => {
            User.findOne({googleId:googleId})
            .then(user => {
                resolve(user.transactions);
            })
        })
    },
    addIncome: (income,googleId) => {
        return new Promise((resolve,reject) => {
            User.findOne({googleId:googleId})
            .then(user => {
                user.income.unshift({date:new Date(),salary:income.salary});
                new User(user).save().then(newIncome => {
                    resolve();
                })
            })
        })
    },
    deleteIncome: (googleId,incomeId) => {
        return new Promise((resolve,reject) => {
            User.updateOne(
                {googleId:googleId},
                {$pull: {'income': {_id: incomeId}}}
            )
            .then((user) => {
                resolve()
            });
        })
    },
    getIncome: (googleId) => {
        return new Promise((resolve,reject) => {
            User.findOne({googleId:googleId})
            .then(user => {
                resolve({allIncome:user.income, carryOver: user.carryOver});
            })
        })
    },
    showIncomeInfo: (googleId, incomeId) => {
        return new Promise((resolve,reject) => {
            User.findOne(
                {googleId:googleId},
                {income: {$elemMatch: {_id:incomeId}}}
            )
            .then(income => {
                resolve(income.income[0]);
            })
        })
    },
    editIncome: (googleId, income, incomeId) => {
        return new Promise((resolve,reject) => {
            User.updateOne(
                {googleId:googleId,'income._id':incomeId},
                {$set: {
                    'income.$.salary': income.salary
                }}
            )
            .then((res) => {
                resolve();
            })
        })
    },
    saveProfile: (googleId,carryOver) => {
        return new Promise((resolve,reject) => {
            if(carryOver) {
                User.updateOne(
                    {googleId:googleId},
                    {$set: {"carryOver": true}}
                ).then(() => resolve())
            }
            else {
                User.updateOne(
                    {googleId:googleId},
                    {$set: {"carryOver": false}}
                ).then(() => resolve())
            }
        })
    },
    getIndividualInfo: (googleId,category) => {
        return new Promise((resolve,reject) => {
            User.aggregate([
                {$match:{'googleId': googleId}},
                {$match: {'transactions.category': category}},
                {$project: {
                    transactions: {$filter: {
                        input:'$transactions',
                        as:'transaction',
                        cond:{$eq:['$$transaction.category',category]}
                    }}
                }}
            ]
            )
            .then(transactions => {
                if(!transactions.length) {
                    resolve(0);
                    return;
                }
                let totalAmount=transactions[0].transactions.reduce((total,transaction) => total+transaction.amount,0);
                resolve(totalAmount);
            })
        })
    },
    // getTotalIncome: (googleId) => {
    //     return new Promise((resolve,reject) => {
    //         User.findOne({googleId:googleId})
    //         .then((user) => {
    //             if(!user.carryOver) {
    //                 user.income=user.income.filter(income => income.date.getMonth()===new Date().getMonth() && income.date.getYear()===new Date().getYear())
    //             }
    //             resolve(user.income.reduce((total, income)=> total+income.salary,0));
    //         })
    //     })
    // }
}

module.exports=transactionCrud;