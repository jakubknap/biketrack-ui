import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from "./pages/register/register.component";
import { NotFoundComponent } from "./pages/not-found/not-found.component";
import { AccountActivationComponent } from './pages/account-activation/account-activation.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { LoginComponent } from './pages/login/login.component';
import { noAuthGuard } from './shared/guard/no-auth.guard';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { authGuard } from './shared/guard/auth.guard';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

const routes: Routes = [
  { path: '', component: LandingPageComponent, canActivate: [noAuthGuard] },
  { path: 'login', component: LoginComponent, canActivate: [noAuthGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [noAuthGuard] },
  { path: 'active-account/:token', component: AccountActivationComponent, canActivate: [noAuthGuard] },
  { path: 'reset-password', component: ForgotPasswordComponent, canActivate: [noAuthGuard] },
  { path: 'reset-password/:token', component: ResetPasswordComponent, canActivate: [noAuthGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }