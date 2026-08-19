import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class TokenService {
    private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    private _accessToken: string | null = null;
    private _refreshToken: string | null = null;

    /**
     * Constructor
     */
    constructor() {
        this._accessToken = this.isBrowser ? localStorage.getItem('accessToken') : null;
        this._refreshToken = this.isBrowser ? localStorage.getItem('refreshToken') : null;
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
        if (!this.isBrowser) return;

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
        if (!this.isBrowser) return;

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