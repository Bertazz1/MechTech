package com.mechtech.MyMechanic.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SpringDocOpenApiConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .components(new Components().addSecuritySchemes("security", securityScheme()))
                .info(new Info()
                        .title("My Mechanic API")
                        .description("API para gestão de oficinas mecânicas com suporte a Multi-Tenancy e recursos de segurança JWT.")
                        .version("v1"))
                .addSecurityItem(new SecurityRequirement().addList("security"));
    }

    private SecurityScheme securityScheme() {
        return new SecurityScheme()
                .description("Insira um Bearer Token válido (JWT) após o login para prosseguir.")
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .in(SecurityScheme.In.HEADER)
                .name("Authorization");
    }
}