package com.classroom.backend.service;

import com.classroom.backend.dto.request.FeeInstallmentRequest;
import com.classroom.backend.model.FeeInstallment;
import com.classroom.backend.model.enums.FeeCategory;
import com.classroom.backend.repository.FeeInstallmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FeeInstallmentService {

    private final FeeInstallmentRepository feeInstallmentRepository;

    public List<FeeInstallment> findAll() {
        return feeInstallmentRepository.findAll();
    }

    public List<FeeInstallment> findByYear(String academicYear) {
        return feeInstallmentRepository.findByAcademicYearOrderBySortOrderAsc(academicYear);
    }

    public List<FeeInstallment> findByCategoryAndYear(FeeCategory category, String academicYear) {
        return feeInstallmentRepository.findByCategoryAndAcademicYearOrderBySortOrderAsc(category, academicYear);
    }

    @Transactional
    public FeeInstallment create(FeeInstallmentRequest request) {
        FeeInstallment installment = FeeInstallment.builder()
                .category(request.getCategory())
                .academicYear(request.getAcademicYear().trim())
                .label(request.getLabel().trim())
                .amount(request.getAmount())
                .periodStart(request.getPeriodStart())
                .periodEnd(request.getPeriodEnd())
                .description(request.getDescription())
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : nextSortOrder(request))
                .build();
        return feeInstallmentRepository.save(installment);
    }

    @Transactional
    public FeeInstallment update(String id, FeeInstallmentRequest request) {
        FeeInstallment installment = feeInstallmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fee installment not found: " + id));
        installment.setCategory(request.getCategory());
        installment.setAcademicYear(request.getAcademicYear().trim());
        installment.setLabel(request.getLabel().trim());
        installment.setAmount(request.getAmount());
        installment.setPeriodStart(request.getPeriodStart());
        installment.setPeriodEnd(request.getPeriodEnd());
        installment.setDescription(request.getDescription());
        if (request.getSortOrder() != null) {
            installment.setSortOrder(request.getSortOrder());
        }
        return feeInstallmentRepository.save(installment);
    }

    @Transactional
    public void delete(String id) {
        feeInstallmentRepository.deleteById(id);
    }

    private int nextSortOrder(FeeInstallmentRequest request) {
        return feeInstallmentRepository
                .findByCategoryAndAcademicYearOrderBySortOrderAsc(request.getCategory(), request.getAcademicYear())
                .size() + 1;
    }
}
