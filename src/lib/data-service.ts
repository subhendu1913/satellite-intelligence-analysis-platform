import organizations from '@/data/organizations.json';
import locations from '@/data/locations.json';
import scenes from '@/data/satelliteScenes.json';
import rawAnalyses from '@/data/analyses.json';
import rawChanges from '@/data/changes.json';
import emergencies from '@/data/emergencies.json';
import rawReports from '@/data/reports.json';
import type { Analysis, AnalysisRequest, Catalog, Change, Report, SearchFilters } from './types';

const changes = rawChanges as Change[];
export const interpretationNotice = 'AI-assisted interpretation — verify with authoritative sources before operational decisions.';
export function insightFor(a: Pick<Analysis, 'category' | 'area' | 'percentage' | 'confidence' | 'locationId' | 'emergency'>) {
 const place = locations.find(l => l.id === a.locationId);
 return `The prototype comparison indicates ${a.area} km² of ${a.category.toLowerCase()} in the ${place?.name ?? 'selected'} area, representing a ${a.percentage}% change within the demonstration area of interest. The simulated classification confidence is ${a.confidence}%. ${a.emergency ? 'Changes are concentrated near exposed low-lying land and infrastructure. Prioritize independent verification of road access and settlement exposure; these observations do not establish structural damage or predict future hazards.' : 'The illustrated spatial pattern suggests a land-cover transition. Seasonal effects, scene registration, cloud cover, and other explanations must be evaluated before attributing a cause.'} All statistics and dated scenes are synthetic; the basemap is illustrative and is not multi-date evidence.`;
}
function changeSet(category: string, emergency: boolean): Change[] {
 const primary = changes.find(c => c.category === category) ?? changes[0];
 return [primary, ...changes.filter(c => c.id !== primary.id && (emergency ? ['damage', 'vegetation'].includes(c.id) : ['vegetation', 'road'].includes(c.id)))].slice(0, 3);
}
const analyses: Analysis[] = rawAnalyses.map(a => ({ ...a, changes: changeSet(a.category, a.emergency), insight: insightFor(a) }));
const reports: Report[] = rawReports.map(r => ({ ...r, analysis: analyses.find(a => a.id === r.analysisId)! }));
export function getCatalog(): Catalog { return { organizations, locations, scenes, analyses, changes, emergencies, reports }; }

const stopWords = new Set(['show','find','the','in','this','near','me','a','an','of','and','analyse','analyze','changes','change','region','here','impact']);
export function searchScenes(query: string, filters: Partial<SearchFilters> = {}) {
 const words = query.toLowerCase().replace(/[^a-z0-9\s-]/g, '').split(/\s+/).filter(w => w && !stopWords.has(w));
 return scenes.filter(s => {
  const location = locations.find(l => l.id === s.locationId)!;
  return (!filters.location || filters.location === s.locationId) && (!filters.source || filters.source === s.source) && (!filters.category || filters.category === s.category) && (!filters.landType || filters.landType === location.landType) && (!filters.from || s.date >= filters.from) && (!filters.to || s.date <= filters.to) && s.cloud <= (filters.cloud ?? 100);
 }).map(s => {
  const location = locations.find(l => l.id === s.locationId)!;
  const searchable = [...s.tags, s.title, s.description, s.category, location.name, location.region, location.country].join(' ').toLowerCase();
  const matches = words.filter(w => searchable.includes(w) || (w === 'flooding' && searchable.includes('flood'))).length;
  return { ...s, relevance: words.length ? Math.min(99, 75 + Math.round((matches / words.length) * 24)) : s.relevance, matches };
 }).filter(s => !words.length || s.matches > 0).sort((a,b) => b.relevance-a.relevance);
}
export function validateAnalysis(input: AnalysisRequest) {
 if (!input || typeof input !== 'object') throw new Error('Analysis configuration is required.');
 const org = organizations.find(o => o.id === input.organizationId);
 if (!org || !org.missions.includes(input.mission)) throw new Error('Select a valid organization and mission.');
 if (!locations.some(l => l.id === input.locationId)) throw new Error('Select a location from the catalog.');
 if (![input.before,input.during,input.after].every(d => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) && Number.isFinite(Date.parse(d)))) throw new Error('Choose three valid observation dates.');
 if (!(input.before < input.during && input.during < input.after)) throw new Error('Dates must be ordered: before, during, then after.');
 if (input.aoi && (!Array.isArray(input.aoi) || input.aoi.length !== 2 || !input.aoi.every(p => Array.isArray(p) && p.length === 2 && p.every(Number.isFinite)))) throw new Error('The selected area is invalid.');
}
export function runDemoAnalysis(input: AnalysisRequest): Analysis {
 validateAnalysis(input);
 const mission = input.mission.toLowerCase();
 const emergency = emergencies.find(e => e.type === input.event) ?? emergencies[0];
 const category = input.emergency ? (['Flood','Cyclone','Severe Storm'].includes(input.event) ? 'Flooding' : input.event === 'Earthquake' ? 'Infrastructure damage' : 'Vegetation change') : mission.includes('deforest') ? 'Deforestation' : mission.includes('road') ? 'Road development' : mission.includes('urban') ? 'Urban expansion' : mission.includes('construction') ? 'Construction' : mission.includes('water') ? 'Water-body change' : mission.includes('crop') || mission.includes('agricultur') || mission.includes('irrigation') ? 'Agricultural/land-use change' : mission.includes('vegetation') || mission.includes('ecosystem') ? 'Vegetation change' : mission.includes('flood') ? 'Flooding' : 'Infrastructure damage';
 const primary = changes.find(c => c.category === category)!;
 const result: Analysis = { id: `AN-${crypto.randomUUID().slice(0,8).toUpperCase()}`, ...input, title: input.emergency ? `${input.event} impact assessment` : input.mission, category, date: new Date().toISOString(), status: 'Completed', changeCount: input.emergency ? Math.round(emergency.area / 5) + 2 : 17, area: input.emergency ? emergency.area : primary.area, percentage: input.emergency ? (emergency.waterExpansion || primary.percentage) : primary.percentage, confidence: input.emergency ? emergency.confidence : primary.confidence, source: 'Sentinel-2', changes: changeSet(category, input.emergency), insight: '' };
 result.changes = result.changes.map((c,i) => i === 0 ? { ...c, area: result.area, percentage: result.percentage, confidence: result.confidence } : c);
 result.insight = insightFor(result);
 return result;
}
export function createReport(analysis: Analysis, author: string): Report {
 if (!analysis?.id || !organizations.some(o => o.id === analysis.organizationId) || !locations.some(l => l.id === analysis.locationId) || !Array.isArray(analysis.changes) || !Number.isFinite(analysis.area) || !Number.isFinite(analysis.confidence) || typeof analysis.insight !== 'string') throw new Error('A completed, valid analysis is required to generate a report.');
 return { id: `RPT-${crypto.randomUUID().slice(0,8).toUpperCase()}`, analysisId: analysis.id, organizationId: analysis.organizationId, title: analysis.emergency ? 'Emergency Situation Report' : `${analysis.mission} Report`, createdAt: new Date().toISOString(), analysis, author: typeof author === 'string' ? author.slice(0, 100) : 'Demo analyst' };
}
export function formatDate(date: string, short = false) { if (!date || !Number.isFinite(Date.parse(date))) return 'Select date'; return new Date(date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', ...(short ? {} : { year: 'numeric' as const }), timeZone: 'UTC' }); }
