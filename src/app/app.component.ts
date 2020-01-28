import { Component, OnInit, OnChanges } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnChanges {
  ngOnChanges(changes: import("@angular/core").SimpleChanges): void {
    if (sessionStorage.getItem('user') != null)
      this.isLoggedIn = true;
  }
  
  ngOnInit(): void {
    if (sessionStorage.getItem('user') != null)
      this.isLoggedIn = true;
  }
  title = 'fido';

  isLoggedIn = false;
  constructor() { }


  handleLogout() {
    sessionStorage.removeItem('user');
  }
}
