import { Component } from '@angular/core';
import {  Navbar } from '../home-navbar/home-navbar';
import { HeroSection } from '../hero-section/hero-section';
import { FeaturesSection } from "../features-section/features-section";
import { AboutSection } from "../about-section/about-section";

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [Navbar, HeroSection, FeaturesSection, AboutSection],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css'
})
export class HomePage {
  heroActive = true;
}
