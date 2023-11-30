import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersListedComponent } from './users-listed.component';
import { beforeEach } from 'node:test';

describe('UsersListedComponent', () => {
  let component: UsersListedComponent;
  let fixture: ComponentFixture<UsersListedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UsersListedComponent]
    });
    fixture = TestBed.createComponent(UsersListedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
