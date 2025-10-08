import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BasicHeaderComponent } from './shared/components/basic-header/basic-header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { RegisterComponent } from './pages/register/register.component';
import { ReactiveFormsModule } from "@angular/forms";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { SpinnerComponent } from './shared/components/spinner/spinner.component';
import { AccountActivationComponent } from './pages/account-activation/account-activation.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { LoginComponent } from './pages/login/login.component';
import { AuthInterceptor } from './shared/interceptor/auth.interceptor';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { FormatCurrencyPipe } from './shared/pipe/format-currency.pipe';
import { UserLayoutComponent } from './layouts/user-layout/user-layout.component';
import { BikeComponent } from './pages/bike/bike.component';
import { BikeAddModalComponent } from './pages/bike/modals/bike-add-modal/bike-add-modal.component';
import { BikeDeleteModalComponent } from './pages/bike/modals/bike-delete-modal/bike-delete-modal.component';
import { BikeEditModalComponent } from './pages/bike/modals/bike-edit-modal/bike-edit-modal.component';
import { RepairComponent } from './pages/repair/repair.component';
import { registerLocaleData } from '@angular/common';
import localePl from '@angular/common/locales/pl';
import { RepairAddModalComponent } from './pages/repair/modals/repair-add-modal/repair-add-modal.component';
import { RepairEditModalComponent } from './pages/repair/modals/repair-edit-modal/repair-edit-modal.component';
import { RepairDeleteModalComponent } from './pages/repair/modals/repair-delete-modal/repair-delete-modal.component';
import { RepairDetailsModalComponent } from './pages/repair/modals/repair-details-modal/repair-details-modal.component';
import { EmptyToNullDirective } from './shared/directives/empty-to-null.directive';
import { BikeDetailsComponent } from './pages/bike/bike-details/bike-details.component';
import { ToastComponent } from './shared/components/toast/toast.component';

registerLocaleData(localePl);

@NgModule({
  declarations: [
    AppComponent,
    BasicHeaderComponent,
    FooterComponent,
    NotFoundComponent,
    RegisterComponent,
    SpinnerComponent,
    AccountActivationComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    LoginComponent,
    LandingPageComponent,
    DashboardComponent,
    FormatCurrencyPipe,
    UserLayoutComponent,
    BikeComponent,
    BikeAddModalComponent,
    BikeDeleteModalComponent,
    BikeEditModalComponent,
    RepairComponent,
    RepairAddModalComponent,
    RepairEditModalComponent,
    RepairDeleteModalComponent,
    RepairDetailsModalComponent,
    EmptyToNullDirective,
    BikeDetailsComponent,
    ToastComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: LOCALE_ID, useValue: 'pl' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }