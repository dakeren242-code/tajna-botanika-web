# Performance Optimization System

Tento projekt obsahuje inteligentní systém pro automatickou optimalizaci výkonu založenou na měření FPS (snímků za sekundu).

## Jak to funguje

Systém automaticky měří FPS každou sekundu a na základě výsledků přizpůsobuje vizuální efekty:

### Úrovně výkonu

- **Vysoký** (≥50 FPS): Všechny efekty zapnuté
  - 50 částic v pozadí
  - Stíny a glow efekty
  - Vlastní kurzor s trailem
  - Animované vozíky a UFO

- **Střední** (35-49 FPS): Snížené efekty
  - 30 částic v pozadí
  - Zachované stíny
  - Všechny animace funkční

- **Nízký** (20-34 FPS): Minimální efekty
  - 15 částic v pozadí
  - Vypnuté stíny
  - Vypnutý vlastní kurzor
  - Animace stále aktivní

- **Ultra nízký** (<20 FPS): Maximální úspora
  - Žádné částice
  - Žádné stíny
  - Žádné animace
  - Pouze základní obsah

## Použití

### Automatický režim (výchozí)

Systém automaticky přizpůsobuje výkon podle měření FPS.

### Ruční režim

V headeru klikněte na ikonu tachometru (Gauge) a vyberte:
1. "Ručně" pro manuální ovládání
2. Zvolte požadovanou úroveň výkonu

## Implementace

### Komponenty

- `usePerformanceMonitor` - Hook pro měření FPS
- `PerformanceContext` - Globální context pro sdílení nastavení
- Optimalizované komponenty:
  - `ParticleBackground` - Adaptivní počet částic
  - `CustomCursor` - Vypíná se při nízkém výkonu
  - `MovingCarts` - Podmíněné vykreslování
  - `FlyingUFOs` - Podmíněné vykreslování

### Použití v komponentě

```tsx
import { usePerformance } from '../contexts/PerformanceContext';

function MyComponent() {
  const { particleCount, enableShadows, enableAnimations } = usePerformance();

  if (!enableAnimations) {
    return null;
  }

  // Použij particleCount a enableShadows pro vykreslování
}
```

## Konfigurace

Nastavení se ukládá do localStorage:
- `performanceMode`: 'auto' nebo 'manual'
- `performanceLevel`: 'high', 'medium', 'low', nebo 'potato'
