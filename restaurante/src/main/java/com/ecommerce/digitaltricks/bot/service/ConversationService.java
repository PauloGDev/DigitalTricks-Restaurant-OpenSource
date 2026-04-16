package com.ecommerce.digitaltricks.bot.service;

import com.ecommerce.digitaltricks.admin.repository.EmpresaRepository;
import com.ecommerce.digitaltricks.bot.enums.EstadoBot;
import com.ecommerce.digitaltricks.bot.model.Conversa;
import com.ecommerce.digitaltricks.bot.repository.ConversaRepository;
import org.springframework.stereotype.Service;

@Service
public class ConversationService {

    private final ConversaRepository conversaRepository;
    private final EmpresaRepository empresaRepository;

    public ConversationService(ConversaRepository conversaRepository, EmpresaRepository empresaRepository) {
        this.conversaRepository = conversaRepository;
        this.empresaRepository = empresaRepository;
    }

    public Conversa findOrCreate(String telefone, Long empresaId) {

        return conversaRepository.findByTelefoneAndEmpresaId(telefone, empresaId)
                .orElseGet(() -> {
                    Conversa c = new Conversa();
                    c.setTelefone(telefone);
                    c.setEmpresa(empresaRepository.getEmpresaById(empresaId));
                    c.setEstado(EstadoBot.INICIO);
                    return conversaRepository.save(c);
                });
    }

    public Conversa save(Conversa c) {
        return conversaRepository.save(c);
    }
}