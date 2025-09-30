import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TeacherService, CreateStudentDto, StudentWithCredentials } from '../../../services/teacher.service';

@Component({
  selector: 'app-register-student',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="header">
        <button (click)="goBack()" class="back-btn">← Back</button>
        <h1>Register New Student</h1>
      </div>

      <div *ngIf="!registrationComplete" class="form-container">
        <form (ngSubmit)="onSubmit()">
          <div class="form-section">
            <h3>Student Information</h3>
            <div class="form-row">
              <div class="form-group">
                <label>First Name *</label>
                <input type="text" [(ngModel)]="formData.studentFirstName" name="studentFirstName" required />
              </div>
              <div class="form-group">
                <label>Last Name *</label>
                <input type="text" [(ngModel)]="formData.studentLastName" name="studentLastName" required />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Age *</label>
                <input type="number" [(ngModel)]="formData.age" name="age" min="6" max="18" required />
              </div>
              <div class="form-group">
                <label>Grade *</label>
                <input type="number" [(ngModel)]="formData.grade" name="grade" min="4" max="12" required />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>School Name</label>
                <input type="text" [(ngModel)]="formData.schoolName" name="schoolName" />
              </div>
              <div class="form-group">
                <label>Class Name</label>
                <input type="text" [(ngModel)]="formData.className" name="className" />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>Parent Information</h3>
            <div class="form-row">
              <div class="form-group">
                <label>First Name *</label>
                <input type="text" [(ngModel)]="formData.parentFirstName" name="parentFirstName" required />
              </div>
              <div class="form-group">
                <label>Last Name *</label>
                <input type="text" [(ngModel)]="formData.parentLastName" name="parentLastName" required />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Phone Number</label>
                <input type="tel" [(ngModel)]="formData.parentPhoneNumber" name="parentPhoneNumber" />
              </div>
              <div class="form-group">
                <label>Occupation</label>
                <input type="text" [(ngModel)]="formData.parentOccupation" name="parentOccupation" />
              </div>
            </div>
          </div>

          <button type="submit" [disabled]="isSubmitting" class="submit-btn">
            {{ isSubmitting ? 'Creating...' : 'Register Student' }}
          </button>
        </form>
      </div>

      <div *ngIf="registrationComplete && credentials" class="credentials-container">
        <h2>✅ Registration Successful!</h2>
        <p class="success-message">{{ credentials.message }}</p>

        <div class="credentials-section">
          <h3>Student Credentials</h3>
          <div class="credential-card">
            <div class="credential-info">
              <p><strong>Name:</strong> {{ credentials.student.firstName }} {{ credentials.student.lastName }}</p>
              <p><strong>Username:</strong> {{ credentials.student.username }}</p>
              <p><strong>Password:</strong> {{ credentials.student.password }}</p>
            </div>
            <div class="qr-code">
              <img [src]="credentials.student.qrCode" alt="Student QR Code" />
              <p>Student QR Code</p>
            </div>
          </div>
        </div>

        <div class="credentials-section">
          <h3>Parent Credentials</h3>
          <div class="credential-card">
            <div class="credential-info">
              <p><strong>Name:</strong> {{ credentials.parent.firstName }} {{ credentials.parent.lastName }}</p>
              <p><strong>Username:</strong> {{ credentials.parent.username }}</p>
              <p><strong>Password:</strong> {{ credentials.parent.password }}</p>
            </div>
            <div class="qr-code">
              <img [src]="credentials.parent.qrCode" alt="Parent QR Code" />
              <p>Parent QR Code</p>
            </div>
          </div>
        </div>

        <div class="actions">
          <button (click)="printCredentials()" class="action-btn">🖨️ Print Credentials</button>
          <button (click)="registerAnother()" class="action-btn">➕ Register Another</button>
          <button (click)="goBack()" class="action-btn">✅ Done</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      max-width: 1000px;
      margin: 0 auto;
    }

    .header {
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .header h1 {
      margin: 0;
      color: #667eea;
    }

    .back-btn {
      padding: 10px 15px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }

    .back-btn:hover {
      background: #5a67d8;
    }

    .form-container {
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .form-section {
      margin-bottom: 30px;
      padding-bottom: 30px;
      border-bottom: 2px solid #e2e8f0;
    }

    .form-section:last-of-type {
      border-bottom: none;
    }

    .form-section h3 {
      margin: 0 0 20px 0;
      color: #2d3748;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group label {
      margin-bottom: 8px;
      color: #4a5568;
      font-weight: 600;
    }

    .form-group input {
      padding: 10px;
      border: 2px solid #e2e8f0;
      border-radius: 5px;
      font-size: 1rem;
    }

    .form-group input:focus {
      outline: none;
      border-color: #667eea;
    }

    .submit-btn {
      width: 100%;
      padding: 15px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .submit-btn:hover:not(:disabled) {
      background: #5a67d8;
    }

    .submit-btn:disabled {
      background: #cbd5e0;
      cursor: not-allowed;
    }

    .credentials-container {
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .credentials-container h2 {
      margin: 0 0 10px 0;
      color: #48bb78;
      text-align: center;
    }

    .success-message {
      text-align: center;
      color: #4a5568;
      margin-bottom: 30px;
    }

    .credentials-section {
      margin-bottom: 30px;
    }

    .credentials-section h3 {
      margin: 0 0 15px 0;
      color: #2d3748;
    }

    .credential-card {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 30px;
      padding: 20px;
      background: #f7fafc;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
    }

    .credential-info p {
      margin: 10px 0;
      color: #4a5568;
    }

    .credential-info strong {
      color: #2d3748;
    }

    .qr-code {
      text-align: center;
    }

    .qr-code img {
      width: 150px;
      height: 150px;
      border: 2px solid #e2e8f0;
      border-radius: 5px;
    }

    .qr-code p {
      margin: 10px 0 0 0;
      color: #718096;
      font-size: 0.9rem;
    }

    .actions {
      display: flex;
      gap: 10px;
      justify-content: center;
      margin-top: 30px;
    }

    .action-btn {
      padding: 12px 24px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 600;
    }

    .action-btn:hover {
      background: #5a67d8;
    }

    @media print {
      .header, .actions, .back-btn {
        display: none;
      }
    }
  `]
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