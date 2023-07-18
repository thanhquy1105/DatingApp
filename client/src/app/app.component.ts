import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { User } from './_models/user';
import { AccountService } from './_services/account.service';
import { PresenceService } from './_services/presence.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'The Dating App';
  users: any;

  constructor(
    private accountService: AccountService,
    private presense: PresenceService
  ) {}

  ngOnInit(): void {
    this.setCurrentUser();
  }

  setCurrentUser() {
    let user: any = localStorage.getItem('user');
    if (user != null) {
      user = JSON.parse(user);
      this.accountService.setCurrentUser(user as User);
      this.presense.createHubConnection(user as User);
    }
  }
}
