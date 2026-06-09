package com.classroom.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FinanceOverviewResponse {

    private Double totalRevenue;
    private Double totalPayrollPaid;
    private Double totalPayrollPending;
    private Double netProfit;
    private Double teacherPayrollPaid;
    private Double staffPayrollPaid;
    private Double teacherPayrollPending;
    private Double staffPayrollPending;
    private long receiptCount;
    private long payrollPaidCount;
    private long payrollPendingCount;
}
