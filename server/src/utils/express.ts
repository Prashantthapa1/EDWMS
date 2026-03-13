import type { TokenPayload } from "src/types/auth.types.js";

declare global{
    namespace express {
        interface Request {
            user?: TokenPayload;
        }
    }
}

export {};