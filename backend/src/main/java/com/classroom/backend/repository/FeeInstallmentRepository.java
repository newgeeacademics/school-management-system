package com.classroom.backend.repository;

import com.classroom.backend.model.FeeInstallment;
import com.classroom.backend.model.enums.FeeCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeeInstallmentRepository extends JpaRepository<FeeInstallment, String> {
    List<FeeInstallment> findByAcademicYearOrderBySortOrderAsc(String academicYear);
    List<FeeInstallment> findByCategoryAndAcademicYearOrderBySortOrderAsc(FeeCategory category, String academicYear);
}
