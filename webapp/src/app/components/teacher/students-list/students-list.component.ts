import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TeacherService } from '../../../services/teacher.service';

@Component({
  selector: 'app-students-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './students-list.component.html',
  styleUrls: ['./students-list.component.scss']
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