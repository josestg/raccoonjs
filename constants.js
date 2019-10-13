const FEATURE_TIME_OUT = 30; //second
const CALLBACK_DATA_SEPARATOR = "~";
const FEATURE_PREFIX_SEPARATOR = "@";
const BUTTON_POSITION_SEPARATOR = "#";
const CHECK_ICON = "☑️ ";
const RESPONSE_TYPES = new Set(["$send", "$edit", "$delete", "$answer", "$batch"]);

module.exports = {
    RESPONSE_TYPES,
    FEATURE_PREFIX_SEPARATOR,
    CALLBACK_DATA_SEPARATOR,
    FEATURE_TIME_OUT,
    BUTTON_POSITION_SEPARATOR,
    CHECK_ICON
};
