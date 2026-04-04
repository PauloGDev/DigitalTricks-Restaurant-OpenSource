package com.ecommerce.digitaltricks.security;

import com.ecommerce.digitaltricks.model.Cliente;
import com.ecommerce.digitaltricks.model.Usuario;
import com.ecommerce.digitaltricks.repository.ClienteRepository;
import com.ecommerce.digitaltricks.repository.UsuarioRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;

    public UserDetailsServiceImpl(UsuarioRepository usuarioRepository, ClienteRepository clienteRepository) {
        this.usuarioRepository = usuarioRepository;
        this.clienteRepository = clienteRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String login) {

        // tenta admin
        Optional<Usuario> usuarioOpt = usuarioRepository.findByUsername(login);

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();

            return new User(
                    usuario.getUsername(),
                    usuario.getPassword(),
                    usuario.getRoles().stream()
                            .map(SimpleGrantedAuthority::new)
                            .collect(Collectors.toList())
            );
        }

        // tenta cliente
        Cliente cliente = clienteRepository.findByTelefone(login)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));

        return new User(
                cliente.getTelefone(),
                cliente.getPassword(),
                List.of(new SimpleGrantedAuthority("ROLE_CLIENTE"))
        );
    }
}
