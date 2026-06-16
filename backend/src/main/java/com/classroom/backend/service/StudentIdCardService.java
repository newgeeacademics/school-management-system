package com.classroom.backend.service;

import com.classroom.backend.dto.response.StudentIdCardResponse;
import com.classroom.backend.model.ClassItem;
import com.classroom.backend.model.ParentContact;
import com.classroom.backend.model.School;
import com.classroom.backend.model.Student;
import com.classroom.backend.model.Teacher;
import com.classroom.backend.repository.ParentContactRepository;
import com.classroom.backend.repository.SchoolRepository;
import com.classroom.backend.repository.StudentRepository;
import com.classroom.backend.util.AcademicYearUtil;
import com.classroom.backend.util.IdCardNumberUtil;
import com.classroom.backend.util.MatriculeGenerator;
import com.classroom.backend.util.PersonNameUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentIdCardService {

    private final StudentRepository studentRepository;
    private final SchoolRepository schoolRepository;
    private final ParentContactRepository parentContactRepository;
    private final PublicAppUrlService publicAppUrlService;

    @Transactional
    public StudentIdCardResponse getIdCard(String studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));

        if (student.getMatricule() == null || student.getMatricule().isBlank()) {
            student.setMatricule(MatriculeGenerator.next(studentRepository, student.getClassItem()));
            student = studentRepository.save(student);
        }

        if (student.getIdCardNumber() == null || student.getIdCardNumber().isBlank()) {
            student.setIdCardNumber(IdCardNumberUtil.resolveStudentCardNumber(
                    null, student.getMatricule(), student.getId()));
            student = studentRepository.save(student);
        }

        ClassItem clazz = student.getClassItem();
        School school = schoolRepository.findAll().stream().findFirst().orElse(null);
        String schoolName = school != null ? school.getName() : "Établissement scolaire";
        String schoolCity = school != null ? PersonNameUtil.trim(school.getCity()) : "";

        String firstName = PersonNameUtil.trim(student.getFirstName());
        String lastName = PersonNameUtil.trim(student.getLastName());
        if (firstName.isEmpty() && lastName.isEmpty() && student.getName() != null) {
            String[] parts = student.getName().trim().split("\\s+", 2);
            firstName = parts.length > 0 ? parts[0] : student.getName();
            lastName = parts.length > 1 ? parts[1] : "";
        }

        String qrPayload = publicAppUrlService.studentCardScanUrl(student.getId());

        return StudentIdCardResponse.builder()
                .studentId(student.getId())
                .matricule(student.getMatricule())
                .idCardNumber(student.getIdCardNumber())
                .firstName(firstName)
                .lastName(lastName)
                .studentName(student.getName())
                .className(clazz != null ? clazz.getName() : null)
                .schoolName(schoolName)
                .schoolCity(schoolCity.isEmpty() ? null : schoolCity)
                .academicYear(AcademicYearUtil.currentLabel())
                .qrPayload(qrPayload)
                .build();
    }

    /** Parent + homeroom teacher details for roster export (not printed on the physical card). */
    public RosterRowDetails rosterDetailsFor(Student student) {
        List<ParentContact> parents = parentContactRepository.findByStudentId(student.getId());
        ParentContact parent = parents.isEmpty() ? null : parents.get(0);

        ClassItem clazz = student.getClassItem();
        Teacher teacher = clazz != null ? clazz.getHomeroomTeacher() : null;

        return new RosterRowDetails(
                parent != null ? parent.getName() : "",
                parent != null ? PersonNameUtil.trim(parent.getPhone()) : "",
                parent != null ? PersonNameUtil.trim(parent.getEmail()) : "",
                teacher != null ? teacher.getName() : ""
        );
    }

    public record RosterRowDetails(
            String parentName,
            String parentPhone,
            String parentEmail,
            String homeroomTeacherName
    ) {
    }
}
