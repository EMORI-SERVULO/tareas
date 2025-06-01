import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,

    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}


  private generateRandomColor(): string {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  }

 
  async create(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    //console.log('viene del front',createTaskDto, user)
    const existingColors = await this.taskRepository.find({
      where: { user: { id: user.id } },
      select: ['color'],
    });
    const usedColors = existingColors.map(t => t.color);

    let color: string;
    let tries = 0;

    do {
      color = this.generateRandomColor();
      tries++;
    } while (usedColors.includes(color) && tries < 20);

    if (tries >= 20) {
      throw new BadRequestException('No hay colores únicos disponibles.');
    }

    const category = await this.categoryRepository.findOneBy({
      id: createTaskDto.categoryId,
    });
    //console.log('category ya esta en el back',category)

    if (!category) {
      throw new NotFoundException('Categoría no encontrada.');
    }

    const task = this.taskRepository.create({
      title: createTaskDto.title,
      description: createTaskDto.description,
      color,
      category,
      userId: user.userId ,
      status: TaskStatus.PENDING,
    });
    //console.log('lo que se guardara',task)
    return this.taskRepository.save(task);
  }


  async getPendingTasks(userId: string): Promise<Task[]> {
    //console.log(userId)
    return this.taskRepository.find({
      where: { user: { id: userId }, status: TaskStatus.PENDING },
      order: { createdAt: 'DESC' },
      take: 6,
      relations: ['category'],
    });
  }




  async getCompletedTasks(userId: string): Promise<Task[]> {
    //console.log(userId)
    return this.taskRepository.find({
      where: { user: { id: userId }, status: TaskStatus.COMPLETED },
      order: { createdAt: 'DESC' },
      take: 6,
      relations: ['category'],
    });
  }


  async markAsCompleted(taskId: string, userId: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id: taskId, user: { id: userId } },
    });

    if (!task) {
      throw new NotFoundException('Tarea no encontrada.');
    }

    task.status = TaskStatus.COMPLETED;
    return this.taskRepository.save(task);
  }


  async delete(taskId: string): Promise<void> {
    const result = await this.taskRepository.delete({
      id: taskId,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Tarea no encontrada o no pertenece al usuario.');
    }
  }
}
