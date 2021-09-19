const fs = require('fs');
const path = require('path');
const today = new Date();
const storeDataObj = require('./storeData');


// Stocks -> date -> file
function makeDir(content, wbName) {
    let StockdirPath = path.join(__dirname, 'Stocks');

    if (!fs.existsSync(StockdirPath)) {
        fs.mkdirSync(StockdirPath);
    }

    let dateDirPath = path.join(StockdirPath, today.toDateString().substring(4));
    if (!fs.existsSync(dateDirPath)) {
        fs.mkdirSync(dateDirPath);
    }
    console.log('Directory created');
    storeDataObj.storeData(content, dateDirPath,wbName);
}
module.exports = {
    makeDir: makeDir
}