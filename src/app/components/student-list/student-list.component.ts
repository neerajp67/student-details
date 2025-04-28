import { Component, effect, inject, signal, viewChild, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Student } from '../../model/student.model';
import { StudentService } from '../../services/student.service';
import { NotificationService } from '../../services/notification.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmationDialogComponent, DialogData } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';


@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule
  ],
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StudentListComponent {
  private router = inject(Router);
  private studentService = inject(StudentService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog); // Inject MatDialog


  displayedColumns = signal<string[]>([
     'firstName', 'lastName', 'course', 'address', 'actions'
  ]);
  dataSource = new MatTableDataSource<Student>([]);

  paginator = viewChild<MatPaginator>(MatPaginator);
  sort = viewChild<MatSort>(MatSort);

  constructor() {
    effect(() => {
      const currentStudents = this.studentService.students$();
      this.dataSource.data =  [...currentStudents];;

      const currentPaginator = this.paginator();
      const currentSort = this.sort();

      if (currentPaginator && this.dataSource.paginator !== currentPaginator) {
        this.dataSource.paginator = currentPaginator;
      }
      if (currentSort && this.dataSource.sort !== currentSort) {
        this.dataSource.sort = currentSort;
      }
    }, { allowSignalWrites: true });
  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  clearFilter(inputElement: HTMLInputElement): void {
    inputElement.value = '';
    this.applyFilter('');
  }

  addStudent(): void {
    this.router.navigate(['/form']);
  }

  editStudent(id: string): void {
    this.router.navigate(['/form', id]);
  }

  deleteStudent(id: string): void {
    const dialogRef = this.dialog.open<ConfirmationDialogComponent, DialogData>(
        ConfirmationDialogComponent,
        {
            width: '350px',
            data: {
                message: `Are you sure you want to delete student ID ${id}?`,
                confirmButtonText: 'Delete',
                cancelButtonText: 'Cancel'
            },
            disableClose: true
        }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        console.log('Deletion confirmed for:', id);
        const success = this.studentService.deleteStudent(id);
        if (success) {
          this.notificationService.showSuccess('Student record deleted successfully!');
        } else {
          this.notificationService.showError('Error deleting student record (not found?).');
        }
      } else {
        console.log('Deletion cancelled for ID:', id);
      }
    });
  }
}