"use strict";
exports.__esModule = true;
var fs = require("fs");
var path = require("path");
var winston_1 = require("winston");
var __1 = require("..");
var align = winston_1.format.align, printf = winston_1.format.printf, timestamp = winston_1.format.timestamp, combine = winston_1.format.combine, colorize = winston_1.format.colorize;
// Create the logs directory if it does not exist
if (!fs.existsSync(__1["default"].logs.LOGS_FOLDER)) {
    fs.mkdirSync(__1["default"].logs.LOGS_FOLDER);
}
/**
 * Production logger format
 */
var combinedLogFormat = combine(timestamp(), printf(function (info) { return "".concat(info.timestamp, " > ").concat(info.message); }));
/**
 * Development logger format
 */
var combinedLogFormatDev = combine(colorize(), align(), timestamp(), printf(function (info) { return "".concat(info.level, ": ").concat(info.message); }));
/**
 * Object for handling the log process
 */
var Logger = (0, winston_1.createLogger)({
    level: 'info',
    format: combinedLogFormat,
    transports: [
        //
        // - Write to all logs with level `info` and below to `app.log`
        // - Write all logs error (and below) to `error.log`.
        //
        new winston_1.transports.File({
            filename: path.join(__1["default"].logs.LOGS_FOLDER, __1["default"].logs.LOGS_ERROR),
            level: 'error'
        }),
        new winston_1.transports.File({
            filename: path.join(__1["default"].logs.LOGS_FOLDER, __1["default"].logs.LOGS_APP)
        }),
    ],
    exceptionHandlers: [
        new winston_1.transports.File({
            filename: path.join(__1["default"].logs.LOGS_FOLDER, __1["default"].logs.LOGS_ERROR)
        }),
    ]
});
//
// If we're not in production then log to the `console
//
if (__1["default"].NODE_ENV !== 'production') {
    Logger.add(new winston_1.transports.Console({
        format: combinedLogFormatDev
    }));
}
exports["default"] = Logger;
