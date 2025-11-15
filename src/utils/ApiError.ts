export class ApiError extends Error {
    status:Number;
    isOperational:Boolean;

    constructor(message:string,status:Number,isOperational:Boolean) {
        super(message);
        this.status=status;
        this.isOperational=isOperational;
        Object.setPrototypeOf(this, new.target.prototype);
    }

}