import { apiClient } from "./api-client";

export type AccountType = "ASSET" | "LIABILITY" | "EQUITY" | "INCOME" | "EXPENSE";
export type NormalBalance = "DEBIT" | "CREDIT";

export interface Account {
  _id: string;
  workspaceId: string;
  code: string;
  name: string;
  type: AccountType;
  subtype: string;
  normalBalance: NormalBalance;
  parentAccountId?: { _id: string; code: string; name: string } | null;
  currency: string;
  currentBalance: number;
  allowPosting: boolean;
  isActive: boolean;
  isSystem: boolean;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JournalLine {
  _id?: string;
  accountId: any;
  description: string;
  debit: number;
  credit: number;
  customerId?: any;
  supplierId?: any;
  entityType?: string | null;
  entityId?: string | null;
}

export interface JournalEntry {
  _id: string;
  workspaceId: string;
  entryNumber: string;
  accountingDate: string;
  description: string;
  status: "DRAFT" | "POSTED" | "REVERSED";
  currency: string;
  lines: JournalLine[];
  totalAmount: number;
  sourceType?: string | null;
  sourceId?: string | null;
  sourceEventType?: string | null;
  sourceEventId?: string | null;
  postedAt?: string | null;
  postedBy?: string | null;
  reversalOf?: any;
  reversedBy?: any;
  reversalReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  _id: string;
  workspaceId: string;
  expenseId: string;
  expenseAccountId: any;
  paymentStatus: "PAID" | "UNPAID";
  paidFromAccountId?: any;
  payableAccountId?: any;
  amount: number;
  taxRatePercent: number;
  taxAmount: number;
  grandTotal: number;
  currency: string;
  expenseDate: string;
  dueDate?: string | null;
  description: string;
  vendorName?: string | null;
  receiptUrl?: string | null;
  status: "DRAFT" | "POSTED" | "REVERSED";
  postedAt?: string | null;
  reversalOf?: any;
  reversedBy?: any;
  reversalReason?: string | null;
  journalEntryId?: any;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierBillLine {
  _id?: string;
  classification: "INVENTORY" | "EXPENSE" | "ASSET";
  accountId: any;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRatePercent?: number;
  taxAmount?: number;
  lineTotal: number;
}

export interface SupplierBill {
  _id: string;
  workspaceId: string;
  billId: string;
  supplierId: any;
  supplier?: {
    supplierId: string;
    name: string;
    email?: string | null;
    phone?: string | null;
  };
  purchaseOrderId?: any;
  billNumber: string;
  billDate: string;
  dueDate: string;
  currency: string;
  lines: SupplierBillLine[];
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  paidAmount: number;
  balanceDue: number;
  status: "DRAFT" | "POSTED" | "REVERSED";
  paymentStatus: "UNPAID" | "PARTIAL" | "PAID";
  notes?: string | null;
  journalEntryId?: any;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierPaymentAllocation {
  billId: any;
  amount: number;
}

export interface SupplierPayment {
  _id: string;
  workspaceId: string;
  paymentId: string;
  supplierId: any;
  supplier?: {
    supplierId: string;
    name: string;
  };
  intent: "BILL_SETTLEMENT" | "SUPPLIER_ADVANCE";
  allocations: SupplierPaymentAllocation[];
  amount: number;
  paymentMethod: string;
  paymentAccountId: any;
  currency: string;
  paymentDate: string;
  transactionReference?: string | null;
  notes?: string | null;
  status: "POSTED" | "REVERSED";
  reversalOf?: any;
  reversedBy?: any;
  reversalReason?: string | null;
  journalEntryId?: any;
  createdAt: string;
  updatedAt: string;
}

export interface OtherIncome {
  _id: string;
  workspaceId: string;
  incomeId: string;
  incomeAccountId: any;
  depositAccountId: any;
  amount: number;
  currency: string;
  incomeDate: string;
  description: string;
  reference?: string | null;
  status: "POSTED" | "REVERSED";
  reversalOf?: any;
  reversedBy?: any;
  reversalReason?: string | null;
  journalEntryId?: any;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceSettings {
  _id?: string;
  workspaceId: string;
  activationDate?: string | null;
  lockedUntilDate?: string | null;
  baseCurrency: string;
  defaultAccounts?: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
}

export interface FinanceOverviewKpis {
  receivables: {
    totalOutstanding: number;
    overdueAmount: number;
    openInvoicesCount: number;
  };
  payables: {
    totalOutstanding: number;
    overdueAmount: number;
    openBillsCount: number;
  };
  cashAndBank: {
    totalBalance: number;
    accounts: Array<{ _id: string; code: string; name: string; balance: number }>;
  };
  monthToDate: {
    revenue: number;
    expenses: number;
    netProfit: number;
  };
  isActivated: boolean;
  activationDate?: string | null;
  lockedUntilDate?: string | null;
}

export interface TrialBalanceRow {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  normalBalance: NormalBalance;
  debitTotal: number;
  creditTotal: number;
  netDebit: number;
  netCredit: number;
}

export interface TrialBalanceReport {
  asOfDate: string;
  currency: string;
  isBalanced: boolean;
  totalDebits: number;
  totalCredits: number;
  difference: number;
  rows: TrialBalanceRow[];
}

export interface ProfitAndLossReport {
  startDate: string;
  endDate: string;
  currency: string;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  revenueRows: Array<{ id: string; code: string; name: string; balance: number }>;
  expenseRows: Array<{ id: string; code: string; name: string; balance: number }>;
}

export interface BalanceSheetReport {
  asOfDate: string;
  currency: string;
  isBalanced: boolean;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  retainedEarnings: number;
  totalLiabilitiesAndEquity: number;
  difference: number;
  assetRows: Array<{ id: string; code: string; name: string; balance: number }>;
  liabilityRows: Array<{ id: string; code: string; name: string; balance: number }>;
  equityRows: Array<{ id: string; code: string; name: string; balance: number }>;
}

export interface CashFlowReport {
  startDate: string;
  endDate: string;
  currency: string;
  operatingCashFlow: number;
  investingCashFlow: number;
  financingCashFlow: number;
  netCashFlow: number;
  beginningCash: number;
  endingCash: number;
  operatingItems: Array<{ date: string; entryNumber: string; description: string; amount: number }>;
  investingItems: Array<{ date: string; entryNumber: string; description: string; amount: number }>;
  financingItems: Array<{ date: string; entryNumber: string; description: string; amount: number }>;
}

export interface AgingBucket {
  count: number;
  amount: number;
}

export interface AgingReport {
  asOfDate: string;
  currency: string;
  totalOutstanding: number;
  buckets: {
    current: AgingBucket;
    days1To30: AgingBucket;
    days31To60: AgingBucket;
    days61To90: AgingBucket;
    days90Plus: AgingBucket;
  };
  details: any[];
}

export interface ReconciliationResult {
  asOfDate: string;
  ledgerBalance: number;
  operationalBalance: number;
  difference: number;
  status: "MATCHED" | "MISMATCH";
}

export interface OverviewReconciliation {
  asOfDate: string;
  currency: string;
  receivables: ReconciliationResult;
  payables: ReconciliationResult;
}

export interface TaxConfiguration {
  _id: string;
  workspaceId: string;
  taxCode: string;
  taxType: "CGST" | "SGST" | "IGST" | "CESS";
  rate: number;
  inputAccountId?: { _id: string; code: string; name: string } | string | null;
  outputAccountId?: { _id: string; code: string; name: string } | string | null;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaxConfigurationPayload {
  taxCode: string;
  taxType: "CGST" | "SGST" | "IGST" | "CESS";
  rate: number;
  inputAccountId?: string | null;
  outputAccountId?: string | null;
  description?: string | null;
}

export interface UpdateTaxConfigurationPayload {
  rate?: number;
  inputAccountId?: string | null;
  outputAccountId?: string | null;
  description?: string | null;
}

export const financeApi = {
  // Tax Configurations
  getTaxConfigurations: async (params?: { isActive?: boolean }): Promise<{ success: boolean; data: TaxConfiguration[] }> => {
    const res = await apiClient.get("/finance/taxes", { params });
    return res.data;
  },

  getTaxConfigurationById: async (id: string): Promise<{ success: boolean; data: TaxConfiguration }> => {
    const res = await apiClient.get(`/finance/taxes/${id}`);
    return res.data;
  },

  createTaxConfiguration: async (data: CreateTaxConfigurationPayload): Promise<{ success: boolean; data: TaxConfiguration }> => {
    const res = await apiClient.post("/finance/taxes", data);
    return res.data;
  },

  updateTaxConfiguration: async (id: string, data: UpdateTaxConfigurationPayload): Promise<{ success: boolean; data: TaxConfiguration }> => {
    const res = await apiClient.put(`/finance/taxes/${id}`, data);
    return res.data;
  },

  deactivateTaxConfiguration: async (id: string): Promise<{ success: boolean; data: TaxConfiguration }> => {
    const res = await apiClient.patch(`/finance/taxes/${id}/deactivate`);
    return res.data;
  },

  deleteTaxConfiguration: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.delete(`/finance/taxes/${id}`);
    return res.data;
  },

