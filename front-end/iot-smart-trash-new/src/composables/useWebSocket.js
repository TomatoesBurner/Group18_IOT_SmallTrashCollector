import { ref, onBeforeUnmount } from 'vue'
import { io } from 'socket.io-client'

export function useWebSocket(url) {
  const socket = ref(null)
  const isConnected = ref(false)
  const messages = ref([])
  const messageListeners = []

  const connect = () => {
    socket.value = io(url)

    socket.value.on('connect', () => {
      isConnected.value = true
    })


    socket.value.on('newTrashRecord', (data) => {
      messages.value = [...messages.value, data]
      messageListeners.forEach((cb) => cb(data))
    })

    socket.value.on('initialWeight', (data) => {
      messages.value = [...messages.value, { type: 'initialWeight', ...data }]
      messageListeners.forEach((cb) => cb({ type: 'initialWeight', ...data }))
    })

    socket.value.on('disconnect', () => {
      isConnected.value = false
    })

    socket.value.on('connect_error', (e) => {
      console.error('Socket.io connect error', e)
    })
  }

  const sendMessage = (event, data) => {
    if (socket.value && isConnected.value) {
      socket.value.emit(event, data)
    }
  }

  const onMessage = (callback) => {
    messageListeners.push(callback)
  }

  const disconnect = () => {
    socket.value?.disconnect()
  }

  onBeforeUnmount(() => {
    disconnect()
  })

  return {
    connect,
    disconnect,
    sendMessage,
    onMessage,
    isConnected,
    messages,
  }
}
