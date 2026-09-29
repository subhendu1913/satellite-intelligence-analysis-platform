import type { Analysis, Change } from './types';
export const emergencyMissions: Record<string, string> = { Flood: 'Flood Analysis', Cyclone: 'Cyclone Impact Assessment', Landslide: 'Landslide Assessment', Wildfire: 'Wildfire Monitoring', Earthquake: 'Earthquake Impact', 'Severe Storm': 'Severe Storm Assessment' };
export const categoryMissions: Record<string, string> = { Flooding: 'Flood Analysis', 'Urban expansion': 'Urban Expansion Analysis', Construction: 'Construction Monitoring', 'Road development': 'Road Development Analysis', Deforestation: 'Deforestation Analysis', 'Vegetation change': 'Vegetation Monitoring', 'Water-body change': 'Water-body Change', 'Infrastructure damage': 'Infrastructure Change', 'Agricultural/land-use change': 'Agricultural Land-use Change' };
const colors: Record<string, string> = { flood: '#3478ef', damage: '#7893b4', vegetation: '#258567', forest: '#3478ef', urban: '#507db4', construction: '#7893b4', road: '#5c7697', water: '#3478ef', agriculture: '#507db4' };
export function presentChange(change: Change): Change { return { ...change, color: colors[change.id] ?? '#3478ef' }; }
export function presentAnalysis(analysis: Analysis): Analysis { return { ...analysis, changes: analysis.changes.map(presentChange) }; }
export function missionRoute(mission: string) { return Object.values(emergencyMissions).includes(mission) ? '/emergency' : '/temporal'; }
export function datesForScene(scene: { stage: string; date: string }) {
 const offset=(days:number)=>new Date(Date.parse(scene.date)+days*86400000).toISOString().slice(0,10);
 return scene.stage==='before'?{before:scene.date,during:offset(17),after:offset(24)}:scene.stage==='after'?{before:offset(-24),during:offset(-7),after:scene.date}:{before:offset(-17),during:scene.date,after:offset(7)};
}
