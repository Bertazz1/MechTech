package com.mechtech.MyMechanic.web.controller;

import com.mechtech.MyMechanic.config.security.IsAdminOrClient;
import com.mechtech.MyMechanic.service.AddressService;
import com.mechtech.MyMechanic.web.dto.cep.CepResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @IsAdminOrClient
    @GetMapping("/cep/{cep}")
    public Mono<ResponseEntity<CepResponseDto>> getAddressByCep(@PathVariable String cep) {
        return addressService.findAddressByCep(cep)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }
}