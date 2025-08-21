import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from "./pages/register/register.component";
import { NotFoundComponent } from "./pages/not-found/not-found.component";
import { AccountActivationComponent } from './pages/account-activation/account-activation.component';

const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'active-account/:token', component: AccountActivationComponent },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
