import type { OsiLayer } from '../../learning/osi-worlds';
const ink='#29443f', paper='#fffdf3';
const points = [[160,325],[340,230],[545,320],[735,218],[928,315]];
function poly(c:CanvasRenderingContext2D,p:number[][],fill:string,stroke=ink) { c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();c.strokeStyle=stroke;c.lineWidth=2;c.lineJoin='round';c.stroke(); }
function box(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,fill=paper,r=7){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();c.strokeStyle=ink;c.lineWidth=2;c.stroke();}
function label(c:CanvasRenderingContext2D,s:string,x:number,y:number,size=13,color=ink){c.font=`700 ${size}px Quicksand,system-ui,sans-serif`;c.textAlign='center';c.fillStyle=color;c.fillText(s,x,y);}
function path(c:CanvasRenderingContext2D,p:number[][],color:string,width=3){c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();}
export class OsiWorld {
 private c:CanvasRenderingContext2D; private observer:ResizeObserver; private ratio=1; private scale=1;private ox=0;private oy=0;private w=1100;private h=540;
 constructor(private canvas:HTMLCanvasElement,private layer:OsiLayer,private select:(i:number)=>void,private message:()=>string){
  this.c=canvas.getContext('2d')!;this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(canvas);canvas.addEventListener('click',this.click);this.resize();
 }
 private resize(){const r=this.canvas.getBoundingClientRect();this.w=r.width;this.h=r.height;this.ratio=Math.min(devicePixelRatio||1,2);this.canvas.width=Math.round(this.w*this.ratio);this.canvas.height=Math.round(this.h*this.ratio);this.scale=Math.min(this.w/1100,this.h/540);this.ox=(this.w-1100*this.scale)/2;this.oy=(this.h-540*this.scale)/2;}
 private click=(e:MouseEvent)=>{const r=this.canvas.getBoundingClientRect();const x=(e.clientX-r.left-this.ox)/this.scale,y=(e.clientY-r.top-this.oy)/this.scale;points.forEach(([px,py],i)=>{if(Math.abs(px-x)<76&&y>py-115&&y<py+54)this.select(i);});};
 draw(selected:number,progress:number,running:boolean,reduced:boolean,time:number){
  const c=this.c,l=this.layer;c.setTransform(this.ratio,0,0,this.ratio,0,0);c.clearRect(0,0,this.w,this.h);c.translate(this.ox,this.oy);c.scale(this.scale,this.scale);
  c.fillStyle='#e0e6d0';for(let x=12;x<1100;x+=24)for(let y=14;y<540;y+=24)c.fillRect(x,y,1.3,1.3);
  poly(c,[[40,300],[550,42],[1062,300],[554,510]],'#d6e8dc');poly(c,[[40,300],[554,510],[554,529],[40,319]],'#a4c5b2');poly(c,[[554,510],[1062,300],[1062,319],[554,529]],'#86b7a1');
  c.save();c.beginPath();c.moveTo(40,300);c.lineTo(550,42);c.lineTo(1062,300);c.lineTo(554,510);c.closePath();c.clip();c.globalAlpha=.5;
  for(let x=-650;x<1550;x+=52){path(c,[[x,0],[x+1080,540]],'#aad2bd',1);path(c,[[x,540],[x+1080,0]],'#aad2bd',1);}c.restore();
  // Each link belongs to this layer's conceptual story, including software roles.
  for(let i=0;i<4;i++){
   const a=points[i],b=points[i+1];path(c,[a,b],'#94b6a2',12);path(c,[a,b],'#f2f4d9',5);
   if(progress>i){const f=Math.min(1,progress-i);path(c,[a,[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f]],l.color,5);}
   const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2;box(c,mx-22,my-12,44,23,l.pale,9);label(c,'→',mx,my+4,17,l.color);
  }
  this.payload(c,selected,progress);
  this.plant(c,208,166);this.plant(c,871,399);this.plant(c,85,295);
  points.map((p,i)=>({p,i})).sort((a,b)=>a.p[1]-b.p[1]).forEach(({p:[x,y],i})=>{
   c.save();c.translate(x,y);const active=i===selected;
   if(active){c.beginPath();c.ellipse(0,7,72,32,0,0,Math.PI*2);c.fillStyle=l.pale;c.fill();c.setLineDash([5,5]);c.strokeStyle=l.color;c.lineWidth=2;c.stroke();c.setLineDash([]);}
   poly(c,[[-48,0],[0,-23],[48,0],[0,23]],'#edf1d6');poly(c,[[-48,0],[0,23],[0,31],[-48,8]],'#bdcda7');poly(c,[[0,23],[48,0],[48,8],[0,31]],'#a5bc91');
   const icon=l.stations[i].icon;
   if(icon==='computer'){box(c,-34,-82,67,48,l.pale);poly(c,[[33,-82],[42,-74],[42,-32],[33,-34]],'#a3b4a4');box(c,-28,-76,55,34,'#ccebf3',3);label(c,i===0?'> '+Array.from(this.message()).slice(0,7).join(''):i===4&&selected===4?'> got it!':'> ready_',0,-57,10);path(c,[[-21,-49],[16,-49]],l.color,2);path(c,[[0,-32],[0,-12]],ink,7);poly(c,[[-18,-10],[0,-19],[20,-10],[0,-1]],'#d4dfc7');}
   else if(icon==='router'||icon==='switch'){
    if(icon==='router'){path(c,[[-25,-58],[-25,-97]],ink,4);path(c,[[22,-58],[22,-97]],ink,4);}
    poly(c,[[-38,-55],[0,-73],[38,-55],[0,-36]],l.pale);poly(c,[[-38,-55],[0,-36],[0,-17],[-38,-35]],l.color);poly(c,[[0,-36],[38,-55],[38,-35],[0,-17]],'#91c3a7');
    label(c,icon==='router'?'↔':'···',0,-52,27);for(let k=0;k<3;k++)box(c,7+k*10,-34-k*5,5,5,paper,1);path(c,[[-19,-25],[-19,-15]],ink,5);path(c,[[16,-24],[16,-14]],ink,5);
   }else if(icon==='server'){box(c,-29,-90,58,77,l.pale);for(let k=0;k<3;k++){box(c,-23,-83+k*21,46,17,paper,2);label(c,'●  ━',0,-71+k*21,12,l.color);}}
   else if(icon==='cable'||icon==='bridge'){poly(c,[[-40,-22],[-40,-46],[0,-65],[40,-46],[40,-22],[0,-3]],l.pale);path(c,[[-31,-34],[0,-50],[30,-34]],l.color,7);label(c,icon==='cable'?'0101':'IP',0,-30,16);}
   else if(icon==='parcel'){poly(c,[[-32,-63],[0,-79],[33,-63],[0,-47]],'#ffe6a3');poly(c,[[-32,-63],[0,-47],[0,-12],[-32,-28]],'#f4c86d');poly(c,[[0,-47],[33,-63],[33,-28],[0,-12]],'#e4af5b');path(c,[[0,-79],[0,-47],[0,-12]],paper,4);box(c,7,-45,18,12,paper,1);}
   else {box(c,-34,-85,68,64,l.pale,10);box(c,-27,-78,54,47,paper,5);const symbols:Record<string,string>={wave:'∿',shield:'✓',sign:'↗',door:'⇄',chat:'···',flag:'⚑',letters:'Aa',book:'≡'};label(c,symbols[icon]??'↔',0,-46,31,l.color);path(c,[[0,-21],[0,-9]],ink,5);poly(c,[[-19,-8],[0,-17],[19,-8],[0,1]],'#d3dfbc');}
   box(c,-74,40,148,28,paper,8);label(c,l.stations[i].name,0,59,13);label(c,l.stations[i].badge,0,84,10,l.color);
   if(active){box(c,-15,-121,30,23,l.color,8);label(c,String(i+1),0,-105,12,'#ffffff');}
   c.restore();
  });
  if(progress>0){const segment=Math.min(3,Math.floor(progress)),f=Math.min(1,progress-segment),a=points[segment],b=points[segment+1],x=a[0]+(b[0]-a[0])*f,y=a[1]+(b[1]-a[1])*f-19;
   c.save();c.translate(x,y-(running&&!reduced?Math.sin(time*5)*3:0));box(c,-17,-13,34,25,l.pale,5);if(l.id===1) label(c,'01',0,4,13,l.color);else path(c,[[-14,-10],[0,0],[14,-10]],l.color,2);c.restore();}
  box(c,427,437,246,35,paper,7);label(c,`LAYER ${l.id}  ·  ${l.name.toUpperCase()}`,550,460,13,l.color);
  label(c,l.id>=5?'SOFTWARE ROLES INSIDE THE ENDPOINTS':l.id===4?'ENDPOINT SOFTWARE + NETWORK TRANSIT':'A LITTLE WORLD OF CONNECTED NODES',550,502,10);
 }
 private payload(c:CanvasRenderingContext2D,selected:number,progress:number){
  const l=this.layer,bytes=[...new TextEncoder().encode(this.message())];
  c.save();c.translate(550,113);box(c,-112,-27,224,84,'#fffdf3ed',10);
  const color=l.color;
  if(l.id===1){
   if(!bytes.length){label(c,'NO PAYLOAD BITS',0,7,12,color);label(c,'Type a message above',0,32,10,color);c.restore();return;}
   const bits=bytes[0].toString(2).padStart(8,'0');label(c,'BITS → SIGNAL → BITS',0,-11,9,color);
   const p:number[][]=[];for(let i=0;i<8;i++){const y=bits[i]==='1'?8:29; if(i)p.push([-88+i*22,y]);p.push([-88+i*22,y],[-66+i*22,y]);label(c,bits[i],-77+i*22,46,10,color);}
   path(c,p,color,2.5);const x=-88+(progress/4)*176;path(c,[[x,0],[x,32]],'#29443f66',1);
  }else if(l.id===2){label(c,'ONE LOCAL FRAME',0,-10,9,color);const names=['MAC','IP + DATA','FCS'];const widths=[48,100,40];let x=-94;names.forEach((n,i)=>{box(c,x,4,widths[i],27,i===1?l.pale:'#f7e8ac',3);label(c,n,x+widths[i]/2,22,10);x+=widths[i];});label(c,selected>=3?'FCS CHECK  ✓':'LOCAL ADDRESS LABEL',0,46,9,color);}
  else if(l.id===3){label(c,'FINAL IP STAYS THE SAME',0,-10,9,color);label(c,'10.0.1.2  →  10.0.2.2',0,15,14);label(c,`TTL: ${64-Math.min(2,Math.floor(progress/1.5))}   ·   MAC label changes per hop`,0,42,10,color);}
  else if(l.id===4){label(c,'TCP BYTE ORDER',0,-10,9,color);for(let i=0;i<4;i++){box(c,-91+i*47,2,43,25,l.pale,3);label(c,String(1000+i),-69+i*47,19,10,color);}label(c,`← ACK ${1000+bytes.length}   ·   next expected byte`,0,44,10,color);}
  else if(l.id===5){label(c,'ONE CONVERSATION',0,-10,9,color);label(c,'START   →   TALK   →   CLOSE',0,16,12);for(let i=0;i<3;i++){c.beginPath();c.arc(-66+i*66,36,5,0,Math.PI*2);c.fillStyle=i<=selected/2?color:'#dce3cd';c.fill();}}
  else if(l.id===6){label(c,'UTF-8 ENCODING',0,-10,9,color);const preview=this.message().length>15?this.message().slice(0,15)+'…':this.message();label(c,preview||'(empty message)',0,13,14);label(c,'↓',0,30,14,color);label(c,bytes.slice(0,7).map(b=>b.toString(16).padStart(2,'0').toUpperCase()).join(' ')||'0 bytes',0,47,11,color);}
  else{label(c,'HTTP EXCHANGE',0,-10,9,color);label(c,'POST /hello   →',0,14,14);label(c,selected>=3?'←   200 OK':'browser → web server',0,41,12,color);}
  c.restore();
 }
 private plant(c:CanvasRenderingContext2D,x:number,y:number){poly(c,[[x-10,y-22],[x+10,y-22],[x+7,y],[x-7,y]],'#dbb88d');c.fillStyle='#7caa69';for(const [dx,dy,r]of [[-7,-39,-.5],[6,-40,.5],[0,-49,0]]){c.save();c.translate(x+dx,y+dy);c.rotate(r);c.beginPath();c.ellipse(0,0,7,20,0,0,Math.PI*2);c.fill();c.strokeStyle=ink;c.lineWidth=1.7;c.stroke();c.restore();}}
 destroy(){this.observer.disconnect();this.canvas.removeEventListener('click',this.click);}
}
