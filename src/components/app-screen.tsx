'use client';
import { Suspense } from 'react';
import { WorkspaceLoading } from './ui';
import { WorkspaceShell } from './workspace-shell';
import { Dashboard } from './dashboard';
import { SearchPage } from './search-page';
import { MapPage } from './map-page';
import { AnalysisWorkbench } from './analysis-workbench';
import { ReportsPage } from './reports-page';
import { HistoryPage, SavedPage, SettingsPage } from './library-pages';
import { MissionsPage, OrganizationsPage } from './organization-pages';
import { AuthPage, LandingPage } from './auth-pages';
export function AppScreen({section='dashboard'}:{section?:string}){
 if(section==='welcome')return <LandingPage/>;
 if(section==='login'||section==='register')return <AuthPage register={section==='register'}/>;
 const screen=section==='dashboard'?<Dashboard/>:section==='search'?<SearchPage/>:section==='map'?<MapPage/>:section==='temporal'?<AnalysisWorkbench key="temporal" mode="temporal"/>:section==='emergency'?<AnalysisWorkbench key="emergency" mode="emergency"/>:section==='changes'?<AnalysisWorkbench key="changes" mode="changes"/>:section==='reports'?<ReportsPage/>:section==='history'?<HistoryPage/>:section==='saved'?<SavedPage/>:section==='settings'?<SettingsPage/>:section==='organizations'?<OrganizationsPage/>:section==='missions'?<MissionsPage/>:<Dashboard/>;
 return <WorkspaceShell><Suspense fallback={<WorkspaceLoading/>}>{screen}</Suspense></WorkspaceShell>;
}
