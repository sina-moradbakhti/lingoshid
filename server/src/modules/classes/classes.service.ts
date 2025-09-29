import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Class } from '../../entities/class.entity';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Class)
    private classRepository: Repository<Class>,
  ) {}

  async create(classData: Partial<Class>): Promise<Class> {
    const classEntity = this.classRepository.create(classData);
    return this.classRepository.save(classEntity);
  }

  async findAll(): Promise<Class[]> {
    return this.classRepository.find({
      relations: ['teacher', 'students'],
      where: { isActive: true },
    });
  }

  async findOne(id: string): Promise<Class> {
    return this.classRepository.findOne({
      where: { id },
      relations: ['teacher', 'students', 'students.user'],
    });
  }

  async findByTeacher(teacherId: string): Promise<Class[]> {
    return this.classRepository.find({
      where: { teacher: { id: teacherId }, isActive: true },
      relations: ['students', 'students.user'],
    });
  }
}