  // Overview
  getOverview: async (): Promise<{ success: boolean; data: FinanceOverviewKpis }> => {
    const res = await apiClient.get("/finance/overview");
    return res.data;
  },

  // Accounts
  getAccounts: async (params?: Record<string, any>): Promise<{ success: boolean; data: Account[] }> => {
    const res = await apiClient.get("/finance/accounts", { params });
    return res.data;
  },

  getAccountById: async (id: string): Promise<{ success: boolean; data: Account }> => {
    const res = await apiClient.get(`/finance/accounts/${id}`);
    return res.data;
  },

  createAccount: async (data: any): Promise<{ success: boolean; data: Account }> => {
    const res = await apiClient.post("/finance/accounts", data);
    return res.data;
  },

  updateAccount: async (id: string, data: any): Promise<{ success: boolean; data: Account }> => {
    const res = await apiClient.put(`/finance/accounts/${id}`, data);
    return res.data;
  },

  deactivateAccount: async (id: string): Promise<{ success: boolean; data: Account }> => {
    const res = await apiClient.post(`/finance/accounts/${id}/deactivate`);
    return res.data;
  },

  deleteAccount: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.delete(`/finance/accounts/${id}`);
    return res.data;
  },

  provisionDefaults: async (): Promise<{ success: boolean; data: any }> => {
    const res = await apiClient.post("/finance/accounts/defaults/provision");
    return res.data;
  },

