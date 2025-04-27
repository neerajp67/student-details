import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { toSignal } from '@angular/core/rxjs-interop';
import { Student } from '../../model/student.model';
import { StudentService } from '../../services/student.service';
import { NotificationService } from '../../services/notification.service';


@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule
  ],
  templateUrl: './student-form.component.html',
  styleUrl: './student-form.component.scss'
})
export class StudentFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private studentService = inject(StudentService);
  private notificationService = inject(NotificationService);

  studentForm!: FormGroup;

  isEditMode = signal(false);
  studentId = signal<string | null>(null);
  pageTitle = computed(() => this.isEditMode() ? 'Edit Student' : 'Add New Student');

  genders: string[] = ['Male', 'Female', 'Other'];
  departments = signal([
    { value: 'cse', viewValue: 'Computer Science' },
    { value: 'eee', viewValue: 'Electrical Engineering' },
    { value: 'mech', viewValue: 'Mechanical Engineering' },
    { value: 'civil', viewValue: 'Civil Engineering' }
  ]);
  availableCourses = signal<string[]>([
    'Introduction to Programming', 'Data Structures', 'Algorithms',
    'Database Management', 'Operating Systems', 'Web Development',
    'Machine Learning'
  ]);

  courseControl = new FormControl('');
  courseInputValue = toSignal(this.courseControl.valueChanges, { initialValue: '' });
  filteredCourses = computed(() => {
    const filterValue = this.courseInputValue()?.toLowerCase() || '';
    if (!filterValue) return this.availableCourses();
    return this.availableCourses().filter(course => course.toLowerCase().includes(filterValue));
  });

  constructor() {
    // Effect to sync autocomplete selection back to the main form
    effect(() => {
      const selectedCourse = this.courseInputValue();
      if (selectedCourse && this.studentForm && this.studentForm.get('course')?.value !== selectedCourse) {
        if (this.availableCourses().includes(selectedCourse)) {
          this.studentForm.get('course')?.setValue(selectedCourse, { emitEvent: false });
        }
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    this.initializeForm();

    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.isEditMode.set(true);
        this.studentId.set(idParam);
        const studentData = this.studentService.getStudentById(idParam);
        if (studentData) {
          this.studentForm.patchValue(studentData);
          this.courseControl.setValue(studentData.course || '', { emitEvent: false });
        } else {
          console.error(`Student with ID ${idParam} not found! Navigating back.`);
          this.router.navigate(['/list']);
        }
      } else {
        this.isEditMode.set(false);
        this.studentId.set(null);
      }
    });
  }

  private initializeForm(): void {
    this.studentForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20)]],
      lastName: ['', [Validators.required, Validators.maxLength(20)]],
      dob: [null as Date | null, Validators.required],
      gender: ['', Validators.required],
      department: ['', Validators.required],
      course: ['', Validators.required],
      address: ['', Validators.maxLength(200)],
      agreedToTerms: [false, Validators.requiredTrue]
    });

    // Sync form's course value changes to the separate autocomplete input control
    this.studentForm.get('course')?.valueChanges.subscribe(value => {
      if (this.courseControl.value !== value) {
        this.courseControl.setValue(value || '', { emitEvent: false });
      }
    });
  }

  onSubmit(): void {
    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
      return;
    }

    const formData = this.studentForm.value;

    if (this.isEditMode()) {
      const currentId = this.studentId();
      if (currentId !== null) {
        const updatePayload: Partial<Omit<Student, 'id'>> = { ...formData };
        const success = this.studentService.updateStudent(currentId, updatePayload);
        if (success) {
          this.notificationService.showSuccess('Student record updated successfully!');
          this.router.navigate(['/list']);
        } else {
          this.notificationService.showError('Error updating student record');
          console.error("Update failed - student not found?");
        }
      } else {
        this.notificationService.showError('Error: Cannot update student record, ID is missing.');
      }
    } else {
      const addPayload: Omit<Student, 'id'> = { ...formData };
      delete (addPayload as any).id; // remove id property
      this.studentService.addStudent(addPayload);
      this.notificationService.showSuccess('Student record added successfully!');
      this.router.navigate(['/list']);
    }
  }

  onCancel(): void {
    this.router.navigate(['/list']);
  }

  getErrorMessage(controlName: string): string {
    const control = this.studentForm.get(controlName);
    if (!control || !control.touched || !control.errors) return '';
    if (control.hasError('required')) return 'This field is required';
    if (control.hasError('minlength')) return `Minimum length is ${control.errors['minlength'].requiredLength}`;
    if (control.hasError('maxlength')) return `Maximum length is ${control.errors['maxlength'].requiredLength}`;
    if (control.hasError('requiredtrue')) return 'You must agree to the terms';
    return 'Invalid value';
  }
}