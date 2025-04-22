import { io } from "socket.io-client"
import readline from 'readline'

// Tạo interface để nhập từ bàn phím
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Kết nối socket
const socket = io("http://localhost:8017")

// Biến lưu trạng thái
let currentRoom = null;
let username = null;

// Xử lý kết nối
socket.on("connect", () => {
    console.log("✅ Connected:", socket.id)

    // Nhập tên người dùng
    rl.question('Nhập tên người dùng: ', (name) => {
        username = name || 'Khách ' + Math.floor(Math.random() * 1000);
        console.log(`Xin chào ${username}!`);
        showCommands();
    });
});

// Xử lý ngắt kết nối
socket.on("disconnect", () => {
    console.log("❌ Disconnected")
});

// Các sự kiện từ server

// Khi tham gia phòng thành công
socket.on('room-joined', (data) => {
    console.log(`✅ Đã tham gia phòng ${data.roomId}`);
    currentRoom = data.roomId;
});

// Khi có người mới tham gia
socket.on('user-joined', (data) => {
    console.log(`👋 ${data.username} đã tham gia phòng`);
});

// Khi có người rời phòng
socket.on('user-left', (data) => {
    console.log(`👋 Người dùng ${data.userId} đã rời phòng`);
});

// Khi nhận được tin nhắn mới
socket.on('new-message', (data) => {
    const sender = data.sender?.username || data.userId;
    console.log(`💬 ${sender}: ${data.content}`);
});

// Khi nhận được danh sách người dùng
socket.on('room-users', (data) => {
    console.log('👥 Danh sách người dùng trong phòng:');
    data.users.forEach((user) => {
        console.log(`  - ${user.username || user.userId}`);
    });
});

// Khi nhận được danh sách tin nhắn
socket.on('room-messages', (data) => {
    console.log('📜 Lịch sử tin nhắn:');
    if (data.messages.length === 0) {
        console.log('  Chưa có tin nhắn nào.');
    } else {
        data.messages.forEach((msg) => {
            const sender = msg.sender?.username || msg.userId;
            console.log(`  ${sender}: ${msg.content}`);
        });
    }
});

// Xử lý lỗi
socket.on('error', (error) => {
    console.error('❌ Lỗi:', error.message);
});

// Hiển thị danh sách lệnh
function showCommands() {
    console.log('\n📋 Danh sách lệnh:');
    console.log('  /join [roomId] - Tham gia phòng chat');
    console.log('  /leave - Rời phòng chat hiện tại');
    console.log('  /users - Xem danh sách người dùng trong phòng');
    console.log('  /history - Xem lịch sử tin nhắn');
    console.log('  /exit - Thoát');
    console.log('  Tin nhắn bình thường sẽ được gửi đến phòng hiện tại');
    console.log('----------------------------------------');

    processInput();
}

// Xử lý nhập liệu
function processInput() {
    rl.question('> ', (input) => {
        // Xử lý các lệnh
        if (input.startsWith('/join')) {
            const roomId = input.split(' ')[1] || 'default-room';
            socket.emit('join-room', { roomId, username });
        } else if (input === '/leave') {
            if (currentRoom) {
                socket.emit('leave-room', { roomId: currentRoom });
                console.log(`Đã rời phòng ${currentRoom}`);
                currentRoom = null;
            } else {
                console.log('Bạn chưa tham gia phòng chat nào.');
            }
        } else if (input === '/users') {
            if (currentRoom) {
                socket.emit('get-room-users', { roomId: currentRoom });
            } else {
                console.log('Bạn chưa tham gia phòng chat nào.');
            }
        } else if (input === '/history') {
            if (currentRoom) {
                socket.emit('get-messages', { roomId: currentRoom, limit: 20 });
            } else {
                console.log('Bạn chưa tham gia phòng chat nào.');
            }
        } else if (input === '/exit') {
            console.log('Tạm biệt!');
            socket.disconnect();
            rl.close();
            process.exit(0);
        } else if (input === '/help') {
            showCommands();
        } else {
            // Gửi tin nhắn thông thường
            if (currentRoom) {
                socket.emit('send-message', { roomId: currentRoom, message: input });
            } else {
                console.log('Bạn cần tham gia phòng chat trước (/join [roomId]).');
            }
        }

        // Tiếp tục nhận input nếu chưa thoát
        if (input !== '/exit') {
            processInput();
        }
    });
}

console.log('🚀 Chat Client khởi động...');
