# digital-wallet-backend

## 🎯 Project Overview

This is a secure, modular, and role-based backend API for a digital wallet system — inspired by platforms like Bkash or Nagad. Built with **Express.js**, **TypeScript**, and **MongoDB**, it supports core financial operations such as:

- 🔐 User registration and login with JWT authentication
- 🏦 Wallet creation and management
- 💰 Deposit, withdraw, and transfer money
- 🧑‍💼 Agent-based cash-in and cash-out
- 🧾 Admin analytics and commission tracking
- 🎭 Role-based access control for `admin`, `user`, and `agent`

All transactions are securely stored and traceable, with Zod validation, modular architecture, and centralized error handling.

---

## ⚙️ Setup & Environment Instructions

### 1. Clone the repository

```bash
git clone https://github.com/shamim-hossain008/digital-wallet-backend.git
cd digital-wallet-api

2. Install dependencies

npm install

3. Create .env file
PORT=5000
DATABASE_URL=mongodb://localhost:27017/digital-wallet
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
DEFAULT_BALANCE=50

4. Run the server
npm run dev


## 📦 API Endpoints
🔐 All protected routes require a valid JWT token in the Authorization header as Bearer <token>.


#Base Path
app.use("/api/v1", router);

| Method | Endpoint                           | Role Access | Description                                     |
| ------ | ---------------------------------- | ----------- | ----------------------------------------------- |
| POST   | `/auth/register`                   | Public      | Register a new user or agent                    |
| POST   | `/auth/login`                      | Public      | Login and receive JWT token                     |
| PATCH  | `/auth/approve/:id`                | Admin       | Approve agent account                           |
| PATCH  | `/auth/suspend/:id`                | Admin       | Suspend agent account                           |
| GET    | `/user/all-users`                  | Admin       | Get all users                                   |
| GET    | `/user/me`                         | All Roles   | Get own profile                                 |
| GET    | `/user/id`                         | All Roles   | Get single user by ID                           |
| PATCH  | `/user/id`                         | All Roles   | Update user profile                             |
| DELETE | `/user/id`                         | Admin       | Delete user                                     |
| GET    | `/wallet/me`                       | User, Agent | Get own wallet info                             |
| GET    | `/wallet/all`                      | Admin       | Get all wallets                                 |
| PATCH  | `/wallet/block/:userId`            | Admin       | Block a user's wallet                           |
| PATCH  | `/wallet/unblock/:userId`          | Admin       | Unblock a user's wallet                         |
| POST   | `/transactions/deposit`            | User        | Deposit money to own wallet                     |
| POST   | `/transactions/withdraw`           | User        | Withdraw money from own wallet                  |
| POST   | `/transactions/transfer`           | User        | Send money to another user                      |
| GET    | `/transactions/me`                 | User, Agent | View own transaction history                    |
| GET    | `/transactions/all`                | Admin       | View all transactions                           |
| POST   | `/transactions/cash-in`            | Agent       | Agent adds money to user's wallet               |
| POST   | `/transactions/cash-out`           | Agent       | Agent withdraws money from user's wallet        |
| GET    | `/agent/dashboard`                 | Agent       | View agent dashboard (cash-in/out + commission) |
| GET    | `/admin/summary`                   | Admin       | View transaction summary                        |
| GET    | `/admin/commission-payouts`        | Admin       | View commission payout summary                  |
| GET    | `/admin/commission-payouts/export` | Admin       | Export commission report as CSV                 |



#Testing
Use Postman to test all endpoints. Make sure to include the JWT token
     in the Authorization header for protected routes.
```
