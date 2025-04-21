package com.backend.backend.services;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import com.backend.backend.models.Report;
import com.backend.backend.models.User;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender emailSender;
    private final TemplateEngine templateEngine;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    public void sendReportToUsers(Report report, List<User> users) {
        users.forEach(user -> {
            try {
                sendReportEmail(user, report);
                logger.info("Email sent successfully to {}", user.getEmail());
            } catch (Exception e) {
                logger.error("Failed to send email to {}: {}", user.getEmail(), e.getMessage());
            }
        });
    }

    private void sendReportEmail(User user, Report report) throws MessagingException {
        MimeMessage message = emailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        
        helper.setFrom(fromEmail);
        helper.setTo(user.getEmail());
        helper.setSubject(report.getTitle());
        
        // Préparer le contexte pour le template
        Context context = new Context();
        context.setVariable("userName", user.getName());
        context.setVariable("reportTitle", report.getTitle());
        context.setVariable("reportType", report.getType().toString());
        context.setVariable("reportDescription", report.getDescription());
        context.setVariable("reportDate", report.getCreatedAt().toLocalDate());
        
        // Traitement du template HTML
        String emailContent = templateEngine.process("report-email", context);
        helper.setText(emailContent, true);
        
        // Ajouter la pièce jointe (le PDF)
        Path filePath = Paths.get(uploadDir, report.getFilePath());
        FileSystemResource file = new FileSystemResource(new File(filePath.toString()));
        helper.addAttachment(file.getFilename(), file);
        
        emailSender.send(message);
    }
}