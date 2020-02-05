/// <reference types="@types/webappsec-credential-management" />
import { Component, OnInit } from '@angular/core';
import { User } from '../interface/user';
import { MockServerService } from '../service/mock-server.service';
import { WebAuthnService } from '../service/web-authn.service';
import { Router } from "@angular/router"

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  username = '';
  users: User[];
  constructor(private mockserver: MockServerService, private webAuth: WebAuthnService, private router: Router) { }
  webAuthnAvailable = navigator.credentials && navigator.credentials.create;

  ngOnInit() {
  }

  register() {

    console.log("register : ", this.username);
    const id = '' + Math.floor(Math.random() * 10000000);
    const user: User = {
      id: id,
      username: this.username,
      credentials: []
    };

    if (this.webAuthnAvailable) {
      this.mockserver.getUser(user).subscribe(userDB => {
        if (userDB == null) {
          const options = this.webAuth.registerOptions(user);
          this.webAuth.register(options)
            .then((credential: PublicKeyCredential) => {
              console.log('Register credential response : ', credential);
              const userx = this.mockserver.registerCredential(user, credential, options);
              this.mockserver.registerUser(userx).subscribe(
                user => {
                  console.log("Response : ", user);
                  this.router.navigate(['/login']);
                },
                err => {
                  console.log("Error : ", err);
                });
            })
            .catch((error) => {
              console.log('Error occured', error);
            });
        } else {
          alert('Username "' + user.username + '" is taken, please choose another.');
          this.username = '';
        }
      });
    }
  }
}
