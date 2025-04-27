import { Routes } from '@angular/router';
import { StudentListComponent } from './components/student-list/student-list.component';
import { StudentFormComponent } from './components/student-form/student-form.component';

export const routes: Routes = [
    {
        path: '', // Default route
        redirectTo: '/list',
        pathMatch: 'full'
    },
    {
        path: 'list',
        component: StudentListComponent,
        title: 'Student List'
    },
    {
        path: 'form', // Route for adding a new student
        component: StudentFormComponent,
        title: 'Add Student'
    },
    {
        path: 'form/:id', // Route for editing an existing student
        component: StudentFormComponent,
        title: 'Edit Student'
    },
    {
        path: '**', // Wildcard route
        redirectTo: '/list'
    }
];