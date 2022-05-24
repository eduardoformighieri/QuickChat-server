import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { PrismaService } from './prisma.service'
import { EventsModule } from './events/events.module';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [ConfigModule.forRoot(), EventsModule],
  controllers: [AppController],
  providers: [PrismaService],
})
export class AppModule {}
