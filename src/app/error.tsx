'use client';
import { Button, Icon } from '@/components/ui';
export default function ErrorPage({reset}:{error:Error&{digest?:string};reset:()=>void}){return <main className="standalone-state"><span className="empty-icon"><Icon name="satellite" size={32}/></span><h1>Let’s reconnect your perspective.</h1><p>The workspace couldn’t load this view. Your browser-saved work is unchanged.</p><Button variant="primary" icon="refresh" onClick={reset}>Try this view again</Button><a href="/">Return to the dashboard</a></main>;}
