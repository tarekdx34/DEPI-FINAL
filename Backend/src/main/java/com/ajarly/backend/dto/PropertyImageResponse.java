package com.ajarly.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyImageResponse {
    private Long imageId;
    private Long propertyId;
    private String imageUrl;
    private String thumbnailUrl;
    private String mediumUrl;
    private String largeUrl;
    private Integer imageOrder;
    private Boolean isCover;
    private String captionAr;
    private String captionEn;
    private Long fileSize;
    private Integer width;
    private Integer height;
    private LocalDateTime uploadedAt;
}