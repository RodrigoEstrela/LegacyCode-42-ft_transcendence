import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
// import { INestApplication } from '@nestjs/common';

export class CustomSocketIoAdapter extends IoAdapter {
   /* constructor(private app: INestApplication) {
        super();
    }*/

    createIOServer(port: number, options?: ServerOptions): any {
        const server = super.createIOServer(port, options);

        // Add a log statement to check if the WebSocket server is running
        console.log(`WebSocket server is running on port: ${port}`);
        return server;
    }

    bindClientConnect(server: any, callback: Function): void {
        super.bindClientConnect(server, callback);

        console.log('bindClientConnect');
        // Add CORS configuration for WebSocket connections
        const io = require('socket.io')(server, {
            cors: {
                origin: 'http://localhost:3000', // Replace with your React app's URL
                methods: ['GET', 'POST'],
                credentials: true,
            },
        });

        io.on('connection', callback);
    }
}


