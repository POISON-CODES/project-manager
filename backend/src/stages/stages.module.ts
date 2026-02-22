import { Module } from '@nestjs/common';
import { StagesService } from './stages.service';
import { StagesController } from './stages.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [StagesController],
    providers: [StagesService],
    exports: [StagesService],
})
export class StagesModule { }
