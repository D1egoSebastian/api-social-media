const mongoose = require("mongoose");

const connection = async() => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/mi_redsocial');
        console.log("connection success with db: mi_redsocial")
    } catch(e) {
        console.log(e);
        throw new Error("No se pudo conectar al db")
    }
}

module.exports = connection