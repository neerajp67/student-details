import { Injectable, signal, computed, WritableSignal, Signal } from '@angular/core';
import { Student } from '../model/student.model';

// Initial Dummy Data
const INITIAL_STUDENT_DATA: Student[] = [
    { id: 'f8a4b7a2-3c6d-4b8e-9f3a-1c7d9e0a2b1c', firstName: 'John', lastName: 'Doe', dob: new Date(2000, 1, 15), gender: 'Male', department: 'cse', course: 'Data Structures', agreedToTerms: true, address: '123 Main St' },
    { id: 'b4e8c1a9-7d2e-4f5a-8a1b-3d9e0a1b4c8d', firstName: 'Jane', lastName: 'Smith', dob: new Date(2001, 5, 20), gender: 'Female', department: 'eee', course: 'Circuit Theory', agreedToTerms: true },
];

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  // Private Writable Signal for internal state management
  readonly #students = signal<Student[]>(INITIAL_STUDENT_DATA);

  // Expose the student list as a readonly signal to prevent direct modification from outside
  public readonly students$: Signal<ReadonlyArray<Student>> = computed(() => this.#students());

  /**
   * Gets a student by their unique ID.
   * @param id The ID of the student to retrieve.
   * @returns The student object or undefined if not found.
   */
  getStudentById(id: string): Student | undefined {
    return this.#students().find(student => student.id === id);
  }

  /**
   * Adds a new student to the list.
   * @param studentData Data for the new student (without ID).
   * @returns The newly created student object with its assigned ID.
   */
  addStudent(studentData: Omit<Student, 'id'>): Student {
    const newId = crypto.randomUUID();
    const newStudent: Student = {
      ...studentData,
      id: newId
    };

    this.#students.update(currentStudents => [...currentStudents, newStudent]);

    console.log('Student Added:', newStudent);
    return newStudent;
  }

  /**
   * Updates an existing student's data.
   * @param id The ID of the student to update.
   * @param updatedData An object containing the fields to update.
   * @returns True if the update was successful, false otherwise.
   */
  updateStudent(id: string, updatedData: Partial<Omit<Student, 'id'>>): boolean {
    let updated = false;
    this.#students.update(currentStudents => {
      const index = currentStudents.findIndex(student => student.id === id);
      if (index !== -1) {
        const modifiedStudent = {
            ...currentStudents[index],
            ...updatedData,
            id: id
        };
        // Create a new array with the updated student
        const newStudents = [...currentStudents];
        newStudents[index] = modifiedStudent;
        updated = true;
        console.log('Student Updated:', modifiedStudent);
        return newStudents;
      }
      return currentStudents;
    });
    return updated;
  }

  /**
   * Deletes a student by their ID.
   * @param id The ID of the student to delete.
   * @returns True if deletion was successful, false otherwise.
   */
  deleteStudent(id: string): boolean {
     const initialLength = this.#students().length;
     this.#students.update(currentStudents =>
       currentStudents.filter(student => student.id !== id)
     );
     const success = this.#students().length < initialLength;
     if(success) {
        console.log('Student Deleted:', id);
     } else {
        console.warn('Student not found for deletion:', id);
     }
     return success;
  }
}