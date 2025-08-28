import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class SessionService {

    private _logoutMessage = new BehaviorSubject<string | null>(null);

    get logoutMessage$(): Observable<string | null> {
        return this._logoutMessage.asObservable();
    }

    notifyLogout(message: string) {
        this._logoutMessage.next(message);
    }

    clearMessage() {
        this._logoutMessage.next(null);
    }
}