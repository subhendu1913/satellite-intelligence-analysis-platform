'use client';
import { useId } from 'react';
import type { OrganizationRegistration } from '@/lib/types';
import { useWorkspace } from './workspace-provider';
export function OrganizationFields({ value, onChange }: { value: OrganizationRegistration; onChange: (value: OrganizationRegistration) => void }) {
 const ws = useWorkspace(); const listId = useId();
 return <div className="form-stack organization-fields">
  <label>Organization name<input aria-label="Organization name" required minLength={2} maxLength={80} autoComplete="organization" placeholder="e.g. Kerala Response Agency" value={value.name} onChange={e => onChange({ ...value, name: e.target.value })}/></label>
  <label>Organization type<select aria-label="Organization type" required value={value.typeId} onChange={e => onChange({ ...value, typeId: e.target.value })}>{ws.organizationTypes.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}</select></label>
  <label>Location<input aria-label="Location" required maxLength={120} autoComplete="address-level2" list={listId} placeholder="City, region, country" value={value.location} onChange={e => { const text = e.target.value; const match = ws.data.locations.find(l => text.toLowerCase().startsWith(l.name.toLowerCase())); onChange({ ...value, location: text, locationId: match?.id }); }}/><datalist id={listId}>{ws.data.locations.map(l => <option key={l.id} value={`${l.name}, ${l.region}, ${l.country}`}/>)}</datalist><span className="field-help">Your organization’s location. You can analyze other regions at any time.</span></label>
 </div>;
}
