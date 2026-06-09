export type PayrollEmployeeType = 'TEACHER' | 'STAFF';

export type PayrollStatus = 'PENDING' | 'PAID' | 'CANCELLED';

export type PayrollPayment = {
  id: string;
  employeeType: PayrollEmployeeType;
  employeeId?: string;
  employeeName: string;
  amount: number;
  periodLabel: string;
  paymentDate: string;
  status: PayrollStatus;
  notes?: string;
};

export type FinanceOverview = {
  totalRevenue: number;
  totalPayrollPaid: number;
  totalPayrollPending: number;
  netProfit: number;
  teacherPayrollPaid: number;
  staffPayrollPaid: number;
  teacherPayrollPending: number;
  staffPayrollPending: number;
  receiptCount: number;
  payrollPaidCount: number;
  payrollPendingCount: number;
};

export type TeacherOption = {
  id: string;
  name: string;
};

export type FinanceSectionId = 'overview' | 'teachers' | 'staff';
