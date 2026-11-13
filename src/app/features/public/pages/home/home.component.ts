import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

interface FolderLink {
  label: string;
  route: string;
  icon: 'gallery' | 'lock' | 'mystery';
  color: 'mint' | 'pink' | 'yellow';
}

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  readonly introMs = 2800;
  readonly loading = signal(true);
  private timer?: ReturnType<typeof setTimeout>;
 
  // Order matters: left, centre (sits lowest = the point of the V), right
  readonly folders: FolderLink[] = [
    { label: '/our_gallery', route: '/mini-gallery', icon: 'gallery', color: 'mint' },
    { label: '/sign_in', route: '/sign-in', icon: 'lock', color: 'pink' },
    { label: '/?????', route: '/coming-soon', icon: 'mystery', color: 'yellow' },
  ];
 
  ngOnInit(): void {
    this.timer = setTimeout(() => this.skipIntro(), this.introMs);
  }
 
  skipIntro(): void {
    clearTimeout(this.timer);
    this.loading.set(false);
  }
 
  replayIntro(): void {
    clearTimeout(this.timer);
    this.loading.set(true);
    this.timer = setTimeout(() => this.skipIntro(), this.introMs);
  }
 
  ngOnDestroy(): void {
    clearTimeout(this.timer);
  }
}
