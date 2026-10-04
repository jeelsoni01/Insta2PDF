function jpegSize(b){
  if(b[0]!==255||b[1]!==216)throw new Error("Instagram returned a non-JPEG image.");
  let i=2;
  while(i<b.length-9){
    if(b[i]!==255){i++;continue}
    const m=b[i+1]; i+=2;
    if(m===216||m===217)continue;
    if(m===218)break;
    const len=(b[i]<<8)|b[i+1];
    if((m>=192&&m<=195)||(m>=197&&m<=199)||(m>=201&&m<=203)||(m>=205&&m<=207))
      return {height:(b[i+3]<<8)|b[i+4],width:(b[i+5]<<8)|b[i+6]};
    i+=len;
  }
  throw new Error("Could not read image dimensions.");
}
function a(s){return new TextEncoder().encode(s)}
function cat(...aa){let n=aa.reduce((x,y)=>x+y.length,0),o=new Uint8Array(n),p=0;for(const x of aa){o.set(x,p);p+=x.length}return o}

function makePdf(imgs){
  const objs=[];let next=3,kids=[];
  for(let i=0;i<imgs.length;i++){
    const page=next++,im=next++,co=next++;kids.push(page);
    objs.push({t:"page",n:page,im,co,w:imgs[i].w,h:imgs[i].h,i});
    objs.push({t:"image",n:im,b:imgs[i].b,w:imgs[i].w,h:imgs[i].h});
    objs.push({t:"content",n:co,w:imgs[i].w,h:imgs[i].h,i});
  }
  const chunks=[a("%PDF-1.4\n%\xFF\xFF\xFF\xFF\n")],off=new Map();let pos=chunks[0].length;
  const add=(n,d)=>{off.set(n,pos);const h=a(`${n} 0 obj\n`),t=a("\nendobj\n");chunks.push(h,d,t);pos+=h.length+d.length+t.length};
  add(1,a("<< /Type /Catalog /Pages 2 0 R >>"));
  add(2,a(`<< /Type /Pages /Kids [${kids.map(x=>x+" 0 R").join(" ")}] /Count ${kids.length} >>`));
  for(const o of objs){
    if(o.t==="image"){
      const d=a(`<< /Type /XObject /Subtype /Image /Width ${o.w} /Height ${o.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${o.b.length} >>\nstream\n`);
      add(o.n,cat(d,o.b,a("\nendstream")));
    }else if(o.t==="content"){
      const w=(o.w*.75).toFixed(2),h=(o.h*.75).toFixed(2),s=`q\n${w} 0 0 ${h} 0 0 cm\n/Im${o.i+1} Do\nQ\n`,body=a(s);
      add(o.n,a(`<< /Length ${body.length} >>\nstream\n${s}endstream`));
    }else{
      const w=(o.w*.75).toFixed(2),h=(o.h*.75).toFixed(2);
      add(o.n,a(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] /Resources << /XObject << /Im${o.i+1} ${o.im} 0 R >> >> /Contents ${o.co} 0 R >>`));
    }
  }
  const start=pos;let x=`xref\n0 ${next}\n0000000000 65535 f \n`;
  for(let i=1;i<next;i++)x+=String(off.get(i)).padStart(10,"0")+" 00000 n \n";
  x+=`trailer\n<< /Size ${next} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`;chunks.push(a(x));
  return cat(...chunks);
}
async function fetchAll(urls){
  const out=[];
  for(let i=0;i<urls.length;i++){
    const r=await fetch(urls[i],{credentials:"include",cache:"no-store"});
    if(!r.ok)throw new Error(`Could not download slide ${i+1} (${r.status}).`);
    const b=new Uint8Array(await r.arrayBuffer());
    const s=jpegSize(b);out.push({b,w:s.width,h:s.height});
  }
  return out;
}
function dataUrl(b){
  let s="",c=0x8000;for(let i=0;i<b.length;i+=c)s+=String.fromCharCode(...b.subarray(i,Math.min(i+c,b.length)));
  return "data:application/pdf;base64,"+btoa(s);
}
chrome.runtime.onMessage.addListener((m,s,reply)=>{
  if(m.action!=="buildPdf")return;
  (async()=>{try{
    const urls=[...new Set(m.urls||[])]; if(!urls.length)throw new Error("No slides.");
    const imgs=await fetchAll(urls);const pdf=makePdf(imgs);
    await chrome.downloads.download({url:dataUrl(pdf),filename:`${m.shortcode||"instagram-carousel"}.pdf`,saveAs:true,conflictAction:"uniquify"});
    reply({ok:true});
  }catch(e){reply({ok:false,error:e?.message||String(e)})}})();
  return true;
});