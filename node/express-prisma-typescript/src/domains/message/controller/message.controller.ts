import { Router } from "express";
import { MessageServiceImpl } from "../service/message.service.impl";
import { MessageRepositoryImpl } from "../repository/message.repository.impl";
import { db } from "@utils/database";

export const messageRouter = Router();

const service = new MessageServiceImpl(new MessageRepositoryImpl(db));

messageRouter.get("/:chatId", async (req, res) => {
    const { userId } = res.locals.context;

    const messages = await service.chatHistory(userId, req.params.chatId);

    return res.status(200).json(messages);
});