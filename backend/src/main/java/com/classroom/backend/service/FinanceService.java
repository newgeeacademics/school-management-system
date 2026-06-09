package com.classroom.backend.service;

import com.classroom.backend.dto.request.PayrollPaymentRequest;
import com.classroom.backend.dto.response.FinanceOverviewResponse;
import com.classroom.backend.model.PayrollPayment;
import com.classroom.backend.model.enums.PayrollEmployeeType;
import com.classroom.backend.model.enums.PayrollStatus;
import com.classroom.backend.repository.PaymentReceiptRepository;
import com.classroom.backend.repository.PayrollPaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FinanceService {

    private final PayrollPaymentRepository payrollRepository;
    private final PaymentReceiptRepository receiptRepository;

    public FinanceOverviewResponse getOverview() {
        double totalRevenue = receiptRepository.findAll().stream()
                .mapToDouble(r -> r.getAmount() != null ? r.getAmount() : 0.0)
                .sum();

        List<PayrollPayment> allPayroll = payrollRepository.findAll();
        double teacherPaid = sumByTypeAndStatus(allPayroll, PayrollEmployeeType.TEACHER, PayrollStatus.PAID);
        double staffPaid = sumByTypeAndStatus(allPayroll, PayrollEmployeeType.STAFF, PayrollStatus.PAID);
        double teacherPending = sumByTypeAndStatus(allPayroll, PayrollEmployeeType.TEACHER, PayrollStatus.PENDING);
        double staffPending = sumByTypeAndStatus(allPayroll, PayrollEmployeeType.STAFF, PayrollStatus.PENDING);

        double totalPaid = teacherPaid + staffPaid;
        double totalPending = teacherPending + staffPending;

        long paidCount = allPayroll.stream().filter(p -> p.getStatus() == PayrollStatus.PAID).count();
        long pendingCount = allPayroll.stream().filter(p -> p.getStatus() == PayrollStatus.PENDING).count();

        return FinanceOverviewResponse.builder()
                .totalRevenue(totalRevenue)
                .totalPayrollPaid(totalPaid)
                .totalPayrollPending(totalPending)
                .netProfit(totalRevenue - totalPaid)
                .teacherPayrollPaid(teacherPaid)
                .staffPayrollPaid(staffPaid)
                .teacherPayrollPending(teacherPending)
                .staffPayrollPending(staffPending)
                .receiptCount(receiptRepository.count())
                .payrollPaidCount(paidCount)
                .payrollPendingCount(pendingCount)
                .build();
    }

    public List<PayrollPayment> findPayroll(PayrollEmployeeType type) {
        if (type != null) {
            return payrollRepository.findByEmployeeType(type);
        }
        return payrollRepository.findAll();
    }

    public PayrollPayment findPayrollById(String id) {
        return payrollRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payroll payment not found: " + id));
    }

    @Transactional
    public PayrollPayment createPayroll(PayrollPaymentRequest request) {
        PayrollPayment payment = PayrollPayment.builder()
                .employeeType(request.getEmployeeType())
                .employeeId(request.getEmployeeId())
                .employeeName(request.getEmployeeName())
                .amount(request.getAmount())
                .periodLabel(request.getPeriodLabel())
                .paymentDate(request.getPaymentDate())
                .status(request.getStatus() != null ? request.getStatus() : PayrollStatus.PENDING)
                .notes(request.getNotes())
                .build();
        return payrollRepository.save(payment);
    }

    @Transactional
    public PayrollPayment updatePayroll(String id, PayrollPaymentRequest request) {
        PayrollPayment payment = findPayrollById(id);
        payment.setEmployeeType(request.getEmployeeType());
        payment.setEmployeeId(request.getEmployeeId());
        payment.setEmployeeName(request.getEmployeeName());
        payment.setAmount(request.getAmount());
        payment.setPeriodLabel(request.getPeriodLabel());
        payment.setPaymentDate(request.getPaymentDate());
        if (request.getStatus() != null) {
            payment.setStatus(request.getStatus());
        }
        payment.setNotes(request.getNotes());
        return payrollRepository.save(payment);
    }

    @Transactional
    public PayrollPayment markPaid(String id) {
        PayrollPayment payment = findPayrollById(id);
        payment.setStatus(PayrollStatus.PAID);
        return payrollRepository.save(payment);
    }

    @Transactional
    public void deletePayroll(String id) {
        payrollRepository.deleteById(id);
    }

    private double sumByTypeAndStatus(
            List<PayrollPayment> payments,
            PayrollEmployeeType type,
            PayrollStatus status
    ) {
        return payments.stream()
                .filter(p -> p.getEmployeeType() == type && p.getStatus() == status)
                .mapToDouble(p -> p.getAmount() != null ? p.getAmount() : 0.0)
                .sum();
    }
}
