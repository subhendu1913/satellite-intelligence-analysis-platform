import { getCatalog } from '@/lib/data-service';
export async function GET() { const catalog = getCatalog(); return Response.json({ ok: catalog.organizations.length > 0, mode: 'json-prototype', services: { catalog: 'operational', analysis: 'demo', reports: 'operational' } }); }
