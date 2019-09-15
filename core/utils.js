const {
    CALLBACK_DATA_SEPARATOR: cbsep,
    BUTTON_POSITION_SEPARATOR: btnsep,
    CHECK_ICON
} = require("./constants");

function makeButton(text, callbackData) {
    const { prefix, action, params } = callbackData;
    return {
        text: text,
        callback_data: `${prefix}${cbsep}${action}${cbsep}${params}`
    };
}

function toogleCheckIcon(text) {
    if (text.includes(CHECK_ICON)) return text.split(CHECK_ICON).pop();
    return CHECK_ICON + text;
}

function encodePosition(row, col) {
    return `${row}${btnsep}${col}`;
}

function decodePosition(dataPosition) {
    const position = dataPosition.split(btnsep);
    return {
        row: parseInt(position[0]),
        col: parseInt(position[1])
    };
}

module.exports = {
    makeButton,
    decodePosition,
    encodePosition,
    toogleCheckIcon
};
