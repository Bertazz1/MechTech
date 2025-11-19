package com.mechtech.MyMechanic.service;

import com.mechtech.MyMechanic.exception.BusinessRuleException;
import com.mechtech.MyMechanic.web.dto.cep.CepResponseDto;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class AddressService {

    private final WebClient webClient;

    public AddressService() {
        this.webClient = WebClient.create("https://viacep.com.br/ws");
    }

    public Mono<CepResponseDto> findAddressByCep(String cep) {
        return this.webClient
                .get()
                // O formato do endpoint do ViaCEP é /<cep>/json
                .uri("/{cep}/json", cep)
                .retrieve()
                .onStatus(HttpStatusCode::isError, response ->
                        Mono.error(new BusinessRuleException("O serviço de consulta de CEP está indisponível ou retornou um erro."))
                )
                .bodyToMono(CepResponseDto.class)
                .doOnSuccess(response -> {
                    if (response == null || response.isErro()) {
                        throw new BusinessRuleException("CEP não encontrado ou inválido: " + cep);
                    }
                });
    }
}