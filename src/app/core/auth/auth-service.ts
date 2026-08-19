import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';
import { AuthUtils } from './auth-utils';
import { environment } from '../../../environments/environment';
import { TokenService } from './token-service';
import { AuthResponse, RegisterRequest, UserCredentials } from './auth-model';
@Injectable()
export class AuthService {
    private _authenticated: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _tokenService: TokenService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for access token
     */
    get accessToken(): string | null {
        return this._tokenService.accessToken;
    }

    /**
     * Getter for refresh token
     */
    get refreshToken(): string | null {
        return this._tokenService.refreshToken;
    }

    /**
     * Setter for access token
     */
    set accessToken(token: string | null) {
        this._tokenService.accessToken = token;
    }

    /**
     * Setter for refresh token
     */
    set refreshToken(token: string | null) {
        this._tokenService.refreshToken = token;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any> {
        return this._httpClient.post(`${environment.apiUrl}/auth/forgot-password`, email);
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string): Observable<any> {
        return this._httpClient.post(`${environment.apiUrl}/auth/reset-password`, password);
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: UserCredentials): Observable<any> {
        // Throw error, if the user is already logged in
        if (this._authenticated) {
            return throwError(() => 'User is already logged in.');
        }

        return this._httpClient.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
            switchMap((response: AuthResponse) => {
                // Store the access token in the local storage
                this.accessToken = response.accessToken;
                this.refreshToken = response.refreshToken;

                // Set the authenticated flag to true
                this._authenticated = true;

                return of(response);
            }),
            catchError((error) => {
                console.error('Error logging in:', error);
                return throwError(() => error);
            })
        );
    }

    /**
     * Sign up
     *
     * @param user
     */
    signUp(registerRequest: RegisterRequest): Observable<AuthResponse> {
        return this._httpClient.post<AuthResponse>(`${environment.apiUrl}/auth/register`, registerRequest);
    }

    /**
     * Sign out
     */
    signOut(): Observable<boolean> {
        // Clear the tokens
        this._tokenService.clearTokens();

        // Set the authenticated flag to false
        this._authenticated = false;

        // Return the observable
        return of(true);
    }

    unlockSession(credentials: { email: string; password: string }): Observable<any> {
        return this._httpClient.post(`${environment.apiUrl}/auth/unlock-session`, credentials);
    }

    check(): Observable<boolean> {
        // Check if the user is logged in
        if (this._authenticated) {
            return of(true);
        }

        // Check the access token availability
        if (!this.accessToken) {
            return of(false);
        }

        // Check the access token expire date
        if (AuthUtils.isTokenExpired(this.accessToken)) {
            return of(false);
        }

        // If the access token exists and it didn't expire, sign in using it
        return this.signInUsingToken();
    }

    /**
     * Sign in using the refresh token
     */
    private signInUsingToken(): Observable<boolean> {
        // Sign in using the token
        return this._httpClient.post<AuthResponse>(
            `${environment.apiUrl}/auth/refresh`,
            {
                refreshToken: this.refreshToken
            },
        ).pipe(
            switchMap((response: AuthResponse) => {
                // Store the access token in the local storage
                this.accessToken = response.accessToken;
                this.refreshToken = response.refreshToken;

                // Set the authenticated flag to true
                this._authenticated = true;

                // Return true
                return of(true);
            }),
            catchError((error) => {
                console.error('Error refreshing token:', error);
                this.signOut();
                return of(false);
            })
        );
    }
}