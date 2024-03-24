import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(@Query() { token }: { token: string }) {
    return this.tasksService.fetchAll(token);
  }

  @Post()
  createTask(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.createTask(createTaskDto);
  }

  @Put(':id')
  updateTask(
    @Body() updateTaskDto: UpdateTaskDto,
    @Param() { id }: { id: string },
  ) {
    return this.tasksService.updateTask(updateTaskDto, id);
  }

  @Delete(':id')
  deleteTask(@Param() { id }: { id: string }) {
    return this.tasksService.deleteTask(id);
  }
}
