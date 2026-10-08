import { useState, useRef, useEffect, useCallback } from "react";
import { VOZ_W } from "@/pages/padre/MundoAsha/voiceConfig";
import { VOZ_H } from "@/pages/padre/MundoAsha/voiceConfig";
import { VOZ_BIRD_X } from "@/pages/padre/MundoAsha/voiceConfig";
import { VOZ_BIRD_R } from "@/pages/padre/MundoAsha/voiceConfig";
import { VOZ_PIPE_W } from "@/pages/padre/MundoAsha/voiceConfig";
import { VOZ_GAP } from "@/pages/padre/MundoAsha/voiceConfig";
import { VOZ_GRAVITY } from "@/pages/padre/MundoAsha/voiceConfig";
import { VOZ_LIFT } from "@/pages/padre/MundoAsha/voiceConfig";
import { VOZ_MAX_UP } from "@/pages/padre/MundoAsha/voiceConfig";
import { VOZ_MAX_DOWN } from "@/pages/padre/MundoAsha/voiceConfig";
import { VOZ_PIPE_SPEED } from "@/pages/padre/MundoAsha/voiceConfig";
import { VOZ_CEIL } from "@/pages/padre/MundoAsha/voiceConfig";
import { VOZ_FLOOR_Y } from "@/pages/padre/MundoAsha/voiceConfig";

export function useVozAventuraGame() {
type Phase = "pre"|"requesting"|"allowed"|"blocked"|"calibrating"|"noisy"|"countdown"|"playing"|"paused"|"done";
const canvasRef = useRef<HTMLCanvasElement>(null);
const animRef = useRef<number>(0);
const micStreamRef = useRef<MediaStream|null>(null);
const analyserRef = useRef<AnalyserNode|null>(null);
const audioCtxRef = useRef<AudioContext|null>(null);
const phaseRef = useRef<Phase>("pre");
const noiseFloorRef = useRef(12);
const smoothedRef = useRef(0);
const isSpeakingRef = useRef(false);
const survivedRef = useRef(0);
const lastTickRef = useRef(0);
const bestTimeRef = useRef(28);
const isFirstRef = useRef(true);
const touchHeldRef = useRef(false);
const useMicRef = useRef(true);
const [phase, setPhase] = useState<Phase>("pre");
const [countdown, setCountdown] = useState(3);
const [survivedSecs, setSurvivedSecs] = useState(0);
const [bestTime, setBestTime] = useState(28);
const [attemptNum, setAttemptNum] = useState(2);
const [isSpeaking, setIsSpeaking] = useState(false);
const [micPct, setMicPct] = useState(0);
const [lastResult, setLastResult] = useState<{survived:number;isRecord:boolean;prevBest:number}|null>(null);
const [inputMode, setInputMode] = useState<"mic"|"touch">("mic");
type Pipe = {x:number;topH:number;safe:boolean};
type Cloud = {x:number;y:number;sz:number;spd:number};
type Particle = {x:number;y:number;vx:number;vy:number;life:number};
const gRef = useRef<{
    birdY:number; birdVY:number; tilt:number; squish:number;
    pipes:Pipe[]; clouds:Cloud[]; particles:Particle[];
    bgOff:number; frame:number; lastPipe:number;
  }>({
    birdY: VOZ_H/2, birdVY:0, tilt:0, squish:0,
    pipes:[], clouds:[], particles:[],
    bgOff:0, frame:0, lastPipe:-200,
  });
useEffect(() => {
    gRef.current.clouds = Array.from({length:5},(_,i)=>({
      x:(i/5)*VOZ_W+Math.random()*60, y:25+Math.random()*100,
      sz:55+Math.random()*70, spd:0.35+Math.random()*0.25,
    }));
  }, []);
const stopMic = useCallback(()=>{
    micStreamRef.current?.getTracks().forEach(t=>t.stop());
    micStreamRef.current=null;
    audioCtxRef.current?.close().catch(()=>{});
    audioCtxRef.current=null; analyserRef.current=null;
  },[]);
const getRaw = useCallback(():number=>{
    if(!analyserRef.current) return 0;
    const d=new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(d);
    return d.reduce((s,v)=>s+v,0)/d.length;
  },[]);
const setP = useCallback((p:Phase)=>{setPhase(p);phaseRef.current=p;},[]);
const requestMic = useCallback(async()=>{
    setP("requesting");
    try {
      const isSecure = window.isSecureContext || location.protocol === "https:" || location.hostname === "localhost";
      if(!isSecure || !navigator.mediaDevices?.getUserMedia){setP("blocked");return;}
      const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}});
      micStreamRef.current=stream;
      const actx=new (window.AudioContext||(window as unknown as {webkitAudioContext:typeof AudioContext}).webkitAudioContext)();
      audioCtxRef.current=actx;
      const analyser=actx.createAnalyser();
      analyser.fftSize=512; analyser.smoothingTimeConstant=0.8;
      analyserRef.current=analyser;
      actx.createMediaStreamSource(stream).connect(analyser);
      useMicRef.current=true;
      setInputMode("mic");
      setP("calibrating");
      const samples:number[]=[]; const t0=Date.now();
      const iv=setInterval(()=>{
        samples.push(getRaw());
        if(Date.now()-t0>=1600){
          clearInterval(iv);
          const avg=samples.reduce((a,b)=>a+b,0)/samples.length;
          const std=Math.sqrt(samples.reduce((s,v)=>s+(v-avg)**2,0)/samples.length);
          noiseFloorRef.current=avg+std*1.8+6;
          if(noiseFloorRef.current>42) setP("noisy");
          else setP("allowed");
        }
      },50);
    } catch { setP("blocked"); }
  },[getRaw,setP]);
