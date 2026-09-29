import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { WorkspaceProvider } from '@/components/workspace-provider';
import { getCatalog } from '@/lib/data-service';
import 'leaflet/dist/leaflet.css';
import './globals.css';
import './workspace.css';
import './analysis.css';
import './public.css';
export const metadata:Metadata={title:'Orbital | Satellite Intelligence',description:'One platform. Multiple organizations. A clearer perspective. Explore semantic satellite retrieval and multi-temporal change analysis in a transparent professional prototype.',icons:{icon:'/icon.svg'}};
export default function RootLayout({children}:{children:ReactNode}){return <html lang="en"><body><WorkspaceProvider data={getCatalog()}>{children}</WorkspaceProvider></body></html>;}
