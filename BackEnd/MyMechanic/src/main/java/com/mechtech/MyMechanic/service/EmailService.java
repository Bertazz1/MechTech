package com.mechtech.MyMechanic.service;

import com.mechtech.MyMechanic.entity.User;
import com.mechtech.MyMechanic.exception.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;


    public void sendPasswordResetEmail(User user, String token) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(user.getEmail()); // O e-mail do usuário
            message.setSubject("Recuperação de Senha - My Mechanic");

            // URL base do seu front-end para redefinição de senha
            String urlBase = "http://localhost:8081/reset-password?token=";
            String resetLink = urlBase + token;

            String emailContent = String.format(
                    "Olá %s,\n\n" +
                            "Você solicitou a redefinição de senha para sua conta no My Mechanic.\n" +
                            "Use o seguinte link para redefinir sua senha (válido por 30 minutos):\n\n" +
                            "%s\n\n" +
                            "Se você não solicitou esta alteração, ignore este e-mail.\n\n" +
                            "Atenciosamente,\n" +
                            "Equipe My Mechanic",
                    user.getFullName(), resetLink);

            message.setText(emailContent);

            log.info("Tentando enviar e-mail de recuperação de senha para: {}", user.getEmail());
            mailSender.send(message);
            log.info("E-mail de recuperação de senha enviado com sucesso para: {}", user.getEmail());

        } catch (Exception e) {
            log.error("Erro ao enviar e-mail de recuperação para {}: {}", user.getEmail(), e.getMessage());
            throw new BusinessRuleException("Erro ao enviar e-mail de recuperação de senha. Verifique as configurações de e-mail.");
        }
    }
}