"use strict";

require("./core/globalconfig");
const list = require("./list/index");
const fs = require("fs");


module.exports = () => {
    
    try {
        fs.writeFileSync(process.lauchner.appData + "list.json", JSON.stringify(list(), null, 4));
        return true;
    } catch (error) {
        return false;
    }
    
}