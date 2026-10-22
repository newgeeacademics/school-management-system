package com.classroom.backend.repository;

import com.classroom.backend.model.Matiere;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatiereRepository extends JpaRepository<Matiere, String> {
    /** The school's own subjects plus legacy subjects that predate per-school scoping. */
    List<Matiere> findBySchoolIdOrSchoolIdIsNull(String schoolId);
}
