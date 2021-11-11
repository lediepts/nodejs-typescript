/**
 * Required External Modules and Interfaces
 */

import express, { Request, Response } from "express";
import * as ChatService from "./chat.service";
import { Chat } from "./chat.interface";
/**
 * Router Definition
 */

export const chatRouter = express.Router();
/**
 * Controller Definitions
 */

// GET items

chatRouter.get("/", async (req: Request, res: Response) => {
  try {
    const items: Chat[] = await ChatService.getAll();
    res.status(200).send(items);
  } catch (e) {
    res.status(500).send((e as any).message);
  }
});

// POST items

chatRouter.post("/", async (req: Request, res: Response) => {
  try {
    const item: Chat = req.body;
    const newItem = await ChatService.create(item);
    res.status(201).json(newItem);
  } catch (e) {
    res.status(500).send((e as any).message);
  }
});
