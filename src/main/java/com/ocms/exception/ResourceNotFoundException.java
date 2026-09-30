package com.ocms.exception;

// Custom RuntimeException for 404 not-found scenarios
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {

        super(message);
    }
}
