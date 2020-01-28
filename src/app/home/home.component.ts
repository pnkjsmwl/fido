import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../service/user.service';
import { User } from '../interface/user';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private userservice: UserService, private router: Router) { }
  name = sessionStorage.getItem('user');

  ngOnInit() {

  }

  deleteAccount() {
    console.log('Remove account');
    let user: User = {
      username: this.name,
      credentials: []
    }
    this.userservice.removeUser(user).subscribe(resp => {
      this.router.navigate(['/register']);
    })

  }
}
