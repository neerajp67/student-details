export interface Student {
    id: string;
    firstName: string;
    lastName: string;
    dob: Date | string;
    gender: string;
    department: string;
    course: string;
    address?: string; // Optional address
    agreedToTerms: boolean;
  }