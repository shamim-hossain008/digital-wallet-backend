import { NextFunction, Request, Response } from "express";
export declare const AuthController: {
    register: (req: Request, res: Response, next: NextFunction) => void;
    logout: (req: Request, res: Response, next: NextFunction) => void;
    approveAgent: (req: Request, res: Response, next: NextFunction) => void;
    suspendAgent: (req: Request, res: Response, next: NextFunction) => void;
    credentialsLogin: (req: Request, res: Response, next: NextFunction) => void;
    getNewAccessToken: (req: Request, res: Response, next: NextFunction) => void;
    googleCallbackController: (req: Request, res: Response, next: NextFunction) => void;
};
//# sourceMappingURL=auth.controller.d.ts.map