'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { OrganizationRegistration } from '@/lib/types';
import { registerLocalAccount, signInLocalAccount } from '@/lib/local-auth';
import { useWorkspace } from './workspace-provider';
import { Brand, Button, Icon } from './ui';
import { OrganizationFields } from './organization-fields';

export function AuthPage({ register = false }: { register?: boolean }) {
 const ws = useWorkspace(); const router = useRouter();
 const [step, setStep] = useState(0); const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
 const [showPassword, setShowPassword] = useState(false); const [loading, setLoading] = useState(false); const [error, setError] = useState(''); const [accepted, setAccepted] = useState(false);
 const [org, setOrg] = useState<OrganizationRegistration>({ name: '', typeId: 'disaster', location: '' });
 async function submit(e: React.FormEvent) {
  e.preventDefault(); setError('');
  if (register && step === 0) { if (org.name.trim().length < 2 || !org.location.trim()) { setError('Enter an organization name and location to continue.'); return; } setStep(1); return; }
  setLoading(true);
  try {
   if (register) {
    if (!accepted) throw new Error('Please acknowledge the demonstration data notice.');
    const account = await registerLocalAccount(name, email, password);
    ws.signIn(account); ws.createOrganization({ ...org, ownerEmail: account.email });
   } else ws.signIn(await signInLocalAccount(email, password));
   router.push('/organizations');
  } catch (e) { setError(e instanceof Error ? e.message : 'Sign-in is temporarily unavailable. You can still enter the demo workspace.'); }
  finally { setLoading(false); }
 }
 function enterDemo() { ws.signIn({ name: 'Alex Morgan', email: 'alex@orbital.demo', role: 'Geospatial analyst' }); ws.switchOrganization('disaster'); router.push('/organizations'); }
 return <div className="auth-layout">
  <aside className="auth-visual"><Link href="/welcome" aria-label="About Orbital"><Brand/></Link><div className="auth-visual-content"><span className="eyebrow">SATELLITE INTELLIGENCE, CONNECTED</span><h1>See beyond<br/>the moment.</h1><p>One platform. Multiple organizations.<br/>A clearer perspective for every mission.</p><div className="auth-capabilities"><span><Icon name="layers"/>Multi-temporal change analysis</span><span><Icon name="shield-check"/>Dedicated organization workspaces</span><span><Icon name="file"/>Evidence-led reports</span></div><div className="auth-coordinates"><Icon name="crosshair"/><span>9.9712° N · 76.2973° E<small>Kochi, Kerala · Illustrative satellite basemap</small></span></div></div><div className="auth-visual-footer"><Icon name="info" size={16}/><span>Demo data. Not operational intelligence.</span><span>© Esri / Maxar</span></div></aside>
  <main className="auth-form-side"><div className="auth-top-link"><Link href="/welcome" className="auth-back-link"><Icon name="arrow-left" size={16}/>Back to platform</Link><span>{register?'Already registered?':'New to Orbital?'} <Link href={register?'/login':'/register'}>{register?'Sign in':'Create account'}<Icon name="arrow-up-right" size={14}/></Link></span></div>
   <div className="auth-form-wrap"><div className="auth-form-icon"><Icon name={register?'buildings':'orbit'} size={28}/></div><span className="eyebrow">{register?'YOUR ORGANIZATION. YOUR MISSION.':'WELCOME BACK'}</span><h2>{register?'Create your workspace.':'Sign in to Orbital.'}</h2><p>{register?'Set up an organization, then create your local demo account.':'Access your organizations, missions, and saved analysis.'}</p>
    {register&&<div className="registration-steps" aria-label="Registration progress"><button type="button" className={step===0?'active':'complete'} onClick={()=>{setStep(0);setError('');}} aria-current={step===0?'step':undefined}><span>{step===1?<Icon name="check" size={13}/>:'1'}</span>Organization</button><i/><button type="button" className={step===1?'active':''} onClick={()=>{if(org.name.trim().length>=2&&org.location.trim()){setStep(1);setError('');}else setError('Complete your organization name and location first.');}} aria-current={step===1?'step':undefined}><span>2</span>Your account</button></div>}
    {register&&step===1&&<div className="registration-org-summary"><Icon name="buildings" size={20}/><div><strong>{org.name}</strong><span>{ws.organizationTypes.find(o=>o.id===org.typeId)?.name} · {org.location}</span></div><button type="button" className="text-button" onClick={()=>{setStep(0);setError('');}}>Edit</button></div>}
    <form onSubmit={submit} className="form-stack" aria-busy={loading}>
     {register&&step===0?<OrganizationFields value={org} onChange={setOrg}/>:<>
      {register&&<label>Full name<div className="input-icon"><Icon name="user" size={18}/><input aria-label="Full name" autoComplete="name" required maxLength={80} placeholder="Alex Morgan" value={name} onChange={e=>setName(e.target.value)}/></div></label>}
      <label>Email address<div className="input-icon"><Icon name="mail" size={18}/><input aria-label="Email address" autoComplete="email" required type="email" placeholder="you@organization.com" value={email} onChange={e=>setEmail(e.target.value)}/></div></label>
      <label>Password<div className="input-icon"><Icon name="lock" size={18}/><input aria-label="Password" autoComplete={register?'new-password':'current-password'} required type={showPassword?'text':'password'} placeholder={register?'Create a demo-only password':'Enter your password'} minLength={8} value={password} onChange={e=>setPassword(e.target.value)}/><button type="button" onClick={()=>setShowPassword(!showPassword)} aria-label={showPassword?'Hide password':'Show password'} aria-pressed={showPassword}><Icon name={showPassword?'eye-off':'eye'} size={18}/></button></div>{register&&<span className="field-help">At least 8 characters. Please don’t use a real or reused password.</span>}</label>
      {register&&<label className="checkbox-label"><input required type="checkbox" checked={accepted} onChange={e=>setAccepted(e.target.checked)}/><span>I understand this is a local prototype. All analysis findings are simulated and are not for operational decisions.</span></label>}
     </>}
     {error&&<div className="error-banner" role="alert"><Icon name="alert" size={18}/><span>{error}</span></div>}
     <div className="auth-submit-row">{register&&step===1&&<Button type="button" icon="arrow-left" onClick={()=>{setStep(0);setError('');}}>Back</Button>}<Button type="submit" variant="primary" icon="arrow-right" loading={loading} disabled={!ws.ready}>{register?(step===0?'Continue to your account':'Create account & workspace'):'Sign in to workspace'}</Button></div>
    </form>
    <div className="auth-divider"><span/>Just exploring?<span/></div><Button className="demo-signin-button" icon="play" onClick={enterDemo} disabled={!ws.ready}>Enter demo workspace<Icon name="arrow-right" size={16}/></Button><div className="auth-disclaimer"><Icon name="shield-check" size={19}/><p>Accounts and organizations are stored in this browser. This prototype is not production authentication or organizational access control.</p></div>
   </div><div className="auth-footer"><Link href="/welcome">About Orbital</Link><span>DEMO DATA / PROTOTYPE ANALYSIS</span></div>
  </main>
 </div>;
}
