import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import { toast } from "react-toastify";
import SockJS from "sockjs-client/dist/sockjs";

const RestaurantNotificationContext = createContext(null);

const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));

function resolveWsUrl() {
  const API_URL_RAW = import.meta.env.VITE_API_URL || "";
  const apiBase = API_URL_RAW.replace(/\/api\/?$/, "").replace(/\/$/, "");

  let wsProtocol = "ws:";
  let wsHost = "localhost:8080";

  if (apiBase) {
    if (apiBase.startsWith("https://")) {
      wsProtocol = "wss:";
      wsHost = apiBase.replace("https://", "");
    } else if (apiBase.startsWith("http://")) {
      wsProtocol = "ws:";
      wsHost = apiBase.replace("http://", "");
    }
  } else {
    wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    wsHost = window.location.host;
  }

  return `${wsProtocol}//${wsHost}/ws`;
}

/* Toca o som de notificação */
function playNotificationSound() {
  try {
    const audio = new Audio("/sounds/notification.wav");
    audio.volume = 0.8;
    audio.play().catch((e) => {
      console.warn("Audio não pôde tocar (permissão necessária):", e.message);
    });
  } catch (e) {
    console.error("Erro ao tocar notificação:", e);
  }
}

export function RestaurantNotificationProvider({ children }) {
  const [notificacoes, setNotificacoes] = useState([]);
  const [ultimoPedido, setUltimoPedido] = useState(null);
  const [conectado, setConectado] = useState(false);

  const clientRef = useRef(null);
  const vistosRef = useRef(new Set());

  useEffect(() => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      sessionStorage.getItem("token") ||
      "";

    if (!token) return;

    const wsUrl = resolveWsUrl();
    console.log("[WS] Conectando em:", wsUrl);

    const client = new Client({
      webSocketFactory: () =>
        new SockJS(wsUrl.replace("ws://", "http://").replace("wss://", "https://")),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (msg) => console.log("[STOMP]", msg),
      onConnect: () => {
        setConectado(true);
        console.log("[WS] Conectado!");

        client.subscribe("/topic/pedidos", (message) => {
          try {
            const body = JSON.parse(message.body);
            console.log("[WS] Novo pedido recebido via WS:", body);
            const id = body.notificationId || body.id || `${body.pedidoId}-${body.criadaEm || Date.now()}`;

            if (vistosRef.current.has(id)) return;
            vistosRef.current.add(id);

            const notificacao = {
              ...body,
              notificationId: id,
              lida: false,
              recebidaEm: new Date().toISOString(),
            };

            setUltimoPedido(body);
            setNotificacoes((prev) => [notificacao, ...prev]);

            // Toca o som antes do toast
            playNotificationSound();

            toast.info(
              `Novo pedido #${body.pedidoId} • ${body.nomeCliente || "Cliente"} • ${formatCurrency(body.total)}`,
              { autoClose: 8000 }
            );
          } catch (error) {
            console.error("Erro ao processar notificação:", error);
          }
        });
      },
      onDisconnect: () => {
        setConectado(false);
        console.log("[WS] Desconectado");
      },
      onWebSocketClose: () => {
        setConectado(false);
        console.warn("[WS] WebSocket fechado");
      },
      onStompError: (frame) => {
        setConectado(false);
        console.error("Erro STOMP:", frame);
      },
      onWebSocketError: (error) => {
        setConectado(false);
        console.error("Erro WebSocket:", error);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      setConectado(false);
      client.deactivate();
      clientRef.current = null;
    };
  }, []);

  const marcarTodasComoLidas = () => {
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
  };

  const limparNotificacoes = () => {
    setNotificacoes([]);
  };

  const quantidadeNaoLidas = useMemo(
    () => notificacoes.filter((n) => !n.lida).length,
    [notificacoes]
  );

  const value = useMemo(
    () => ({
      conectado,
      notificacoes,
      ultimoPedido,
      quantidadeNaoLidas,
      marcarTodasComoLidas,
      limparNotificacoes,
    }),
    [conectado, notificacoes, ultimoPedido, quantidadeNaoLidas]
  );

  return (
    <RestaurantNotificationContext.Provider value={value}>
      {children}
    </RestaurantNotificationContext.Provider>
  );
}

export function useRestaurantNotifications() {
  const context = useContext(RestaurantNotificationContext);

  if (!context) {
    throw new Error(
      "useRestaurantNotifications deve ser usado dentro de RestaurantNotificationProvider"
    );
  }

  return context;
}