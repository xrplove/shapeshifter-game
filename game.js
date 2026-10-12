// Shapeshifter: Tree of Life — a gentle family game. MIT License.
const W=800,H=500;
const touch={up:0,down:0,left:0,right:0,space:0};let spaceTap=false;
document.querySelectorAll('[data-k]').forEach(b=>{const k=b.dataset.k;
 const on=e=>{e.preventDefault();Sound.start();if(k==='space'&&!touch.space)spaceTap=true;touch[k]=1};
 const off=e=>{e.preventDefault();touch[k]=0};
 b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointerleave',off);b.addEventListener('pointercancel',off);
 b.addEventListener('contextmenu',e=>e.preventDefault());
 b.addEventListener('touchstart',e=>{e.preventDefault();on(e);},{passive:false});
 b.addEventListener('touchend',off,{passive:false});
 b.addEventListener('touchcancel',off);
});
document.body.addEventListener('contextmenu',e=>{if(e.target.closest&&e.target.closest('[data-k],#mute,#pad'))e.preventDefault();});
const muteBtn=document.getElementById('mute');
muteBtn.addEventListener('contextmenu',e=>e.preventDefault());
muteBtn.addEventListener('touchstart',e=>e.preventDefault(),{passive:false});
const buzz=p=>{try{navigator.vibrate&&navigator.vibrate(p)}catch(e){}};

// ---------- Sound: everything made in code with Web Audio ----------
const Sound={ctx:null,master:null,muted:false,timer:null,form:0,step:0,
 tunes:[ // per form: [notes (semitones from root), root Hz, tempo ms, wave]
  [[0,2,4,7,4,2,0,-5],262,300,'triangle'],     // Ant: busy little walk
  [[7,9,12,9,7,4,7,12],392,220,'sine'],         // Fly: light and quick
  [[0,3,7,3,10,7,3,0],196,420,'sine'],          // Vampire: soft, mysterious
  [[0,4,7,11,12,11,7,4],330,380,'sine'],        // Angel: bright and floating
  [[0,4,7,12,7,9,5,7],262,340,'triangle'],      // King/Queen: proud march
 ],
 start(){if(this.ctx)return;const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
  this.ctx=new C();this.master=this.ctx.createGain();this.master.gain.value=this.muted?0:0.6;this.master.connect(this.ctx.destination);
  // breeze: filtered noise with slow swell
  const len=this.ctx.sampleRate*2,buf=this.ctx.createBuffer(1,len,this.ctx.sampleRate),d=buf.getChannelData(0);
  for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
  const n=this.ctx.createBufferSource();n.buffer=buf;n.loop=true;
  const f=this.ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=500;
  const g=this.ctx.createGain();g.gain.value=0.04;
  const lfo=this.ctx.createOscillator();lfo.frequency.value=0.12;const lg=this.ctx.createGain();lg.gain.value=0.03;
  lfo.connect(lg);lg.connect(g.gain);n.connect(f);f.connect(g);g.connect(this.master);n.start();lfo.start();
  this.setForm(this.form);},
 tone(freq,dur,type='sine',vol=0.15,slide=0){if(!this.ctx)return;const t=this.ctx.currentTime,o=this.ctx.createOscillator(),g=this.ctx.createGain();
  o.type=type;o.frequency.setValueAtTime(freq,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(40,freq+slide),t+dur);
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.connect(g);g.connect(this.master);o.start(t);o.stop(t+dur+0.05);},
 setForm(i){this.form=i;if(!this.ctx)return;clearInterval(this.timer);const[notes,root,ms,wave]=this.tunes[i];this.step=0;
  this.timer=setInterval(()=>{const s=notes[this.step++%notes.length];this.tone(root*Math.pow(2,s/12),ms/1000*1.6,wave,0.05);
   if(this.step%4===1)this.tone(root/2,ms/1000*3,'sine',0.035);},ms);},
 sfx(name){const T=(f,d,w,v,s)=>this.tone(f,d,w,v,s);
  ({pickup:()=>{T(660,0.12,'square',0.06);setTimeout(()=>T(990,0.15,'square',0.05),80)},
    drop:()=>{T(523,0.15,'triangle',0.1);setTimeout(()=>T(784,0.25,'triangle',0.1),100)},
    fly:()=>T(300,0.35,'sawtooth',0.04,500),land:()=>T(500,0.25,'sine',0.08,-300),
    sight:()=>T(220,0.6,'sine',0.1,440),find:()=>[784,988,1175].forEach((f,i)=>setTimeout(()=>T(f,0.3,'sine',0.08),i*90)),
    heal:()=>[523,659,784,1047].forEach((f,i)=>setTimeout(()=>T(f,0.5,'sine',0.07),i*70)),
    gather:()=>T(392,0.4,'triangle',0.1,200),bump:()=>T(120,0.12,'square',0.05),
    win:()=>[523,659,784,1047,1319].forEach((f,i)=>setTimeout(()=>T(f,0.6,'triangle',0.09),i*120))}[name]||(()=>{}))();},
 toggle(){this.muted=!this.muted;if(this.master)this.master.gain.value=this.muted?0:0.6;document.getElementById('mute').textContent=this.muted?'🔇':'🔊';}
};
window.addEventListener('keydown',()=>Sound.start());window.addEventListener('pointerdown',()=>Sound.start());
document.getElementById('mute').addEventListener('click',e=>{e.stopPropagation();Sound.toggle();});

