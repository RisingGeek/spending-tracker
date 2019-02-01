const User=require('./models/user-model');
const transactionCrud = {
    addTransaction: (transaction,googleId) => {
        return new Promise((resolve,reject) => {
            User.findOne({googleId:googleId})
            .then(user => {
                user.transactions.unshift({category:transaction.category,amount:transaction.amount,date:new Date()});
                new User(user).save().then(newTransaction => {
                    console.log('transaction saved');
                    resolve();
                })
            })
        })
    },
    getTransaction: (googleId) => {
        return new Promise((resolve,reject) => {
            User.findOne({googleId:googleId})
            .then(user => {
                resolve(user.transactions);
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
                console.log('deleted',user)
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
                console.log(res);
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
                    console.log('income saved');
                    resolve();
                })
            })
        })
    },
    getIncome: (googleId) => {
        return new Promise((resolve,reject) => {
            User.findOne({googleId:googleId})
            .then(user => {
                resolve({allIncome:user.income, carryOver: user.carryOver});
            })
        })
    }
}

module.exports=transactionCrud;