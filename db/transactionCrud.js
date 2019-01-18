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
    }
}

module.exports=transactionCrud;