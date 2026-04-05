# 🍽️ Digital Tricks — Sistema para Restaurantes

Plataforma completa de gestão para restaurantes, com cardápio digital, carrinho de compras, checkout com pagamento via Mercado Pago, painel administrativo Kanban e notificações em tempo real via WebSocket.

---

## 🌟 Funcionalidades

- 🛒 **Cardápio digital** com categorias, variações, opcionais e observações
- 📱 **Carrinho guest** (sem login) com sincronização automática ao logar
- 💳 **Checkout** com Mercado Pago (PIX, Crédito, Boleto)
- 🔔 **Notificações em tempo real** via WebSocket para novos pedidos
- 📋 **Painel Kanban** para gerenciar pedidos (Recebido → Em Preparo → Pronto → Entrega → Entregue)
- 📊 **Dashboard** com métricas e análises
- 👥 **Gestão de clientes, produtos, cupons e equipe**
- 🔐 **Autenticação JWT** para clientes e equipe administrativa

---

## ⚙️ Tecnologias

| Camada     | Tecnologia                        |
|------------|-----------------------------------|
| Backend    | Java 17 / Spring Boot 3           |
| Frontend   | React 18 + Vite + Tailwind CSS    |
| Banco      | PostgreSQL                        |
| Pagamento  | Mercado Pago SDK                  |
| Real-time  | WebSocket (STOMP)                 |
| Notificação| WhatsApp (Twilio API) / Toast     |

---

## 📂 Estrutura

```
Digital Tricks - Restaurantes/
├── restaurante/                    # Spring Boot (backend)
│   └── src/main/java/com/ecommerce/digitaltricks
│       ├── config/                 # CORS, Security, WebSocket
│       ├── admin/                  # Gestão empresa/usuarios (back-office)
│       ├── customer/               # Cliente (auth, perfil, endereços)
│       ├── product/                # Catálogo (produtos, categorias, opcionais)
│       ├── order/                  # Pedidos, pagamentos, cupons, analytics
│       ├── cart/                   # Carrinho (guest + logado)
│       ├── bot/                    # WhatsApp bot
│       ├── integration/            # APIs externas (ViaCEP, Nominatim)
│       ├── shared/                 # Exception, security, validation, util
│       └── bootstrap/              # Seed de dados iniciais
├── frontend/                       # React (Vite + Tailwind)
│   └── src/
│       ├── components/             # Componentes reutilizáveis
│       ├── context/                # Providers (Auth, Carrinho, etc.)
│       ├── hooks/                  # Custom hooks
│       ├── utils/                  # Utilitários (ACL, helpers, services)
│       ├── pages/                  # Páginas (Cardápio, Login, etc.)
│       └── assets/                 # Imagens, sons, estilos
└── docs/                           # Imagens e documentação
```

---

## ▶️ Execução

### Backend

```bash
cd restaurante
mvn clean package
mvn spring-boot:run
```

Configure o `application.yml` com as credenciais do banco de dados e chaves de API.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend abre em `http://localhost:5173`.  
O backend em `http://localhost:8080`.

---

## 🛒 Fluxo do Carrinho

1. **Guest**: usuário adiciona itens ao carrinho sem login (localStorage)
2. **Login**: ao logar, itens do localStorage são sincronizados para o backend automaticamente
3. **Logado**: todo carrinho é gerenciado pelo backend (dados completos)

---

## 📋 Painel Kanban

O painel de pedidos usa drag-and-drop para mover pedidos entre status:

| Coluna        | Status                           |
|---------------|----------------------------------|
| Recebido      | `AGUARDANDO_PAGAMENTO`, `RECEBIDO` |
| Preparo       | `EM_PREPARO`, `PRONTO`            |
| Logística     | `SAIU_PARA_ENTREGA`, `AGUARDANDO_RETIRADA` |
| Finalizados   | `ENTREGUE`, `RETIRADO`, `CANCELADO` |

**Mudança de status:**
- Transições diretas → realizadas sem confirmação
- Pular etapas → abre modal mostrando o caminho intermediário
- O backend registra cada etapa no `PedidoStatusLog`

---

## 🔐 Observações

- ⚠️ Nunca comite o `.env` ou `application.yml` com credenciais reais
- 🔑 O token JWT é armazenado no `localStorage`
- 🔄 O WebSocket conecta automaticamente ao logar no painel admin

---

## 📬 Contato

👨‍💻 **Digital Tricks**  
🌐 [digitaltricks.com.br](https://digitaltricks.com.br)
