/**
 * Data Model Interfaces
 */

import { Chat } from "./chat.interface";

// Todo:

/**
 * In-Memory Store
 */
let items: Chat[] = [
  {
    id: 1,
    user: "xx12345",
    message: "hello every body",
    createAt: new Date().toISOString(),
  },
];
/**
 * Service Methods
 */

export const getAll = async (): Promise<Chat[]> => Object.values(items);
export const create = async (newItem: Chat): Promise<Chat> => {
  const tmp = {
    ...newItem,
    id: new Date().getTime(),
  };
  items.push(tmp);
  return tmp;
};
