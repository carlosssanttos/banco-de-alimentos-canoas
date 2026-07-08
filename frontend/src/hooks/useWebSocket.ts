import { useState, useEffect, useRef, useCallback } from 'react'
import type { Notificacao } from '@/types'
import { TOKEN_STORAGE_KEY } from '@/services/api'

const MAX_DELAY = 30000

// Eventos internos do protocolo — não são notificações pro usuário.
const EVENTOS_IGNORADOS = new Set(['conectado', 'ping'])

// Traduz os eventos de negócio (emitidos pelos routers via ws_manager) em
// mensagens legíveis. Eventos fora desse mapa caem no fallback genérico.
const EVENTO_INFO: Record<string, { tipo: Notificacao['tipo']; mensagem: (dados: Record<string, unknown>) => string }> = {
  lote_criado: { tipo: 'lote', mensagem: (d) => `Novo lote registrado${d.criado_por ? ` por ${d.criado_por}` : ''}` },
  lote_estragado: { tipo: 'lote', mensagem: (d) => `Lote marcado como estragado${d.registrado_por ? ` por ${d.registrado_por}` : ''}` },
  lote_deletado: { tipo: 'lote', mensagem: () => 'Lote removido do estoque' },
  distribuicao_criada: { tipo: 'distribuicao', mensagem: (d) => `Nova distribuição registrada${d.registrado_por ? ` por ${d.registrado_por}` : ''}` },
  distribuicao_atualizada: { tipo: 'distribuicao', mensagem: (d) => `Distribuição atualizada${d.registrado_por ? ` por ${d.registrado_por}` : ''}` },
  distribuicao_excluida: { tipo: 'distribuicao', mensagem: (d) => `Distribuição excluída${d.registrado_por ? ` por ${d.registrado_por}` : ''}` },
}

function tryParseJson(raw: string): Notificacao | null {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const evento = parsed.evento as string | undefined
    if (evento && EVENTOS_IGNORADOS.has(evento)) return null

    const dados = (parsed.dados as Record<string, unknown>) ?? {}
    const info = evento ? EVENTO_INFO[evento] : undefined

    return {
      id: crypto.randomUUID(),
      tipo: info?.tipo ?? (parsed.tipo as Notificacao['tipo']) ?? 'sistema',
      mensagem: info ? info.mensagem(dados) : (parsed.mensagem as string) || String(raw),
      lida: false,
      criadaEm: new Date().toISOString(),
      dados,
    }
  } catch {
    return {
      id: crypto.randomUUID(),
      tipo: 'sistema',
      mensagem: String(raw),
      lida: false,
      criadaEm: new Date().toISOString(),
    }
  }
}

export function useWebSocket() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const wsRef = useRef<WebSocket | null>(null)
  const delayRef = useRef(1000)
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const unmountedRef = useRef(false)

  const connect = useCallback(() => {
    if (unmountedRef.current) return
    const token = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (!token || token === '__DEMO__') return
    const baseUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws'
    const wsUrl = `${baseUrl}?token=${encodeURIComponent(token)}`
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      delayRef.current = 1000
    }

    ws.onmessage = (event) => {
      const notif = tryParseJson(event.data as string)
      if (notif) {
        setNotificacoes((prev) => [notif, ...prev])
      }
    }

    ws.onclose = () => {
      if (unmountedRef.current) return
      reconnectRef.current = setTimeout(() => {
        delayRef.current = Math.min(delayRef.current * 2, MAX_DELAY)
        connect()
      }, delayRef.current)
    }

    ws.onerror = () => {
      ws.close()
    }
  }, [])

  useEffect(() => {
    connect()
    return () => {
      unmountedRef.current = true
      if (reconnectRef.current) clearTimeout(reconnectRef.current)
      wsRef.current?.close()
    }
  }, [connect])

  const marcarLida = useCallback((id: string) => {
    setNotificacoes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
    )
  }, [])

  const marcarTodasLidas = useCallback(() => {
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })))
  }, [])

  const naoLidas = notificacoes.filter((n) => !n.lida).length

  return { notificacoes, naoLidas, marcarLida, marcarTodasLidas }
}