const startCountdown = useCallback(()=>{
    const g=gRef.current;
    g.birdY=VOZ_H/2; g.birdVY=0; g.tilt=0; g.pipes=[]; g.frame=0;
    g.lastPipe=-200; g.particles=[]; g.squish=0;
    setSurvivedSecs(0); survivedRef.current=0;
    setP("countdown"); setCountdown(3);
    let c=3;
    const iv=setInterval(()=>{
      c--;
      if(c>0){setCountdown(c);}
      else{
        clearInterval(iv); setCountdown(0);
        setTimeout(()=>{lastTickRef.current=Date.now(); setP("playing");},900);
      }
    },850);
  },[setP]);
const startTouchMode = useCallback(()=>{
    useMicRef.current=false;
    setInputMode("touch");
    startCountdown();
  },[startCountdown]);
useEffect(()=>{
    const onDown=(e:KeyboardEvent)=>{ if(e.code==="Space"||e.code==="ArrowUp"){e.preventDefault();touchHeldRef.current=true;} };
    const onUp=(e:KeyboardEvent)=>{ if(e.code==="Space"||e.code==="ArrowUp") touchHeldRef.current=false; };
    window.addEventListener("keydown",onDown); window.addEventListener("keyup",onUp);
    return()=>{ window.removeEventListener("keydown",onDown); window.removeEventListener("keyup",onUp); };
  },[]);
useEffect(()=>{
    if(phase!=="allowed") return;
    const iv=setInterval(()=>{
      const raw=getRaw();
      smoothedRef.current=smoothedRef.current*0.7+raw*0.3;
      const speaking=smoothedRef.current>noiseFloorRef.current+7;
      setIsSpeaking(speaking); isSpeakingRef.current=speaking;
      setMicPct(Math.min(100,Math.round((smoothedRef.current/Math.max(1,noiseFloorRef.current+28))*100)));
    },60);
    return()=>clearInterval(iv);
  },[phase,getRaw]);
