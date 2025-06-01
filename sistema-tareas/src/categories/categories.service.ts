import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ConflictException } from '@nestjs/common';

@Injectable()
export class CategoriesService implements OnModuleInit {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async onModuleInit() {
    const defaultCategories = ['Trabajo', 'Estudio', 'Casa', 'Familia', 'Diversión'];

    for (const name of defaultCategories) {
      const exists = await this.categoryRepository.findOne({ where: { name } });
      if (!exists) {
        await this.categoryRepository.save(this.categoryRepository.create({ name }));
      }
    }

    console.log('Categorías precargadas');
  }

  findAll() {
    return this.categoryRepository.find();
  }
  async create(createCategoryDto: CreateCategoryDto) {
  const { name } = createCategoryDto;
  const exists = await this.categoryRepository.findOne({ where: { name } });

  if (exists) {
    throw new ConflictException('La categoría ya existe');
  }

  const category = this.categoryRepository.create({ name });
  return this.categoryRepository.save(category);
}
}

