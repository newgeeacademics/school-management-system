package com.classroom.backend.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PhoneAccountUtilTest {

    @Test
    void phoneNumbersAreRecognised() {
        assertTrue(PhoneAccountUtil.looksLikePhone("0708091011"));
        assertTrue(PhoneAccountUtil.looksLikePhone("07 08 09 10 11"));
        assertTrue(PhoneAccountUtil.looksLikePhone("+225 07-08-09-10-11"));
        assertTrue(PhoneAccountUtil.looksLikePhone("(225) 0708091011"));
    }

    @Test
    void emailsAndLoginIdsWithDigitsAreNotPhones() {
        assertFalse(PhoneAccountUtil.looksLikePhone("aya.kone20102012@gmail.com"));
        assertFalse(PhoneAccountUtil.looksLikePhone("driver.12345678@ecole.ci"));
        assertFalse(PhoneAccountUtil.looksLikePhone("sermem12345678"));
        assertFalse(PhoneAccountUtil.looksLikePhone("koffiy1"));
        assertFalse(PhoneAccountUtil.looksLikePhone("0708"));
    }
}
