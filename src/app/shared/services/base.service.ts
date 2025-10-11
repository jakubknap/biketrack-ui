import { HttpErrorResponse } from "@angular/common/http";
import { throwError } from "rxjs";
import { environment } from "../../../environments/environment";

export abstract class BaseService {

    protected baseUrl = environment.apiUrl;

    protected handleError(error: HttpErrorResponse) {
        return throwError(() => error.error);
    }
}