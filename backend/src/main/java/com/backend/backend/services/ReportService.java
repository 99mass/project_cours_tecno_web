package com.backend.backend.services;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.backend.dto.ReportCreationRequest;
import com.backend.backend.dto.ReportResponse;
import com.backend.backend.dto.ReportUpdateRequest;
import com.backend.backend.enums.Type;
import com.backend.backend.exceptions.ResourceNotFoundException;
import com.backend.backend.models.Report;
import com.backend.backend.models.User;
import com.backend.backend.repositories.ReportRepository;
import com.backend.backend.repositories.UserRepository;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReportService {

    private static final Logger logger = LoggerFactory.getLogger(ReportService.class);

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(Paths.get(uploadDir));
            logger.info("Upload directory created: {}", uploadDir);
        } catch (IOException e) {
            logger.error("Could not create upload directory: {}", e.getMessage());
            throw new RuntimeException("Could not create upload directory!", e);
        }
    }

    @Transactional(readOnly = true)
    public List<ReportResponse> getAllReports() {
        return reportRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToReportResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReportResponse> getReportsByType(Type type) {
        return reportRepository.findByType(type).stream()
                .map(this::mapToReportResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReportResponse> getNewReports() {
        return reportRepository.findByIsNewTrue().stream()
                .map(this::mapToReportResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ReportResponse getReportById(UUID id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with id: " + id));
        return mapToReportResponse(report);
    }

    @Transactional
    public ReportResponse createReport(ReportCreationRequest request) {
        String filePath = saveFile(request.getFileBase64(), request.getFileName());

        Report report = new Report();
        report.setTitle(request.getTitle());
        report.setDescription(request.getDescription());
        report.setType(request.getType());
        report.setFilePath(filePath);
        report.setIsNew(true);

        Report savedReport = reportRepository.save(report);
        return mapToReportResponse(savedReport);
    }

    @Transactional
    public void sendReportByEmail(UUID reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with id: " + reportId));

        List<User> users = userRepository.findAll();

        emailService.sendReportToUsers(report, users);
    }

    @Transactional
    public ReportResponse updateReport(UUID id, ReportUpdateRequest request) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with id: " + id));

        if (request.getTitle() != null) {
            report.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            report.setDescription(request.getDescription());
        }
        if (request.getType() != null) {
            report.setType(request.getType());
        }

        // Si un nouveau fichier est fourni, le sauvegarder et mettre à jour le chemin
        if (request.getFileBase64() != null && !request.getFileBase64().isEmpty()) {
            // Supprimer l'ancien fichier s'il existe
            deleteFileIfExists(report.getFilePath());

            // Enregistrer le nouveau fichier
            String filePath = saveFile(request.getFileBase64(), request.getFileName());
            report.setFilePath(filePath);
        }

        Report updatedReport = reportRepository.save(report);
        return mapToReportResponse(updatedReport);
    }

    @Transactional
    public void deleteReport(UUID id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with id: " + id));

        // Supprimer le fichier associé
        deleteFileIfExists(report.getFilePath());

        reportRepository.deleteById(id);
    }

    @Transactional
    public void markReportAsRead(UUID id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with id: " + id));

        report.setIsNew(false);
        reportRepository.save(report);
    }

    private String saveFile(String base64Content, String originalFileName) {
        try {
            // Extraire l'extension du fichier
            String extension = "";
            int lastDot = originalFileName.lastIndexOf('.');
            if (lastDot > 0) {
                extension = originalFileName.substring(lastDot);
            }

            // Générer un ID unique pour le fichier
            String fileName = UUID.randomUUID().toString() + extension;

            // Créer le chemin complet pour le fichier
            Path filePath = Paths.get(uploadDir, fileName);

            // Décoder le contenu base64 et l'écrire dans le fichier
            byte[] fileContent = Base64.getDecoder().decode(base64Content);
            Files.write(filePath, fileContent);

            logger.info("File saved: {}", filePath);

            return fileName;
        } catch (IOException e) {
            logger.error("Failed to save file: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to save file: " + e.getMessage(), e);
        }
    }

    private void deleteFileIfExists(String fileName) {
        try {
            if (fileName != null && !fileName.isEmpty()) {
                Path filePath = Paths.get(uploadDir, fileName);
                Files.deleteIfExists(filePath);
                logger.info("File deleted: {}", filePath);
            }
        } catch (IOException e) {
            logger.error("Failed to delete file: {}", e.getMessage(), e);
        }
    }

    private ReportResponse mapToReportResponse(Report report) {
        return ReportResponse.builder()
                .id(report.getId())
                .title(report.getTitle())
                .description(report.getDescription())
                .type(report.getType())
                .filePath(report.getFilePath())
                .isNew(report.getIsNew())
                .createdAt(report.getCreatedAt())
                .updatedAt(report.getUpdatedAt())
                .build();
    }
}