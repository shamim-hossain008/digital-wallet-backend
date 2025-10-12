export declare const AdminService: {
    getTransactionSummary: () => Promise<Record<string, number>>;
    getCommissionPayouts: (fromData?: string, toDate?: string, status?: string, page?: number, limit?: number) => Promise<{
        total: any;
        page: number;
        limit: number;
        payouts: any[];
    }>;
};
//# sourceMappingURL=admin.service.d.ts.map