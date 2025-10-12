"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAction = void 0;
const logAction = (action, userId, details) => {
    console.log(`[AUDIT] ${new Date().toISOString()} | ${userId} | ${action}`, details || "");
};
exports.logAction = logAction;
//# sourceMappingURL=logger.js.map