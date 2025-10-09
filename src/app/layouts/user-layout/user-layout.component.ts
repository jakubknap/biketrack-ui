import { Component } from "@angular/core";
import { LogoutService } from "src/app/shared/services/logout.servicet";

@Component({
  selector: 'app-user-layout',
  templateUrl: './user-layout.component.html'
})
export class UserLayoutComponent {

  sidebarOpen = false;

  constructor(private logoutService: LogoutService) { }

  logout() {
    this.logoutService.logout();
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    if (this.sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeSidebar() {
    this.sidebarOpen = false;
    document.body.style.overflow = '';
  }

  menuItems = [
    { label: 'Przegląd', link: '/dashboard' },
    { label: 'Rowery', link: '/bikes' },
    { label: 'Naprawy', link: '/repairs' },
    { label: 'Statystyki', link: '/statistics' },
    { label: 'Profil', link: '/profile' }
  ];
}