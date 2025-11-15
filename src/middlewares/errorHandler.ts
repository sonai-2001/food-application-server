
export const errorHandler=(err: any, req: any, res: any, next: any) => {
   const isOperational = err.isOperational || false;
    const statusCode = err.status || 500;

    const response ={
        status:statusCode,
        message: isOperational ? err.message : 'Internal Server Error'
    }

    return res.status(statusCode).json(response);
    }