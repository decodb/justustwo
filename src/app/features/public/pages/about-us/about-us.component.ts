import { Component } from '@angular/core';

@Component({
  selector: 'app-about-us',
  imports: [],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.scss'
})
export class AboutUsComponent {
  readonly cycle = 14; // seconds for one full chase (eat hearts, then turn the tables)
  readonly letters = 'coming soon'.split('');

  // Where each heart sits along the track (%). The delay makes each one vanish
  // exactly when Pac-Man's mouth reaches it.
  readonly pellets = [10, 21, 32, 43, 54, 65, 76, 90].map((x) => ({
    x,
    power: x === 90, // the big yellow heart
    delay: ((x + 14) / 128) * (this.cycle * 0.44) - this.cycle * 0.055,
  }));
}
