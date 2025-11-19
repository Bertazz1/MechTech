package com.mechtech.MyMechanic.exception;

public class PdfGenerationException extends RuntimeException {
    public PdfGenerationException(Exception message) {
        super(message);
    }
}
