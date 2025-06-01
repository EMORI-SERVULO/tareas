import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}


  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @CurrentUser() user: User) {
    return this.tasksService.create(createTaskDto, user);
  }


  @Get('pending')
  getPending(@CurrentUser() user: User) {
    return this.tasksService.getPendingTasks(user.id);
  }


  @Get('completed')
  getCompleted(@CurrentUser() user: User) {
    return this.tasksService.getCompletedTasks(user.id);
  }


  @Patch(':id/complete')
  markAsCompleted(@Param('id') id: string, @CurrentUser() user: User) {
    return this.tasksService.markAsCompleted(id, user.id);
  }


  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.tasksService.delete(id);
  }
}
