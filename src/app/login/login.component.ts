import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MockServerService } from '../service/mock-server.service';
import { WebAuthnService } from '../service/web-authn.service';
import { User } from '../interface/user';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  username = '';

  constructor(private mockserver: MockServerService, private webAuth: WebAuthnService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.route
      .queryParams
      .subscribe(params => {
        console.log(params.name);
        this.username = params.name;
      });
  }

  login() {
    console.log("login...", this.username);
    let user: User = {
      username: this.username,
      credentials: []
    }
    this.mockserver.getUser(user).subscribe(user => {
      console.log('user : ', user);
      this.webAuth.webAuthn_login(user)
        .then((resp) => {
          sessionStorage.setItem('user', this.username);
          alert('Authentication went fine !!');
          this.router.navigate(['/home']);
        })
        .catch((error) => {
          alert('Invalid credentials !!');
          console.log('Error occured in authentication !!');
        });
    });
  }
}
