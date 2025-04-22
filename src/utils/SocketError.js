export class SocketError extends Error {

    constructor(code, message, context = null) {
        super(message)
        this.name = 'SocketError'
        this.code = code
        this.context = context
        this.timestamp = new Date()
    }
}
