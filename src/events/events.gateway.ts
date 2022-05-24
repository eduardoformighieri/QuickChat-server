import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
  WsResponse,
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server } from 'socket.io';
import { PrismaService } from '../prisma.service'
import { Chat as ChatModel, Message as MessageModel, Prisma } from '@prisma/client'
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';



@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  constructor(private readonly prismaService: PrismaService) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() messageData: { chatName: string; author: string; content: string; },
    ): Promise<void> {

    const { chatName, author, content } = messageData;

    if (!(/^(\w|\.|-)+$/.test(author))) {
      this.server.emit('custom error', 'Invalid username, only letters (a-z), numbers (0-9), dashes (-), underscores (_) and dots (.) are allowed');
      throw new WsException('Invalid request');
    }

    if (author.length > 20) {
      this.server.emit('custom error', 'Name cannot exceed 20 characters')
      throw new WsException('Invalid request')

    }

    if(!content){
      this.server.emit('custom error', 'Empty message')
      throw new WsException('Invalid request');
    }

    const existingChat = await this.prismaService.chat.findUnique({ where: { name: chatName } })
    if (existingChat){
      await this.prismaService.message.create({
        data: {
          author,
          content,
          chat: {
            connect: { name: chatName },
          },
        },
      })
      this.server.emit('messageStored')
    }

    else this.server.emit('custom error', 'This chat does not exist')

  }
}
