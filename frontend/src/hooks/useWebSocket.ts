import { useState, useEffect, useRef, useCallback } from 'react'
import type { Notificacao } from '@/types'

const MAX_DELAY = 30000

function tryParseJson(raw: string): Notificacao | null {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    return {
      id: crypto.randomUUID(),
      tipo: (parsed.tipo as Notificacao['tipo']) || 'sistema',
      mensagem: (parsed.mensagem as string) || String(raw),
      lida: false,
      criadaEm: new Date().toISOString(),
      dados: parsed.dados as Record<string, unknown> | undefined,
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
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws'
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
