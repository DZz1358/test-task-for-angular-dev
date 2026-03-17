import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { BlockBuilderComponent } from '@ng-x-rocket/block-builder';
import { WeatherStateService } from '@ng-x-rocket/weather/state';

@Component({
  selector: 'app-weather-ui',
  imports: [CommonModule, MatButtonModule, MatCardModule, BlockBuilderComponent],
  templateUrl: './weather-ui.component.html',
  styleUrl: './weather-ui.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeatherUiComponent implements OnInit {
  readonly weatherState = inject(WeatherStateService);

  ngOnInit(): void {
    if (this.weatherState.status() === 'idle') {
      this.weatherState.load();
    }
  }

  refresh(): void {
    this.weatherState.refresh();
  }
}
