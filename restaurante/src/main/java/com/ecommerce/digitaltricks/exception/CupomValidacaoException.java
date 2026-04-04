package com.ecommerce.digitaltricks.exception;

import java.util.List;
import java.util.Map;

public class CupomValidacaoException extends RuntimeException {

    private final String code;
    private final List<String> reasons;
    private final Map<String, Object> details;

    public CupomValidacaoException(String code, String message) {
        super(message);
        this.code = code;
        this.reasons = List.of(message);
        this.details = Map.of();
    }

    public CupomValidacaoException(String code, String message, List<String> reasons, Map<String, Object> details) {
        super(message);
        this.code = code;
        this.reasons = reasons != null ? reasons : List.of();
        this.details = details != null ? details : Map.of();
    }

    public String getCode() {
        return code;
    }

    public List<String> getReasons() {
        return reasons;
    }

    public Map<String, Object> getDetails() {
        return details;
    }
}