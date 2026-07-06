package com.classroom.backend.service;

import com.classroom.backend.model.FeeInstallment;
import com.classroom.backend.model.enums.UserRole;
import com.classroom.backend.repository.FeeInstallmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PortalFeeService {

    private final PortalScopeResolver portalScopeResolver;
    private final FeeInstallmentRepository feeInstallmentRepository;

    @Transactional(readOnly = true)
    public List<FeeInstallment> feesForCurrentUser(String academicYear) {
        UserRole role = portalScopeResolver.resolveForCurrentUser().role();
        if (role != UserRole.PARENT && role != UserRole.STUDENT) {
            throw new IllegalStateException("L'échéancier est réservé aux parents et élèves.");
        }

        String year = academicYear != null && !academicYear.isBlank()
                ? academicYear.trim()
                : currentAcademicYear();

        List<FeeInstallment> installments =
                feeInstallmentRepository.findByAcademicYearOrderBySortOrderAsc(year);
        if (!installments.isEmpty()) {
            return installments;
        }
        return feeInstallmentRepository.findAll();
    }

    static String currentAcademicYear() {
        LocalDate today = LocalDate.now();
        int year = today.getYear();
        if (today.getMonthValue() >= 9) {
            return year + "-" + (year + 1);
        }
        return (year - 1) + "-" + year;
    }
}
