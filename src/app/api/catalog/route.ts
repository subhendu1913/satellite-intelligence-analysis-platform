import { getCatalog } from '@/lib/data-service';
export async function GET() { return Response.json({ ...getCatalog(), mode: 'DEMO DATA / PROTOTYPE ANALYSIS' }); }