// ---------- Levels ----------
const LEVELS=[
 {name:'Ant',color:0x8b4513,bg:0x6b8e23,goal:'Carry 5 crumbs home to the nest. Pick one up, bring it back.',power:'Space: pick up / drop a crumb',lesson:'Small hands doing steady work feed the whole family.'},
 {name:'Fly',color:0x4466aa,bg:0x88b0d8,goal:'Reach the flower. Walls are in the way!',power:'Space: fly up over the walls (press again to land)',lesson:'Rise above what blocks you, and the way opens.'},
 {name:'Vampire',color:0x6a2c70,bg:0x1b1030,goal:'Find 3 lost fireflies hidden in the dark.',power:'Space: night sight, see far in the dark',lesson:'Even in the dark, a gentle eye can find the light.'},
 {name:'Angel',color:0xfff3b0,bg:0xbfe3ff,goal:'Heal the 5 wilted flowers of the garden.',power:'Space near a flower: heal it',lesson:'Kindness given freely makes everything grow.'},
 {name:'Crown',color:0xffd700,bg:0x2e7d32,goal:'Gather the Ant, Fly, Vampire and Angel home to the Tree of Life.',power:'Walk to each friend; Space: call friends near you',lesson:'A true ruler serves, and brings everyone home together.'},
];

class Title extends Phaser.Scene{constructor(){super('Title')}
 create(){this.cameras.main.setBackgroundColor('#0b1020');
  drawTree(this,W/2,300,1);
  this.add.text(W/2,70,'Shapeshifter: Tree of Life',{fontSize:'38px',color:'#ffe9a8'}).setOrigin(0.5);
  this.add.text(W/2,120,'Ant → Fly → Vampire → Angel → King or Queen',{fontSize:'18px',color:'#cdf'}).setOrigin(0.5);
  this.add.text(W/2,440,'Press Space or tap Power to begin',{fontSize:'20px',color:'#fff'}).setOrigin(0.5);
  this.input.on('pointerdown',()=>this.go());this.input.keyboard.on('keydown-SPACE',()=>this.go());}
 go(){if(this.gone)return;this.gone=true;Sound.start();spaceTap=false;this.scene.start('Level',{i:0});}}

function drawTree(s,x,y,a){const g=s.add.graphics();g.fillStyle(0x6d4c2f,a).fillRect(x-14,y-20,28,120);
 g.fillStyle(0x2e8b57,a).fillCircle(x,y-60,70).fillCircle(x-60,y-30,45).fillCircle(x+60,y-30,45);
 g.fillStyle(0xffe9a8,a);for(let i=0;i<9;i++)g.fillCircle(x+Math.cos(i*0.7)*55,y-50+Math.sin(i*1.3)*35,4);return g;}

