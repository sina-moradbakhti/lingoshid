import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TeacherService } from '../../../services/teacher.service';

@Component({
  selector: 'app-students-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="header">
        <button (click)="goBack()" class="back-btn">← Back</button>
        <h1>My Students</h1>
      </div>

      <div class="search-section">
        <input
          type="text"
          [(ngModel)]="searchTerm"
          (ngModelChange)="filterStudents()"
          placeholder="Search students..."
          class="search-input"
        />
      </div>

      <div *ngIf="isLoading" class="loading">Loading students...</div>

      <div *ngIf="!isLoading && filteredStudents.length > 0" class="students-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Grade</th>
              <th>Points</th>
              <th>Level</th>
              <th>Parent</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let student of filteredStudents">
              <td>{{ student.firstName }} {{ student.lastName }}</td>
              <td>{{ student.username }}</td>
              <td>{{ student.grade }}</td>
              <td>{{ student.totalPoints }}</td>
              <td>{{ student.currentLevel }}</td>
              <td>
                <div *ngIf="student.parent">
                  {{ student.parent.firstName }} {{ student.parent.lastName }}
                  <br>
                  <small>{{ student.parent.username }}</small>
                </div>
              </td>
              <td>
                <button (click)="viewProgress(student.id)" class="action-btn view">View Progress</button>
                <button (click)="editStudent(student)" class="action-btn edit">Edit</button>
                <button (click)="resetCredentials(student.id, 'student')" class="action-btn reset">Reset Student Cred</button>
                <button (click)="resetCredentials(student.id, 'parent')" class="action-btn reset">Reset Parent Cred</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="!isLoading && filteredStudents.length === 0" class="empty-state">
        <p>No students found</p>
      </div>

      <!-- Edit Student Modal -->
      <div *ngIf="showEditModal" class="modal-overlay" (click)="closeEditModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h2>Edit Student</h2>
          <form (ngSubmit)="saveStudentEdit()">
            <div class="form-group">
              <label>First Name</label>
              <input type="text" [(ngModel)]="editingStudent.firstName" name="firstName" required />
            </div>
            <div class="form-group">
              <label>Last Name</label>
              <input type="text" [(ngModel)]="editingStudent.lastName" name="lastName" required />
            </div>
            <div class="form-group">
              <label>Grade</label>
              <input type="number" [(ngModel)]="editingStudent.grade" name="grade" min="4" max="12" required />
            </div>
            <div class="form-group">
              <label>Age</label>
              <input type="number" [(ngModel)]="editingStudent.age" name="age" min="6" max="18" required />
            </div>
            <div class="form-group">
              <label>School Name</label>
              <input type="text" [(ngModel)]="editingStudent.schoolName" name="schoolName" />
            </div>
            <div class="form-group">
              <label>Class Name</label>
              <input type="text" [(ngModel)]="editingStudent.className" name="className" />
            </div>
            <div class="modal-actions">
              <button type="submit" class="btn-save">Save Changes</button>
              <button type="button" (click)="closeEditModal()" class="btn-cancel">Cancel</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Credentials Modal -->
      <div *ngIf="showCredentialsModal" class="modal-overlay" (click)="closeCredentialsModal()">
        <div class="credentials-modal-content" (click)="$event.stopPropagation()">
          <h2>✅ {{ credentialsData?.message }}</h2>
          <p class="success-message">New credentials have been generated. Please save or print them.</p>

          <div class="credential-display">
            <div class="credential-info">
              <p><strong>Name:</strong> {{ credentialsData?.firstName }} {{ credentialsData?.lastName }}</p>
              <p><strong>Username:</strong> <span class="highlight">{{ credentialsData?.username }}</span></p>
              <p><strong>Password:</strong> <span class="highlight">{{ credentialsData?.password }}</span></p>
            </div>
            <div class="qr-code-section">
              <img [src]="credentialsData?.qrCode" alt="QR Code" class="qr-image" />
              <p class="qr-label">Scan to save credentials</p>
            </div>
          </div>

          <div class="modal-actions">
            <button (click)="printCredentials()" class="btn-print">🖨️ Print</button>
            <button (click)="closeCredentialsModal()" class="btn-done">✅ Done</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      max-width: 1400px;
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

    .search-section {
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }

    .search-input {
      width: 100%;
      padding: 12px;
      border: 2px solid #e2e8f0;
      border-radius: 5px;
      font-size: 1rem;
    }

    .search-input:focus {
      outline: none;
      border-color: #667eea;
    }

    .loading, .empty-state {
      text-align: center;
      padding: 40px;
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .students-table {
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }

    th {
      background: #f7fafc;
      color: #2d3748;
      font-weight: 600;
    }

    tr:hover {
      background: #f7fafc;
    }

    .action-btn {
      padding: 6px 12px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      margin-right: 5px;
      margin-bottom: 5px;
      font-size: 0.85rem;
    }

    .action-btn.view {
      background: #667eea;
      color: white;
    }

    .action-btn.view:hover {
      background: #5a67d8;
    }

    .action-btn.reset {
      background: #ed8936;
      color: white;
    }

    .action-btn.reset:hover {
      background: #dd6b20;
    }

    .action-btn.edit {
      background: #48bb78;
      color: white;
    }

    .action-btn.edit:hover {
      background: #38a169;
    }

    small {
      color: #718096;
      font-size: 0.85rem;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      padding: 30px;
      border-radius: 10px;
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-content h2 {
      margin: 0 0 20px 0;
      color: #2d3748;
    }

    .form-group {
      margin-bottom: 15px;
    }

    .form-group label {
      display: block;
      margin-bottom: 5px;
      color: #4a5568;
      font-weight: 600;
    }

    .form-group input {
      width: 100%;
      padding: 10px;
      border: 2px solid #e2e8f0;
      border-radius: 5px;
      font-size: 1rem;
    }

    .form-group input:focus {
      outline: none;
      border-color: #667eea;
    }

    .modal-actions {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }

    .btn-save {
      flex: 1;
      padding: 12px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 600;
    }

    .btn-save:hover {
      background: #5a67d8;
    }

    .btn-cancel {
      flex: 1;
      padding: 12px;
      background: #e2e8f0;
      color: #2d3748;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 600;
    }

    .btn-cancel:hover {
      background: #cbd5e0;
    }

    /* Credentials Modal Styles */
    .credentials-modal-content {
      background: white;
      padding: 40px;
      border-radius: 10px;
      max-width: 600px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .credentials-modal-content h2 {
      margin: 0 0 10px 0;
      color: #48bb78;
      text-align: center;
    }

    .success-message {
      text-align: center;
      color: #4a5568;
      margin-bottom: 30px;
    }

    .credential-display {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 30px;
      padding: 25px;
      background: #f7fafc;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      margin-bottom: 20px;
    }

    .credential-info p {
      margin: 12px 0;
      color: #4a5568;
      font-size: 1rem;
    }

    .credential-info strong {
      color: #2d3748;
    }

    .credential-info .highlight {
      color: #667eea;
      font-weight: 600;
      font-size: 1.1rem;
      padding: 4px 8px;
      background: #edf2f7;
      border-radius: 4px;
    }

    .qr-code-section {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .qr-image {
      width: 150px;
      height: 150px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      margin-bottom: 10px;
    }

    .qr-label {
      margin: 0;
      color: #718096;
      font-size: 0.9rem;
    }

    .btn-print {
      flex: 1;
      padding: 12px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 600;
    }

    .btn-print:hover {
      background: #5a67d8;
    }

    .btn-done {
      flex: 1;
      padding: 12px;
      background: #48bb78;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 600;
    }

    .btn-done:hover {
      background: #38a169;
    }

    @media (max-width: 768px) {
      .credential-display {
        grid-template-columns: 1fr;
        text-align: center;
      }

      .qr-code-section {
        margin-top: 20px;
      }
    }

    @media print {
      .modal-overlay {
        display: none !important;
      }

      .credentials-modal-content {
        display: block !important;
        position: static;
        box-shadow: none;
      }

      .modal-actions {
        display: none !important;
      }
    }
  `]
})
export class StudentsListComponent implements OnInit {
  students: any[] = [];
  filteredStudents: any[] = [];
  searchTerm = '';
  isLoading = true;
  showEditModal = false;
  editingStudent: any = {};
  originalStudent: any = null;
  showCredentialsModal = false;
  credentialsData: any = null;

  constructor(
    private router: Router,
    private teacherService: TeacherService
  ) {}

  ngOnInit() {
    this.loadStudents();
  }

  loadStudents() {
    this.teacherService.getStudentsList().subscribe({
      next: (students) => {
        this.students = students;
        this.filteredStudents = students;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading students:', error);
        this.isLoading = false;
      }
    });
  }

  filterStudents() {
    const term = this.searchTerm.toLowerCase();
    this.filteredStudents = this.students.filter(student =>
      student.firstName.toLowerCase().includes(term) ||
      student.lastName.toLowerCase().includes(term) ||
      student.username.toLowerCase().includes(term)
    );
  }

  viewProgress(studentId: string) {
    this.router.navigate(['/teacher/student-progress', studentId]);
  }

  editStudent(student: any) {
    this.originalStudent = student;
    this.editingStudent = {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      grade: student.grade,
      age: student.age,
      schoolName: student.schoolName,
      className: student.className
    };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editingStudent = {};
    this.originalStudent = null;
  }

  saveStudentEdit() {
    const updateData = {
      firstName: this.editingStudent.firstName,
      lastName: this.editingStudent.lastName,
      grade: this.editingStudent.grade,
      age: this.editingStudent.age,
      schoolName: this.editingStudent.schoolName,
      className: this.editingStudent.className
    };

    this.teacherService.updateStudent(this.editingStudent.id, updateData).subscribe({
      next: (response) => {
        // Update the student in the list
        const index = this.students.findIndex(s => s.id === this.editingStudent.id);
        if (index !== -1) {
          this.students[index] = { ...this.students[index], ...updateData };
        }
        this.filterStudents();
        this.closeEditModal();
        alert('Student information updated successfully!');
      },
      error: (error) => {
        console.error('Error updating student:', error);
        alert('Failed to update student information');
      }
    });
  }

  resetCredentials(studentId: string, type: 'student' | 'parent') {
    if (confirm(`Are you sure you want to reset ${type} credentials?`)) {
      this.teacherService.updateStudentCredentials(studentId, type).subscribe({
        next: (response) => {
          this.credentialsData = response;
          this.showCredentialsModal = true;
        },
        error: (error) => {
          console.error('Error resetting credentials:', error);
          alert('Failed to reset credentials');
        }
      });
    }
  }

  closeCredentialsModal() {
    this.showCredentialsModal = false;
    this.credentialsData = null;
  }

  printCredentials() {
    window.print();
  }

  goBack() {
    this.router.navigate(['/teacher']);
  }
}