import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  Query,
  HttpException,
  HttpStatus,
  Headers,
  ForbiddenException,
  BadRequestException
} from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { User as UserModel, Post as PostModel, Chat as ChatModel, Message as MessageModel, Prisma } from '@prisma/client'
import * as bcrypt from 'bcrypt';



@Controller()
export class AppController {
  constructor(private readonly prismaService: PrismaService) {}

  async generateAdminHash() {
    const saltOrRounds = 10;
    const password = process.env.ADMIN_PASSWORD;
    const hash = await bcrypt.hash(password, saltOrRounds);
    return hash
  }


  @Get('chat/:name')
  async getChatByName(@Param('name') name: string): Promise<ChatModel> {

    return this.prismaService.chat.findUnique({ where: { name: name },  include: { messages: true }, })

  }

  @Get('chats')
  async getAllChats(@Headers() headers): Promise<ChatModel[]> {
    const password = headers.password
    const hash = await this.generateAdminHash()
    const isAdmin = await bcrypt.compare(password, hash);
    if (isAdmin){
      return this.prismaService.chat.findMany()
    }
    throw new ForbiddenException('Get the fuck out here')
  }

  @Post('chat')
  async createChat(@Body() data: { name: string }): Promise<ChatModel> {

    const chatName = data.name;

    if (!(/^(\w|\.|-)+$/.test(chatName))) {
      throw new BadRequestException('Invalid name, only letters (a-z), numbers (0-9), dashes (-), underscores (_) and dots (.) are allowed')
    }

    if (chatName.length > 20) {
      throw new BadRequestException('Name cannot exceed 20 characters')
    }

    const existingChat = await this.prismaService.chat.findUnique({ where: { name: data.name } })
    if (existingChat){
      return existingChat
    }

    return this.prismaService.chat.create({
      data: {
        name: chatName
      },
    })
  }

  @Delete('chat/:id')
  async deleteChat(@Param('id') id: string, @Headers() headers): Promise<ChatModel> | null {
    const password = headers.password
    const hash = await this.generateAdminHash()
    const isAdmin = await bcrypt.compare(password, hash);
    if (isAdmin){
      return this.prismaService.chat.delete({ where: { id: Number(id) } })
    }
    throw new ForbiddenException('Get the fuck out here')

  }

}
