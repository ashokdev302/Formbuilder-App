import { Component } from '@angular/core';
import { RightPaneComponent } from '../right-pane/right-pane.component';
import { MiddlePaneComponent } from '../middle-pane/middle-pane.component';
import { LeftPaneComponent } from '../left-pane/left-pane.component';
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RightPaneComponent, MiddlePaneComponent, LeftPaneComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {

}
