import { osiExplorerNav } from './osi-explorer-nav';
import { osiLayers } from '../learning/osi-worlds';
import { connectedSteps, connectedPayload } from '../learning/osi-connected';
import { soundEffects } from '../audio/sound-effects';
import { escape as esc } from './network-notebook';
type Options={message:string;reduced:()=>boolean;saveMessage:(message:string)=>void;navigate:(id:number)=>void;formats:()=>void;close:()=>void};
const computer=`<svg viewBox="0 0 100 82" aria-hidden="true"><path d="m22 60 28-14 30 14-29 15Z" fill="#dbe8c3" stroke="#29443f" stroke-width="2"/><path d="M49 47v13" stroke="#29443f" stroke-width="6"/><path d="m72 8 8 6v39l-8-5" fill="#9dc1ad" stroke="#29443f" stroke-width="2"/><rect x="18" y="5" width="56" height="44" rx="6" fill="#fff9de" stroke="#29443f" stroke-width="2"/><rect x="23" y="10" width="46" height="31" rx="2" fill="#c7e6f2" stroke="#29443f" stroke-width="1.5"/><path d="m31 22 6 3-6 3m13 1h15" fill="none" stroke="#5c8e84" stroke-width="2"/></svg>`;
export function mountOsiConnected(root:HTMLElement,o:Options){
 let step=0,playing=false,elapsed=0,speed=1,message=o.message,disposed=false;
 root.style.setProperty('--osi-color','#3d8b80');root.style.setProperty('--osi-pale','#dbefe5');
 const tower=(side:'sender'|'receiver')=>`<section class="connected-tower connected-${side}" aria-label="${side} OSI stack"><div class="connected-machine">${computer}<div><small>${side==='sender'?'COMPUTER A · SENDER':'COMPUTER B · RECEIVER'}</small><h2>${side==='sender'?'Wrap it ↓':'Unwrap it ↑'}</h2></div></div><div class="connected-layer-list">${[...osiLayers].reverse().map(l=>`<button data-connected-side="${side}" data-connected-layer="${l.id}" style="--row-color:${l.color};--row-pale:${l.pale}"><b>${l.id}</b><span>${l.name}<small>${side==='sender'?['Send signals','Add MAC label','Add IP label','Add TCP label','Keep conversation','Encode bytes','Create request'][l.id-1]:['Read signals','Remove MAC label','Remove IP label','Read TCP label','Match conversation','Decode bytes','Read request'][l.id-1]}</small></span><i>${side==='sender'?'↓':'↑'}</i></button>`).join('')}</div><div class="connected-plinth"></div></section>`;
 root.innerHTML=`<div class="osi-topline"><span class="eyebrow">THE OSI EXPLORER / THE WHOLE JOURNEY</span><button id="connected-exit" class="text-button">← Back to layer worlds</button></div><div class="osi-intro"><div><h1>Seven layers.<br><em>Working together.</em></h1><p>Add delivery labels, cross the cable, then open the labels at the other end.</p></div><div class="osi-message"><label for="connected-message">FOLLOW YOUR OWN MESSAGE</label><div><input id="connected-message" maxlength="80" value="${esc(message)}" aria-label="Connected journey message"><span id="connected-byte-count"></span></div><small>One local-link example · an established TCP connection</small></div></div>
 ${osiExplorerNav("connected")}
 <div class="connected-key"><span><b>↓</b> Solid arrows: passing data to the next job</span><span><b>↔</b> Matching colours: partners doing the same job</span><span><b>▱</b> Wrappers carry the layers above</span></div>
 <section class="connected-stage" aria-label="One message through both seven-layer stacks">${tower('sender')}
 <section class="connected-middle"><div class="connected-phase" id="connected-phase"></div><div class="connected-peers" id="connected-peers"></div><div class="connected-step-label" id="connected-step-label"></div><h2 id="connected-title" tabindex="-1"></h2><p id="connected-caption" role="status" aria-live="polite"></p><div class="connected-handoff" id="connected-handoff"></div><div class="connected-parcel"><small>WHAT THE NEXT LAYER RECEIVES</small><div id="connected-wrappers"></div><div id="connected-bits"></div></div><div class="connected-received" id="connected-received" hidden><small>AT THE RECEIVING APP</small><strong id="connected-result"></strong><span>✓ Same message. All seven roles worked together.</span></div><button id="connected-explore" class="text-button">Explore this layer’s world ↗</button></section>
 ${tower('receiver')}<button id="connected-wire" class="connected-wire" data-sound-own><span>1</span><i></i><b>0101 <em>→</em> signals across one cable <em>→</em> 0101</b><i></i><span>1</span></button></section>
 <section class="connected-controls" aria-label="Whole journey playback"><button id="connected-play" class="primary">▶ Play whole journey</button><button id="connected-prev" class="text-button">← Previous</button><button id="connected-next" class="text-button">Next handoff →</button><button id="connected-reset" class="text-button">↶ Replay</button><label>Speed <select id="connected-speed" aria-label="Whole journey speed"><option value=".5">½×</option><option value="1" selected>1×</option><option value="2">2×</option><option value="4">4×</option></select></label><span id="connected-count"></span><div class="connected-progress" id="connected-progress" aria-label="Select a journey step">${connectedSteps.map((s,i)=>`<button data-connected-step="${i}" aria-label="Step ${i+1}: ${s.side} ${s.layer}, ${esc(s.title)}"></button>`).join('')}</div></section>
 <div class="connected-takeaways"><div><span>↓ ↑</span><strong>Neighbours cooperate.</strong><p>A layer uses the one below and serves the one above.</p></div><div><span>▱</span><strong>Data travels inside data.</strong><p>Frame [ IP [ TCP [ application bytes ] ] ]</p></div><div><span>↔</span><strong>Peers understand the same labels.</strong><p>Matching layers interpret the information their partner sent.</p></div></div><details class="connected-notes"><summary>A little more detail about this example</summary><p>This is an OSI teaching animation, separate from the network lab’s simulation. Both computers share a local Ethernet link; a routed network would repeat lower-layer delivery at every hop. HTTP travels in TCP, in IP, in Ethernet. TCP headers, IP headers, Ethernet headers and the FCS are schematic; this module does not serialize them or compute checksums.</p><p>Layers 5–7 illustrate roles that commonly share application code. There is no invented session or presentation header. This example encodes a plain HTTP request as UTF-8, with no compression or encryption. DNS lookup and TCP setup happen before this example; acknowledgements and the HTTP response would be separate journeys in the reverse direction.</p><p id="connected-request-detail"></p></details>`;
 const find=<T extends HTMLElement=HTMLElement>(q:string)=>root.querySelector<T>(q)!;
 const playbackArea=document.createElement("div");
 playbackArea.className="connected-playback-area";
 root.insertBefore(playbackArea,find(".connected-stage"));
 playbackArea.append(find(".connected-controls"),find(".connected-stage"));
 function render(){
  const s=connectedSteps[step],l=osiLayers[s.layer-1],p=connectedPayload(message);
  root.dataset.currentLayer=String(s.layer);
  root.style.setProperty('--osi-color',l.color);root.style.setProperty('--osi-pale',l.pale);
  find('#connected-phase').textContent=s.side==='sender'?'SENDER · ADDING WRAPPERS':s.side==='receiver'?'RECEIVER · OPENING WRAPPERS':'THE PHYSICAL LINK';
  find('#connected-peers').textContent=`Layer ${l.id} ${l.name} ↔ Layer ${l.id} ${l.name}`;
  find('#connected-step-label').textContent=`HANDOFF ${String(step+1).padStart(2,'0')} OF 15`;
  find('#connected-title').textContent=s.title;find('#connected-caption').textContent=s.caption;find('#connected-handoff').textContent=s.handoff;
  find('#connected-count').textContent=`${step+1} / ${connectedSteps.length}`;
  find('#connected-play').textContent=playing?'Ⅱ Pause journey':step===14?'▶ Play again':'▶ Play whole journey';
  find<HTMLButtonElement>('#connected-prev').disabled=step===0;find<HTMLButtonElement>('#connected-next').disabled=step===14;
  root.querySelectorAll<HTMLButtonElement>('[data-connected-side]').forEach(b=>{const layer=Number(b.dataset.connectedLayer),side=b.dataset.connectedSide;
   const index=side==='sender'?7-layer:7+layer;
   b.classList.toggle('connected-peer',layer===s.layer);b.classList.toggle('connected-visited',index<step);
   if(index===step)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');
  });
  find('#connected-wire').classList.toggle('connected-wire-active',step===7);
  find('#connected-wire').setAttribute('aria-pressed',String(step===7));
  root.querySelectorAll<HTMLButtonElement>('[data-connected-step]').forEach((b,i)=>{b.style.backgroundColor=i<=step?osiLayers[connectedSteps[i].layer-1].color:'#dce4d4';if(i===step)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
  const textView=step===0||step>=13;
  let parcel=`<div class="connected-data"><small>${textView?'HTTP REQUEST BODY':'UTF-8 APPLICATION BYTES'}</small><strong>${textView?(esc(message)||'<em>(empty message)</em>'):([...p.bodyBytes.slice(0,8)].map(b=>b.toString(16).padStart(2,'0').toUpperCase()).join(' ')||'0 body bytes')}</strong><span>${textView?'POST /hello':`Body preview · ${p.bytes.length} bytes in the complete HTTP request`}</span></div>`;
  if(s.wraps>=1)parcel=`<div class="connected-wrap wrap-tcp"><b>TCP · ports 51000 → 80</b>${parcel}<small>SEQ 1000 · identifies and orders the byte stream</small></div>`;
  if(s.wraps>=2)parcel=`<div class="connected-wrap wrap-ip"><b>IP · 10.0.0.2 → 10.0.0.3</b>${parcel}</div>`;
  if(s.wraps>=3)parcel=`<div class="connected-wrap wrap-mac"><b>Ethernet · MAC …0A → …0B</b>${parcel}<small>FCS · error check</small></div>`;
  find('#connected-wrappers').innerHTML=parcel;
  find('#connected-bits').textContent=step>=6&&step<=8?`∿  ${[...p.bytes.slice(0,3)].map(b=>b.toString(2).padStart(8,'0')).join(' ')}  ∿`:'';
  find('#connected-byte-count').textContent=`${p.bodyBytes.length} bytes`;
  find('#connected-received').hidden=step!==14;find('#connected-result').textContent=p.decoded||'(empty message)';
  find('#connected-request-detail').textContent=`Your message body: ${p.bodyBytes.length} UTF-8 bytes. Complete HTTP request: ${p.bytes.length} bytes. For a starting sequence of 1000, its next-byte TCP ACK would be ${p.ack}.`;
  root.classList.toggle('connected-is-playing',playing&&!o.reduced());
 }
 function choose(i:number){step=i;playing=false;elapsed=0;soundEffects.play(i===14?'success':'step',connectedSteps[i].layer);render();}
 root.querySelectorAll<HTMLButtonElement>('[data-connected-side]').forEach(b=>b.onclick=()=>choose(b.dataset.connectedSide==='sender'?7-Number(b.dataset.connectedLayer):7+Number(b.dataset.connectedLayer)));
 root.querySelectorAll<HTMLButtonElement>('[data-connected-step]').forEach(b=>b.onclick=()=>choose(Number(b.dataset.connectedStep)));
 find('#connected-wire').onclick=()=>choose(7);find('#connected-prev').onclick=()=>choose(Math.max(0,step-1));find('#connected-next').onclick=()=>choose(Math.min(14,step+1));
 find('#connected-play').onclick=()=>{if(step===14)step=0;playing=!playing;elapsed=0;render();};find('#connected-reset').onclick=()=>choose(0);
 find<HTMLSelectElement>('#connected-speed').onchange=e=>speed=Number((e.target as HTMLSelectElement).value);
 find<HTMLInputElement>('#connected-message').oninput=e=>{message=(e.target as HTMLInputElement).value;step=0;playing=false;elapsed=0;o.saveMessage(message);render();};
 find('#connected-formats-open').onclick=o.formats;
 find('#osi-worlds-open').onclick=o.close;
 find('#osi-connected-open').onclick=()=>{};
 find('#connected-exit').onclick=o.close;find('#connected-explore').onclick=()=>o.navigate(connectedSteps[step].layer);
 render();
 return {tick(dt:number){if(disposed||!playing)return;elapsed+=dt*speed;if(elapsed<1.8)return;elapsed=0;step=Math.min(14,step+1);if(step===14)playing=false;soundEffects.play(step===14?'success':step===7?'send':'hop',connectedSteps[step].layer);render();},destroy(){disposed=true;playing=false;root.classList.remove('connected-is-playing');}};
}
