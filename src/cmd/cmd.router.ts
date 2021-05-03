/**
 * Required External Modules and Interfaces
 */

import express, { Request, Response } from "express";
import * as CmdService from "./cmd.service";
/**
 * Router Definition
 */

export const cmdRouter = express.Router();
/**
 * Controller Definitions
 */
cmdRouter.get("/", async (req: Request, res: Response) => {
  try {
    const rs = await CmdService.run();
    res.status(200).send(rs);
  } catch (e) {
    console.log(e);
    res.status(500).send(e.message);
  }
});
