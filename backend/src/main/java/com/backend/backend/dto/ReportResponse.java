package com.backend.backend.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.backend.backend.enums.Type;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReportResponse {
    private UUID id;
    private String title;
    private String description;
    private Type type;
    private String filePath;
    private Boolean isNew;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}