const {
    CALLBACK_DATA_SEPARATOR: cbsep,
    BUTTON_POSITION_SEPARATOR: btnsep,
    FEATURE_PREFIX_SEPARATOR : fsep,
    CHECK_ICON
} = require("./constants");

/**
 * Make Inline Button
 * @param {string} text 
 * @param {Object} callbackData 
 */
function makeButton(text, callbackData) {
    const { prefix, action, params } = callbackData;
    return {
        text: text,
        callback_data: `${prefix}${cbsep}${action}${cbsep}${params}`
    };
}

/**
 * Toogle check icon from given text
 * @param {string} text 
 */
function toogleCheckIcon(text) {
    if (text.includes(CHECK_ICON)) return text.split(CHECK_ICON).pop();
    return CHECK_ICON + text;
}

/**
 * Encode keyboard positition to string formated
 * @param {int} row 
 * @param {int} col 
 */
function encodePosition(row, col) {
    return `${row}${btnsep}${col}`;
}

/**
 * Decode params to keyboard postition
 * @param {string} dataPosition 
 */
function decodePosition(dataPosition) {
    const position = dataPosition.split(btnsep);
    return {
        row: parseInt(position[0]),
        col: parseInt(position[1])
    };
}

/**
 * decode callback data
 * @param {string} data 
 */
function decodeCallbackData(data) {
    const [prefix, method, params] = data.split(cbsep);
    const [featureName, owner] = prefix.split(fsep);
    return { prefix, method, params, featureName, owner };
}

module.exports = {
    makeButton,
    decodePosition,
    encodePosition,
    toogleCheckIcon,
    decodeCallbackData
};
