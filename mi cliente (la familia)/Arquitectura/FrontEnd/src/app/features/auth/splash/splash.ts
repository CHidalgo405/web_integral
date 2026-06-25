import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="splash-screen" id="splash-screen">
      <div class="splash-content">
        <div class="splash-logo" style="color: #fff;"><app-icon name="store" size="64" /></div>
        <h1 class="splash-title">La Familia</h1>
        <p class="splash-tagline">Tu tiendita de confianza</p>
        <div class="splash-loader">
          <div class="loader-bar"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .splash-screen {
      min-height: 100dvh; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
    }
    .splash-content { text-align: center; animation: fadeInUp 0.8s ease; }
    .splash-logo { margin-bottom: 16px; animation: bounce 2s infinite; display: inline-block; }
    .splash-title { font-size: 2.2rem; font-weight: 800; color: #fff; margin: 0 0 8px; }
    .splash-tagline { font-size: 1rem; color: rgba(255,255,255,0.8); margin: 0 0 40px; }
    .splash-loader { width: 120px; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px; margin: 0 auto; overflow: hidden; }
    .loader-bar { width: 40%; height: 100%; background: #fff; border-radius: 2px; animation: loading 1.5s ease infinite; }
    @keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(350%); } }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
  `],
})
export class Splash implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
    setTimeout(() => this.router.navigate(['/auth/login']), 2500);
  }
}
