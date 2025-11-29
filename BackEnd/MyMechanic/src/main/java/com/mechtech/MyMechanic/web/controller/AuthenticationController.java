package com.mechtech.MyMechanic.web.controller;


import com.mechtech.MyMechanic.entity.User;
import com.mechtech.MyMechanic.jwt.JwtToken;
import com.mechtech.MyMechanic.jwt.JwtUserDetailsService;
import com.mechtech.MyMechanic.service.UserService;
import com.mechtech.MyMechanic.web.dto.user.UserLoginDto;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1")
public class AuthenticationController {
    private final UserService userService;

    private final JwtUserDetailsService jwtUserDetailsService;
    private final AuthenticationManager authenticationManager;


    @PostMapping("/auth")
    public ResponseEntity<?> authenticate(@RequestBody @Valid UserLoginDto userLoginDto, HttpServletRequest request){
        log.info("Authenticating user: {}", userLoginDto.getEmail());
        User userAux = userService.findByEmailForAuthentication(userLoginDto.getEmail());

        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(userLoginDto.getEmail(), userLoginDto.getPassword());
        authenticationManager.authenticate(authenticationToken); // Se falhar, lança AuthenticationException
        JwtToken jwtToken = jwtUserDetailsService.getTokenAuthenticated(userLoginDto.getEmail(), userAux.getTenantId());
        return ResponseEntity.ok(jwtToken);
      }


}
