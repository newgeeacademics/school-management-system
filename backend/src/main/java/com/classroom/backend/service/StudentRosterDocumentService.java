package com.classroom.backend.service;

import com.classroom.backend.model.School;
import com.classroom.backend.model.Student;
import com.classroom.backend.repository.SchoolRepository;
import com.classroom.backend.repository.StudentRepository;
import com.classroom.backend.util.AcademicYearUtil;
import com.classroom.backend.util.PersonNameUtil;
import lombok.RequiredArgsConstructor;
import org.apache.poi.xwpf.usermodel.ParagraphAlignment;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.apache.poi.xwpf.usermodel.XWPFTable;
import org.apache.poi.xwpf.usermodel.XWPFTableRow;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentRosterDocumentService {

    private final StudentRepository studentRepository;
    private final SchoolRepository schoolRepository;
    private final StudentIdCardService studentIdCardService;

    public byte[] exportRosterDocx(String classId) throws IOException {
        List<Student> students = classId != null && !classId.isBlank()
                ? studentRepository.findByClassItemId(classId)
                : studentRepository.findAll();

        School school = schoolRepository.findAll().stream().findFirst().orElse(null);
        String schoolName = school != null ? school.getName() : "Établissement";
        String academicYear = AcademicYearUtil.currentLabel();

        try (XWPFDocument document = new XWPFDocument(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            XWPFParagraph title = document.createParagraph();
            title.setAlignment(ParagraphAlignment.CENTER);
            XWPFRun titleRun = title.createRun();
            titleRun.setBold(true);
            titleRun.setFontSize(16);
            titleRun.setText("Liste des élèves — " + schoolName);

            XWPFParagraph subtitle = document.createParagraph();
            subtitle.setAlignment(ParagraphAlignment.CENTER);
            XWPFRun subRun = subtitle.createRun();
            subRun.setFontSize(11);
            subRun.setText("Année scolaire " + academicYear);

            document.createParagraph();

            String[] headers = {
                    "Prénom", "Nom", "Matricule", "N° carte", "Classe",
                    "Parent", "Tél. parent", "E-mail parent", "Prof. principal"
            };

            XWPFTable table = document.createTable(students.size() + 1, headers.length);
            table.setWidth("100%");

            XWPFTableRow headerRow = table.getRow(0);
            for (int i = 0; i < headers.length; i++) {
                setCellText(headerRow.getCell(i), headers[i], true);
            }

            for (int rowIndex = 0; rowIndex < students.size(); rowIndex++) {
                Student student = students.get(rowIndex);
                StudentIdCardService.RosterRowDetails details = studentIdCardService.rosterDetailsFor(student);

                String first = PersonNameUtil.trim(student.getFirstName());
                String last = PersonNameUtil.trim(student.getLastName());
                if (first.isEmpty() && last.isEmpty() && student.getName() != null) {
                    String[] parts = student.getName().trim().split("\\s+", 2);
                    first = parts.length > 0 ? parts[0] : student.getName();
                    last = parts.length > 1 ? parts[1] : "";
                }

                String className = student.getClassItem() != null ? student.getClassItem().getName() : "";
                String cardNumber = student.getIdCardNumber() != null ? student.getIdCardNumber() : student.getMatricule();

                XWPFTableRow row = table.getRow(rowIndex + 1);
                String[] values = {
                        first,
                        last,
                        nullToEmpty(student.getMatricule()),
                        nullToEmpty(cardNumber),
                        className,
                        details.parentName(),
                        details.parentPhone(),
                        details.parentEmail(),
                        details.homeroomTeacherName()
                };
                for (int col = 0; col < values.length; col++) {
                    setCellText(row.getCell(col), values[col], false);
                }
            }

            document.write(out);
            return out.toByteArray();
        }
    }

    private static void setCellText(org.apache.poi.xwpf.usermodel.XWPFTableCell cell, String text, boolean bold) {
        while (!cell.getParagraphs().isEmpty()) {
            cell.removeParagraph(0);
        }
        XWPFParagraph paragraph = cell.addParagraph();
        XWPFRun run = paragraph.createRun();
        run.setBold(bold);
        run.setFontSize(10);
        run.setText(text != null ? text : "");
    }

    private static String nullToEmpty(String value) {
        return value == null ? "" : value;
    }
}
