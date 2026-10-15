import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DoodleWall } from './components/doodle-wall/doodle-wall';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DoodleWall],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<app-doodle-wall /><router-outlet />',
})
export class App {}
