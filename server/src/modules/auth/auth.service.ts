import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../entities/user.entity';
import { Student } from '../../entities/student.entity';
import { Parent } from '../../entities/parent.entity';
import { Teacher } from '../../entities/teacher.entity';
import { UserRole } from '../../enums/user-role.enum';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(Parent)
    private parentRepository: Repository<Parent>,
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName, role, ...profileData } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
    });

    const savedUser = await this.userRepository.save(user);

    // Create role-specific profile
    await this.createRoleProfile(savedUser, role, profileData);

    // Generate JWT token
    const payload = { 
      email: savedUser.email, 
      sub: savedUser.id, 
      role: savedUser.role,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        role: savedUser.role,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user with profile data
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['studentProfile', 'parentProfile', 'teacherProfile'],
    });

    if (!user || !await bcrypt.compare(password, user.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    user.lastLogin = new Date();
    await this.userRepository.save(user);

    // Generate JWT token
    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profile: this.getProfileData(user),
      },
    };
  }

  private async createRoleProfile(user: User, role: UserRole, profileData: any) {
    switch (role) {
      case UserRole.STUDENT:
        const student = this.studentRepository.create({
          user,
          grade: profileData.grade || 4,
          age: profileData.age || 9,
          schoolName: profileData.schoolName,
          className: profileData.className,
        });
        await this.studentRepository.save(student);
        break;

      case UserRole.PARENT:
        const parent = this.parentRepository.create({
          user,
          phoneNumber: profileData.phoneNumber,
          occupation: profileData.occupation,
        });
        await this.parentRepository.save(parent);
        break;

      case UserRole.TEACHER:
        const teacher = this.teacherRepository.create({
          user,
          employeeId: profileData.employeeId,
          schoolName: profileData.schoolName,
          department: profileData.department,
          qualification: profileData.qualification,
          yearsOfExperience: profileData.yearsOfExperience || 0,
          phoneNumber: profileData.phoneNumber,
        });
        await this.teacherRepository.save(teacher);
        break;
    }
  }

  private getProfileData(user: User) {
    switch (user.role) {
      case UserRole.STUDENT:
        return user.studentProfile;
      case UserRole.PARENT:
        return user.parentProfile;
      case UserRole.TEACHER:
        return user.teacherProfile;
      default:
        return null;
    }
  }

  async validateUser(userId: string): Promise<User> {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: ['studentProfile', 'parentProfile', 'teacherProfile'],
    });
  }
}