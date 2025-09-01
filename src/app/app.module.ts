import { NgModule } from '@angular/core';
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
    UserLayoutComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