useEffect(()=>{ if(phase==="playing") lastTickRef.current=Date.now(); },[phase]);
useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return;
    const ctx=canvas.getContext("2d"); if(!ctx) return;
    const W=VOZ_W, H=VOZ_H;

    const drawCloud=(x:number,y:number,sz:number)=>{
      ctx.save(); ctx.fillStyle="rgba(255,255,255,0.82)";
      ctx.beginPath();
      ctx.arc(x,y,sz*0.38,0,Math.PI*2);
      ctx.arc(x+sz*0.28,y-sz*0.12,sz*0.26,0,Math.PI*2);
      ctx.arc(x-sz*0.22,y-sz*0.08,sz*0.22,0,Math.PI*2);
      ctx.arc(x+sz*0.18,y+sz*0.06,sz*0.2,0,Math.PI*2);
      ctx.fill(); ctx.restore();
    };

    const drawPipe=(x:number,topH:number)=>{
      const pw=VOZ_PIPE_W, CAP=12, R=7;
      const tg=ctx.createLinearGradient(x,0,x+pw,0);
      tg.addColorStop(0,"#059669"); tg.addColorStop(0.4,"#10B981"); tg.addColorStop(1,"#047857");
      ctx.fillStyle=tg;
      if(topH>CAP) ctx.fillRect(x+4,0,pw-8,topH-CAP);
      ctx.beginPath(); ctx.roundRect(x,topH-CAP,pw,CAP,[0,0,R,R]); ctx.fill();
      ctx.fillStyle="rgba(255,255,255,0.18)"; ctx.fillRect(x+7,0,9,Math.max(0,topH-CAP));
      const by2=topH+VOZ_GAP, bh=H-by2;
      const bg2=ctx.createLinearGradient(x,0,x+pw,0);
      bg2.addColorStop(0,"#059669"); bg2.addColorStop(0.4,"#10B981"); bg2.addColorStop(1,"#047857");
      ctx.fillStyle=bg2;
      ctx.beginPath(); ctx.roundRect(x,by2,pw,CAP,[R,R,0,0]); ctx.fill();
      if(bh>CAP) ctx.fillRect(x+4,by2+CAP,pw-8,bh-CAP);
      ctx.fillStyle="rgba(255,255,255,0.18)"; ctx.fillRect(x+7,by2+CAP,9,Math.max(0,bh-CAP));
    };

    const loop=()=>{
      const g=gRef.current;
      const ph=phaseRef.current;

      const sky=ctx.createLinearGradient(0,0,0,H);
      sky.addColorStop(0,"#7DD3FC"); sky.addColorStop(0.55,"#BAE6FD"); sky.addColorStop(1,"#ECFDF5");
      ctx.fillStyle=sky; ctx.fillRect(0,0,W,H);

      if(ph==="playing") g.bgOff=(g.bgOff+VOZ_PIPE_SPEED*0.4)%80;
      ctx.fillStyle="#86EFAC"; ctx.fillRect(0,H-32,W,32);
      ctx.fillStyle="#4ADE80";
      for(let i=-1;i<W/80+1;i++){
        ctx.beginPath(); ctx.arc(i*80-g.bgOff,H-32,20,Math.PI,0); ctx.fill();
      }

      g.clouds.forEach(c=>{
        if(ph==="playing"){c.x-=c.spd; if(c.x<-c.sz)c.x=W+c.sz;}
        drawCloud(c.x,c.y,c.sz);
      });

      const preScreens=["pre","requesting","allowed","blocked","calibrating","noisy"] as Phase[];
      if(preScreens.includes(ph)||ph==="countdown"){
        const bob=Math.sin(Date.now()/700)*8;
        ctx.font="44px serif"; ctx.textAlign="center";
        ctx.fillText("🦋",VOZ_BIRD_X,H/2+bob);
        animRef.current=requestAnimationFrame(loop); return;
      }

      // playing / paused / done
      if(ph==="playing"){
        g.frame++;
        const now=Date.now();
        if(now-lastTickRef.current>=1000){
          survivedRef.current++; lastTickRef.current+=1000;
          setSurvivedSecs(survivedRef.current);
        }
        let speaking = false;
        if(useMicRef.current){
          const raw=getRaw();
          smoothedRef.current=smoothedRef.current*0.72+raw*0.28;
          speaking=smoothedRef.current>noiseFloorRef.current+7;
          setMicPct(Math.min(100,Math.round((smoothedRef.current/Math.max(1,noiseFloorRef.current+28))*100)));
        } else {
          speaking=touchHeldRef.current;
          setMicPct(speaking?85:0);
        }
        if(speaking!==isSpeakingRef.current){isSpeakingRef.current=speaking;setIsSpeaking(speaking);}

        if(speaking) g.birdVY=Math.max(g.birdVY-VOZ_LIFT,VOZ_MAX_UP);
        else g.birdVY=Math.min(g.birdVY+VOZ_GRAVITY,VOZ_MAX_DOWN);
        g.birdY+=g.birdVY;

        const tTilt=g.birdVY*0.07; g.tilt+=(tTilt-g.tilt)*0.1;

        if(g.birdY<VOZ_CEIL){g.birdY=VOZ_CEIL;g.birdVY=Math.max(0,g.birdVY);g.squish=-1;}
        if(g.birdY>VOZ_FLOOR_Y){g.birdY=VOZ_FLOOR_Y;g.birdVY=Math.min(0,g.birdVY);g.squish=1;}
        g.squish*=0.82;

        const interval=Math.max(100,140-Math.floor(g.frame/300)*4);
        if(g.frame-g.lastPipe>=interval){
          const minH=55, maxH=VOZ_H-VOZ_GAP-VOZ_FLOOR_Y+55;
          g.pipes.push({x:W+5,topH:minH+Math.random()*(Math.max(20,maxH-minH)),safe:false});
          g.lastPipe=g.frame;
        }
        g.pipes=g.pipes.map(p=>({...p,x:p.x-VOZ_PIPE_SPEED})).filter(p=>p.x>-VOZ_PIPE_W-10);

        const bL=VOZ_BIRD_X-VOZ_BIRD_R, bR=VOZ_BIRD_X+VOZ_BIRD_R;
        const bT=g.birdY-VOZ_BIRD_R, bB=g.birdY+VOZ_BIRD_R;
        let dead=false;

        for(const pipe of g.pipes){
          const xOv=bR>pipe.x+5&&bL<pipe.x+VOZ_PIPE_W-5;
          if(!xOv){pipe.safe=false;continue;}
          const inGap=bT>=pipe.topH-2&&bB<=pipe.topH+VOZ_GAP+2;
          if(!pipe.safe){
            if(inGap){pipe.safe=true;}
            else{dead=true;break;}
          }
          if(pipe.safe){
            if(bT<pipe.topH){g.birdY=pipe.topH+VOZ_BIRD_R+1;g.birdVY=Math.max(0,g.birdVY);}
            if(bB>pipe.topH+VOZ_GAP){g.birdY=pipe.topH+VOZ_GAP-VOZ_BIRD_R-1;g.birdVY=Math.min(0,g.birdVY);}
          }
        }

        if(speaking&&g.frame%4===0){
          g.particles.push({x:VOZ_BIRD_X-VOZ_BIRD_R-4,y:g.birdY+(Math.random()-0.5)*10,vx:-(0.8+Math.random()),vy:(Math.random()-0.5)*1.2,life:1});
        }
        g.particles=g.particles.map(p=>({...p,x:p.x+p.vx,y:p.y+p.vy,life:p.life-0.05})).filter(p=>p.life>0);

        if(dead){
          const survived=survivedRef.current;
          const prevBest=bestTimeRef.current;
          const isRecord=survived>prevBest;
          if(isRecord) bestTimeRef.current=survived;
          setLastResult({survived,isRecord,prevBest});
          if(isRecord) setBestTime(survived);
          setAttemptNum(a=>a+1);
          phaseRef.current="done"; setPhase("done");
          stopMic(); return;
        }
      }

      g.pipes.forEach(p=>drawPipe(p.x,p.topH));

      g.particles.forEach(p=>{
        ctx.save(); ctx.globalAlpha=p.life*0.8;
        ctx.fillStyle="#A78BFA";
        ctx.beginPath(); ctx.arc(p.x,p.y,5*p.life,0,Math.PI*2); ctx.fill();
        ctx.restore();
      });

      ctx.save();
      ctx.translate(VOZ_BIRD_X,g.birdY+g.squish*3);
      ctx.rotate(g.tilt);
      ctx.scale(1,1+Math.abs(g.squish)*0.12);
      if(isSpeakingRef.current&&ph==="playing"){ctx.shadowColor="#7C3AED";ctx.shadowBlur=14;}
      ctx.font="42px serif"; ctx.textAlign="center";
      ctx.fillText("🦋",0,16);
      ctx.restore();

      animRef.current=requestAnimationFrame(loop);
    };

    animRef.current=requestAnimationFrame(loop);
    return()=>cancelAnimationFrame(animRef.current);
  },[getRaw,stopMic]);
useEffect(()=>()=>{stopMic();},[stopMic]);
const getFeedback=(s:number)=>{
    if(s<10) return "¡Buen comienzo! Prueba hablar suavemente para subir y guardar silencio para bajar.";
    if(s<30) return "¡Muy bien! Ya estás aprendiendo a controlar tu voz durante la aventura.";
    if(s<60) return "¡Excelente control! Tu voz llevó al personaje muy lejos.";
    return "¡Increíble aventura! Mantuviste un gran control de tu voz durante todo el recorrido.";
  };
return { canvasRef, animRef, micStreamRef, analyserRef, audioCtxRef, phaseRef, noiseFloorRef, smoothedRef, isSpeakingRef, survivedRef, lastTickRef, bestTimeRef, isFirstRef, touchHeldRef, useMicRef, phase, setPhase, countdown, setCountdown, survivedSecs, setSurvivedSecs, bestTime, setBestTime, attemptNum, setAttemptNum, isSpeaking, setIsSpeaking, micPct, setMicPct, lastResult, setLastResult, inputMode, setInputMode, gRef, stopMic, getRaw, setP, requestMic, startCountdown, startTouchMode, getFeedback };
}
