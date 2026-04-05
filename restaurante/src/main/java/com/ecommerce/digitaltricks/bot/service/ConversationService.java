package com.ecommerce.digitaltricks.service.bot;

import com.ecommerce.digitaltricks.enums.bot.EstadoBot;
import com.ecommerce.digitaltricks.model.Conversa;
import com.ecommerce.digitaltricks.repository.bot.ConversaRepository;
import org.springframework.stereotype.Service;

@Service
public class ConversationService {

    private final ConversaRepository conversaRepository;

    public ConversationService(ConversaRepository conversaRepository) {
        this.conversaRepository = conversaRepository;
    }

    public Conversa findOrCreate(String telefone, Long empresaId) {

        return conversaRepository.findByTelefoneAndEmpresaId(telefone, empresaId)
                .orElseGet(() -> {
                    Conversa c = new Conversa();
                    c.setTelefone(telefone);
                    c.setEmpresaId(empresaId);
                    c.setEstado(EstadoBot.INICIO);
                    return conversaRepository.save(c);
                });
    }

    public Conversa save(Conversa c) {
        return conversaRepository.save(c);
    }
}