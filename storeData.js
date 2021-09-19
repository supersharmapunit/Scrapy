const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

async function storeData(content, path, wbName) {
    await createXLSX(content, path, wbName);
}


function createXLSX(content, path, wbName) {
    // create new workbook
    let wb = xlsx.utils.book_new();
    // create new worksheet && convert JSON to sheet
    let ws = xlsx.utils.json_to_sheet(content);
    // append data -> sheet
    xlsx.utils.book_append_sheet(wb, ws, wbName);
    // write workbook data into file(if already present it'll get replaced)
    xlsx.writeFile(wb, `${path}/${wbName}.xlsx`);
    console.log('XLSX file created')
    return;
}

module.exports = {
    storeData: storeData
}