import crypto from "crypto";

export const generateId = () => crypto.randomUUID();

console.log("user id:", generateId());