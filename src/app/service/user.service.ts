import { Injectable } from '@angular/core';
import { User } from '../interface/user';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  POST_URL = 'https://w1j47wjia9.execute-api.us-east-1.amazonaws.com/dev/fido';

  constructor(private http: HttpClient) { }

  registerUser(user: User): Observable<User> {
    console.log('User to lambda :=> ', JSON.stringify(user));
    let headers = { 'Action': 'Register' };
    return this.http.post<User>(this.POST_URL, user, { headers });
  }

  getUser(user: User): Observable<User> {
    console.log('Username to lambda :=> ', user.username);
    let headers = { 'Action': 'Get' };
    return this.http.post<User>(this.POST_URL, user, { headers });
  }

  removeUser(user: User): Observable<User> {
    console.log('Username to lambda :=> ', user.username);
    let headers = { 'Action': 'Delete' };
    return this.http.post<User>(this.POST_URL, user, { headers });
  }

}
