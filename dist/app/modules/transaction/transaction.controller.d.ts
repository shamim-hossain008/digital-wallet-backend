import { Request, Response } from "express";
export declare const TransactionController: {
    deposit: (req: Request, res: Response, next: import("express").NextFunction) => void;
    withdraw: (req: Request, res: Response, next: import("express").NextFunction) => void;
    transfer: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getMyTransactions: (req: Request, res: Response, next: import("express").NextFunction) => void;
    cashIn: (req: Request, res: Response, next: import("express").NextFunction) => void;
    cashOut: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getAllTransactions: (req: Request, res: Response, next: import("express").NextFunction) => void;
};
//# sourceMappingURL=transaction.controller.d.ts.map