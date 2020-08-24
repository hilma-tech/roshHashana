export const CONSTS = {
    NO_INTERNET_ACTION: "לא ניתן לבצע פעולה זו כיוון שאינך מחובר לאינטרנט",
    SHOFAR_BLOWING_DURATION_MS: 300000, // 5 min
    NOT_A_VALID_ADDRESS: "NOT_A_VALID_ADDRESS",
    ADDRESS_MSG_ERROR: "הכתובת שהזנת אינה תקינה",
    PICK_FROM_LIST_ADDRESS_MSG_ERROR: 'אנא בחר מיקום מהרשימה הנפתחת',
    NO_SETTINGS_CHANGE_MSG: "הפרטים לא שונו",
    CURRENTLY_BLOCKED_ERR: 'BLOCKED',
    ISRAEL_COORDS: [
        { lat: 32.863532, lng: 35.889902 },
        { lat: 33.458826, lng: 35.881345 },
        { lat: 33.107715, lng: 35.144508 },
        { lat: 31.296718, lng: 34.180102 },
        { lat: 29.486869, lng: 34.881321 },
        { lat: 29.551662, lng: 34.984779 },
    ],
    MAP_OPTIONS: {
        fullscreenControl: false,
        zoomControl: false,
        streetViewControl: false,
        mapTypeControl: false,
        disableDefaultUI: true,
        clickableIcons: false
    },
    JERUSALEM_POSITION: { lat: 31.771959, lng: 35.217018 },
    DATE_TO_BLOCK_ISOLATED: new Date(2020, 8, 20, 23, 59, 0).toLocaleString("en-US", { timeZone: "Asia/Jerusalem" }), // 20/9/2020 23:58
    DATE_TO_BLOCK_BLOWER: new Date(2020, 8, 19, 23, 59, 0).toLocaleString("en-US", { timeZone: "Asia/Jerusalem" }) // 19/9/2020 23:58
}