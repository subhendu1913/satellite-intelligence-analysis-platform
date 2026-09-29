import { jsPDF } from 'jspdf';
import type { Catalog, Report } from './types';
import { formatDate, interpretationNotice } from './data-service';
import { satelliteImageCandidates } from './satellite-assets';
async function imageData(url: string): Promise<string> {
 for (const source of satelliteImageCandidates(url)) {
  try {
   const response = await fetch(source);
   if (!response.ok) throw new Error('Image unavailable');
   const blob = await response.blob();
   if (!blob.type.startsWith('image/')) throw new Error('Invalid image response');
   const data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Image could not be read'));
    reader.readAsDataURL(blob);
   });
   const decoded = new Image(); decoded.src = data; await decoded.decode();
   if (!decoded.naturalWidth) throw new Error('Image could not be decoded');
   // Keep original JPEG bytes in normal reports. Rasterize only the last-resort
   // local SVG because jsPDF's JPEG encoder does not accept SVG input.
   if (source.endsWith('.jpg')) return data;
   const canvas = document.createElement('canvas');
   canvas.width = decoded.naturalWidth; canvas.height = decoded.naturalHeight;
   const context = canvas.getContext('2d');
   if (!context) throw new Error('Image rendering unavailable');
   context.drawImage(decoded, 0, 0);
   return canvas.toDataURL('image/jpeg', 0.92);
  } catch { /* Try the next bundled local fallback, never an external URL. */ }
 }
 throw new Error('The local report images could not be loaded. Restart the app to restore the bundled demo assets.');
}
export async function downloadReportPDF(report:Report,catalog:Catalog){
 const pdf=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});const a=report.analysis;const org=catalog.organizations.find(o=>o.id===a.organizationId)!;const location=catalog.locations.find(l=>l.id===a.locationId)!;const emergency=catalog.emergencies.find(e=>e.type===a.event);const image=await imageData(location.image);
 const ink:[number,number,number]=[23,38,59],muted:[number,number,number]=[105,117,132],blue:[number,number,number]=[41,103,232];
 function text(value:string,x:number,y:number,size=10,color=ink,bold=false){pdf.setTextColor(...color);pdf.setFont('helvetica',bold?'bold':'normal');pdf.setFontSize(size);pdf.text(value.replace(/[—–]/g,'-').replace(/→/g,'to'),x,y);}
 function paragraph(value:string,x:number,y:number,width:number,size=9){pdf.setFont('helvetica','normal');pdf.setFontSize(size);pdf.setTextColor(...muted);const lines=pdf.splitTextToSize(value.replace(/[—–]/g,'-'),width);pdf.text(lines,x,y);return y+lines.length*4.4;}
 function header(page:number){pdf.setFillColor(12,26,44);pdf.rect(0,0,210,32,'F');text('orbital.',16,16,24,[255,255,255],true);text('GEOSPATIAL INTELLIGENCE',16,23,6.5,[161,182,207]);text('DEMO DATA / PROTOTYPE ANALYSIS',120,16,7.4,[164,195,239],true);text(report.id,120,23,7.5,[200,211,226]);pdf.setDrawColor(226,231,238);pdf.line(16,282,194,282);text('Not for operational use. All analysis results and dated scene metadata are simulated.',16,288,6.5,muted);text(`${page} / 3`,185,288,7,muted);}
 function heading(value:string,y:number){text(value,16,y,11,ink,true);pdf.setDrawColor(229,234,241);pdf.line(16,y+3,194,y+3);}
 function metric(label:string,value:string,x:number,y:number){pdf.setFillColor(245,247,250);pdf.roundedRect(x,y,42,23,2,2,'F');text(label,x+4,y+6.5,7,muted);text(value,x+4,y+17,15,ink,true);}
 header(1);text(report.title,16,47,19,ink,true);text(`${location.name}, ${location.region}, ${location.country}`,16,56,11,muted);text(`Prepared ${formatDate(report.createdAt)} | ${report.author}`,16,63,8,muted);
 heading('MISSION CONTEXT',75);text('Organization',16,86,7.5,muted);text(org.name,16,92,10,ink,true);text('Mission',110,86,7.5,muted);text(a.mission,110,92,9,ink,true);text('Event / observation',16,103,7.5,muted);text(a.event,16,109,10);text('Coordinates / reference system',110,103,7.5,muted);text(`${location.lat.toFixed(4)}, ${location.lng.toFixed(4)} | WGS 84`,110,109,9);
 if(a.aoi){text(`AOI: ${a.aoi.map(p=>p.map(n=>n.toFixed(4)).join(', ')).join(' to ')}`,16,119,8,muted);}else text('AOI: demonstration reference area centered on the selected location.',16,119,8,muted);
 heading('MULTI-TEMPORAL OBSERVATIONS',132);(['before','during','after'] as const).forEach((stage,i)=>{const x=16+i*61;pdf.addImage(image,'JPEG',x,139,56,43);if(stage!=='before'){pdf.setDrawColor(103,190,248);pdf.setLineWidth(.45);pdf.setLineDashPattern([1.2,.7],0);pdf.rect(x+22,144,stage==='during'?13:8,31,'S');pdf.setLineDashPattern([],0);}text(stage.toUpperCase(),x,188,8,ink,true);text(formatDate(a[stage]),x,194,8,muted);text(`${stage==='after'?'Landsat-9':a.source} (simulated)`,x,200,7,muted);});
 paragraph('Illustrative reference basemap: Esri / Maxar / Earthstar Geographics. Images are not verified acquisitions for these dates. Blue outlines illustrate simulated change masks.',16,208,177,7.5);
 heading('ASSESSMENT AT A GLANCE',231);metric('Affected area',`${a.area} km²`,16,239);metric('Percentage change',`${a.percentage}%`,61,239);metric('Demo confidence',`${a.confidence}%`,106,239);metric('Changed regions',String(a.changeCount),151,239);
 pdf.addPage();header(2);text('Change map & observed differences',16,47,17,ink,true);pdf.addImage(image,'JPEG',16,56,178,104);a.changes.forEach((c,i)=>{pdf.setDrawColor(c.color);pdf.setLineWidth(.8);pdf.setLineDashPattern([2,1],0);const x=70+i*28,y=78+(i%2)*34;pdf.line(x,y,x+17,y-8);pdf.line(x+17,y-8,x+28,y+10);pdf.line(x+28,y+10,x+15,y+28);pdf.line(x+15,y+28,x-5,y+20);pdf.line(x-5,y+20,x,y);pdf.setLineDashPattern([],0);});
 paragraph('Simulated change regions on an illustrative basemap; not a georeferenced analytical raster or a verified damage map.',16,167,178,7.5);
 heading('DETECTED CHANGE CATEGORIES',184);pdf.setFillColor(242,245,249);pdf.rect(16,190,178,10,'F');text('CATEGORY',20,196.5,7,muted,true);text('AREA',99,196.5,7,muted,true);text('CHANGE',130,196.5,7,muted,true);text('CONFIDENCE',161,196.5,7,muted,true);a.changes.forEach((c,i)=>{const y=209+i*14;text(c.category,20,y,9);text(`${c.area} km²`,99,y,9);text(`${c.percentage}%`,130,y,9);text(`${c.confidence}%`,161,y,9);pdf.setDrawColor(234,238,243);pdf.line(16,y+5,194,y+5);});
 paragraph('Category areas may overlap and must not be summed as a unique affected footprint. Confidence values are synthetic and do not represent calibrated model accuracy.',16,257,178,7.5);
 pdf.addPage();header(3);text('Interpretation & observation timeline',16,47,17,ink,true);heading('AI-ASSISTED INSIGHT',61);let y=paragraph(a.insight,16,72,176,10)+7;y=paragraph(interpretationNotice,16,y,176,8)+9;
 heading('OBSERVATION TIMELINE',y);y+=12;(['before','during','after'] as const).forEach(stage=>{text(formatDate(a[stage]),16,y,9,blue,true);text(stage==='before'?'Pre-event reference':stage==='during'?'Event / change observation':'Post-event recovery observation',62,y,9);y+=10;});
 if(a.emergency&&emergency){y+=6;heading('SIMULATED INFRASTRUCTURE & LAND-COVER EXPOSURE',y);y+=12;text(`Road segments: ${emergency.roads}    Building footprints: ${emergency.buildings}`,16,y,9);y+=9;text(`Vegetation: ${emergency.vegetation} km²    Water expansion: ${emergency.waterExpansion}%`,16,y,9);y+=10;}
 y+=6;heading('SOURCES, LIMITATIONS & VERIFICATION',y);y+=12;y=paragraph('Scene sources: Sentinel-2 / Landsat-9 (simulated metadata). Basemap attribution: Esri, Maxar, Earthstar Geographics. Dates do not establish actual acquisition times. This deterministic prototype does not run a trained remote-sensing or language model. It supports observation workflows, not disaster prediction. Cloud, seasonality, sensor resolution, and registration must be checked against authoritative acquisitions before use.',16,y,177,8);y+=7;text(`Analysis timestamp: ${new Date(a.date).toISOString()}`,16,Math.min(y,269),7.5,muted);
 pdf.setProperties({title:report.title,subject:'DEMO DATA / PROTOTYPE ANALYSIS',author:report.author,creator:'Orbital Geospatial Intelligence'});pdf.save(`Orbital-${a.emergency?'Emergency-Situation-Report':'Analysis-Report'}-${report.id}.pdf`);
}
export function downloadJSON(value:unknown,name:string){const blob=new Blob([JSON.stringify(value,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download=name;anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
