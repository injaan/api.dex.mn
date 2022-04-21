const mongoose = require('mongoose');
init = async ()=>{
    try {
        await mongoose.connect(process.env.DBURL);
        console.log('Database successfully connected');
        return true; 
    } catch(ex) {
        console.log('db','Database connection error', ex);
        return false;
    }
}

module.exports = init;