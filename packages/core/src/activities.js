export const activityTypes = [
  {
    id: 'gym',
    name: 'Gym / strength',
    icon: 'Strength',
    levels: [
      ['Light', 3.0, 'Bodyweight & light resistance'],
      ['Moderate', 3.5, 'General weight training'],
      ['Hard', 6.0, 'Vigorous weight training'],
    ],
    source: 'https://pacompendium.com/conditioning-exercise/',
  },
  {
    id: 'bike',
    name: 'Cycling',
    icon: 'Bike',
    levels: [
      ['Light', 4.0, 'Easy stationary cycling'],
      ['Moderate', 6.0, 'Steady stationary cycling'],
      ['Hard', 8.0, 'High-resistance cycling'],
    ],
    source: 'https://pacompendium.com/bicycling/',
  },
  {
    id: 'treadmill',
    name: 'Treadmill',
    icon: 'Treadmill',
    levels: [
      ['Light', 3.0, 'Easy walk · 3.2–3.9 km/h'],
      ['Moderate', 4.8, 'Brisk walk · 5.6–6.3 km/h'],
      ['Hard', 8.3, 'Very fast walk · 8.0–8.9 km/h'],
    ],
    source: 'https://pacompendium.com/walking/',
  },
  {
    id: 'elliptical',
    name: 'Elliptical',
    icon: 'Elliptical',
    levels: [
      ['Moderate', 5.0, 'Steady, moderate effort'],
      ['Hard', 9.0, 'Vigorous effort'],
    ],
    source: 'https://pacompendium.com/conditioning-exercise/',
  },
  {
    id: 'running',
    name: 'Running',
    icon: 'Running',
    levels: [
      ['Light', 6.5, 'Easy run · 6.4–6.8 km/h'],
      ['Moderate', 8.5, 'Steady run · 8.0–8.4 km/h'],
      ['Hard', 10.5, 'Fast run · 10.8 km/h'],
    ],
    source: 'https://pacompendium.com/running/',
  },
  {
    id: 'padel',
    name: 'Padel',
    icon: 'Padel',
    levels: [
      ['Light', 4.5, 'Relaxed rallies & frequent breaks'],
      ['Moderate', 6.0, 'Steady match play'],
      ['Hard', 8.0, 'Fast, competitive rallies'],
    ],
    source: 'https://pacompendium.com/sports/',
    proxy: true,
  },
];
export function estimateActivity(met, kg, minutes) {
  return Math.round(((met * 3.5 * kg) / 200) * minutes);
}
