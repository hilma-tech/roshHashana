const CONSTS = require('./consts/consts');

module.exports = function checkDateBlock() {
    let now = new Date().toLocaleString("en-US", { timeZone: "Asia/Jerusalem" });
    if (Date.parse(CONSTS.DATE_TO_BLOCK) < Date.parse(now)) {
        //CONSTS.DATE_TO_BLOCK is less than now
        //block
        return true;
    } else {
        //now is less than CONSTS.DATE_TO_BLOCK
        return false;
    }
}