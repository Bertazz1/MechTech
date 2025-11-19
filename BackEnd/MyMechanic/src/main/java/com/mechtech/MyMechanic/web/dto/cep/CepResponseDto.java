package com.mechtech.MyMechanic.web.dto.cep;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CepResponseDto {

    // A resposta da ViaCEP tem nomes de campos diferentes
    @JsonProperty("cep")
    private String code;

    @JsonProperty("uf")
    private String state;

    @JsonProperty("localidade")
    private String city;

    @JsonProperty("bairro")
    private String district;

    @JsonProperty("logradouro")
    private String address;

    // ViaCEP retorna {"erro": true} para CEPs não encontrados
    private boolean erro;
}