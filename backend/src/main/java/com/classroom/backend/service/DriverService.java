package com.classroom.backend.service;

import com.classroom.backend.dto.request.DriverRequest;
import com.classroom.backend.model.AppUser;
import com.classroom.backend.model.Driver;
import com.classroom.backend.model.enums.UserRole;
import com.classroom.backend.repository.DriverRepository;
import com.classroom.backend.util.IdCardNumberUtil;
import com.classroom.backend.util.PersonNameUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DriverService {

    private final DriverRepository driverRepository;
    private final PortalAccountService portalAccountService;

    public List<Driver> findAll() {
        return driverRepository.findAll();
    }

    public Driver findById(String id) {
        return driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Driver not found: " + id));
    }

    @Transactional
    public Driver create(DriverRequest request) {
        String fullName = PersonNameUtil.requireFullName(
                request.getFirstName(), request.getLastName(), request.getName());

        AppUser appUser = portalAccountService.createLinkedAccountForPerson(
                request.getFirstName(), request.getLastName(), fullName,
                request.getEmail(), request.getPhone(),
                request.getPassword(), UserRole.STAFF);

        Driver driver = Driver.builder()
                .name(fullName)
                .firstName(PersonNameUtil.trim(request.getFirstName()))
                .lastName(PersonNameUtil.trim(request.getLastName()))
                .staffId(IdCardNumberUtil.resolveDriverStaffId(request.getStaffId(), null))
                .licenseNumber(trim(request.getLicenseNumber()))
                .email(appUser != null ? appUser.getEmail() : null)
                .phone(trim(request.getPhone()))
                .appUser(appUser)
                .build();

        driver = driverRepository.save(driver);
        if (driver.getStaffId() == null || driver.getStaffId().isBlank()) {
            driver.setStaffId(IdCardNumberUtil.resolveDriverStaffId(null, driver.getId()));
            driver = driverRepository.save(driver);
        }
        return driver;
    }

    @Transactional
    public Driver update(String id, DriverRequest request) {
        Driver driver = findById(id);
        String fullName = PersonNameUtil.requireFullName(
                request.getFirstName(), request.getLastName(), request.getName());

        driver.setName(fullName);
        driver.setFirstName(PersonNameUtil.trim(request.getFirstName()));
        driver.setLastName(PersonNameUtil.trim(request.getLastName()));
        driver.setLicenseNumber(trim(request.getLicenseNumber()));
        driver.setEmail(request.getEmail() != null ? request.getEmail().trim() : null);
        driver.setPhone(trim(request.getPhone()));

        if (request.getStaffId() != null && !request.getStaffId().isBlank()) {
            driver.setStaffId(request.getStaffId().trim());
        } else if (driver.getStaffId() == null || driver.getStaffId().isBlank()) {
            driver.setStaffId(IdCardNumberUtil.resolveDriverStaffId(null, driver.getId()));
        }

        if (driver.getAppUser() != null) {
            portalAccountService.syncLinkedAccount(
                    driver.getAppUser(), fullName, request.getEmail(),
                    request.getPhone(), request.getPassword());
        } else if ((request.getEmail() != null && !request.getEmail().isBlank())
                || (request.getPhone() != null && !request.getPhone().isBlank())) {
            AppUser appUser = portalAccountService.createLinkedAccount(
                    fullName, request.getEmail(), request.getPhone(),
                    request.getPassword(), UserRole.STAFF);
            driver.setAppUser(appUser);
        }

        return driverRepository.save(driver);
    }

    @Transactional
    public void delete(String id) {
        Driver driver = findById(id);
        AppUser linked = driver.getAppUser();
        driverRepository.delete(driver);
        portalAccountService.deleteLinkedAccount(linked);
    }

    private void validatePortalContact(DriverRequest request) {
        boolean hasEmail = request.getEmail() != null && !request.getEmail().isBlank();
        boolean hasPhone = request.getPhone() != null && !request.getPhone().isBlank();
        if (!hasEmail && !hasPhone) {
            throw new IllegalArgumentException("Email or phone is required for tracker login");
        }
    }

    private String trim(String value) {
        if (value == null || value.isBlank()) return null;
        return value.trim();
    }
}