  // Journals
  getJournals: async (params?: Record<string, any>): Promise<{ success: boolean; items: JournalEntry[]; total: number }> => {
    const res = await apiClient.get("/finance/journal", { params });
    return res.data;
  },

  getJournalById: async (id: string): Promise<{ success: boolean; data: JournalEntry }> => {
    const res = await apiClient.get(`/finance/journal/${id}`);
    return res.data;
  },

  createJournal: async (data: any): Promise<{ success: boolean; data: JournalEntry }> => {
    const res = await apiClient.post("/finance/journal", data);
    return res.data;
  },

  postDraftJournal: async (id: string): Promise<{ success: boolean; data: JournalEntry }> => {
    const res = await apiClient.post(`/finance/journal/${id}/post`);
    return res.data;
  },

  reverseJournal: async (id: string, data: { reversalReason: string; accountingDate?: string }): Promise<{ success: boolean; data: JournalEntry }> => {
    const res = await apiClient.post(`/finance/journal/${id}/reverse`, data);
    return res.data;
  },

  // Expenses
  getExpenses: async (params?: Record<string, any>): Promise<{ success: boolean; items: Expense[]; total: number }> => {
    const res = await apiClient.get("/finance/expenses", { params });
    return res.data;
  },

  getExpenseById: async (id: string): Promise<{ success: boolean; data: Expense }> => {
    const res = await apiClient.get(`/finance/expenses/${id}`);
    return res.data;
  },

