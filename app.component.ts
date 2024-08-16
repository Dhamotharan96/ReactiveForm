import { routes } from './app.routes';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators, ValidatorFn, FormControl } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})


export class AppComponent implements OnInit {
  [x: string]: any;
  form!: FormGroup;
  jobCategories = ['Fresher', 'Internship', 'Working Professional'];
  showAdditionalFields = false;

  constructor(private fb: FormBuilder, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.form = this.fb.group({
      firstname: ['', [Validators.required,
        Validators.minLength(2), Validators.maxLength(40),
        this.alphaSpaceValidator(), this.noWhitespaceValidator()]],
      lastname: ['', [Validators.required,
        Validators.minLength(2), Validators.maxLength(40),
        this.alphaSpaceValidator(), this.noWhitespaceValidator()]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(40)]],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      birthday: ['', [Validators.required, this.ageValidator(18, 50)]],
      address: this.fb.group({
        street: ['', [Validators.required, Validators.minLength(5),Validators.maxLength(80)]],
        city: ['', [Validators.required, this.noWhitespaceValidator(),
          Validators.minLength(2), Validators.maxLength(30)]],
        state: ['', [Validators.required, this.noWhitespaceValidator(),
          Validators.minLength(2), Validators.maxLength(30), ]],
        zip: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
      }),
      jobCategory: ['', Validators.required],
      graduationYear: [''],
      highestQualification: [''],
      cgpa: [''],
      internshipType: [''],
      internDuration: [''],
      currentEmployer: [''],
      currentRole: [''],
      noticePeriod: [''],
    });

    this.form.get('jobCategory')?.valueChanges.subscribe(value => {
      this.showAdditionalFields = value !== '';
      this.resetAdditionalFields();
      this.applyValidators(value);
    });
  }

  resetAdditionalFields() {
    this.form.patchValue({
      graduationYear: '',
      highestQualification: '',
      cgpa: '',
      internshipType: '',
      internDuration: '',
      currentEmployer: '',
      currentRole: '',
      noticePeriod: ''
    });
  }

  onJobCategoryChange(): void {
    this.form.get('jobCategory')?.valueChanges.subscribe(value => {
      this.showAdditionalFields = value !== '';
      this.applyValidators(value);
    });
  }

  applyValidators(category: string): void {
    // Reset validators
    this.resetValidators();

    switch (category) {
      case 'Fresher':
        this.form.get('graduationYear')?.setValidators([Validators.required, this.yearRangeValidator(2022,2024)]);
        this.form.get('highestQualification')?.setValidators([Validators.required, this.noWhitespaceValidator(),
          Validators.minLength(2), Validators.maxLength(30)]);
        this.form.get('cgpa')?.setValidators([Validators.required, this.RangeValidator(60,100)]);
        break;

      case 'Internship':
        this.form.get('internshipType')?.setValidators([Validators.required]);
        this.form.get('internDuration')?.setValidators([Validators.required, this.RangeValidator(3,6)]);
        break;

      case 'Working Professional':
        this.form.get('currentEmployer')?.setValidators([Validators.required,
          Validators.minLength(2), Validators.maxLength(60), this.noWhitespaceValidator()]);
        this.form.get('currentRole')?.setValidators([Validators.required,
          Validators.minLength(2), Validators.maxLength(50), this.noWhitespaceValidator()]);
        this.form.get('noticePeriod')?.setValidators([Validators.required, this.RangeValidator(1,90)]);
        break;
    }

    // Update form validation status
    this.form.updateValueAndValidity();
  }

  resetValidators(): void {
    this.form.get('graduationYear')?.clearValidators();
    this.form.get('highestQualification')?.clearValidators();
    this.form.get('cgpa')?.clearValidators();
    this.form.get('internshipType')?.clearValidators();
    this.form.get('internDuration')?.clearValidators();
    this.form.get('currentEmployer')?.clearValidators();
    this.form.get('currentRole')?.clearValidators();
    this.form.get('noticePeriod')?.clearValidators();
  }

  // Custom validator for letters and spaces only
  alphaSpaceValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const value = control.value.trim();
      if (value && !/^[a-zA-Z\s]*$/.test(value)) {
        return { 'alphaSpace': true };
      }
      return null;
    };
  }

  // Custom validator to ensure that the input is not only whitespace
  noWhitespaceValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const value = control.value.trim();  // Trim the value before checking
      if (value === '') {
        return { 'alphaSpace': true };
      }
      return null;
    };
  }

  // Custom validator to ensure age is at least `minAge` years old
  ageValidator(minAge: number, maxAge: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      if (control.value) {
        let birthDate = new Date(control.value);
        let today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        let monthDifference = today.getMonth() - birthDate.getMonth();
        let dayDifference = today.getDate() - birthDate.getDate();

        // Adjust age if the birth date hasn't occurred yet this year
        if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
          age--;
        }

        if (age < minAge || age > maxAge) {
          return { 'age': true };
        }
      }
      return null;
    };
  }

  yearRangeValidator(minYear: number, maxYear: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const year = control.value;
      if (year == null || year === '') {
        return null; // Allow empty value if required
      }
      const parsedYear = parseInt(year, 10);
      if (isNaN(parsedYear) || parsedYear < minYear || parsedYear > maxYear) {
        return { 'yearRange': { minYear, maxYear } };
      }
      return null;
    };
  }

  RangeValidator(min: number, max: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (value === null || value === undefined || value === '') {
        return null; // Don't validate if the value is null or empty
      }
      return value < min || value > max ? { 'range': { value } } : null;
    };
  }

  onSubmit() {
    if (this.form.valid) {
      console.log(this.form.value);
      this.snackBar.open(
        'Job submitted successfully! Altimetrik HR team will review and contact you!',
         'Close', {
        duration: 6000,
      });
    } else {
      this.markAllAsTouched();
      return;
      console.log('form is invalid');
    }
  }

  markAllAsTouched(): void {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.controls[key];
      if (control instanceof FormGroup) {
        this.markAllAsTouchedInFormGroup(control);
      } else {
        control.markAsTouched();
      }
    });
  }

  markAllAsTouchedInFormGroup(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.controls[key];
      if (control instanceof FormGroup) {
        this.markAllAsTouchedInFormGroup(control);
      } else {
        control.markAsTouched();
      }
    });
  }

  getErrorText(errorKey: string): string {
    switch (errorKey) {
      case 'required':
        return 'This field is required';
      default:
        return 'Unknown error';
    }
  }
}


