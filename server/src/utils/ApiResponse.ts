
export class ApiResponse<T> {
    public success: boolean;
    public message: string;
    public statusCode: number;
    public data?: T | null;

    constructor(statusCode: number, message: string, data?: T | null) {
        this.success = statusCode < 400;
        this.statusCode = statusCode;
        this.message = message;
        this.data = data ?? null;
        // if(data) {
        //     this.data = data;
        // }
    };

    static success<T> (message: string, data?: T | null) {
        return new ApiResponse<T>(200, message, data);
    }

    static created<T> (message: string, data?: T | null) {
        return new ApiResponse<T>(201, message, data);
    }
};