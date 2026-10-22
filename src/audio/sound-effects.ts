export type SoundCue = 'inspect' | 'open' | 'close' | 'layer' | 'send' | 'hop' | 'step' | 'play' | 'pause' | 'reset' | 'success' | 'error' | 'drop';
type Tone = [frequency: number, offset: number, duration: number, amplitude?: number, endFrequency?: number];
const melodies: Record<SoundCue, Tone[]> = {
  inspect: [[523,0,.09,.21],[784,.055,.13,.15]],
  open: [[392,0,.10,.18],[587,.065,.15,.17]],
  close: [[587,0,.08,.16],[392,.055,.11,.13]],
  layer: [[523,0,.12,.2],[659,.075,.15,.2],[784,.15,.22,.16]],
  send: [[240,0,.20,.17,1100],[1047,.17,.12,.12]],
  hop: [[740,0,.07,.12,990]],
  step: [[660,0,.09,.17],[880,.04,.08,.10]],
  play: [[440,0,.09,.17],[660,.06,.12,.15]],
  pause: [[660,0,.075,.13],[440,.05,.09,.12]],
  reset: [[784,0,.08,.14],[587,.05,.08,.13],[392,.10,.12,.12]],
  success: [[523,0,.17,.19],[659,.09,.17,.19],[784,.18,.17,.19],[1047,.30,.32,.17]],
  error: [[330,0,.13,.16,220],[247,.12,.20,.13,165]],
  drop: [[440,0,.16,.14,140]],
};

/** Tiny local synth: no downloads, microphone access, timers or autoplay on page load. */
export class SoundEffects {
  private context?: AudioContext;
  private master?: GainNode;
  private voices = new Set<OscillatorNode>();
  private last = new Map<string, number>();
  private unlocked = false;
  private disposed = false;
  private enabled = true;
  private volume = .5;
  private layer = 1;
  setLayer(layer: number) { this.layer = Math.max(1,Math.min(7,layer)); }
  setEnabled(enabled: boolean) {
    this.enabled=enabled;
    if(!enabled) this.stop();
    this.applyVolume();
  }
  setVolume(volume: number) {
    if(!Number.isFinite(volume)) return;
    this.volume=Math.max(0,Math.min(1,volume));
    if(this.volume===0) this.stop();
    this.applyVolume();
  }
  private applyVolume() {
    if(!this.master||!this.context)return;
    this.master.gain.cancelScheduledValues(this.context.currentTime);
    this.master.gain.setTargetAtTime(this.enabled?this.volume*.23:0,this.context.currentTime,.012);
  }
  unlock() {
    if(this.disposed||!this.enabled||document.hidden)return;
    try {
      if(!this.context) {
        this.context=new AudioContext();
        this.master=this.context.createGain();
        this.master.gain.value=this.volume*.23;
        const limiter=this.context.createDynamicsCompressor();
        limiter.threshold.value=-18;limiter.knee.value=15;limiter.ratio.value=6;
        this.master.connect(limiter);limiter.connect(this.context.destination);
      }
      this.unlocked=true;
      if(this.context.state==='suspended')void this.context.resume().catch(()=>{});
    }catch { /* Unsupported audio leaves the whole app usable. */ }
  }
  play(cue: SoundCue, layer = this.layer) {
    const c=this.context;
    if(this.disposed||!this.enabled||this.volume===0||!this.unlocked||!c||!this.master||document.hidden||c.state==='closed')return;
    const now=performance.now();
    const priority=cue==='success'||cue==='error'||cue==='layer'||cue==='send'||cue==='drop';
    const group=cue==='hop'||priority?cue:'interaction';
    const gap=priority?180:cue==='hop'?145:45;
    if(now-(this.last.get(group)??-Infinity)<gap)return;
    this.last.set(group,now);
    // Layer worlds have a shared musical palette with their own gentle pitch.
    const pitch=cue==='hop'||cue==='inspect'||cue==='layer'?2**((Math.max(1,Math.min(7,layer))-1)/24):1;
    try {
      for(const [hz,offset,duration,amplitude=.18,end] of melodies[cue]) {
        if(this.voices.size>=16)break;
        const osc=c.createOscillator(),gain=c.createGain(),start=c.currentTime+.008+offset;
        osc.type=cue==='send'||cue==='drop'?'sine':'triangle';
        osc.frequency.setValueAtTime(hz*pitch,start);
        if(end)osc.frequency.exponentialRampToValueAtTime(end*pitch,start+duration);
        gain.gain.setValueAtTime(.0001,start);
        gain.gain.exponentialRampToValueAtTime(amplitude,start+.008);
        gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
        osc.connect(gain);gain.connect(this.master);this.voices.add(osc);
        osc.onended=()=>{this.voices.delete(osc);osc.disconnect();gain.disconnect();};
        osc.start(start);osc.stop(start+duration+.02);
      }
    }catch { /* Device changes or suspended contexts must never interrupt learning. */ }
  }
  stop() { for(const osc of this.voices){try{osc.stop();}catch{/* Already ended. */}}this.voices.clear(); }
  hide() { this.stop();if(this.context?.state==='running')void this.context.suspend().catch(()=>{}); }
  destroy() {this.disposed=true;this.stop();if(this.context)void this.context.close().catch(()=>{});}
  bindInterface() {
    const unlock=()=>this.unlock();
    const click=(event: MouseEvent)=>{
      const target=event.target instanceof Element?event.target.closest<HTMLElement>('button,summary,a,input[type="radio"],input[type="checkbox"]'):null;
      if(!target||target.matches(':disabled,[data-sound-control]')||target.closest('[data-sound-own]'))return;
      const id=target.id;
      if(id==='send'||id==='osi-nav'||id==='network-classroom'||id==='osi-next'||id==='osi-prev'||target.matches('[data-osi-layer],[data-osi-stack],[data-osi-station],[data-connected-side],[data-connected-step]'))return;
      let cue: SoundCue | undefined;
      if(/drop|fault-(data|ack)/.test(id))cue='drop';
      else if(/reset|replay/.test(id)||target.dataset.conceptAction==='reset')cue='reset';
      else if(/next|back|prev/.test(id))cue='step';
      else if(/play/.test(id))cue=/Pause/.test(target.textContent??'')||target.getAttribute('aria-label')==='Pause'?'pause':'play';
      else if(target.matches('[data-device],[data-event],[data-concept]'))cue='inspect';
      if(cue)this.play(cue);
    };
    const visibility=()=>{if(document.hidden)this.hide();else if(this.unlocked)this.unlock();};
    document.addEventListener('pointerdown',unlock,true);
    document.addEventListener('keydown',unlock,true);
    document.addEventListener('click',click,true);
    document.addEventListener('visibilitychange',visibility);
    return ()=>{
      document.removeEventListener('pointerdown',unlock,true);document.removeEventListener('keydown',unlock,true);
      document.removeEventListener('click',click,true);
      document.removeEventListener('visibilitychange',visibility);
    };
  }
}
export const soundEffects = new SoundEffects();
