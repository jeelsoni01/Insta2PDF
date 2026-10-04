const go=document.getElementById("go");
const status=document.getElementById("status");
const setStatus=(x,c="")=>{status.textContent=x;status.className=c;};

go.onclick=async()=>{
  go.disabled=true;
  try{
    const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
    if(!tab?.id || !/^https:\/\/(www\.)?instagram\.com\//i.test(tab.url||""))
      throw new Error("Open the Instagram carousel first.");

    setStatus("Collecting slides…");

    const results=await chrome.scripting.executeScript({
      target:{tabId:tab.id},
      func: async function() {
        const sleep=ms=>new Promise(r=>setTimeout(r,ms));

        // Find the carousel <ul>
        const getCarouselUl=()=>{
          for(const ul of document.querySelectorAll('ul')){
            const imgs=[...ul.querySelectorAll('img')].filter(
              img=>img.naturalWidth>=400 && img.currentSrc
            );
            if(imgs.length>=1) return ul;
          }
          return null;
        };

        // Get all unique srcs currently rendered in the ul
        const getSrcs=(ul)=>[...new Set(
          [...ul.querySelectorAll('img')]
            .filter(img=>img.naturalWidth>=400 && img.currentSrc)
            .map(img=>img.currentSrc)
        )];

        // Find button by exact aria-label
        const getBtn=(label)=>
          [...document.querySelectorAll('button,[role="button"]')].find(b=>
            (b.getAttribute("aria-label")||"").trim()===label
          )||null;

        // Wait for carousel ul to appear
        let ul=null;
        for(let i=0;i<50;i++){ul=getCarouselUl();if(ul)break;await sleep(200);}
        if(!ul) throw new Error("Could not find carousel.");

        ul.scrollIntoView({behavior:"instant",block:"center"});
        await sleep(600);

        // Rewind to slide 1 — click "Go back" until it disappears
        // (Go back only appears after slide 1, so when it's gone we're at slide 1)
        for(let i=0;i<60;i++){
          const btn=getBtn("Go back");
          if(!btn) break; // already at slide 1
          const countBefore=getSrcs(ul).length;
          btn.click();
          // Wait for new slide to load into ul
          for(let j=0;j<25;j++){
            await sleep(150);
            if(getSrcs(ul).length!==countBefore) break;
            // Also check if Go back disappeared (means we hit slide 1)
            if(!getBtn("Go back")) break;
          }
          await sleep(100);
        }
        await sleep(400);

        // Collect all slides
        const seen=new Set();
        const urls=[];

        const snap=(ul)=>{
          for(const src of getSrcs(ul)){
            if(!seen.has(src)){seen.add(src);urls.push(src);}
          }
        };

        snap(ul); // grab slide 1 + pre-rendered slide 2

        // Click Next until button disappears or no new slide loads
        for(let i=0;i<100;i++){
          const btn=getBtn("Next");
          if(!btn) break; // no Next button = last slide reached

          const countBefore=seen.size;
          btn.click();

          // Wait for a NEW image to appear in the ul
          let newSlideLoaded=false;
          for(let j=0;j<30;j++){
            await sleep(150);
            // Check if any src in ul is not yet in seen
            const srcsNow=getSrcs(ul);
            const hasNew=srcsNow.some(s=>!seen.has(s));
            if(hasNew){newSlideLoaded=true;break;}
          }

          snap(ul); // capture whatever loaded

          // If no new slide appeared after clicking Next, we're done
          if(!newSlideLoaded || seen.size===countBefore) break;
        }

        if(!urls.length) throw new Error("No slides found.");

        const shortcode=(location.pathname.match(/\/(?:p|reel|tv)\/([^/]+)/i)||[])[1]||"instagram-carousel";
        return {urls, shortcode};
      }
    });

    const data=results?.[0]?.result;
    if(!data?.urls?.length) throw new Error("No slides found.");
    setStatus(`Found ${data.urls.length} slide(s). Creating PDF…`);

    const r=await chrome.runtime.sendMessage({action:"buildPdf",urls:data.urls,shortcode:data.shortcode});
    if(!r?.ok) throw new Error(r?.error||"PDF creation failed.");
    setStatus(`Done — ${data.urls.length} slides saved.`, "ok");
  }catch(e){
    setStatus("Error: "+(e?.message||e),"err");
  }finally{go.disabled=false}
};
