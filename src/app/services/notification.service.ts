import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  // Default configuration for snackbars
  private defaultConfig: MatSnackBarConfig = {
    duration: 3000,
    verticalPosition: 'top',
    horizontalPosition: 'center',
  };

  /**
   * Shows a success notification.
   * @param message The message to display.
   * @param config Optional MatSnackBarConfig overrides.
   */
  showSuccess(message: string, config?: Partial<MatSnackBarConfig>): void {
    this.snackBar.open(message, 'Close', {
      ...this.defaultConfig,
      panelClass: ['success-snackbar'],
      ...config,
    });
  }

  /**
   * Shows an error notification.
   * @param message The message to display.
   * @param config Optional MatSnackBarConfig overrides.
   */
  showError(message: string, config?: Partial<MatSnackBarConfig>): void {
    this.snackBar.open(message, 'Close', {
      ...this.defaultConfig,
      duration: 4000,
      panelClass: ['error-snackbar'],
      ...config,
    });
  }

  /**
   * Shows a general information notification.
   * @param message The message to display.
   * @param config Optional MatSnackBarConfig overrides.
   */
  showInfo(message: string, config?: Partial<MatSnackBarConfig>): void {
    this.snackBar.open(message, 'Close', {
      ...this.defaultConfig,
      ...config,
    });
  }
}