package com.ecommerce.digitaltricks.repository;

import com.ecommerce.digitaltricks.enums.pedido.StatusPedido;
import com.ecommerce.digitaltricks.costumer.model.Cliente;
import com.ecommerce.digitaltricks.order.model.Pedido;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    Page<Pedido> findByStatus(StatusPedido status, Pageable pageable);

    Optional<Pedido> findByMpPaymentId(String mpPaymentId);

    List<Pedido> findByEmpresaId(Long empresaId);

    boolean existsByEnderecoEntrega_Id(Long enderecoId);

    boolean existsByClienteId(Long id);

    List<Pedido> findByCliente(Cliente cliente);

    List<Pedido> findByClienteId(Long clienteId);

    List<Pedido> findByClienteIdOrderByDataDesc(Long clienteId);

    Page<Pedido> findByEmpresaIdOrderByDataDesc(Long empresaId, Pageable pageable);

    Optional<Pedido> findTopByTelefoneOrderByDataDesc(String telefone);


}