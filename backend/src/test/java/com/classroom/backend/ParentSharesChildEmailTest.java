package com.classroom.backend;

import com.classroom.backend.model.AppUser;
import com.classroom.backend.model.Student;
import com.classroom.backend.model.enums.UserRole;
import com.classroom.backend.repository.AppUserRepository;
import com.classroom.backend.service.PortalAccountService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@Transactional
class ParentSharesChildEmailTest {

    @Autowired private PortalAccountService accounts;
    @Autowired private AppUserRepository users;

    @Test
    void parentTakesTheEmailTheirChildWasRegisteredWith() {
        AppUser kid = accounts.createLinkedAccountForPerson(
                "Awa", "Koné", "Awa Koné", "famille.kone@example.com", null, null, UserRole.STUDENT);
        Student child = Student.builder().name("Awa Koné").appUser(kid).build();

        var result = accounts.findOrCreateParentAccount(
                "Jean", "Koné", "Jean Koné", "famille.kone@example.com", null, null, child);

        assertTrue(result.newlyCreated());
        assertEquals(UserRole.PARENT, result.user().getRole());
        assertEquals("famille.kone@example.com", result.user().getEmail());
        AppUser kidAfter = users.findById(kid.getId()).orElseThrow();
        assertTrue(kidAfter.getEmail().endsWith("@portal.classroom"), kidAfter.getEmail());
        assertEquals(kid.getLoginId(), kidAfter.getLoginId());
    }

    @Test
    void emailOfAnotherPersonIsStillRefused() {
        accounts.createLinkedAccountForPerson("Yao", "Kouassi", "Yao Kouassi", "yao@example.com", null, null, UserRole.STUDENT);
        assertThrows(IllegalArgumentException.class, () -> accounts.findOrCreateParentAccount(
                "Marie", "Kouassi", "Marie Kouassi", "yao@example.com", null, null, null));
    }
}
