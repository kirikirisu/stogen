"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fallbackValue = void 0;
const fallbackValue = (type) => {
    switch (type) {
        case "string":
            return "text";
        case "number":
            return 10;
        case "boolean":
            return false;
        default:
            return undefined;
    }
};
exports.fallbackValue = fallbackValue;
