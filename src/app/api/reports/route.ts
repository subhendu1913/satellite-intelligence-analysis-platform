import { createReport } from '@/lib/data-service';
export async function POST(request: Request) {
 try { const { analysis, author } = await request.json(); return Response.json({ report: createReport(analysis, author) }, { status: 201 }); }
 catch (error) { return Response.json({ error: error instanceof Error ? error.message : 'Report generation failed.' }, { status: 400 }); }
}
