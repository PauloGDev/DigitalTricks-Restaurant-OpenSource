package com.ecommerce.digitaltricks.bot.repository;

import com.ecommerce.digitaltricks.bot.model.MensagemProcessada;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MensagemProcessadaRepository extends JpaRepository<MensagemProcessada, String> {

     boolean existsById(String messageId);

}
