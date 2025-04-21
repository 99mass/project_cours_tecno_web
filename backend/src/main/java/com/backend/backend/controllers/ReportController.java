package com.backend.backend.controllers;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.backend.backend.dto.ReportCreationRequest;
import com.backend.backend.dto.ReportResponse;
import com.backend.backend.dto.ReportUpdateRequest;
import com.backend.backend.enums.Type;
import com.backend.backend.exceptions.ResourceNotFoundException;
import com.backend.backend.services.ReportService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping
    public ResponseEntity<List<ReportResponse>> getAllReports(
            @RequestParam(required = false) Type type) {
        List<ReportResponse> reports;

        if (type != null) {
            reports = reportService.getReportsByType(type);
        } else {
            reports = reportService.getAllReports();
        }

        return ResponseEntity.ok(reports);
    }

    @GetMapping("/new")
    public ResponseEntity<List<ReportResponse>> getNewReports() {
        return ResponseEntity.ok(reportService.getNewReports());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReportResponse> getReportById(@PathVariable UUID id) {
        return ResponseEntity.ok(reportService.getReportById(id));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadFile(@PathVariable UUID id) {
        ReportResponse report = reportService.getReportById(id);
        try {
            Path filePath = Paths.get(report.getFilePath());
            ByteArrayResource resource = new ByteArrayResource(Files.readAllBytes(filePath));

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filePath.getFileName())
                    .contentType(MediaType.APPLICATION_PDF)
                    .contentLength(Files.size(filePath))
                    .body(resource);
        } catch (IOException e) {
            throw new ResourceNotFoundException("File not found: " + report.getFilePath());
        }
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ReportResponse> createReport(@RequestBody ReportCreationRequest request) {
        return new ResponseEntity<>(reportService.createReport(request), HttpStatus.CREATED);
    }

    @PostMapping("/{id}/send-email")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> sendReportByEmail(@PathVariable UUID id) {
        reportService.sendReportByEmail(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ReportResponse> updateReport(
            @PathVariable UUID id,
            @RequestBody ReportUpdateRequest request) {
        return ResponseEntity.ok(reportService.updateReport(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteReport(@PathVariable UUID id) {
        reportService.deleteReport(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markReportAsRead(@PathVariable UUID id) {
        reportService.markReportAsRead(id);
        return ResponseEntity.ok().build();
    }
}