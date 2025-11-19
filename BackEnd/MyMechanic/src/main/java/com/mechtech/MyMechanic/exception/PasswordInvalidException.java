package com.mechtech.MyMechanic.exception;

public class PasswordInvalidException extends RuntimeException{

    public PasswordInvalidException(String message) {
        super(message);
    }

}
