"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
exports.userRouter = (0, express_1.Router)();
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../db");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = require("../middlewares/user");
const helper_1 = require("../Scraping/helper");
const generative_ai_1 = require("@google/generative-ai");
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
exports.userRouter.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        // console.log(username,password);
        const isAlreadySignedUp = yield db_1.userModel.findOne({
            username: username,
        });
        // If username already exists
        if (isAlreadySignedUp) {
            res.status(409).json({
                Message: "Username already used",
            });
            return;
        }
        else {
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            yield db_1.userModel.create({
                username: username,
                password: hashedPassword,
            });
            res.status(200).json({
                Message: "Signed Up successfully",
            });
            return;
        }
    }
    catch (error) {
        console.log(error);
        res.json({
            Error: error,
        });
    }
}));
exports.userRouter.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        const isSignedUp = yield db_1.userModel.findOne({
            username: username,
        });
        // If not Signed Up Yet
        if (!isSignedUp) {
            res.status(400).json({
                Message: "Username not registered yet",
            });
            return;
        }
        const registeredPassword = isSignedUp.password;
        const isPasswordRight = yield bcrypt_1.default.compare(password, registeredPassword);
        if (isPasswordRight) {
            const objectId = isSignedUp._id;
            const JWTToken = jsonwebtoken_1.default.sign({
                objectId: objectId,
            }, process.env.JWT_SECRET);
            res.status(200).send(JWTToken);
        }
        else {
            res.status(401).json({
                Message: "Wrong password",
            });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            Error: error,
        });
    }
}));
exports.userRouter.post("/addMemory", user_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const type = req.body.type;
    const creatorId = req.objectId;
    const currentTime = (0, helper_1.getTime)();
    const currentDate = (0, helper_1.getDate)();
    try {
        if (type == "Note") {
            const { title, description } = req.body;
            const embeddings = yield (0, helper_1.createEmbeddings)({
                title: title,
                description: description,
            });
            const newMemory = yield db_1.memoryModel.create({
                title,
                description,
                creationTime: currentTime,
                creationDate: currentDate,
                embeddings: embeddings,
                creatorId: creatorId,
                type,
            });
            const memoryWithoutEmbeddings = newMemory.toObject();
            delete memoryWithoutEmbeddings.embeddings;
            res.status(200).json({
                NewMemory: memoryWithoutEmbeddings,
            });
        }
        if (type == "Youtube") {
            const link = req.body.link;
            const { title, description, channelName } = yield (0, helper_1.giveYoutubeInfo)(link);
            const embeddings = yield (0, helper_1.createEmbeddings)({
                title,
                description,
                creatorName: channelName,
            });
            const newMemory = yield db_1.memoryModel.create({
                type: "Youtube",
                title,
                creationTime: currentTime,
                creationDate: currentDate,
                embeddings,
                creatorId: creatorId,
                link: link,
            });
            const memoryWithoutEmbeddings = newMemory.toObject();
            delete memoryWithoutEmbeddings.embeddings;
            res.status(200).json({
                NewMemory: memoryWithoutEmbeddings,
            });
        }
        if (type == "Twitter") {
            // console.log("Hello");
            const link = req.body.link;
            const { description, creatorName } = yield (0, helper_1.giveTweetInfo)(link);
            const embeddings = yield (0, helper_1.createEmbeddings)({ description, creatorName });
            const newMemory = yield db_1.memoryModel.create({
                type: "Twitter",
                description,
                creationTime: currentTime,
                creationDate: currentDate,
                embeddings,
                creatorId: creatorId,
                link: link
            });
            const memoryWithoutEmbeddings = newMemory.toObject();
            delete memoryWithoutEmbeddings.embeddings;
            res.status(200).json({
                NewMemory: memoryWithoutEmbeddings,
            });
        }
        if (type == "Website") {
            const link = req.body.link;
            const { title, description, logoUrl } = yield (0, helper_1.giveWebsiteInfo)(link);
            const embeddings = yield (0, helper_1.createEmbeddings)({ title, description });
            const newMemory = yield db_1.memoryModel.create({
                type: "Website",
                title,
                description,
                creationTime: currentTime,
                creationDate: currentDate,
                embeddings,
                creatorId: creatorId,
                link: link,
                logoUrl: logoUrl
            });
            const memoryWithoutEmbeddings = newMemory.toObject();
            delete memoryWithoutEmbeddings.embeddings;
            res.status(200).json({
                NewMemory: memoryWithoutEmbeddings,
            });
        }
    }
    catch (error) {
        res.status(500).json({
            "Message": error,
        });
    }
}));
exports.userRouter.post("/getRelatedMemories", user_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.body.query;
    const creatorId = req.objectId;
    try {
        const allMemories = yield db_1.memoryModel.find({
            creatorId: creatorId,
        });
        //   console.log(allMemories);
        const queryEmbeddings = yield (0, helper_1.createQueryEmbeddings)(query);
        const memoryEmbeddingScore = allMemories.map((memory) => (Object.assign(Object.assign({}, memory.toObject()), { score: (0, helper_1.cosineSimilarity)(memory.embeddings, queryEmbeddings) })));
        memoryEmbeddingScore.sort((a, b) => b.score - a.score);
        // console.log(memoryEmbeddingScore);
        const memoriesToBeSent = memoryEmbeddingScore
            .slice(0, 10)
            .filter((memory) => memory.score > 0.6)
            .map((memory) => {
            const tempMemory = memory;
            delete tempMemory.embeddings;
            delete tempMemory.score;
            // console.log(tempMemory);
            return tempMemory;
        });
        res.json({
            topMemories: memoriesToBeSent
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            Error: error,
        });
    }
}));
exports.userRouter.get("/getAllMemories", user_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const creatorId = req.objectId;
    try {
        const allMemories = yield db_1.memoryModel.find({
            creatorId: creatorId
        });
        // console.log(allMemories);
        const memoriesWithoutEmbeddings = allMemories.map((memory) => {
            const tempMemory = memory.toObject();
            delete tempMemory.embeddings;
            // console.log(tempMemory);
            return tempMemory;
        });
        res.status(200).json({
            "allMemories": memoriesWithoutEmbeddings
        });
    }
    catch (error) {
        res.json({
            "Message": error
        });
    }
}));
exports.userRouter.post("/updateMemory", user_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log("Hello");
    const memoryObjectId = req.body.memoryObjectId;
    const creatorId = req.objectId;
    const currentState = req.body.currentState;
    try {
        const updateInfo = yield db_1.memoryModel.updateOne({
            _id: memoryObjectId,
            creatorId: creatorId
        }, { $set: {
                bookmark: !currentState
            } });
        res.status(200).json({
            "UpdateInfo": updateInfo
        });
    }
    catch (error) {
        console.log(error);
    }
}));
exports.userRouter.post("/deleteMemory", user_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log("Hello");
    const memoryObjectId = req.body.memoryObjectId;
    const creatorId = req.objectId;
    // const currentState=req.body.currentState
    try {
        const deleteInfo = yield db_1.memoryModel.deleteOne({
            _id: memoryObjectId,
            creatorId: creatorId
        });
        res.status(200).json({
            "DeleteInfo": deleteInfo
        });
    }
    catch (error) {
        console.log(error);
    }
}));
exports.userRouter.post("/askGemini", user_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Hello");
    const creatorId = req.objectId;
    const prompt = req.body.prompt;
    console.log(prompt);
    const result = yield model.generateContent(prompt);
    console.log(result.response.text());
    result.response.text();
    res.json({
        "Response": result.response.text()
    });
}));
