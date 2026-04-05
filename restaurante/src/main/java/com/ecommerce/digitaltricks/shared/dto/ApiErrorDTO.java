package com.ecommerce.digitaltricks.shared.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public record ApiErrorDTO(
        int status,
        String error,
        String code,
        String message,
        LocalDateTime timestamp,
        List<String> reasons,
        Map<String, Object> details
) {}