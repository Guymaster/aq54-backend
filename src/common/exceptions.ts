export class CustomException extends Error{
    code: string;
    message: string;
    statusCode: number;
    constructor(code: string, statusCode: number, message?: string){
        super();
        this.code = code;
        this.message = message? message : "";
        this.statusCode = statusCode;
    }
    getBody(){
        return {
            code: this.code,
            message: this.message,
        };
    }
}