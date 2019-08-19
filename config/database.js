// config/database.js
module.exports = {

    'url' : `mongodb+srv://${process.env.User_Name}:${process.env.User_Password}@cluster0-ieizd.mongodb.net/${process.env.DB_Name}?retryWrites=true&w=majority`,
    'dbName': process.env.DB_NAME
};
