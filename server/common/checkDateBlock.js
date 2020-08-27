const CONSTS = require('./consts/consts');

module.exports = function checkDateBlock(blockType) {
    let now = new Date().toLocaleString("en-US", { timeZone: "Asia/Jerusalem" });
    if (Date.parse(CONSTS[blockType]) < Date.parse(now)) {
        //CONSTS.blockType is less than now
        //block
        return true;
    } else {
        //now is less than CONSTS.blockType
        return false;
    }
}