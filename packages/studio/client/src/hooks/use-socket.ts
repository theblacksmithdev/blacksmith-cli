import { useEffect, useRef } from 'react'
import { getSocket } from '@/lib/socket'
import { useUiStore } from '@/stores/ui-store'
import type { Socket } from 'socket.io-client'

export function useSocket(): Socket {
  const socket = useRef(getSocket()).current
  const setConnectionStatus = useUiStore((s) => s.setConnectionStatus)

  useEffect(() => {
    socket.on('connect', () => {
      console.log('[socket] Connected')
      setConnectionStatus('connected')
    })
    socket.on('disconnect', () => {
      console.log('[socket] Disconnected')
      setConnectionStatus('disconnected')
    })
    socket.on('connect_error', (err) => {
      console.log('[socket] Connection error:', err.message)
      setConnectionStatus('disconnected')
    })

    if (!socket.connected) {
      socket.connect()
    }

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('connect_error')
    }
  }, [socket, setConnectionStatus])

  return socket
}
