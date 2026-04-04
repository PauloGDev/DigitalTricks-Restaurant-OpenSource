package com.ecommerce.digitaltricks.repository.bot;

import com.ecommerce.digitaltricks.model.NumeroWhatsapp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface NumeroWhatsappRepository extends JpaRepository<NumeroWhatsapp, Long> {

    Optional<NumeroWhatsapp> findByPhoneNumberId(String phoneNumberId);

    Optional<NumeroWhatsapp> findByEmpresaId(Long empresaId);
}
