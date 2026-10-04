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

        // Find the main article element containing the carousel
        const getArticle=()=>{
          // Instagram posts live inside <article> tags
          const articles=[...document.querySelectorAll('article')];
          // Pick the one closest to center of viewport (the active post)
          const cx=window.innerWidth/2, cy=window.innerHeight/2;
          let best=null, bestDist=Infinity;
          for(const a of articles){
            const r=a.getBoundingClientRect();
            if(r.width===0||r.height===0)continue;
            const dist=Math.hypot(r.left+r.width/2-cx, r.top+r.height/2-cy);
            if(dist<bestDist){bestDist=dist;best=a;}
          }
          return best;
        };

        // Get the best carousel image — must be inside the article, large, and loaded
        const getCarouselImage=(article)=>{
          if(!article)return null;
          const imgs=[...article.querySelectorAll('img')].filter(img=>{
            const r=img.getBoundingClientRect();
            return r.width>=200 && r.height>=200 &&
                   img.complete && img.naturalWidth>=300 &&
                   getComputedStyle(img).display!=="none" &&
                   getComputedStyle(img).visibility!=="hidden" &&
                   // exclude avatars / thumbnails in the header area
                   r.top > 40;
          });
          // pick the largest
          imgs.sort((x,y)=>{
            const rx=x.getBoundingClientRect(), ry=y.getBoundingClientRect();
            return ry.width*ry.height - rx.width*rx.height;
          });
          return imgs[0]||null;
        };

        // Find prev/next buttons scoped inside the article to avoid hitting page-level buttons
        const findBtn=(article, dir)=>{
          if(!article)return null;
          const scope=article;
          const words=dir==="prev"
            ?["previous","prev","back","zurück","précédent","anterior","left"]
            :["next","suivant","siguiente","nächste","avanti","right"];
          const candidates=[...scope.querySelectorAll('button,[role="button"]')].filter(e=>{
            const r=e.getBoundingClientRect();
            return r.width>0 && r.height>0;
          });
          return candidates.find(e=>{
            const t=((e.getAttribute("aria-label")||"")+" "+(e.getAttribute("title")||"")+" "+(e.innerText||"")).toLowerCase();
            return words.some(w=>t.includes(w));
          })||null;
        };

        // Wait for article to appear
        let article=null;
        for(let i=0;i<40;i++){article=getArticle();if(article)break;await sleep(250);}
        if(!article)throw new Error("Could not find the post on this page.");

        // Scroll article into view so buttons appear
        article.scrollIntoView({behavior:"instant",block:"center"});
        await sleep(400);

        // Wait for the main carousel image
        let im=null;
        for(let i=0;i<40;i++){im=getCarouselImage(article);if(im)break;await sleep(250);}
        if(!im)throw new Error("No carousel image found.");

        // Rewind to slide 1
        for(let i=0;i<60;i++){
          const b=findBtn(article,"prev");
          if(!b)break;
          const before=getCarouselImage(article)?.currentSrc||"";
          b.click();
          let changed=false;
          for(let j=0;j<20;j++){
            await sleep(150);
            const now=getCarouselImage(article)?.currentSrc||"";
            if(now && now!==before){changed=true;break;}
          }
          if(!changed)break;
        }

        await sleep(400);

        // Collect all slide URLs by stepping forward
        const urls=[];
        const seen=new Set();

        // Capture slide 1
        const first=getCarouselImage(article)?.currentSrc||"";
        if(first){seen.add(first);urls.push(first);}

        // Step through remaining slides
        for(let i=0;i<100;i++){
          const nextBtn=findBtn(article,"next");
          if(!nextBtn)break; // no more slides

          const before=getCarouselImage(article)?.currentSrc||"";
          nextBtn.click();

          // Wait for image to actually change
          let changed=false;
          for(let j=0;j<25;j++){
            await sleep(160);
            const now=getCarouselImage(article)?.currentSrc||"";
            if(now && now!==before){changed=true;break;}
          }
          if(!changed)break;

          await sleep(100);
          const cur=getCarouselImage(article)?.currentSrc||"";
          if(cur && !seen.has(cur)){
            seen.add(cur);
            urls.push(cur);
          }

          // If we've looped back to slide 1 it means we've gone past the end
          if(cur && urls.length>1 && cur===urls[0])break;
        }

        if(!urls.length)throw new Error("No slides found.");

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
