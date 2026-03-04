import { testConnection } from "./database.config.js"

(async() => {
    await testConnection();
}) ();