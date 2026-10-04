const go=document.getElementById("go");
const status=document.getElementById("status");
const setStatus=(x,c="")=>{status.textContent=x;status.className=c;};

go.onclick=async()=>{
  go.disabled=true;
  try{
    const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
    if(!tab?.id || !/^https:\/\/(www\.)?instagram\.com\//i.test(tab.url||""))
      throw new Error("Open the Instagram carousel first.");

    setStatus("Opening carousel collector…");

    const results=await chrome.scripting.executeScript({
      target:{tabId:tab.id},
      func: async function() {
        const sleep=ms=>new Promise(r=>setTimeout(r,ms));
        const getImages=()=>[...document.images].filter(img=>{
          const r=img.getBoundingClientRect();
          return r.width>=300&&r.height>=200&&r.bottom>0&&r.right>0&&img.complete&&img.naturalWidth>=500&&
                 getComputedStyle(img).display!=="none"&&getComputedStyle(img).visibility!=="hidden";
        });
        const best=()=>{const a=getImages();a.sort((x,y)=>{const rx=x.getBoundingClientRect(),ry=y.getBoundingClientRect();return ry.width*ry.height-rx.width*rx.height});return a[0]||null};
        const buttons=()=>[...document.querySelectorAll('button,[role="button"]')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&r.bottom>0&&r.right>0});
        const find=(dir)=>{
          const words=dir==="prev"?["previous","prev","back","zurück","précédent","anterior"]:["next","suivant","siguiente","nächste","avanti"];
          return buttons().find(e=>{const t=((e.getAttribute("aria-label")||"")+" "+(e.getAttribute("title")||"")+" "+(e.innerText||"")).toLowerCase();return words.some(w=>t.includes(w))})||null;
        };
        let im=null; for(let i=0;i<30;i++){im=best();if(im)break;await sleep(250)}
        if(!im)throw new Error("No carousel image found.");
        // rewind
        for(let i=0;i<60;i++){
          const before=best()?.currentSrc||"", b=find("prev"); if(!b)break;
          b.click(); let changed=false;
          for(let j=0;j<12;j++){await sleep(180);const now=best()?.currentSrc||"";if(now&&now!==before){changed=true;break}}
          if(!changed)break;
        }
        const urls=[],seen=new Set();
        for(let i=0;i<100;i++){
          await sleep(300); const cur=best()?.currentSrc||"";
          if(cur&&!seen.has(cur)){seen.add(cur);urls.push(cur)}
          const n=find("next"); if(!n)break; const before=cur; n.click();
          let changed=false;
          for(let j=0;j<16;j++){await sleep(180);const now=best()?.currentSrc||"";if(now&&now!==before){changed=true;break}}
          if(!changed)break;
          if(urls.length>1&&(best()?.currentSrc||"")===urls[0])break;
        }
        const shortcode=(location.pathname.match(/\/(?:p|reel|tv)\/([^/]+)/i)||[])[1]||"instagram-carousel";
        return {urls,shortcode};
      }
    });

    const data=results?.[0]?.result;
    if(!data?.urls?.length)throw new Error("No slides found.");
    setStatus(`Found ${data.urls.length} slide(s). Creating PDF…`);

    const r=await chrome.runtime.sendMessage({action:"buildPdf",urls:data.urls,shortcode:data.shortcode});
    if(!r?.ok)throw new Error(r?.error||"PDF creation failed.");
    setStatus(`Done — ${data.urls.length} slides saved.`, "ok");
  }catch(e){
    setStatus("Error: "+(e?.message||e),"err");
  }finally{go.disabled=false}
};