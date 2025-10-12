import { NextFunction, Request, Response } from "express";
import { ZodObject, ZodRawShape } from "zod";
export declare const validateRequest: (zodSchema: ZodObject<ZodRawShape>) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=validateRequest.d.ts.map