"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.ErrorResponse = exports.FieldError = void 0;
var graphql_1 = require("@nestjs/graphql");
var FieldError = /** @class */ (function () {
    function FieldError() {
    }
    __decorate([
        (0, graphql_1.Field)()
    ], FieldError.prototype, "field");
    __decorate([
        (0, graphql_1.Field)()
    ], FieldError.prototype, "message");
    FieldError = __decorate([
        (0, graphql_1.ObjectType)()
    ], FieldError);
    return FieldError;
}());
exports.FieldError = FieldError;
var ErrorResponse = /** @class */ (function () {
    function ErrorResponse() {
    }
    __decorate([
        (0, graphql_1.Field)(function () { return [FieldError]; }, { nullable: true })
    ], ErrorResponse.prototype, "errors");
    ErrorResponse = __decorate([
        (0, graphql_1.ObjectType)()
    ], ErrorResponse);
    return ErrorResponse;
}());
exports.ErrorResponse = ErrorResponse;
