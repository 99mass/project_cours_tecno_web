package com.backend.backend.dto;

import com.backend.backend.enums.Type;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReportCreationRequest {
    private String title;
    private String description;
    private Type type;
    private String fileBase64; // Contenu du fichier en base64
    private String fileName; // Nom original du fichier
}