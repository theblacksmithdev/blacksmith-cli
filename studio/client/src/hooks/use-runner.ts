import { useEffect, useCallback } from 'react'
import { useSocket } from './use-socket'
import { useRunnerStore } from '@/stores/runner-store'

export function useRunner() {
  const socket = useSocket()
  const store = useRunnerStore

  useEffect(() => {
    const onStatus = (data: any) => {
      store.getState().setStatus(data)
    }

    const onOutput = (data: { source: 'backend' | 'frontend'; line: string }) => {
      store.getState().addLog({
        source: data.source,
        line: data.line,
        timestamp: Date.now(),
      })
    }

    socket.on('runner:status', onStatus)
    socket.on('runner:output', onOutput)

    return () => {
      socket.off('runner:status', onStatus)
      socket.off('runner:output', onOutput)
    }
  }, [socket])

  const start = useCallback((target: 'backend' | 'frontend' | 'all') => {
    socket.emit('runner:start', { target })
  }, [socket])

  const stop = useCallback((target: 'backend' | 'frontend' | 'all') => {
    socket.emit('runner:stop', { target })
  }, [socket])

  return { start, stop }
}
