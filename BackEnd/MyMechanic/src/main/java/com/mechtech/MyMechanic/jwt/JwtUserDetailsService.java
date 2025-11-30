package com.mechtech.MyMechanic.jwt;


import com.mechtech.MyMechanic.entity.User;
import com.mechtech.MyMechanic.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;


@RequiredArgsConstructor
@Service
public class  JwtUserDetailsService implements UserDetailsService {

    private final UserService userService;
    private final JwtUtils jwtUtils;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
       User user = userService.findByEmail(email);
        return new JwtUserDetails(user);
    }

    public JwtToken getTokenAuthenticated(String email, String tenantId) {
       User.Role role = userService.findRoleByEmail(email);
        return jwtUtils.createToken(email, role.name().substring("ROLE_".length()), tenantId);
    }
}
