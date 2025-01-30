"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userMiddleware = userMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function userMiddleware(req, res, next) {
    const jwtToken = req.headers.authorization;
    if (jwtToken) {
        try {
            const isValid = jsonwebtoken_1.default.verify(jwtToken, process.env.JWT_SECRET);
            console.log(isValid);
            if (isValid) {
                req.objectId = isValid.objectId;
                next();
            }
        }
        catch (error) {
            res.json({
                "Message": "JWT Token not verified"
            });
        }
    }
}
