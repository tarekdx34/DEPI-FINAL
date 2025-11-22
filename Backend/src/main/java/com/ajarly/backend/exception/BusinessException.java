package com.ajarly.backend.exception;

/**
 * Custom exception for business logic violations
 * Used for validation errors and business rule violations
 */
public class BusinessException extends RuntimeException {
    
    public BusinessException(String message) {
        super(message);
    }
    
    public BusinessException(String message, Throwable cause) {
        super(message, cause);
    }
}