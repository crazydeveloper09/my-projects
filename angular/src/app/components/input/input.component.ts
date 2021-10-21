import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Task } from 'src/app/Task';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css']
})
export class InputComponent implements OnInit {
  title: String;
  @Output() onAddTask: EventEmitter<Task> = new EventEmitter();
  constructor() { }

  ngOnInit(): void {
  }
  onSubmit() {
    if(!this.title){
      alert("Please add task title");
      return;
    }
    const newTask = {
      title: this.title
    }
    this.onAddTask.emit(newTask);

    this.title = '';
  }
}
