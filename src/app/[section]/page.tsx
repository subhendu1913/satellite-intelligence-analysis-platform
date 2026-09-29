import { notFound } from 'next/navigation';
import { AppScreen } from '@/components/app-screen';
const sections=['dashboard','search','map','temporal','emergency','changes','reports','history','saved','settings','organizations','missions','welcome','login','register'];
const titles:Record<string,string>={dashboard:'Intelligence overview',search:'Semantic search',map:'Map explorer',temporal:'Multi-temporal analysis',emergency:'Emergency analysis',changes:'Change detection',reports:'Intelligence reports',history:'Analysis history',saved:'Saved locations',settings:'Workspace settings',organizations:'Choose your organization',missions:'Choose your mission',welcome:'A new perspective',login:'Sign in',register:'Create a demo account'};
export function generateStaticParams(){return sections.map(section=>({section}));}
export async function generateMetadata({params}:{params:Promise<{section:string}>}){const {section}=await params;return {title:`${titles[section]??'Workspace'} | Orbital`};}
export default async function SectionPage({params}:{params:Promise<{section:string}>}){const {section}=await params;if(!sections.includes(section))notFound();return <AppScreen section={section}/>;}
