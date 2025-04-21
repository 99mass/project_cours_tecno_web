package com.backend.backend.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.backend.backend.enums.Type;
import com.backend.backend.models.Report;

@Repository
public interface ReportRepository extends JpaRepository<Report, UUID> {
    List<Report> findByType(Type type);
    List<Report> findByIsNewTrue();
    List<Report> findAllByOrderByCreatedAtDesc();
}