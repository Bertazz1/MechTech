package com.mechtech.MyMechanic.web.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/hello")
public class HelloController {

    @GetMapping()
    public String hello() {
        return "Olá, mundo!";
    }
}