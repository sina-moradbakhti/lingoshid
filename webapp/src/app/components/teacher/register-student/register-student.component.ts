import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TeacherService, CreateStudentDto, StudentWithCredentials } from '../../../services/teacher.service';

@Component({
  selector: 'app-register-student',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register-student.component.html',
  styleUrls: ['./register-student.component.scss']
})
export class RegisterStudentComponent {
  formData: CreateStudentDto = {
    studentFirstName: '',
    studentLastName: '',
    grade: 4,
    age: 9,
    schoolName: '',
    className: '',
    parentFirstName: '',
    parentLastName: '',
    parentPhoneNumber: '',
    parentOccupation: ''
  };

  credentials: StudentWithCredentials | null = null;
  registrationComplete = false;
  isSubmitting = false;

  constructor(
    private router: Router,
    private teacherService: TeacherService
  ) {}

  onSubmit() {
    this.isSubmitting = true;
    this.teacherService.createStudent(this.formData).subscribe({
      next: (response) => {
        this.credentials = response;
        this.registrationComplete = true;
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error registering student:', error);
        alert('Failed to register student. Please try again.');
        this.isSubmitting = false;
      }
    });
  }

  printCredentials() {
    window.print();
  }

  registerAnother() {
    this.registrationComplete = false;
    this.credentials = null;
    this.formData = {
      studentFirstName: '',
      studentLastName: '',
      grade: 4,
      age: 9,
      schoolName: '',
      className: '',
      parentFirstName: '',
      parentLastName: '',
      parentPhoneNumber: '',
      parentOccupation: ''
    };
  }

  goBack() {
    this.router.navigate(['/teacher']);
  }
}