import { runDemoAnalysis } from '@/lib/data-service';
export async function POST(request: Request) {
 try { return Response.json({ analysis: runDemoAnalysis(await request.json()), mode: 'PROTOTYPE ANALYSIS' }); }
 catch (error) { return Response.json({ error: error instanceof Error ? error.message : 'Analysis failed. Please try again.' }, { status: 400 }); }
}
