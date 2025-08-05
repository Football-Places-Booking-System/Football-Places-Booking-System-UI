import { Component, OnInit } from '@angular/core';
import { Router ,RouterModule} from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NgIf } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule,NgIf],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register implements OnInit {
  registerForm!: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const passwordControl = formGroup.get('password');
    const confirmPasswordControl = formGroup.get('confirmPassword');

    if (passwordControl && confirmPasswordControl && passwordControl.value !== confirmPasswordControl.value) {
      confirmPasswordControl.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      confirmPasswordControl?.setErrors(null);
      return null;
    }
  }

  onSubmit(): void {
    this.errorMessage = '';
    if (this.registerForm.valid) {
      const { username, email, password } = this.registerForm.value;
      // const success = this.authService.register({ username, email, password });
      // if (success) {
      //   console.log('Registration successful');
      //   this.router.navigate(['/login']);
      // } else {
      //   console.error('Registration failed');
      //   this.errorMessage = 'Registration failed. Username or email already exists.';
      // }
      this.authService.register({ username, email, password }).subscribe
        (response => {
          console.log('Registration successful:', response)
          // Use the new redirect method to go to the originally requested page or dashboard
          this.authService.redirectAfterLogin();

        }, error => {
          console.error('Registration error:', error)
          this.errorMessage = 'Registration failed. Please try again.'
        })
      console.log('Registration attempt:', { username, email, password });


    } else {
      this.errorMessage = 'Please enter valid registration data.';
      this.markAllAsTouched(this.registerForm);
    }
  }

  private markAllAsTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markAllAsTouched(control);
      }
    });
  }
}
