import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Progress } from '../../entities/progress.entity';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(Progress)
    private progressRepository: Repository<Progress>,
  ) {}

  async findAll(): Promise<Progress[]> {
    return this.progressRepository.find({
      relations: ['user', 'student'],
    });
  }

  async findByStudent(studentId: string): Promise<Progress[]> {
    return this.progressRepository.find({
      where: { student: { id: studentId } },
      relations: ['user', 'student'],
    });
  }

  async findByUser(userId: string): Promise<Progress[]> {
    return this.progressRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'student'],
    });
  }
}