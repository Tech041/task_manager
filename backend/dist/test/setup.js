"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const testUrl = process.env.DATABASE_URL;
if (!testUrl) {
    throw new Error("DATABASE_URL is not set.");
}
