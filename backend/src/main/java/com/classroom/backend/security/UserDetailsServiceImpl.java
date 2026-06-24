package com.classroom.backend.security;

import com.classroom.backend.model.AppUser;
import com.classroom.backend.service.AccountIdentifierService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final AccountIdentifierService accountIdentifierService;

    @Override
    public UserDetails loadUserByUsername(String principal) throws UsernameNotFoundException {
        AppUser appUser = accountIdentifierService.findByPrincipalName(principal)
                .or(() -> accountIdentifierService.findBySignInIdentifier(principal))
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + principal));

        String username = accountIdentifierService.canonicalPrincipalName(appUser);

        return new User(
                username,
                appUser.getPassword(),
                List.of(new SimpleGrantedAuthority("ROLE_" + appUser.getRole().name()))
        );
    }
}
