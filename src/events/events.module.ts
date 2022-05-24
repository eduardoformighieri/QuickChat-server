import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { EventsGateway } from './events.gateway';

@Module({
  providers: [EventsGateway,PrismaService],
})
export class EventsModule {}
