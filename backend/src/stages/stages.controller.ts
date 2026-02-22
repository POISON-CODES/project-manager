import {
    Controller,
    Get,
    Param,
    UseGuards,
} from '@nestjs/common';
import { StagesService } from './stages.service';
import { JwtAuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('stages')
@UseGuards(JwtAuthGuard)
export class StagesController {
    constructor(private readonly stagesService: StagesService) { }

    @Get()
    async findAll() {
        const data = await this.stagesService.findAll();
        return { success: true, data };
    }
}
