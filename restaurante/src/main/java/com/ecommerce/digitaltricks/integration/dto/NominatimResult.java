package com.ecommerce.digitaltricks.integration.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record NominatimResult(
        String lat,
        String lon,
        String display_name
) {
}