package com.mechtech.MyMechanic.util;

import com.mechtech.MyMechanic.exception.BusinessRuleException;

public final class ValidationUtils {

    // Construtor privado para evitar que a classe seja instanciada
    private ValidationUtils() {}


    public static void validateCpf(String cpf) {
        if (cpf == null) {
            throw new BusinessRuleException("CPF não pode ser nulo.");
        }

        String cpfLimpido = cpf.replaceAll("[^0-9]", "");

        if (cpfLimpido.length() != 11 || cpfLimpido.matches("(\\d)\\1{10}")) {
            throw new BusinessRuleException("CPF inválido: " + cpf);
        }

        try {
            //  Cálculo do primeiro dígito verificador
            int soma = 0;
            for (int i = 0; i < 9; i++) {
                soma += Integer.parseInt(String.valueOf(cpfLimpido.charAt(i))) * (10 - i);
            }
            int primeiroDigito = 11 - (soma % 11);
            if (primeiroDigito >= 10) {
                primeiroDigito = 0;
            }
            if (Integer.parseInt(String.valueOf(cpfLimpido.charAt(9))) != primeiroDigito) {
                throw new BusinessRuleException("CPF inválido: " + cpf);
            }

            //  Cálculo do segundo dígito verificador
            soma = 0;
            for (int i = 0; i < 10; i++) {
                soma += Integer.parseInt(String.valueOf(cpfLimpido.charAt(i))) * (11 - i);
            }
            int segundoDigito = 11 - (soma % 11);
            if (segundoDigito >= 10) {
                segundoDigito = 0;
            }
            if (Integer.parseInt(String.valueOf(cpfLimpido.charAt(10))) != segundoDigito) {
                throw new BusinessRuleException("CPF inválido: " + cpf);
            }
        } catch (NumberFormatException e) {
            throw new BusinessRuleException("CPF contém caracteres não numéricos: " + cpf);
        }
    }
}