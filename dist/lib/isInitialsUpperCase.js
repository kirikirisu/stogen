"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isInitialsUpperCase = void 0;
const isInitialsUpperCase = (str) => {
    return str[0] === str[0].toUpperCase() ? true : false;
};
exports.isInitialsUpperCase = isInitialsUpperCase;
