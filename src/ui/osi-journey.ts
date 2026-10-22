import { osiExplorerNav } from './osi-explorer-nav';
import { osiLayers, layerData, messageBytes } from '../learning/osi-worlds';
import { soundEffects } from '../audio/sound-effects';
import { OsiWorld } from '../art/network/osi-world';
import { escape as esc } from './network-notebook';
type Options={layer:number;message:string;reduced:()=>boolean;navigate:(id:number)=>void;close:()=>void;reference:(unit:number)=>void;formats:()=>void;saveMessage:(message:string)=>void};
export function mountOsiJourney(root:HTMLElement,o:Options){
 const l=osiLayers[o.layer-1];let selected=0,progress=0,playing=false,elapsed=0,message=o.message,destroyed=false;
 root.dataset.currentLayer=String(l.id);
 root.style.setProperty('--osi-color',l.color);root.style.setProperty('--osi-pale',l.pale);
 root.innerHTML=`<div class="osi-topline"><span class="eyebrow">THE OSI EXPLORER <span class="slash">/</span> ONE MESSAGE · SEVEN WORLDS</span><button class="text-button" id="osi-exit">← Back to network lab</button></div>
 <div class="osi-intro"><div><h1>Seven layers.<br><em>One little hello.</em></h1><p>Each layer has one job. Explore the roles here, then watch them work together.</p></div><div class="osi-message"><label for="osi-message">THE SAME MESSAGE IN EVERY WORLD</label><div><input id="osi-message" maxlength="80" value="${esc(message)}" aria-label="OSI journey message"><span id="osi-bytes"></span></div><small>Try your name or an emoji. Follow it from 1 → 7.</small></div></div>
 <nav class="osi-layer-nav" aria-label="Seven OSI layer worlds">${osiLayers.map(x=>`<button data-osi-layer="${x.id}" style="--tile-color:${x.color};--tile-pale:${x.pale}" ${x.id===l.id?'aria-current="page"':''}><b>${String(x.id).padStart(2,'0')}</b><span>${x.name}</span><small>${x.id===l.id?'YOU ARE HERE':'EXPLORE WORLD'}</small></button>`).join('')}</nav>
 ${osiExplorerNav("worlds")}
 <section class="osi-banner"><span class="osi-number">${String(l.id).padStart(2,'0')}</span><div><span class="tiny-label">${l.name.toUpperCase()} LAYER</span><h2 id="osi-title" tabindex="-1">${esc(l.title)}</h2><p>${l.task}</p></div><span class="osi-form">${l.form}</span></section>
 <div class="osi-workbench"><section class="osi-map-card"><div class="osi-map-header"><strong><i></i> The ${l.name.toLowerCase()} world</strong><button id="osi-reset" class="text-button">↻ Reset world</button></div><div class="osi-swipe-hint">↔ Swipe to explore the whole map</div><div class="osi-canvas-scroll"><canvas id="osi-canvas" role="img" aria-label="Isometric ${l.name} world with five connected stations. Use the station buttons below to explore the same map with a keyboard."></canvas></div><div class="osi-map-caption"><span>✦</span> ${l.id>=5?'Software jobs inside the sending and receiving computers.':'Click a node. Follow a parcel. See what changes.'}</div><div class="osi-stations" aria-label="Explore map stations">${l.stations.map((s,i)=>`<button data-osi-station="${i}" aria-pressed="${i===0}"><b>${i+1}</b>${s.name}</button>`).join('')}</div><div class="osi-controls"><button id="osi-play" class="primary">▶ Play this layer</button><button id="osi-step" class="text-button">Next station →</button><span id="osi-step-count">1 / 5</span></div></section>
 <aside class="osi-inspector"><div class="osi-inspector-heading"><span>✎</span><div><small>A CLOSER LOOK</small><h3 id="osi-node-name"></h3></div></div><div class="osi-action-icon" aria-hidden="true"></div><div class="osi-mini-flow" aria-hidden="true"><span>IN</span><i>→</i><b>${l.form}</b><i>→</i><span>OUT</span></div><p id="osi-action" role="status" aria-live="polite"></p><details id="osi-detail"><summary>A little more detail</summary><p id="osi-node-detail"></p></details><div class="osi-parcel"><small>INSIDE THIS WORLD</small><strong id="osi-data-main"></strong><span id="osi-data-sub"></span></div><div class="osi-stack"><small>HOW THE WORLDS CONNECT</small>${[...osiLayers].reverse().map(x=>`<button data-osi-stack="${x.id}" style="--stack-color:${x.color};--stack-pale:${x.pale}" ${x.id===l.id?'aria-current="page"':''}><b>${x.id}</b><span>${x.name}</span><em>${x.id===l.id?'← here':'↥'}</em></button>`).join('')}<p>Sender: 7 ↓ 1 · link · Receiver: 1 ↑ 7</p></div></aside></div>
 <footer class="osi-footer"><button id="osi-prev" class="osi-page-button" ${l.id===1?'disabled':''}>← <span>PREVIOUS WORLD<strong>${osiLayers[l.id-2]?.name??'Start at the physical link'}</strong></span></button><button id="osi-reference" class="text-button">CN classroom · Unit ${l.unit} ↗</button><button id="osi-next" class="osi-page-button" ${l.id===7?'disabled':''}><span>NEXT WORLD<strong>${osiLayers[l.id]?.name??'All seven explored'}</strong></span> →</button></footer>
 <p class="osi-scope">A visual guide to OSI roles. Each map isolates one idea; the network lab runs the packet simulation. Layers 5–7 commonly share application code in Internet systems.</p>`;
 const find=<T extends HTMLElement=HTMLElement>(s:string)=>root.querySelector<T>(s)!;
 const canvas=find<HTMLCanvasElement>('#osi-canvas');
 const world=new OsiWorld(canvas,l,i=>choose(i),()=>message);
 function data(){const d=layerData(l.id,message);find('#osi-bytes').textContent=`${messageBytes(message).length} bytes`;find('#osi-data-main').textContent=d[0];find('#osi-data-sub').textContent=d[1];}
 function update(){
  const viewport=find('.osi-canvas-scroll');
  if(viewport.scrollWidth>viewport.clientWidth){const positions=[160,340,545,735,928];const target=positions[selected]*canvas.clientWidth/1100;viewport.scrollTo({left:Math.max(0,target-viewport.clientWidth/2),behavior:o.reduced()?'instant':'smooth'});}
  const s=l.stations[selected];find('#osi-node-name').textContent=s.name;find('#osi-action').textContent=s.action;find('#osi-node-detail').textContent=s.detail;const symbols:Record<string,string>={computer:'▣',wave:'∿',cable:'0101',parcel:'▱',switch:'↔',router:'↗',shield:'✓',sign:'↗',bridge:'⇢',door:'⇄',chat:'···',flag:'⚑',letters:'Aa',book:'≡',server:'▤'};find('.osi-action-icon').textContent=symbols[s.icon]??'↔';find('#osi-step-count').textContent=`${selected+1} / 5`;find<HTMLButtonElement>('#osi-step').disabled=selected===4;root.querySelectorAll<HTMLButtonElement>('[data-osi-station]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===selected)));find('#osi-play').textContent=playing?'Ⅱ Pause':selected===4?'↶ Replay layer':'▶ Play this layer';}
 function choose(i:number){soundEffects.play('inspect',l.id);selected=i;progress=i;playing=false;find<HTMLDetailsElement>('#osi-detail').open=false;update();world.draw(selected,progress,false,o.reduced(),elapsed);}
 root.querySelectorAll<HTMLButtonElement>('[data-osi-layer],[data-osi-stack]').forEach(b=>b.onclick=()=>o.navigate(Number(b.dataset.osiLayer??b.dataset.osiStack)));
 root.querySelectorAll<HTMLButtonElement>('[data-osi-station]').forEach(b=>b.onclick=()=>choose(Number(b.dataset.osiStation)));
 find('#osi-prev').onclick=()=>o.navigate(l.id-1);find('#osi-next').onclick=()=>o.navigate(l.id+1);
 find('#osi-formats-open').onclick=o.formats;
 find('#osi-worlds-open').onclick=()=>{};
 find('#osi-connected-open').onclick=()=>{location.hash='osi-connected';};
 find('#osi-exit').onclick=o.close;find('#osi-reference').onclick=()=>o.reference(l.unit);
 find('#osi-reset').onclick=()=>choose(0);find('#osi-step').onclick=()=>choose(Math.min(4,selected+1));
 find('#osi-play').onclick=()=>{if(selected===4){progress=0;selected=0;}playing=!playing;update();};
 find<HTMLInputElement>('#osi-message').oninput=e=>{message=(e.target as HTMLInputElement).value;o.saveMessage(message);data();};
 update();data();world.draw(selected,progress,playing,o.reduced(),0);
 return {tick(dt:number){if(destroyed)return;elapsed+=dt;if(playing){progress=Math.min(4,progress+dt*.62);const next=Math.floor(progress);if(next!==selected){selected=next;if(selected===4)playing=false;soundEffects.play(selected===4?'success':'hop',l.id);update();}}world.draw(selected,progress,playing,o.reduced(),elapsed);},destroy(){destroyed=true;world.destroy();}};
}
