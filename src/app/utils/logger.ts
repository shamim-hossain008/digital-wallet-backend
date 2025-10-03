export const logAction = (action: string, userId: string, details?: any) => {
  console.log(
    `[AUDIT] ${new Date().toISOString()} | ${userId} | ${action}`,
    details || ""
  );
};
