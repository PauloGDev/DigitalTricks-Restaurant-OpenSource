package com.ecommerce.digitaltricks.repository.bot;

import com.ecommerce.digitaltricks.bot.model.Conversa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ConversaRepository extends JpaRepository<Conversa, Long> {
    Optional<Conversa> findByTelefone(String telefone);

    Optional<Conversa> findByTelefoneAndEmpresaId(String telefone, Long empresaId);
}