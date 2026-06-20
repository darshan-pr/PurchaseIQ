package com.example.notes;

import org.springframework.http.HttpStatus;

public class DatasetUploadException extends RuntimeException {
    private final HttpStatus status;

    public DatasetUploadException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
