package com.mechtech.MyMechanic.web.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mechtech.MyMechanic.entity.Client;
import com.mechtech.MyMechanic.entity.Vehicle;
import com.mechtech.MyMechanic.repository.ClientRepository;
import com.mechtech.MyMechanic.repository.VehicleRepository;
import com.mechtech.MyMechanic.web.dto.vehicle.VehicleCreateDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito; // Import Mockito
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration; // Import TestConfiguration
import org.springframework.context.annotation.Bean; // Import Bean
import org.springframework.context.annotation.Primary; // Import Primary
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@WithMockUser
class VehicleControllerTest {

    @TestConfiguration
    static class TestConfig {
        @Bean
        @Primary // marca o bean como primário para sobrescrever o bean real
        public JavaMailSender testJavaMailSender() {
            return Mockito.mock(JavaMailSender.class);
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private ClientRepository clientRepository;

    private Client savedClient;


    @BeforeEach
    void setUp() {
        vehicleRepository.deleteAll();
        clientRepository.deleteAll();

        Client client = new Client();
        client.setName("Cliente de Teste");
        client.setCpf("12345678901");
        client.setEmail("cliente.teste@example.com");
        client.setPhone("45999999999");
        client.setTenantId("tenant-test-123");
        savedClient = clientRepository.save(client);
    }

    @Test
    @DisplayName("POST /api/v1/vehicles - Deve criar um veículo com sucesso quando dados são válidos")
    void createVehicle_WithValidData_ReturnsCreatedAndSavesToDb() throws Exception {
        VehicleCreateDto vehicleCreateDto = new VehicleCreateDto();
        vehicleCreateDto.setBrand("Ford");
        vehicleCreateDto.setModel("Fiesta");
        vehicleCreateDto.setYear(2020);
        vehicleCreateDto.setLicensePlate("TST1A23");
        vehicleCreateDto.setColor("Preto");
        vehicleCreateDto.setClientId(savedClient.getId());

        mockMvc.perform(post("/api/v1/vehicles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(vehicleCreateDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.brand").value("Ford"))
                .andExpect(jsonPath("$.model").value("Fiesta"))
                .andExpect(jsonPath("$.licensePlate").value("TST1A23"))
                .andExpect(jsonPath("$.client.id").value(savedClient.getId()));

        List<Vehicle> vehiclesInDb = vehicleRepository.findAll();
        assertThat(vehiclesInDb).hasSize(1);
        Vehicle savedVehicle = vehiclesInDb.get(0);
        assertThat(savedVehicle.getBrand()).isEqualTo("Ford");
        assertThat(savedVehicle.getModel()).isEqualTo("Fiesta");
        assertThat(savedVehicle.getLicensePlate()).isEqualTo("TST1A23");
        assertThat(savedVehicle.getClient().getId()).isEqualTo(savedClient.getId());
        assertThat(savedVehicle.getTenantId()).isNotNull();
    }

    @Test
    @DisplayName("POST /api/v1/vehicles - Deve retornar 404 Not Found quando ID do cliente não existe")
    void createVehicle_WithNonExistentClient_ReturnsNotFound() throws Exception {
        long nonExistentClientId = savedClient.getId() + 999L;

        VehicleCreateDto vehicleCreateDto = new VehicleCreateDto();
        vehicleCreateDto.setBrand("VW");
        vehicleCreateDto.setModel("Gol");
        vehicleCreateDto.setYear(2010);
        vehicleCreateDto.setLicensePlate("XYZ9F87");
        vehicleCreateDto.setColor("Branco");
        vehicleCreateDto.setClientId(nonExistentClientId);

        mockMvc.perform(post("/api/v1/vehicles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(vehicleCreateDto)))
                .andExpect(status().isNotFound());

        assertThat(vehicleRepository.count()).isEqualTo(0);
    }

    @Test
    @DisplayName("POST /api/v1/vehicles - Deve retornar 409 Conflict quando placa já existe")
    void createVehicle_WithDuplicateLicensePlate_ReturnsConflict() throws Exception {
        Vehicle existingVehicle = new Vehicle();
        existingVehicle.setBrand("Fiat");
        existingVehicle.setModel("Uno");
        existingVehicle.setYear(2015);
        existingVehicle.setLicensePlate("DUP1L23"); // Placa que será duplicada
        existingVehicle.setColor("Vermelho");
        existingVehicle.setClient(savedClient);
        existingVehicle.setTenantId(savedClient.getTenantId());
        vehicleRepository.save(existingVehicle);

        VehicleCreateDto duplicateDto = new VehicleCreateDto();
        duplicateDto.setBrand("Ford");
        duplicateDto.setModel("Ka");
        duplicateDto.setYear(2018);
        duplicateDto.setLicensePlate("DUP1L23"); ; // Placa duplicada
        duplicateDto.setColor("Azul");
        duplicateDto.setClientId(savedClient.getId());

        mockMvc.perform(post("/api/v1/vehicles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicateDto)))

                .andExpect(status().isConflict());

    }

    @Test
    @DisplayName("POST /api/v1/vehicles - Deve retornar 422 Unprocessable Entity quando dados obrigatórios estão faltando")
    void createVehicle_WithMissingRequiredData_ReturnsBadRequest() throws Exception {
        VehicleCreateDto invalidDto = new VehicleCreateDto();
        invalidDto.setModel("Fiesta");
        invalidDto.setYear(2020);
        invalidDto.setLicensePlate("INV4L56");
        invalidDto.setColor("Preto");
        invalidDto.setClientId(savedClient.getId());

        mockMvc.perform(post("/api/v1/vehicles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidDto)))
                .andExpect(status().isUnprocessableEntity());

        assertThat(vehicleRepository.count()).isEqualTo(0);
    }

    @Test
    @DisplayName( "GET /api/v1/vehicles/{id} - Deve retornar o veículo pelo ID com sucesso")
    void getVehicleById_WithValidId_ReturnsVehicle() throws Exception {
        Vehicle vehicle = new Vehicle();
        vehicle.setBrand("Chevrolet");
        vehicle.setModel("Onix");
        vehicle.setYear(2021);
        vehicle.setLicensePlate("GET1A23");
        vehicle.setColor("Cinza");
        vehicle.setClient(savedClient);
        vehicle.setTenantId(savedClient.getTenantId());
        Vehicle savedVehicle = vehicleRepository.save(vehicle);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/v1/vehicles/{id}", savedVehicle.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(savedVehicle.getId()))
                .andExpect(jsonPath("$.brand").value("Chevrolet"))
                .andExpect(jsonPath("$.model").value("Onix"))
                .andExpect(jsonPath("$.licensePlate").value("GET1A23"))
                .andExpect(jsonPath("$.client.id").value(savedClient.getId()));
    }

    @Test
    @DisplayName( "GET /api/v1/vehicles/{id} - Deve retornar 404 Not Found quando veículo não existe")
    void getVehicleById_WithNonExistentId_ReturnsNotFound() throws Exception {
        long nonExistentVehicleId = 9999L;
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/api/v1/vehicles/{id}", nonExistentVehicleId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

    }
    
}