function makeForm(s,name,royal){const c=s.add.container(0,0);const g=s.add.graphics();c.add(g);
 if(name==='Ant'){g.fillStyle(0x3b2314).fillCircle(-10,0,7).fillCircle(0,0,6).fillCircle(10,0,8);g.lineStyle(2,0x3b2314);for(let i=-1;i<=1;i++){g.lineBetween(i*6,0,i*6-4,10);g.lineBetween(i*6,0,i*6-4,-10);}}
 else if(name==='Fly'){g.fillStyle(0xddeeff,0.8).fillEllipse(-6,-10,16,10).fillEllipse(6,-10,16,10);g.fillStyle(0x223355).fillCircle(0,0,9);g.fillStyle(0xcc2222).fillCircle(-4,-3,3).fillCircle(4,-3,3);}
 else if(name==='Vampire'){g.fillStyle(0x2a0f30).fillTriangle(-18,14,18,14,0,-8);g.fillStyle(0xf5e6d3).fillCircle(0,-10,9);g.fillStyle(0xff4d6d).fillCircle(-3,-11,2).fillCircle(3,-11,2);}
 else if(name==='Angel'){g.fillStyle(0xffffff,0.9).fillEllipse(-14,0,18,26).fillEllipse(14,0,18,26);g.fillStyle(0xfff3b0).fillTriangle(-9,14,9,14,0,-4).fillCircle(0,-10,8);g.lineStyle(2,0xffd700).strokeEllipse(0,-22,16,5);}
 else{g.fillStyle(royal==='Queen'?0xc2185b:0x1565c0).fillTriangle(-14,16,14,16,0,-4);g.fillStyle(0xf5d6b3).fillCircle(0,-10,9);g.fillStyle(0xffd700).fillTriangle(-9,-18,-5,-26,-1,-18).fillTriangle(-3,-18,0,-28,3,-18).fillTriangle(1,-18,5,-26,9,-18);}
 return c;}

