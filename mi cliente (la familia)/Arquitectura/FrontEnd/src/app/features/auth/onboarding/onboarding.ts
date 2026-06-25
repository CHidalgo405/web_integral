import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="onboarding-container">
      
      <!-- Mobile View -->
      <div class="mobile-view">
        <div class="mobile-image-section">
          <img src="/assets/images/onboarding.png" alt="Fresh Produce" />
          <div class="image-overlay"></div>
        </div>
        <div class="mobile-content-card">
          <div class="drag-indicator"></div>
          <h1>¡Hola,<br>Familia!</h1>
          <p>Llevamos lo mejor del campo a la mesa de tu hogar con calidez y cercanía.</p>
          <a routerLink="/auth/login" class="btn-primary wide-btn">SIGUIENTE</a>
        </div>
      </div>

      <!-- Desktop View -->
      <div class="desktop-view">
        <div class="desktop-left">
          <img src="/assets/images/onboarding.png" alt="Fresh Produce" class="desktop-img" />
        </div>
        <div class="desktop-right">
          <div class="desktop-content">
            <h1>Tu tienda de<br>barrio con<br>alma.</h1>
            <p>Descubre productos frescos, naturales<br>y de calidad accesible para toda tu<br>familia.</p>
            <a routerLink="/auth/login" class="btn-primary">COMENZAR</a>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .onboarding-container {
      width: 100%;
      min-height: 100dvh;
      background-color: var(--bg);
    }

    /* Mobile Styles */
    .mobile-view {
      display: flex;
      flex-direction: column;
      min-height: 100dvh;
      background-color: var(--primary);
      position: relative;
    }
    
    .mobile-image-section {
      height: 60vh;
      width: 100%;
      position: relative;
    }

    .mobile-image-section img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .image-overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(to bottom, rgba(0,0,0,0) 40%, rgba(28,84,66,0.9) 100%);
    }

    .mobile-content-card {
      flex: 1;
      background-color: var(--surface);
      border-radius: 40px 40px 0 0;
      margin-top: -60px;
      position: relative;
      z-index: 10;
      padding: 32px 24px 40px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      box-shadow: 0 -10px 30px rgba(0,0,0,0.15);
    }

    .drag-indicator {
      width: 40px;
      height: 6px;
      background-color: #E0E0E0;
      border-radius: 3px;
      margin-bottom: 24px;
    }

    .mobile-content-card h1 {
      font-family: var(--font-heading);
      font-size: 2.8rem;
      font-weight: 800;
      color: var(--primary);
      margin: 0 0 16px;
      line-height: 1.1;
    }

    .mobile-content-card p {
      font-family: var(--font-body);
      font-size: 1.05rem;
      color: var(--text-secondary);
      margin: 0 0 40px;
      line-height: 1.5;
      padding: 0 16px;
    }

    .btn-primary {
      display: inline-block;
      padding: 16px 48px;
      background-color: var(--secondary);
      color: #fff;
      font-family: var(--font-body);
      font-weight: 800;
      font-size: 0.95rem;
      text-decoration: none;
      border-radius: 9999px;
      transition: background 0.2s, transform 0.2s;
    }

    .btn-primary:hover {
      background-color: var(--secondary-dark);
      transform: translateY(-2px);
    }

    .wide-btn {
      width: 100%;
      padding: 18px;
      font-size: 1rem;
      margin-top: auto;
    }

    /* Desktop Styles */
    .desktop-view {
      display: none;
    }

    /* Media Queries */
    @media (min-width: 768px) {
      .mobile-view {
        display: none;
      }
      
      .desktop-view {
        display: flex;
        min-height: 100vh;
      }

      .desktop-left {
        flex: 1;
        background-color: var(--primary);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px;
      }

      .desktop-img {
        width: 100%;
        max-width: 500px;
        height: auto;
        aspect-ratio: 4/3;
        object-fit: cover;
        border-radius: 24px;
        box-shadow: 0 12px 32px rgba(0,0,0,0.2);
      }

      .desktop-right {
        flex: 1;
        background-color: var(--surface);
        display: flex;
        align-items: center;
        justify-content: flex-start;
        padding: 40px 80px;
      }

      .desktop-content {
        max-width: 480px;
      }

      .desktop-content h1 {
        font-family: var(--font-heading);
        font-size: 4rem;
        font-weight: 800;
        color: var(--primary);
        margin: 0 0 24px;
        line-height: 1.1;
      }

      .desktop-content p {
        font-family: var(--font-body);
        font-size: 1.1rem;
        color: var(--text-secondary);
        margin: 0 0 40px;
        line-height: 1.6;
      }

      .desktop-content .btn-primary {
        margin-top: 0;
      }
    }
  `]
})
export class Onboarding {}
