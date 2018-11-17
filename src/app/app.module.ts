import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

// Components
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

// Pages
import { DashboardComponent } from './dashboard/dashboard.component';
import { HomeComponent } from './dashboard/home/home.component';

// Services
import { PerceptronService } from './services/perceptron.service';

// Modules
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { PrismModule } from '@ngx-prism/core';

import { AppComponent } from './app.component';

@NgModule({
    declarations: [
        AppComponent,
		HomeComponent,
		HeaderComponent,
		FooterComponent,
        DashboardComponent
    ],
    imports: [
		AppRoutingModule,
        BrowserModule,
        FormsModule,
        PrismModule,

		ScrollToModule.forRoot()
    ],
	providers: [
		PerceptronService
	],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule { }
