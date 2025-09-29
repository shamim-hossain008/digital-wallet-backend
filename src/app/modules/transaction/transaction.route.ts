import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../auth/auth.interface";
import { TransactionController } from "./transaction.controller";

const router = Router() 

router.post('/deposit', checkAuth(Role.USER),TransactionController.deposit)
router.post('/withdraw', checkAuth(Role.USER),TransactionController.withdraw)
router.post('/transfer', checkAuth(Role.USER),TransactionController.transfer)
router.get('/me', checkAuth(Role.USER,Role.AGENT), TransactionController.getMyTransactions)


export const TransactionRoutes = router
