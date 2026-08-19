import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { AuthUtils } from './auth-utils';
import { TokenService } from './token-service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor
{
    /**
     * Constructor
     */
    constructor(
        private _tokenService: TokenService
    ) { }

    /**
     * Intercept
     *
     * @param req
     * @param next
     */
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Clone the request object
        let newReq = req.clone();

        // Get the access token
        const accessToken = this._tokenService.accessToken;

        // If the access token exists and is not expired, add it to the request
        if (accessToken && !AuthUtils.isTokenExpired(accessToken)) {
            newReq = req.clone({
                headers: req.headers.set('Authorization', `Bearer ${accessToken}`)
            });
        }

        // Response
        return next.handle(newReq).pipe(
            catchError((error) => {
                // Catch "401 Unauthorized" responses
                if (error instanceof HttpErrorResponse && error.status === 401) {
                    // Clear the tokens
                    this._tokenService.clearTokens();
                }

                return throwError(() => error);
            })
        );
    }
}