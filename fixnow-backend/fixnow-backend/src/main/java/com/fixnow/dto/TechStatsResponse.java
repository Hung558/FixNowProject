package com.fixnow.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TechStatsResponse {
    private Long jobsDone;
    private Double averageRating;
}
