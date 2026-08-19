import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/auth/auth-service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  loginForm!: FormGroup;
  isLoading = signal(false);
  hidePassword = signal(true);
  returnUrl = '/office';
  showForgotPassword = signal(false);
  forgotPasswordEmail = signal('');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    // Check if already logged in
    if (this.authService.check()) {
        this.router.navigate(['/office']);
      return;
    }

    // Get return URL from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/office';

    // Initialize form
  }

  initForm(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      this.snackBar.open('Veuillez remplir tous les champs correctement', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isLoading.set(true);

    const credentials = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password
    };

    this.authService.signIn(credentials).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        
        this.snackBar.open(`Bienvenue Firdawsitech !`, 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });

        // Redirect based on role
          this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('Login error:', error);
        
        let errorMessage = 'Erreur lors de la connexion';
        
        if (error.status === 401) {
          errorMessage = 'Email ou mot de passe incorrect';
        } else if (error.status === 403) {
          errorMessage = 'Compte désactivé ou non vérifié';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }

        this.snackBar.open(errorMessage, 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword.set(!this.hidePassword());
  }

  onForgotPassword(): void {
    this.showForgotPassword.set(true);
  }

  sendPasswordReset(): void {
    const email = this.forgotPasswordEmail();
    
    if (!email || !this.isValidEmail(email)) {
      this.snackBar.open('Veuillez entrer une adresse email valide', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isLoading.set(true);

    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.showForgotPassword.set(false);
        this.snackBar.open(
          'Un email de réinitialisation a été envoyé à votre adresse',
          'Fermer',
          {
            duration: 5000,
            panelClass: ['success-snackbar']
          }
        );
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('Forgot password error:', error);
        this.snackBar.open(
          'Erreur lors de l\'envoi de l\'email',
          'Fermer',
          {
            duration: 3000,
            panelClass: ['error-snackbar']
          }
        );
      }
    });
  }

  cancelForgotPassword(): void {
    this.showForgotPassword.set(false);
    this.forgotPasswordEmail.set('');
  }

  goToRegister(): void {
    this.router.navigate(['/register'], {
      queryParams: { returnUrl: this.returnUrl }
    });
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Getters for template
  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}




