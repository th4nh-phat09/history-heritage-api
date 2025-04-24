import { io } from "socket.io-client"

// Gán cứng dữ liệu test
const roomId = "680867a051ce88b27193a6a8" // ID phòng có sẵn trong DB
const userData = {
    userId: "67fe7cd70b2e21672948328a",
    username: "namle022004"
}

// Kết nối socket
const socket = io("http://localhost:8017", {
    autoConnect: true,      // có thể set false nếu muốn chủ động connect
    reconnection: false     // ❌ không tự reconnect
})

// Khi kết nối thành công
socket.on("connect", () => {
    console.log("✅ Connected:", socket.id)

    // Gửi sự kiện tham gia phòng với dữ liệu gán cứng
    socket.emit("join-room", { roomId, userData })

    // Ngắt kết nối
    socket.on("disconnect", () => {
        console.log("❌ Disconnected")
    })
    // Các sự kiện phản hồi từ server
    socket.on("room-joined", (data) => {
        console.log("🚪 room-joined:", data)
    })

    socket.on("user-joined", (data) => {
        console.log("👋 user-joined:", data)
    })

    socket.on("room-users", (data) => {
        console.log("👥 room-users:", data)
    })

    socket.on("error", (err) => {
        console.error("❌ Error:", err)
    })
})

