module.exports = {
    SHOFAR_BLOWING_DURATION_MS: 300000, // 5 min
    CURRENTLY_BLOCKED_ERR: 'BLOCKED',
    DATE_TO_BLOCK_ISOLATED: new Date(2020, 8, 17, 10, 0, 0).toLocaleString("en-US", { timeZone: "Asia/Jerusalem" }), // 17/9/2020 10:00
    DATE_TO_BLOCK_BLOWER: new Date(2020, 8, 17, 20, 0, 0).toLocaleString("en-US", { timeZone: "Asia/Jerusalem" }) // 17/9/2020 20:00
}