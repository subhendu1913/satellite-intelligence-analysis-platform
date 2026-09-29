'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Analysis, AnalysisRequest, Catalog, GeoLocation, Organization, OrganizationRegistration, Preferences, Report, Session, WorkspaceMemory } from '@/lib/types';
import { datesForScene, presentAnalysis, presentChange } from '@/lib/presentation';
import { updateLocalProfile } from '@/lib/local-auth';

type Toast = { message: string; type: 'success' | 'error' | 'info' } | null;
const defaultPreferences: Preferences = { notifications: true, units: 'km²', defaultLayer: 'satellite', compact: false };
const demoSession: Session = { name: 'Alex Morgan', email: 'alex@orbital.demo', role: 'Geospatial analyst' };
function initialMemory(org: Organization): WorkspaceMemory {
 const type = org.typeId ?? org.id;
 return { mission: org.missions[0], locationId: org.homeLocationId ?? (type === 'environment' ? 'amazon' : type === 'agriculture' ? 'punjab' : ['urban', 'infrastructure'].includes(type) ? 'delhi' : ['defence', 'weather'].includes(type) ? 'mumbai' : 'kochi') };
}
function useWorkspaceState(catalog: Catalog) {
 const [organizationId, setOrganizationId] = useState('disaster');
 const [customOrganizations, setCustomOrganizations] = useState<Organization[]>([]);
 const [contexts, setContexts] = useState<Record<string, WorkspaceMemory>>({});
 const [session, setSessionState] = useState<Session | null>(demoSession);
 const [customAnalyses, setCustomAnalyses] = useState<Analysis[]>([]);
 const [customReports, setCustomReports] = useState<Report[]>([]);
 const [saved, setSaved] = useState<Record<string, string[]>>({ disaster: ['kochi', 'wayanad'], environment: ['amazon'] });
 const [savedScenes, setSavedScenes] = useState<Record<string, string[]>>({});
 const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
 const [newAnalysisOpen, setNewAnalysisOpen] = useState(false);
 const [toast, setToast] = useState<Toast>(null);
 const [ready, setReady] = useState(false);
 const [activeReportId, setActiveReportId] = useState<string | null>(null);
 const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
 const notify = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
  if (timer.current) clearTimeout(timer.current);
  setToast({ message, type }); timer.current = setTimeout(() => setToast(null), 5000);
 }, []);
 const availableOrganizations = useMemo(() => [...customOrganizations.filter(o => o.ownerEmail === session?.email), ...catalog.organizations], [customOrganizations, session?.email, catalog]);
 const organization = availableOrganizations.find(o => o.id === organizationId) ?? catalog.organizations[0];
 const organizationType = organization.typeId ?? organization.id;
 const memory = contexts[organization.id] ?? initialMemory(organization);
 const mission = memory.mission;
 const location = catalog.locations.find(l => l.id === memory.locationId) ?? catalog.locations[0];
 const selectedScene = catalog.scenes.find(s => s.id === memory.sceneId && s.locationId === location.id) ?? null;
 const allMissions = useMemo(() => new Set(catalog.organizations.flatMap(o => o.missions)), [catalog]);
 const missionOptions = useMemo(() => Array.from(new Set([...organization.missions, mission])), [organization, mission]);
 const data: Catalog = useMemo(() => ({ ...catalog, organizations: availableOrganizations, changes: catalog.changes.map(presentChange), analyses: catalog.analyses.map(presentAnalysis), reports: catalog.reports.map(r => ({ ...r, analysis: presentAnalysis(r.analysis) })) }), [catalog, availableOrganizations]);
 const analyses = useMemo(() => [...customAnalyses, ...data.analyses].filter(a => a.organizationId === organization.id).map(presentAnalysis), [customAnalyses, data, organization.id]);
 const reports = useMemo(() => [...customReports, ...data.reports].filter(r => r.organizationId === organization.id), [customReports, data, organization.id]);
 useEffect(() => {
  try {
   const text = localStorage.getItem('orbital-workspace-v1');
   if (text) {
    const p = JSON.parse(text);
    const localOrgs: Organization[] = Array.isArray(p.customOrganizations) ? p.customOrganizations.filter((o: Organization) => o.id && o.ownerEmail && catalog.organizations.some(base => base.id === o.typeId)).map((o: Organization) => ({ ...catalog.organizations.find(base => base.id === o.typeId)!, ...o })) : [];
    setCustomOrganizations(localOrgs);
    const restoredSession = p.session === null || (p.session?.name && p.session?.email) ? p.session : demoSession;
    setSessionState(restoredSession);
    const allowedOrgs = [...localOrgs.filter(o => o.ownerEmail === restoredSession?.email), ...catalog.organizations];
    const restoredOrg = allowedOrgs.find(o => o.id === p.organizationId) ?? catalog.organizations[0];
    setOrganizationId(restoredOrg.id);
    const restoredContexts: Record<string, WorkspaceMemory> = {};
    for (const org of [...localOrgs, ...catalog.organizations]) {
     const savedContext = p.contexts?.[org.id];
     if (savedContext && allMissions.has(savedContext.mission) && catalog.locations.some(l => l.id === savedContext.locationId)) restoredContexts[org.id] = savedContext;
    }
    // Preserve older browser workspaces instead of resetting existing data.
    if (!restoredContexts[restoredOrg.id]) restoredContexts[restoredOrg.id] = { ...initialMemory(restoredOrg), ...(allMissions.has(p.mission) ? { mission: p.mission } : {}), ...(catalog.locations.some(l => l.id === p.locationId) ? { locationId: p.locationId } : {}) };
    setContexts(restoredContexts);
    if (Array.isArray(p.customAnalyses)) setCustomAnalyses(p.customAnalyses.filter((a: Analysis) => a.id && a.organizationId && Array.isArray(a.changes)));
    if (Array.isArray(p.customReports)) setCustomReports(p.customReports.filter((r: Report) => r.id && r.analysis?.id));
    if (p.saved && typeof p.saved === 'object') setSaved(p.saved);
    if (p.savedScenes && typeof p.savedScenes === 'object') setSavedScenes(p.savedScenes);
    if (p.preferences) setPreferences({ ...defaultPreferences, ...p.preferences });
    if (typeof p.activeReportId === 'string') setActiveReportId(p.activeReportId);
   }
  } catch { notify('Your saved workspace could not be restored. The demo is still available.', 'info'); }
  setReady(true);
  return () => { if (timer.current) clearTimeout(timer.current); };
 }, [catalog, allMissions, notify]);
 useEffect(() => {
  if (!ready) return;
  try { localStorage.setItem('orbital-workspace-v1', JSON.stringify({ organizationId: organization.id, mission, locationId: location.id, contexts, customOrganizations, session, customAnalyses, customReports, saved, savedScenes, preferences, activeReportId })); }
  catch { notify('Browser storage is unavailable. Export your work from Settings before closing this session.', 'error'); }
 }, [ready, organization.id, mission, location.id, contexts, customOrganizations, session, customAnalyses, customReports, saved, savedScenes, preferences, activeReportId, notify]);
 function patchMemory(patch: Partial<WorkspaceMemory>, org = organization) { setContexts(previous => ({ ...previous, [org.id]: { ...(previous[org.id] ?? initialMemory(org)), ...patch } })); }
 function switchOrganization(id: string) { if (!availableOrganizations.some(o => o.id === id)) return; setOrganizationId(id); setActiveReportId(null); }
 function configureWorkspace(id: string, nextMission: string, nextLocation: string) {
  const org = availableOrganizations.find(o => o.id === id);
  if (!org || !allMissions.has(nextMission) || !catalog.locations.some(l => l.id === nextLocation)) return;
  setOrganizationId(id); setActiveReportId(null);
  patchMemory({ mission: nextMission, locationId: nextLocation, sceneId: undefined, lastAnalysisId: undefined, ...(nextLocation !== location.id ? { aoi: undefined } : {}) }, org);
 }
 function setMission(value: string) { if (allMissions.has(value)) patchMemory({ mission: value, lastAnalysisId: undefined }); }
 function selectLocation(value: GeoLocation | string) {
  const id = typeof value === 'string' ? value : value.id;
  if (catalog.locations.some(l => l.id === id)) patchMemory({ locationId: id, aoi: undefined, sceneId: undefined, lastAnalysisId: undefined });
 }
 function selectScene(id: string) {
  const scene = catalog.scenes.find(s => s.id === id);
  if (scene) patchMemory({ locationId: scene.locationId, sceneId: scene.id, ...(memory.sceneId !== scene.id ? { draft: datesForScene(scene), lastAnalysisId: undefined } : {}), ...(scene.locationId !== location.id ? { aoi: undefined, lastAnalysisId: undefined } : {}) });
 }
 function setSession(next: Session | null) { setSessionState(next); if (!next) { setOrganizationId('disaster'); setActiveReportId(null); setNewAnalysisOpen(false); } }
 function signIn(next: Session) {
  setSessionState(next);
  const own = customOrganizations.filter(o => o.ownerEmail === next.email);
  setOrganizationId(own.find(o => o.id === organizationId)?.id ?? own[0]?.id ?? 'disaster');
  setActiveReportId(null);
 }
 function updateProfile(next: Session) {
  const normalized = { ...next, name: next.name.trim(), email: next.email.trim().toLowerCase() };
  updateLocalProfile(session?.email ?? '', normalized);
  setCustomOrganizations(previous => previous.map(o => o.ownerEmail === session?.email ? { ...o, ownerEmail: normalized.email } : o));
  setSessionState(normalized);
 }
 function createOrganization(input: OrganizationRegistration) {
  const template = catalog.organizations.find(o => o.id === input.typeId);
  const ownerEmail = (input.ownerEmail ?? session?.email ?? '').trim().toLowerCase();
  if (!template || input.name.trim().length < 2 || !input.location.trim() || !ownerEmail) throw new Error('Add an organization name, type, location, and a local account.');
  if (customOrganizations.some(o => o.ownerEmail === ownerEmail && o.name.toLowerCase() === input.name.trim().toLowerCase())) throw new Error('You already have an organization with this name. Choose a different name or open the existing workspace.');
  const org: Organization = { ...template, id: `org-${crypto.randomUUID().slice(0, 12)}`, name: input.name.trim(), shortName: input.name.trim(), typeId: template.id, ownerEmail, headquarters: input.location.trim(), homeLocationId: input.locationId || initialMemory(template).locationId, createdAt: new Date().toISOString(), scenes: catalog.scenes.length, locations: 0, changes: 0, emergencies: 0 };
  setCustomOrganizations(previous => [...previous, org]); setContexts(previous => ({ ...previous, [org.id]: initialMemory(org) })); setOrganizationId(org.id); setActiveReportId(null);
  return org;
 }
 function toggleSaved(id: string) {
  const exists = (saved[organization.id] ?? []).includes(id);
  setSaved(previous => ({ ...previous, [organization.id]: exists ? (previous[organization.id] ?? []).filter(l => l !== id) : [...(previous[organization.id] ?? []), id] }));
  notify(exists ? 'Location removed from this organization.' : `Location saved to ${organization.name}.`);
 }
 function toggleScene(id: string) {
  const exists = (savedScenes[organization.id] ?? []).includes(id);
  setSavedScenes(previous => ({ ...previous, [organization.id]: exists ? (previous[organization.id] ?? []).filter(s => s !== id) : [...(previous[organization.id] ?? []), id] }));
  notify(exists ? 'Scene removed from saved imagery.' : `Scene saved to ${organization.name}.`);
 }
 async function submitAnalysis(input: Omit<AnalysisRequest, 'organizationId'>): Promise<Analysis> {
  // Existing JSON API uses catalog mission templates. Local workspace ownership is applied here,
  // without changing the analysis engine or implying server-side tenancy/authentication.
  const template = catalog.organizations.find(o => o.missions.includes(input.mission));
  if (!template) throw new Error('Choose an available mission before starting the analysis.');
  const response = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...input, organizationId: template.id }) });
  const result = await response.json(); if (!response.ok) throw new Error(result.error ?? 'Analysis is unavailable. Please try again.');
  return presentAnalysis({ ...result.analysis, organizationId: organization.id });
 }
 function addAnalysis(analysis: Analysis) { setCustomAnalyses(previous => [presentAnalysis(analysis), ...previous.filter(a => a.id !== analysis.id)]); patchMemory({ lastAnalysisId: analysis.id }); }
 function openAnalysis(analysis: Analysis) { patchMemory({ mission: analysis.mission, locationId: analysis.locationId, aoi: analysis.aoi, lastAnalysisId: analysis.id, sceneId: undefined, draft: { before: analysis.before, during: analysis.during, after: analysis.after } }); }
 async function generateReport(analysis: Analysis) {
  const org = availableOrganizations.find(o => o.id === analysis.organizationId);
  if (!org) throw new Error('Switch to the organization that owns this analysis.');
  const response = await fetch('/api/reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ analysis: { ...analysis, organizationId: org.typeId ?? org.id }, author: session?.name ?? 'Demo analyst' }) });
  const result = await response.json(); if (!response.ok) throw new Error(result.error || 'Unable to generate report.');
  const report: Report = { ...result.report, organizationId: analysis.organizationId, analysis };
  setCustomReports(previous => [report, ...previous]); setActiveReportId(report.id); notify('Report generated. Your preview is ready.'); return report;
 }
 function resetWorkspace() {
  setCustomAnalyses([]); setCustomReports([]); setSaved({ disaster: ['kochi', 'wayanad'], environment: ['amazon'] }); setSavedScenes({}); setContexts({}); setPreferences(defaultPreferences); setActiveReportId(null); notify('Demo analyses and saved items reset. Your accounts and organizations were kept.');
 }
 return { data, organization, organizationId: organization.id, organizationType, organizationTypes: catalog.organizations, createOrganization, switchOrganization, configureWorkspace, analysisDraft: memory.draft, setAnalysisDraft: (draft: WorkspaceMemory['draft']) => patchMemory({ draft }), mission, missionOptions, setMission, location, selectLocation, selectedScene, selectScene, session, setSession, signIn, updateProfile, analyses, reports, addAnalysis, openAnalysis, submitAnalysis, generateReport, saved: saved[organization.id] ?? [], savedScenes: savedScenes[organization.id] ?? [], toggleSaved, toggleScene, preferences, setPreferences, newAnalysisOpen, setNewAnalysisOpen, launchAnalysis: () => setNewAnalysisOpen(true), toast, setToast, notify, ready, activeReportId, setActiveReportId, aoi: memory.aoi, setAoi: (aoi?: [number, number][]) => patchMemory({ aoi }), resetWorkspace };
}
const WorkspaceContext = createContext<ReturnType<typeof useWorkspaceState> | null>(null);
export function WorkspaceProvider({ data, children }: { data: Catalog; children: ReactNode }) { const value = useWorkspaceState(data); return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>; }
export function useWorkspace() { const context = useContext(WorkspaceContext); if (!context) throw new Error('Workspace provider is missing.'); return context; }
