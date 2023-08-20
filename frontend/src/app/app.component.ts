import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { TestService } from './services/test.service';
import { Test } from './interfaces/test';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'frontend';

  testValue: Observable<Test> = this.service.getTest();

  constructor(private service: TestService) {}
}
