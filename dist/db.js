"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.memoryModel = exports.userModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const mongoose_2 = require("mongoose");
const userSchema = new mongoose_2.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const memorySchema = new mongoose_2.Schema({
    type: { type: String, enum: ['Youtube', 'Twitter', 'Notion', 'Website', 'Note'], required: true },
    title: { type: String, default: "N/A" },
    description: { type: String, default: "N/A" },
    creationTime: { type: String, required: true },
    creationDate: { type: String, required: true },
    embeddings: { type: [Number], required: true },
    creatorId: { type: mongoose_1.Types.ObjectId, required: true },
    link: { type: String, default: "N/A" },
    logoUrl: { type: String, default: "N/A" },
    bookmark: { type: Boolean, default: false }
});
exports.userModel = mongoose_1.default.model('users', userSchema);
exports.memoryModel = mongoose_1.default.model('memories', memorySchema);
