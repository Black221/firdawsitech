import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class TokenService {
    private _accessToken: string | null = null;
    private _refreshToken: string | null = null;

    /**
     * Constructor
     */
    constructor() {
        this._accessToken = localStorage.getItem('accessToken');
        this._refreshToken = localStorage.getItem('refreshToken');
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter & Setter for access token
     */
    get accessToken(): string | null {
        return this._accessToken;
    }

    set accessToken(token: string | null) {
        this._accessToken = token;
        
        if (token) {
            localStorage.setItem('accessToken', token);
        } else {
            localStorage.removeItem('accessToken');
        }
    }

    /**
     * Getter & Setter for refresh token
     */
    get refreshToken(): string | null {
        return this._refreshToken;
    }

    set refreshToken(token: string | null) {
        this._refreshToken = token;
        
        if (token) {
            localStorage.setItem('refreshToken', token);
        } else {
            localStorage.removeItem('refreshToken');
        }
    }

    /**
     * Clear tokens
     */
    clearTokens(): void {
        this.accessToken = null;
        this.refreshToken = null;
    }
}