class Level extends Phaser.Scene{constructor(){super('Level')}
 init(d){this.i=d.i;this.royal=d.royal||'King';this.done=false;}
 create(){const L=LEVELS[this.i];Sound.setForm(this.i);this.cameras.main.setBackgroundColor(L.bg);
  this.keys=this.input.keyboard.createCursorKeys();
  const title=this.i===4?this.royal:L.name;
  this.p=makeForm(this,L.name,this.royal);this.p.x=80;this.p.y=H/2;this.p.setDepth(5);
  this.score=0;this.flying=false;this.sight=false;this.carry=null;
  this['setup'+this.i]();
  this.hud=this.add.text(10,8,'',{fontSize:'16px',color:'#fff',backgroundColor:'#0008',padding:{x:6,y:4},wordWrap:{width:W-90}}).setDepth(20);
  this.base=`Form ${this.i+1}/5: ${title} — ${L.goal}\n${L.power}`;this.updHud();
  this.cameras.main.fadeIn(500);this.cameras.main.flash(400,255,255,220);buzz(60);}
 updHud(extra=''){this.hud.setText(this.base+(extra?'\n'+extra:''));}
 shine(){this.cameras.main.flash(250,255,240,180);buzz(40);}
 // Ant: crumbs & nest
 setup0(){this.nest=this.add.circle(80,H/2,50,0x5a3a1a).setStrokeStyle(5,0x3b2314);this.add.text(80,H/2+58,'nest',{color:'#fff',fontSize:'18px'}).setOrigin(0.5);
  this.items=[];for(let k=0;k<5;k++)this.items.push(this.add.circle(Phaser.Math.Between(250,760),Phaser.Math.Between(110,470),14,0xf5deb3));}
 // Fly: walls
 setup1(){this.walls=[[220,60,30,380],[400,0,30,300],[400,380,30,120],[580,120,30,380]].map(r=>this.add.rectangle(r[0]+r[2]/2,r[1]+r[3]/2,r[2],r[3],0x5d4037).setStrokeStyle(2,0x3e2723));
  this.walls.forEach(w=>w.setDepth(3));this.goal=this.add.star(740,H/2,6,10,24,0xff69b4);this.add.circle(740,H/2,7,0xffeb3b);
  this.shadow=this.add.ellipse(0,0,22,8,0x000000,0.3).setDepth(4);}
 // Vampire: darkness
 setup2(){this.items=[];for(let k=0;k<3;k++){const f=this.add.circle(Phaser.Math.Between(300,760),Phaser.Math.Between(80,470),7,0xfff176);this.tweens.add({targets:f,alpha:0.4,yoyo:true,repeat:-1,duration:600});this.items.push(f);}
  for(let k=0;k<25;k++)this.add.circle(Phaser.Math.Between(0,W),Phaser.Math.Between(0,H),Phaser.Math.Between(4,14),0x3a2a50);
  this.dark=this.add.renderTexture(0,0,W,H).setOrigin(0).setDepth(10);this.eraser=this.make.graphics({},false);}
 // Angel: wilted flowers
 setup3(){this.items=[];for(let k=0;k<5;k++){const x=150+k*130,y=Phaser.Math.Between(120,440);const c=this.add.container(x,y);
  const g=this.add.graphics();g.lineStyle(3,0x556b2f).lineBetween(0,0,8,-20);g.fillStyle(0x888866).fillCircle(8,-22,8);c.add(g);c.healed=false;this.items.push(c);}}
 // Crown: choose, then gather
 setup4(){this.p.setVisible(false);this.choosing=true;
  const t=this.add.text(W/2,140,'Who will you become?',{fontSize:'30px',color:'#ffe9a8'}).setOrigin(0.5);
  const mk=(x,label)=>{const b=this.add.text(x,260,label,{fontSize:'30px',color:'#fff',backgroundColor:'#0006',padding:{x:16,y:10}}).setOrigin(0.5).setInteractive();
   b.on('pointerdown',()=>pick(label));return b;};
  const bk=mk(W/2-120,'👑 King'),bq=mk(W/2+120,'👑 Queen');const hint=this.add.text(W/2,330,'◀ King   ·   Queen ▶   (or tap)',{fontSize:'18px',color:'#cdf'}).setOrigin(0.5);
  const pick=r=>{if(!this.choosing)return;this.choosing=false;this.royal=r.includes('Queen')?'Queen':'King';[t,bk,bq,hint].forEach(o=>o.destroy());
   this.p.destroy();this.p=makeForm(this,'Crown',this.royal);this.p.setPosition(80,H/2).setDepth(5);Sound.sfx('gather');this.shine();
   this.base=`Form 5/5: ${this.royal} — ${LEVELS[4].goal}\n${LEVELS[4].power}`;this.updHud(`0/4 gathered`);
   drawTree(this,720,H/2+20,1).setDepth(1);this.items=['Ant','Fly','Vampire','Angel'].map(n=>{const f=makeForm(this,n);f.setPosition(Phaser.Math.Between(200,600),Phaser.Math.Between(90,460));f.follow=false;return f;});};
  this.pickFn=pick;}
 update(t,dt){if(this.done)return;const k=this.keys,sp=dt*0.2;
  const space=Phaser.Input.Keyboard.JustDown(k.space)||spaceTap;spaceTap=false;
  if(this.i===4&&this.choosing){if(Phaser.Input.Keyboard.JustDown(k.left)||touch.left)this.pickFn('King');else if(Phaser.Input.Keyboard.JustDown(k.right)||touch.right)this.pickFn('Queen');return;}
  let dx=(k.left.isDown||touch.left?-1:0)+(k.right.isDown||touch.right?1:0),dy=(k.up.isDown||touch.up?-1:0)+(k.down.isDown||touch.down?1:0);
  const ox=this.p.x,oy=this.p.y;this.p.x=Phaser.Math.Clamp(this.p.x+dx*sp,15,W-15);this.p.y=Phaser.Math.Clamp(this.p.y+dy*sp,15,H-15);
  this['tick'+this.i](space,ox,oy,t);}
 near(o,r=30){return Phaser.Math.Distance.Between(this.p.x,this.p.y,o.x,o.y)<r;}
 tick0(space){if(this.carry){this.carry.setPosition(this.p.x+14,this.p.y-10);}
  if(space){if(!this.carry){const c=this.items.find(c=>this.near(c));if(c){this.carry=c;Sound.sfx('pickup');buzz(20);}else Sound.sfx('bump');}
   else{if(this.near(this.nest,65)){this.carry.destroy();this.items=this.items.filter(c=>c!==this.carry);this.carry=null;this.score++;Sound.sfx('drop');this.shine();this.updHud(`${this.score}/5 crumbs home`);if(this.score>=5)this.win();}
    else{this.carry=null;Sound.sfx('bump');}}}}
 tick1(space,ox,oy,t){if(space){this.flying=!this.flying;Sound.sfx(this.flying?'fly':'land');buzz(25);this.updHud(this.flying?'Flying! ✈':'Landed');}
  this.p.setScale(this.flying?1.4+Math.sin(t/80)*0.05:1);this.shadow.setPosition(this.p.x,this.p.y+(this.flying?26:12)).setScale(this.flying?0.6:1);
  if(!this.flying&&this.walls.some(w=>Phaser.Geom.Rectangle.Contains(w.getBounds(),this.p.x,this.p.y))){this.p.setPosition(ox,oy);if(!this.bumped){Sound.sfx('bump');this.cameras.main.shake(120,0.004);buzz(30);}this.bumped=true;}else this.bumped=false;
  if(this.near(this.goal,30)){this.score=1;this.win();}}
 tick2(space){if(space){this.sight=!this.sight;Sound.sfx('sight');buzz(20);this.updHud(this.sight?'Night sight ON 👁':'Night sight off');}
  this.dark.clear().fill(0x000000,0.94);this.eraser.clear().fillStyle(0xffffff).fillCircle(0,0,this.sight?140:45);this.dark.erase(this.eraser,this.p.x,this.p.y);
  this.items=this.items.filter(f=>{if(this.near(f,28)){f.destroy();this.score++;Sound.sfx('find');this.shine();this.updHud(`${this.score}/3 fireflies found`);return false}return true});
  if(this.score>=3)this.win();}
 tick3(space){if(space){const f=this.items.find(f=>!f.healed&&this.near(f,50));
   if(f){f.healed=true;const g=this.add.graphics();g.fillStyle(0xff80ab);for(let a=0;a<5;a++)g.fillCircle(8+Math.cos(a*1.26)*9,-26+Math.sin(a*1.26)*9,6);g.fillStyle(0xffeb3b).fillCircle(8,-26,5);f.add(g);
    this.tweens.add({targets:f,scale:1.3,yoyo:true,duration:250});const r=this.add.circle(f.x,f.y,10,0xfff59d,0.6);this.tweens.add({targets:r,radius:60,alpha:0,duration:600,onComplete:()=>r.destroy()});
    this.score++;Sound.sfx('heal');this.shine();this.updHud(`${this.score}/5 flowers healed`);if(this.score>=5)this.win();}else Sound.sfx('bump');}}
 tick4(space){if(!this.items)return;this.items.forEach((f,n)=>{if(!f.follow&&(this.near(f,30)||(space&&this.near(f,110)))){f.follow=true;this.score++;Sound.sfx('gather');this.shine();this.updHud(`${this.score}/4 gathered — lead them to the Tree`);}
   if(f.follow){f.x+=(this.p.x-30-n*25-f.x)*0.08;f.y+=(this.p.y+10-f.y)*0.08;}});
  if(space&&!this.items.some(f=>!f.follow))Sound.sfx('gather');
  if(this.score>=4&&this.p.x>660)this.win();}
 win(){if(this.done)return;this.done=true;Sound.sfx('win');buzz([80,60,120]);this.cameras.main.flash(600,255,255,200);
  const L=LEVELS[this.i];const box=this.add.rectangle(W/2,H/2,620,170,0x000000,0.75).setDepth(30).setStrokeStyle(3,0xffe9a8);
  this.add.text(W/2,H/2-40,'✨ Well done! ✨',{fontSize:'28px',color:'#ffe9a8'}).setOrigin(0.5).setDepth(31);
  this.add.text(W/2,H/2+5,L.lesson,{fontSize:'19px',color:'#fff',wordWrap:{width:580},align:'center'}).setOrigin(0.5).setDepth(31);
  this.add.text(W/2,H/2+55,this.i<4?'Space / tap Power: become the next form':'Space / tap Power: play again',{fontSize:'16px',color:'#cdf'}).setOrigin(0.5).setDepth(31);
  const next=()=>{spaceTap=false;this.scene.start(this.i<4?'Level':'End',{i:this.i+1,royal:this.royal})};
  this.time.delayedCall(700,()=>{this.input.keyboard.once('keydown-SPACE',next);this.input.once('pointerdown',next);const iv=setInterval(()=>{if(spaceTap){clearInterval(iv);next()}},100);this.events.once('shutdown',()=>clearInterval(iv));});}}

class End extends Phaser.Scene{constructor(){super('End')}
 init(d){this.royal=d.royal}
 create(){this.cameras.main.setBackgroundColor('#0b1020');drawTree(this,W/2,300,1);Sound.setForm(4);
  ['Ant','Fly','Vampire','Angel'].forEach((n,k)=>makeForm(this,n).setPosition(250+k*100,430));makeForm(this,'Crown',this.royal).setPosition(W/2,150).setScale(1.6);
  this.add.text(W/2,50,'The whole family is home. 🌳',{fontSize:'30px',color:'#ffe9a8'}).setOrigin(0.5);
  this.add.text(W/2,480,'Everything is artifact • 589 — Space / tap to play again',{fontSize:'15px',color:'#cdf'}).setOrigin(0.5);
  const go=()=>{spaceTap=false;this.scene.start('Title')};this.time.delayedCall(800,()=>{this.input.keyboard.once('keydown-SPACE',go);this.input.once('pointerdown',go);});}}

window.game=new Phaser.Game({type:Phaser.AUTO,parent:'game',width:W,height:H,backgroundColor:'#0b1020',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_HORIZONTALLY},scene:[Title,Level,End]});
