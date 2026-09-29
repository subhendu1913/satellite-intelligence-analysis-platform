import { searchScenes } from '@/lib/data-service';
export async function POST(request: Request) {
 try {
  const { query = '', filters = {} } = await request.json();
  if (typeof query !== 'string' || query.length > 500 || !filters || typeof filters !== 'object') return Response.json({ error: 'Enter a query of 500 characters or fewer.' }, { status: 400 });
  if (filters.from && filters.to && filters.from > filters.to) return Response.json({ error: 'The end date must be after the start date.' }, { status: 400 });
  return Response.json({ scenes: searchScenes(query, filters), mode: 'DEMO', method: 'Keyword and tag relevance over a synthetic catalog; not a trained semantic model.' });
 } catch { return Response.json({ error: 'The search request could not be read. Please try again.' }, { status: 400 }); }
}