  createExpense: async (data: any): Promise<{ success: boolean; data: Expense }> => {
    const res = await apiClient.post("/finance/expenses", data);
    return res.data;
  },

  payExpense: async (id: string, data: any): Promise<{ success: boolean; data: Expense }> => {
    const res = await apiClient.post(`/finance/expenses/${id}/pay`, data);
    return res.data;
  },

  reverseExpense: async (id: string, reversalReason: string): Promise<{ success: boolean; data: Expense }> => {
    const res = await apiClient.post(`/finance/expenses/${id}/reverse`, { reversalReason });
    return res.data;
  },

  deleteDraftExpense: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.delete(`/finance/expenses/${id}`);
    return res.data;
  },

  // Supplier Bills
  getSupplierBills: async (params?: Record<string, any>): Promise<{ success: boolean; items: SupplierBill[]; total: number }> => {
    const res = await apiClient.get("/finance/bills", { params });
    return res.data;
  },

  getSupplierBillById: async (id: string): Promise<{ success: boolean; data: SupplierBill }> => {
    const res = await apiClient.get(`/finance/bills/${id}`);
    return res.data;
  },

  createSupplierBill: async (data: any): Promise<{ success: boolean; data: SupplierBill }> => {
    const res = await apiClient.post("/finance/bills", data);
    return res.data;
  },

  postDraftSupplierBill: async (id: string): Promise<{ success: boolean; data: SupplierBill }> => {
    const res = await apiClient.post(`/finance/bills/${id}/post`);
    return res.data;
  },

  reverseSupplierBill: async (id: string, reversalReason: string): Promise<{ success: boolean; data: SupplierBill }> => {
    const res = await apiClient.post(`/finance/bills/${id}/reverse`, { reversalReason });
    return res.data;
  },

  deleteDraftSupplierBill: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.delete(`/finance/bills/${id}`);
    return res.data;
  },

  // Supplier Payments
  getSupplierPayments: async (params?: Record<string, any>): Promise<{ success: boolean; items: SupplierPayment[]; total: number }> => {
    const res = await apiClient.get("/finance/supplier-payments", { params });
    return res.data;
  },

  getSupplierPaymentById: async (id: string): Promise<{ success: boolean; data: SupplierPayment }> => {
    const res = await apiClient.get(`/finance/supplier-payments/${id}`);
    return res.data;
  },

  recordSupplierPayment: async (data: any): Promise<{ success: boolean; data: SupplierPayment }> => {
    const res = await apiClient.post("/finance/supplier-payments", data);
    return res.data;
  },

  applySupplierAdvance: async (data: { supplierAdvancePaymentId: string; billId: string; amount: number }): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.post("/finance/supplier-payments/apply-advance", data);
    return res.data;
  },

  reverseSupplierPayment: async (id: string, reversalReason: string): Promise<{ success: boolean; data: SupplierPayment }> => {
    const res = await apiClient.post(`/finance/supplier-payments/${id}/reverse`, { reversalReason });
    return res.data;
  },

  // Other Income
  getOtherIncomes: async (params?: Record<string, any>): Promise<{ success: boolean; items: OtherIncome[]; total: number }> => {
    const res = await apiClient.get("/finance/income", { params });
    return res.data;
  },

  getOtherIncomeById: async (id: string): Promise<{ success: boolean; data: OtherIncome }> => {
    const res = await apiClient.get(`/finance/income/${id}`);
    return res.data;
  },

  createOtherIncome: async (data: any): Promise<{ success: boolean; data: OtherIncome }> => {
    const res = await apiClient.post("/finance/income", data);
    return res.data;
  },

