package com.ecommerce.digitaltricks.repository.bot;

import com.ecommerce.digitaltricks.model.MensagemProcessada;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MensagemProcessadaRepository extends JpaRepository<MensagemProcessada, String> {

     boolean existsById(String messageId);

}
