package com.classroom.backend.model;

import com.classroom.backend.model.enums.AccessLevel;
import com.classroom.backend.model.enums.AppModule;
import com.classroom.backend.model.enums.UserRole;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "role_module_access",
        uniqueConstraints = @UniqueConstraint(columnNames = {"role", "module"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleModuleAccess {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AppModule module;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccessLevel accessLevel;
}
