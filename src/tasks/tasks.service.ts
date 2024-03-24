import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from './schemas/tasks.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<Task>,
    private configService: ConfigService,
  ) {}

  async fetchAll(token: string): Promise<Task[]> {
    const data = jwt.verify(token, this.configService.get('JWT_SECRET_KEY'));
    const _id: string = (data as any).id;

    return await this.taskModel
      .find({ userId: _id })
      .sort({ createdDate: -1 })
      .exec();
  }

  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    const createdTask = new this.taskModel(createTaskDto);
    try {
      return await createdTask.save();
    } catch (error) {
      console.log(error);
      throw new HttpException('Failed to create task', HttpStatus.BAD_REQUEST);
    }
  }

  async updateTask(updateTaskDto: UpdateTaskDto, id: string): Promise<Task> {
    const updatedTask = await this.taskModel
      .findOneAndUpdate({ _id: id }, updateTaskDto, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!updatedTask) {
      throw new NotFoundException(`Task with ID ${updateTaskDto.id} not found`);
    }

    return updatedTask;
  }

  async deleteTask(id: string): Promise<Task> {
    const result = await this.taskModel.findOneAndDelete({ _id: id }).exec();
    if (!result) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return result;
  }
}
