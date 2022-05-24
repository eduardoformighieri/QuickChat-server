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
  Headers
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


  @Get('chat/:id')
  async getChatById(@Param('id') id: string, @Headers() headers): Promise<ChatModel> {
    const password = headers.password
    const hash = await this.generateAdminHash()
    const isAdmin = await bcrypt.compare(password, hash);
    if (isAdmin){
      return this.prismaService.chat.findUnique({ where: { id: Number(id) } })
    }
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }

  @Get('chats')
  async getAllChats(@Headers() headers): Promise<ChatModel[]> {
    const password = headers.password
    const hash = await this.generateAdminHash()
    const isAdmin = await bcrypt.compare(password, hash);
    if (isAdmin){
      return this.prismaService.chat.findMany()
    }
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }

  @Post('chat')
  async createChat(@Body() name: string): Promise<ChatModel> {
    return this.prismaService.chat.create({
      data: {
        name
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
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);

  }

}