  reverseOtherIncome: async (id: string, reversalReason: string): Promise<{ success: boolean; data: OtherIncome }> => {
    const res = await apiClient.post(`/finance/income/${id}/reverse`, { reversalReason });
    return res.data;
  },

  // Receivables
  getReceivablesInvoices: async (params?: Record<string, any>): Promise<{ success: boolean; items: any[]; total: number }> => {
    const res = await apiClient.get("/finance/receivables/invoices", { params });
    return res.data;
  },

  getReceivablesAging: async (asOfDate?: string): Promise<{ success: boolean; data: AgingReport }> => {
    const res = await apiClient.get("/finance/receivables/aging", { params: { asOfDate } });
    return res.data;
  },

  reconcileReceivables: async (asOfDate?: string): Promise<{ success: boolean; data: ReconciliationResult }> => {
    const res = await apiClient.get("/finance/receivables/reconcile", { params: { asOfDate } });
    return res.data;
  },

  // Payables
  getPayablesAging: async (asOfDate?: string): Promise<{ success: boolean; data: AgingReport }> => {
    const res = await apiClient.get("/finance/payables/aging", { params: { asOfDate } });
    return res.data;
  },

  reconcilePayables: async (asOfDate?: string): Promise<{ success: boolean; data: ReconciliationResult }> => {
    const res = await apiClient.get("/finance/payables/reconcile", { params: { asOfDate } });
    return res.data;
  },

  // Reports
  getTrialBalance: async (params?: Record<string, any>): Promise<{ success: boolean; data: TrialBalanceReport }> => {
    const res = await apiClient.get("/finance/reports/trial-balance", { params });
    return res.data;
  },

  getProfitAndLoss: async (params?: Record<string, any>): Promise<{ success: boolean; data: ProfitAndLossReport }> => {
    const res = await apiClient.get("/finance/reports/profit-loss", { params });
    return res.data;
  },

  getBalanceSheet: async (params?: Record<string, any>): Promise<{ success: boolean; data: BalanceSheetReport }> => {
    const res = await apiClient.get("/finance/reports/balance-sheet", { params });
    return res.data;
  },

  getCashFlow: async (params?: Record<string, any>): Promise<{ success: boolean; data: CashFlowReport }> => {
    const res = await apiClient.get("/finance/reports/cash-flow", { params });
    return res.data;
  },

  getGeneralLedger: async (accountId: string, params?: Record<string, any>): Promise<{ success: boolean; data: any }> => {
    const res = await apiClient.get(`/finance/reports/ledger/${accountId}`, { params });
    return res.data;
  },

  getTaxSummary: async (params?: Record<string, any>): Promise<{ success: boolean; data: any }> => {
    const res = await apiClient.get("/finance/reports/tax-summary", { params });
    return res.data;
  },

  // Reconciliation
  getOverviewReconciliations: async (asOfDate?: string): Promise<{ success: boolean; data: OverviewReconciliation }> => {
    const res = await apiClient.get("/finance/reconciliation/overview", { params: { asOfDate } });
    return res.data;
  },

  reconcileBank: async (data: { bankAccountId: string; statementClosingDate: string; statementClosingBalance: number }): Promise<{ success: boolean; data: any }> => {
    const res = await apiClient.post("/finance/reconciliation/bank", data);
    return res.data;
  },

  // Settings
  getSettings: async (): Promise<{ success: boolean; data: FinanceSettings }> => {
    const res = await apiClient.get("/finance/settings");
    return res.data;
  },

  updateSettings: async (data: any): Promise<{ success: boolean; data: FinanceSettings }> => {
    const res = await apiClient.put("/finance/settings", data);
    return res.data;
  },

  postOpeningBalances: async (data: { activationDate: string; lines: any[] }): Promise<{ success: boolean; data: any }> => {
    const res = await apiClient.post("/finance/settings/opening-balances", data);
    return res.data;
  },
};
