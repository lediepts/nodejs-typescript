import { Server, Socket } from 'socket.io'
import { server } from '..'

export const io = new Server(server, {
  serveClient: false,
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
io.use((socket, next) => {
  if (socket.request.headers.referer?.includes(':5500')) {
    next()
  } else {
    next(
      new Error(
        socket.request.headers.origin + ' websocket: ' + socket.id + ' invalid'
      )
    )
  }
})

function disConnect(socket: Socket) {
  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
}
interface Chat {
  id: number
  user: string
  message: string
}

let chats: Chat[] = []

const chatHandlers = (socket: Socket) => {
  const add = (payload: Omit<Chat, 'id'>) => {
    chats.push({
      ...payload,
      id: new Date().getTime(),
    })
    io.emit('request', chats)
  }

  const getAll = () => {
    socket.emit('request', chats)
  }

  socket.on('chat:create', add)
  socket.on('chat:all', getAll)
}

export const test = (meg: string) => {
  io.emit('messageAll', meg)
}

const onConnection = (socket: Socket) => {
  chatHandlers(socket)
  disConnect(socket)
}

io.on('connection', onConnection)
