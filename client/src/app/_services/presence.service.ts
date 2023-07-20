import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { User } from '../_models/user';
import { BehaviorSubject, take } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class PresenceService {
  hubUrl = environment.hubUrl;
  private hubConnection: HubConnection | undefined;
  private onlineUsersSource = new BehaviorSubject<string[]>([]);
  onlineUsers$ = this.onlineUsersSource.asObservable();

  constructor(private toastr: ToastrService, private router: Router) {}

  createHubConnection(user: User | null) {
    if (user) {
      this.hubConnection = new HubConnectionBuilder()
        .withUrl(this.hubUrl + 'presence', {
          accessTokenFactory: () => user.token,
        })
        .withAutomaticReconnect()
        .build();

      this.hubConnection.start().catch((error) => console.log(error));

      this.hubConnection.on('UserIsOnline', (username) => {
        this.onlineUsers$.pipe(take(1)).subscribe({
          next: (usernames) =>
            this.onlineUsersSource.next([...usernames, username]),
        });
      });

      this.hubConnection.on('UserIsOffline', (username) => {
        this.onlineUsers$.pipe(take(1)).subscribe({
          next: (usernames) =>
            this.onlineUsersSource.next([
              ...usernames.filter((x) => x !== username),
            ]),
        });
      });

      this.hubConnection.on('NewMessageReceived', ({ username, knownAs }) => {
        this.toastr
          .info(knownAs + ' has sent you a new message')
          .onTap.pipe(take(1))
          .subscribe({
            next: () =>
              this.router.navigateByUrl('/members/' + username + '?tab=3'),
          });
      });
    }

    this.hubConnection?.on('GetOnlineUsers', (usernames: string[]) => {
      this.onlineUsersSource.next(usernames);
    });
  }

  stopHubConnection() {
    this.hubConnection?.stop().catch((error) => console.log(error));
  }
}
