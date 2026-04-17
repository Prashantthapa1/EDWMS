export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export class ApiError extends Error {
    public statusCode: number;
    public errors?: any;

    constructor (message: string, statusCode: number, errors?: any) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;

        Error.captureStackTrace(this, this.constructor);
    };
}

export class badRequest extends ApiError {
    constructor(message: string = "Bad Request", errors?: any) {
        super(message, HTTP_STATUS.BAD_REQUEST, errors);
    }
}

export class internalError extends ApiError {
    constructor(message: string = "Internal Server Error") {
        super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
}

export class conflictError extends ApiError {
    constructor(message: string = "Conflict") {
        super(message, HTTP_STATUS.CONFLICT);
    }
}

export class notFound extends ApiError{
    constructor(message: string = "Not Found") {
        super(message, HTTP_STATUS.NOT_FOUND);
    }
}

export class forbidden extends ApiError{
    constructor(message: string = "Forbidden") {
        super(message, HTTP_STATUS.FORBIDDEN);
    }
}

export class unauthorized extends ApiError{
    constructor(message: string = "Unauthorized") {
        super(message, HTTP_STATUS.UNAUTHORIZED);
    }
}