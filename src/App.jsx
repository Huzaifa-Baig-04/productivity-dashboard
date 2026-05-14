import React from "react";
import { useState, useEffect } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, ResponsiveContainer, CartesianGrid
} from "recharts";
import { initializeSync } from './services/dataSync';
import SyncStatusIndicator from './components/SyncStatusIndicator';
import { ref, set, onValue } from "firebase/database";
import { database } from "./firebase";

// ═══════════════════════════════ STYLES ════════════════════════════════════
const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Plus Jakarta Sans',sans-serif;background:#0D1117;color:#F0F6FC;-webkit-font-smoothing:antialiased;}
:root{
  --bg:#0D1117;--card:#161B22;--card2:#1C2333;--border:#30363D;
  --em:#10B981;--em-d:#059669;--em-g:rgba(16,185,129,0.12);--em-g2:rgba(16,185,129,0.25);
  --text:#F0F6FC;--muted:#8B949E;--dim:#484F58;
  --red:#EF4444;--amber:#F59E0B;--blue:#60A5FA;--purple:#A78BFA;
}
.layout{display:flex;min-height:100vh;}
.sb{width:64px;background:var(--card);border-right:1px solid var(--border);display:flex;flex-direction:column;align-items:center;padding:18px 0 16px;position:fixed;top:0;left:0;bottom:0;z-index:50;transition:width 0.25s ease;overflow:hidden;}
.sb.open{width:216px;align-items:flex-start;}
.sb-logo{width:36px;height:36px;background:var(--em);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:800;color:#fff;flex-shrink:0;margin:0 auto 20px;letter-spacing:-1px;}
.sb.open .sb-logo{margin:0 14px 20px;}
.ni{width:100%;display:flex;align-items:center;gap:11px;padding:9px 10px;cursor:pointer;border-radius:8px;font-size:13px;color:var(--muted);transition:all 0.15s;white-space:nowrap;font-weight:500;}
.sb:not(.open) .ni{justify-content:center;padding:9px 0;}
.ni:hover{color:var(--text);background:var(--card2);}
.ni.active{color:var(--em);background:var(--em-g);}
.ni-icon{font-size:17px;flex-shrink:0;}
.sb-tog{margin-top:auto;width:100%;display:flex;justify-content:center;padding:10px;cursor:pointer;color:var(--dim);font-size:16px;transition:color 0.15s;}
.sb-tog:hover{color:var(--muted);}
.main{flex:1;margin-left:64px;transition:margin-left 0.25s ease;}
.main.shift{margin-left:216px;}
.topbar{background:var(--card);border-bottom:1px solid var(--border);padding:13px 28px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:40;gap:16px;}
.tb-title{font-size:14px;font-weight:700;color:var(--text);}
.tb-date{font-size:11px;color:var(--muted);margin-top:2px;}
.qv{background:var(--em-g);border:1px solid var(--em-g2);border-radius:8px;padding:6px 14px;font-size:12px;color:var(--em);max-width:460px;font-style:italic;line-height:1.5;text-align:right;}
.content{padding:26px 28px 60px;}
.card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:20px;transition:border-color 0.2s;}
.card:hover{border-color:var(--dim);}
.ct{font-size:11px;font-weight:700;color:var(--muted);letter-spacing:0.1em;text-transform:uppercase;margin-bottom:14px;display:flex;align-items:center;gap:7px;}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
.g3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;}
.mb16{margin-bottom:16px;}.mb20{margin-bottom:20px;}
.sc{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:18px 20px;}
.sc-num{font-size:30px;font-weight:800;line-height:1;margin:4px 0;}
.sc-lbl{font-size:12px;color:var(--muted);}
.inp{background:var(--card2);border:1px solid var(--border);border-radius:8px;padding:9px 13px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;color:var(--text);outline:none;transition:border-color 0.2s;width:100%;}
.inp:focus{border-color:var(--em);}
.inp::placeholder{color:var(--dim);}
select.inp{cursor:pointer;}
.textarea{background:var(--card2);border:1px solid var(--border);border-radius:8px;padding:12px 13px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;color:var(--text);outline:none;resize:vertical;width:100%;min-height:120px;line-height:1.65;transition:border-color 0.2s;}
.textarea:focus{border-color:var(--em);}
.textarea::placeholder{color:var(--dim);}
.btn{display:inline-flex;align-items:center;gap:6px;padding:9px 18px;border-radius:8px;border:none;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.15s;}
.btn-em{background:var(--em);color:#fff;}
.btn-em:hover{background:var(--em-d);}
.btn-em:disabled{opacity:0.5;cursor:not-allowed;}
.btn-ghost{background:var(--card2);color:var(--muted);border:1px solid var(--border);}
.btn-ghost:hover{color:var(--text);border-color:var(--dim);}
.btn-ghost:disabled{opacity:0.5;cursor:not-allowed;}
.btn-danger{background:rgba(239,68,68,0.12);color:var(--red);border:none;}
.btn-danger:hover{background:rgba(239,68,68,0.22);}
.badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;}
.bh{background:rgba(239,68,68,0.15);color:var(--red);}
.bm{background:rgba(245,158,11,0.15);color:var(--amber);}
.bl{background:var(--em-g);color:var(--em);}
.tbl{width:100%;border-collapse:collapse;}
.tbl th{font-size:11px;font-weight:700;color:var(--muted);letter-spacing:0.08em;text-transform:uppercase;padding:10px 12px;border-bottom:1px solid var(--border);text-align:left;}
.tbl td{padding:11px 12px;font-size:13px;border-bottom:1px solid rgba(48,54,61,0.4);vertical-align:middle;}
.tbl tr:last-child td{border-bottom:none;}
.tbl tr:hover td{background:var(--em-g);}
.pb{height:5px;background:var(--card2);border-radius:3px;overflow:hidden;}
.pf{height:100%;background:var(--em);border-radius:3px;transition:width 0.5s ease;}
.ph h1{font-size:22px;font-weight:800;color:var(--text);display:flex;align-items:center;gap:10px;}
.ph p{font-size:13px;color:var(--muted);margin-top:4px;}
.ph{margin-bottom:22px;}
.pg{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;}
.pc{background:var(--card2);border:1.5px solid var(--border);border-radius:12px;padding:14px 8px;display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;transition:all 0.2s;}
.pc.prayed{background:var(--em-g);border-color:var(--em-g2);}
.pc:hover{border-color:var(--em);}
.pn{font-size:12px;font-weight:600;color:var(--muted);}
.pc.prayed .pn{color:var(--em);}
.ht-cell{width:28px;height:28px;border-radius:6px;background:var(--card2);border:1px solid var(--border);margin:0 auto;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:13px;color:#fff;transition:all 0.15s;}
.ht-cell.done{background:var(--em);border-color:var(--em);}
.muscle-chip{padding:6px 13px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;border:1.5px solid var(--border);background:var(--card2);color:var(--muted);transition:all 0.15s;user-select:none;}
.muscle-chip:hover{border-color:var(--em);color:var(--em);}
.muscle-chip.sel{background:var(--em-g);border-color:var(--em);color:var(--em);}
.muscle-chip.disabled{opacity:0.35;cursor:not-allowed;}
.ev{display:flex;align-items:center;gap:12px;padding:13px 14px;background:var(--card2);border-radius:10px;border-left:3px solid var(--em);margin-bottom:8px;}
.ai-box{background:var(--em-g);border:1px solid var(--em-g2);border-radius:10px;padding:14px 16px;font-size:13px;color:var(--text);line-height:1.65;margin-top:12px;}
.ai-lbl{font-size:10px;font-weight:700;letter-spacing:0.1em;color:var(--em);text-transform:uppercase;margin-bottom:6px;}
.jc{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:18px;margin-bottom:10px;cursor:pointer;transition:border-color 0.2s;}
.jc:hover{border-color:var(--em);}
.ld span{display:inline-block;animation:blink 1.2s infinite;font-size:18px;line-height:1;}
.ld span:nth-child(2){animation-delay:0.2s;}
.ld span:nth-child(3){animation-delay:0.4s;}
@keyframes blink{0%,80%,100%{opacity:0}40%{opacity:1}}
@keyframes fu{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.fu{animation:fu 0.3s ease forwards;}
.flex{display:flex;}.fc{display:flex;align-items:center;}.gap8{gap:8px;}.gap10{gap:10px;}.gap12{gap:12px;}.gap16{gap:16px;}
.f1{flex:1;}.mt12{margin-top:12px;}.mt16{margin-top:16px;}.mt20{margin-top:20px;}
.fs12{font-size:12px;}.fs13{font-size:13px;}
@media(max-width:900px){
  .layout{display:flex;}
  .sb{position:fixed;top:0;left:0;width:64px;height:100vh;flex-direction:column;align-items:center;padding:18px 0 16px;border-right:1px solid var(--border);z-index:60;transition:width 0.25s ease;overflow:hidden;}
  .sb.open{width:216px;align-items:flex-start;}
  .main{margin-left:64px;transition:margin-left 0.25s ease;}
  .main.shift{margin-left:216px;}
  .topbar{padding:12px 18px;}
  .content{padding:18px 16px 60px;}
  .g4{grid-template-columns:1fr 1fr;}
  .g3{grid-template-columns:1fr 1fr;}
  .g2{grid-template-columns:1fr;}
  .pg{grid-template-columns:repeat(3,1fr);}
  .ct{font-size:10px;}
  .pc{padding:10px 8px;}
  .btn{font-size:12px;padding:8px 12px;}
  .ph h1{font-size:20px;}
  .sb-logo{margin:0 auto 20px;}
  .ni{width:100%;display:flex;align-items:center;gap:11px;padding:9px 10px;cursor:pointer;border-radius:8px;font-size:13px;color:var(--muted);transition:all 0.15s;white-space:nowrap;font-weight:500;}
  .sb:not(.open) .ni{justify-content:center;padding:9px 0;}
  .ni:hover{color:var(--text);background:var(--card2);}
  .ni.active{color:var(--em);background:var(--em-g);}
  .ni-icon{font-size:17px;flex-shrink:0;}
  .sb-tog{margin-top:auto;width:100%;display:flex;justify-content:center;padding:10px;cursor:pointer;color:var(--dim);font-size:16px;transition:color 0.15s;}
  .sb-tog:hover{color:var(--muted);}
  .card{min-width:0;}
}
@media(max-width:700px){
  .sb{gap:4px;padding:8px 8px;}
  .sb-logo{width:32px;height:32px;font-size:15px;}
  .ni{font-size:12px;padding:8px 10px;min-width:70px;}
  .topbar{padding:10px 14px;}
  .content{padding:16px 14px 60px;}
  .g4{grid-template-columns:1fr;}
  .g3{grid-template-columns:1fr;}
  .pg{grid-template-columns:repeat(2,1fr);}
  .ct{font-size:9px;}
  .card{padding:16px;}
  .sc{padding:14px;}
  .ph h1{font-size:18px;}
  .btn{font-size:11px;padding:7px 10px;}
  .tbl th,.tbl td{padding:8px 10px;font-size:12px;}
  .ht-cell{width:26px;height:26px;}
  .flex{flex-wrap:wrap;}
  .fc{flex-wrap:wrap;}
}
@media(max-width:550px){
  .pg{grid-template-columns:1fr;}
  .topbar{flex-direction:column;align-items:flex-start;gap:10px;}
  .tb-title{font-size:12px;}
  .qv{font-size:11px;max-width:100%;}
  .sb{padding:8px 8px;gap:4px;}
  .ni{font-size:11px;padding:8px 10px;min-width:60px;}
  .btn{font-size:10px;padding:6px 10px;}
  .inp{font-size:12px;}
  .textarea{font-size:12px;}
  .card{padding:14px;}
  .sc{padding:12px;}
  .tbl th,.tbl td{padding:7px 8px;font-size:11px;}
  .ph h1{font-size:16px;}
  .ct{font-size:8px;}
}
`;

// ═══════════════════════════════ CONFIG ════════════════════════════════════
const EM = "#10B981", CARD2 = "#1C2333";
const TODAY_STR = new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"});
const NAV = [
  {id:"dashboard",icon:"🏠",label:"Dashboard"},
  {id:"salah",    icon:"🕌",label:"Salah Tracker"},
  {id:"todos",    icon:"✅",label:"To-Do List"},
  {id:"workout",  icon:"🏋️",label:"Workout Tracker"},
  {id:"skincare", icon:"🧴",label:"Skincare Tracker"},
  {id:"study",    icon:"📚",label:"Study Tracker"},
  {id:"habits",   icon:"💪",label:"Habit Tracker"},
  {id:"journal",  icon:"📝",label:"Journal & Notes"},
  {id:"calendar", icon:"📆",label:"Calendar"},
  {id:"analytics",icon:"📊",label:"Analytics"},
];
const PRAYERS = ["Fajr","Dhuhr","Asr","Maghrib","Isha"];
const PRAYER_ICONS = {Fajr:"🌙",Dhuhr:"☀️",Asr:"🌤️",Maghrib:"🌇",Isha:"⭐"};
const PRAYER_TIMES = {Fajr:"5:12 AM",Dhuhr:"12:30 PM",Asr:"3:45 PM",Maghrib:"6:15 PM",Isha:"8:00 PM"};
const DAYS7 = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const EV_COLORS = {Exam:"#EF4444",Assignment:"#F59E0B",Meeting:"#60A5FA",Personal:"#10B981",Reminder:"#A78BFA"};
const CAT_COLORS = {Journal:"#10B981","Study Notes":"#60A5FA",Ideas:"#F59E0B",Personal:"#A78BFA"};

// ── All muscle groups ──
const MUSCLES = [
  {id:"chest",    label:"Chest",    icon:"💪"},
  {id:"back",     label:"Back",     icon:"🏋️"},
  {id:"shoulders",label:"Shoulders",icon:"🔝"},
  {id:"legs",     label:"Legs",     icon:"🦵"},
  {id:"arms",     label:"Arms",     icon:"🤜"},
  {id:"core",     label:"Core",     icon:"🎯"},
  {id:"glutes",   label:"Glutes",   icon:"🍑"},
  {id:"calves",   label:"Calves",   icon:"🦶"},
  {id:"triceps",  label:"Triceps",  icon:"💥"},
  {id:"biceps",   label:"Biceps",   icon:"💪"},
];

// ── Morning & Night skincare steps ──
const MORNING_STEPS = [
  {key:"facewash",   label:"Face Wash",  icon:"🧼",desc:"Cleanse away overnight oils"},
  {key:"toner",      label:"Toner",      icon:"💦",desc:"Balance & prep skin"},
  {key:"moisturizer",label:"Moisturizer",icon:"🧴",desc:"Hydrate & protect"},
  {key:"sunscreen",  label:"Sunscreen",  icon:"☀️",desc:"SPF protection — always"},
];
const NIGHT_STEPS = [
  {key:"cleanser",   label:"Cleanser",   icon:"🫧",desc:"Remove dirt & impurities"},
  {key:"serum",      label:"Serum",      icon:"💎",desc:"Active overnight treatment"},
  {key:"nightcream", label:"Night Cream",icon:"🌙",desc:"Deep overnight hydration"},
  {key:"eyecream",   label:"Eye Cream",  icon:"👁️",desc:"Target under-eye area"},
];

// ═══════════════════════════════ INITIAL DATA ══════════════════════════════
const INIT = {
  todaySalah:{Fajr:true,Dhuhr:true,Asr:false,Maghrib:false,Isha:false},
  salahHist:[
    {day:"Mon",pct:80},{day:"Tue",pct:100},{day:"Wed",pct:60},
    {day:"Thu",pct:100},{day:"Fri",pct:100},{day:"Sat",pct:60},{day:"Sun",pct:40},
  ],
  todos:[
    {id:1,task:"Python practice — OOP & Classes",done:false,priority:"High",due:"Today",category:"Study"},
    {id:2,task:"Workout — Chest & Triceps",done:true,priority:"Medium",due:"Today",category:"Health"},
    {id:3,task:"Read Quran — 5 pages",done:false,priority:"High",due:"Today",category:"Deen"},
    {id:4,task:"SQL Assignment — JOINs",done:false,priority:"Medium",due:"Tomorrow",category:"College"},
    {id:5,task:"Morning skincare routine",done:true,priority:"Low",due:"Today",category:"Health"},
    {id:6,task:"Reply to important emails",done:false,priority:"Low",due:"Today",category:"Personal"},
  ],
  // workouts include muscles[] — up to 2
  workouts:[
    {id:1,day:"Mon",done:true, type:"Gym",         duration:60,energy:8,muscles:["chest","triceps"]},
    {id:2,day:"Tue",done:false,type:"-",            duration:0, energy:5,muscles:[]},
    {id:3,day:"Wed",done:true, type:"Cardio",       duration:30,energy:7,muscles:["legs"]},
    {id:4,day:"Thu",done:true, type:"Gym",          duration:75,energy:9,muscles:["back","shoulders"]},
    {id:5,day:"Fri",done:false,type:"-",            duration:0, energy:4,muscles:[]},
    {id:6,day:"Sat",done:true, type:"Home Workout", duration:45,energy:6,muscles:["core","arms"]},
    {id:7,day:"Sun",done:false,type:"-",            duration:0, energy:0,muscles:[]},
  ],
  // simplified skincare tracking options
  todaySkin:{
    morning:false,
    night:false,
    faceMassage:false,
  },
  skinHist:[
    {day:"Mon",pct:100},{day:"Tue",pct:75},{day:"Wed",pct:50},
    {day:"Thu",pct:100},{day:"Fri",pct:25},{day:"Sat",pct:100},{day:"Sun",pct:50},
  ],
  study:[
    {id:1,subject:"Python",hours:2.5,topic:"OOP & Classes",focus:8,day:"Mon"},
    {id:2,subject:"SQL",hours:1.5,topic:"JOINs & Subqueries",focus:7,day:"Tue"},
    {id:3,subject:"Machine Learning",hours:2,topic:"Linear Regression",focus:9,day:"Wed"},
    {id:4,subject:"Data Science",hours:1,topic:"Pandas DataFrames",focus:6,day:"Thu"},
    {id:5,subject:"Python",hours:3,topic:"Flask REST API",focus:8,day:"Fri"},
    {id:6,subject:"English",hours:1,topic:"Academic Writing",focus:7,day:"Sat"},
  ],
  // ── UPDATED: Quran Reading added as habit ──
  habits:[
    {id:1, name:"Wake early",    icon:"🌅", done:[true,false,true,true,true,false,false]},
    {id:2, name:"Exercise",      icon:"🏋️", done:[true,false,true,true,false,true,false]},
    {id:3, name:"Quran Reading", icon:"📖", done:[true,true,false,true,true,true,false]},
    {id:4, name:"Coding",        icon:"💻", done:[true,true,true,false,true,true,false]},
    {id:5, name:"Sleep on time", icon:"😴", done:[false,true,true,true,false,true,false]},
    {id:6, name:"Water intake",  icon:"💧", done:[true,true,true,true,true,true,false]},
    {id:7, name:"Reading",       icon:"📚", done:[true,false,false,true,true,false,false]},
    {id:8, name:"Study",         icon:"📘", done:[false,false,false,false,false,false,false]},
    {id:9, name:"Abs Workout",   icon:"💥", done:[false,false,false,false,false,false,false]},
  ],
  journal:[
    {id:1,title:"Productive Monday",category:"Journal",date:"Jan 6",mood:8,fav:true,content:"Today was really productive. Completed Python OOP chapter and had a great gym session. Feeling good about where I'm heading."},
    {id:2,title:"Flask API Study Notes",category:"Study Notes",date:"Jan 5",mood:7,fav:false,content:"Key learnings: @app.route, Blueprint for modular apps, REST conventions. Need to revisit request/response objects more deeply."},
    {id:3,title:"Monthly Reflection",category:"Personal",date:"Jan 4",mood:9,fav:true,content:"Grateful for the consistency I'm building. Need to balance Deen and Dunya better. Progress is progress — keep going."},
  ],
  events:[
    {id:1,event:"Data Science Exam",date:"Jan 15",type:"Exam",important:true},
    {id:2,event:"Python Project Deadline",date:"Jan 12",type:"Assignment",important:true},
    {id:3,event:"Gym Session",date:"Today",type:"Personal",important:false},
    {id:4,event:"Study Group — SQL",date:"Jan 10",type:"Meeting",important:false},
    {id:5,event:"Jummah Prayer",date:"Every Friday",type:"Personal",important:true},
  ],
};

// ═══════════════════════════════ HELPERS ══════════════════════════════════
async function callClaude(system,user){
  const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system,messages:[{role:"user",content:user}]})});
  const d=await r.json();
  return d.content?.map(b=>b.text||"").join("")||"";
}
function Cb({done,onToggle,size=20}){
  return <div onClick={onToggle} style={{width:size,height:size,borderRadius:6,border:done?"none":"2px solid #30363D",background:done?EM:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all 0.15s",flexShrink:0,fontSize:size*0.55,color:"white",userSelect:"none"}}>{done?"✓":""}</div>;
}
function Donut({pct,size=120,color=EM}){
  const data=[{v:Math.max(pct,0)},{v:Math.max(100-pct,0)}];
  return(
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <PieChart width={size} height={size}>
        <Pie data={data} dataKey="v" innerRadius={size*0.32} outerRadius={size*0.44} startAngle={90} endAngle={-270} strokeWidth={0}>
          <Cell fill={color}/><Cell fill={CARD2}/>
        </Pie>
      </PieChart>
      <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center",pointerEvents:"none"}}>
        <div style={{fontSize:size>100?20:14,fontWeight:800,color:"#F0F6FC"}}>{pct}%</div>
        <div style={{fontSize:9,color:"#8B949E"}}>done</div>
      </div>
    </div>
  );
}
const Tip=({active,payload,label})=>active&&payload?.length?<div style={{background:"#161B22",border:"1px solid #30363D",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#F0F6FC"}}><div style={{color:"#8B949E",marginBottom:4}}>{label}</div>{payload.map((p,i)=><div key={i} style={{color:p.color||EM}}>{p.name}: {p.value}</div>)}</div>:null;
function SC({num,label,icon,color=EM}){return<div className="sc"><div style={{fontSize:20}}>{icon}</div><div className="sc-num" style={{color}}>{num}</div><div className="sc-lbl">{label}</div></div>;}
function PH({icon,title,desc}){return<div className="ph"><h1><span>{icon}</span>{title}</h1>{desc&&<p>{desc}</p>}</div>;}
function LD(){return<span className="ld"><span>·</span><span>·</span><span>·</span></span>;}


function App() {

  useEffect(() => {

    const testRef = ref(database, "test/message");

    set(testRef, {
      text: "Hello Firebase"
    });

    onValue(testRef, (snapshot) => {
      console.log(snapshot.val());
    });

  }, []);

  return (
    <div>
      Firebase Test
    </div>
  );
}

export default App;

// ════════════════════════════════ DASHBOARD ════════════════════════════════
function Dashboard({state,setState}){
  const salahDone=Object.values(state.todaySalah).filter(Boolean).length;
  const tasksDone=state.todos.filter(t=>t.done).length;
  const totalStudy=state.study.reduce((a,s)=>a+s.hours,0).toFixed(1);
  const wkDone=state.workouts.filter(w=>w.done).length;
  const salahPct=Math.round((salahDone/5)*100);
  const [motivation,setMotivation]=useState("");
  const [motLoading,setMotLoading]=useState(false);
  const getMot=async()=>{setMotLoading(true);setMotivation("");try{const r=await callClaude("You are a motivational coach for a young Muslim student. Give a short, punchy motivational message (2-3 sentences max) about staying consistent with goals, Deen, and self-improvement. Be warm, direct, and inspiring.","Give me a daily motivation message.");setMotivation(r);}catch{setMotivation("Every day is a new page. Write something worthy of it. Bismillah — let's go.");}setMotLoading(false);};
  return(
    <div className="fu">
      <div style={{marginBottom:22}}>
        <div style={{fontSize:22,fontWeight:800,color:"#F0F6FC"}}>Assalamu Alaikum, Huzaifa 👋</div>
        <div style={{fontSize:13,color:"#8B949E",marginTop:4}}>Your personal Productivity & Deen OS. All in one place.</div>
      </div>
      <div className="g4 mb20">
        <SC num={`${salahDone}/5`} label="Prayers Today" icon="🕌" color={EM}/>
        <SC num={`${tasksDone}/${state.todos.length}`} label="Tasks Done" icon="✅" color="#60A5FA"/>
        <SC num={`${totalStudy}h`} label="Study Hours (Week)" icon="📚" color="#F59E0B"/>
        <SC num={wkDone} label="Workouts (Week)" icon="🏋️" color="#A78BFA"/>
      </div>
      <div className="g2 mb16">
        <div className="card">
          <div className="ct">🕌 Today's Salah</div>
          <div className="flex gap16" style={{alignItems:"center"}}>
            <Donut pct={salahPct}/>
            <div style={{flex:1}}>
              {PRAYERS.map(p=>{const done=state.todaySalah[p];return(
                <div key={p} className="flex fc gap10" style={{marginBottom:9}}>
                  <Cb done={done} onToggle={()=>setState(s=>({...s,todaySalah:{...s.todaySalah,[p]:!done}}))}/>
                  <span style={{fontSize:15}}>{PRAYER_ICONS[p]}</span>
                  <span style={{fontSize:13,color:done?"#F0F6FC":"#8B949E",flex:1}}>{p}</span>
                  <span style={{fontSize:11,color:"#484F58"}}>{PRAYER_TIMES[p]}</span>
                </div>
              );})}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="ct">✅ Today's Priority Tasks</div>
          {state.todos.filter(t=>t.due==="Today").map(t=>(
            <div key={t.id} className="flex fc gap10" style={{marginBottom:10,padding:"9px 10px",background:"#1C2333",borderRadius:8,border:`1px solid ${t.done?"rgba(16,185,129,0.2)":"#30363D"}`}}>
              <Cb done={t.done} onToggle={()=>setState(s=>({...s,todos:s.todos.map(x=>x.id===t.id?{...x,done:!x.done}:x)}))}/>
              <span style={{fontSize:13,color:t.done?"#8B949E":"#F0F6FC",textDecoration:t.done?"line-through":"none",flex:1,lineHeight:1.4}}>{t.task}</span>
              <span className={`badge b${t.priority[0].toLowerCase()}`}>{t.priority}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="g2">
        <div className="card">
          <div className="ct">📊 Weekly Prayer Completion</div>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={state.salahHist} barSize={26}>
              <CartesianGrid vertical={false} stroke="#30363D"/>
              <XAxis dataKey="day" tick={{fill:"#8B949E",fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis hide domain={[0,100]}/>
              <Tooltip content={<Tip/>} formatter={v=>[`${v}%`,"Completion"]}/>
              <Bar dataKey="pct" name="Completion" fill={EM} radius={[5,5,0,0]}>
                {state.salahHist.map((_,i)=><Cell key={i} fill={_.pct===100?"#10B981":_.pct>=60?"#059669":"#064E3B"}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="ct">✨ Daily Motivation</div>
          {motivation?(<div className="ai-box" style={{marginTop:0}}><div className="ai-lbl">✦ AI Motivation</div>{motivation}</div>):(
            <div style={{color:"#484F58",fontSize:13,marginBottom:16,lineHeight:1.6}}>Click below for a personalized motivational message to start your day right.</div>
          )}
          <button className="btn btn-ghost mt12" onClick={getMot} disabled={motLoading}>✦ {motLoading?<LD/>:"Get Motivation"}</button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════ SALAH ═══════════════════════════════════
function SalahTracker({state,setState}){
  const done=Object.values(state.todaySalah).filter(Boolean).length;
  const pct=Math.round((done/5)*100);
  return(
    <div className="fu">
      <PH icon="🕌" title="Salah Tracker" desc="Never miss a prayer. Your connection to Allah is your greatest strength."/>
      <div className="flex gap16 mb20" style={{alignItems:"flex-start"}}>
        <Donut pct={pct} size={140}/>
        <div style={{flex:1}}>
          <div style={{fontSize:13,color:"#8B949E",marginBottom:8}}>Today's Progress</div>
          <div className="pb mb16"><div className="pf" style={{width:`${pct}%`}}/></div>
          <div className="flex gap12">
            {[{v:done,l:"Prayed ✅",bg:"var(--em-g)",bc:"var(--em-g2)",c:EM},{v:5-done,l:"Remaining ⬜",bg:"#1C2333",bc:"#30363D",c:"#F0F6FC"},{v:`${pct}%`,l:"Complete",bg:"#1C2333",bc:"#30363D",c:pct===100?"#10B981":"#F59E0B"}].map((x,i)=>(
              <div key={i} style={{background:x.bg,border:`1px solid ${x.bc}`,borderRadius:10,padding:"10px 18px",textAlign:"center"}}>
                <div style={{fontSize:26,fontWeight:800,color:x.c}}>{x.v}</div>
                <div style={{fontSize:11,color:"#8B949E"}}>{x.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="pg mb20">
        {PRAYERS.map(p=>{const prayed=state.todaySalah[p];return(
          <div key={p} className={`pc${prayed?" prayed":""}`} onClick={()=>setState(s=>({...s,todaySalah:{...s.todaySalah,[p]:!prayed}}))}>
            <div style={{fontSize:26}}>{PRAYER_ICONS[p]}</div>
            <div className="pn">{p}</div>
            <div style={{fontSize:11,color:"#484F58"}}>{PRAYER_TIMES[p]}</div>
            <div style={{fontSize:20}}>{prayed?"✅":"⬜"}</div>
          </div>
        );})}
      </div>
      <div className="card">
        <div className="ct">📊 7-Day Prayer History</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={state.salahHist} barSize={34}>
            <CartesianGrid vertical={false} stroke="#30363D"/>
            <XAxis dataKey="day" tick={{fill:"#8B949E",fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis hide domain={[0,100]}/>
            <Tooltip content={<Tip/>} formatter={v=>[`${v}%`,"Prayers"]}/>
            <Bar dataKey="pct" name="Prayers" radius={[5,5,0,0]}>
              {state.salahHist.map((_,i)=><Cell key={i} fill={_.pct===100?"#10B981":_.pct>=60?"#059669":"#064E3B"}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ════════════════════════════════ TODO ════════════════════════════════════
function TodoList({state,setState}){
  const [filter,setFilter]=useState("All");
  const [form,setForm]=useState({task:"",priority:"High",due:"Today",category:"Study"});
  const [aiLoading,setAiLoading]=useState(false);
  const [aiText,setAiText]=useState("");
  const cats=["All","Study","Health","Deen","College","Personal"];
  const filtered=filter==="All"?state.todos:state.todos.filter(t=>t.category===filter);
  const add=()=>{if(!form.task.trim())return;setState(s=>({...s,todos:[...s.todos,{...form,id:Date.now(),done:false}]}));setForm(f=>({...f,task:""}));};
  const toggle=id=>setState(s=>({...s,todos:s.todos.map(t=>t.id===t.id?{...t,done:!t.done}:t)}));
  const del=id=>setState(s=>({...s,todos:s.todos.filter(t=>t.id!==id)}));
  const aiPrioritize=async()=>{const pending=state.todos.filter(t=>!t.done).map(t=>`${t.task} [${t.priority}, ${t.category}]`).join("; ");if(!pending)return;setAiLoading(true);setAiText("");try{const r=await callClaude("You are a productivity expert. Given a list of tasks, suggest the best order to tackle them today based on impact, urgency, and Deen/Dunya balance. Keep it short and clear with bullet points.",`Tasks: ${pending}`);setAiText(r);}catch{setAiText("Could not reach AI.");}setAiLoading(false);};
  const done=state.todos.filter(t=>t.done).length;
  return(
    <div className="fu">
      <PH icon="✅" title="To-Do List" desc="Stay focused. Do what matters most."/>
      <div className="flex gap12 mb20" style={{flexWrap:"wrap"}}>
        {[{n:done,l:"Done",c:EM,i:"✅"},{n:state.todos.length-done,l:"Remaining",c:"#F59E0B",i:"⬜"},{n:`${state.todos.length?Math.round((done/state.todos.length)*100):0}%`,l:"Complete",c:"#60A5FA",i:"🎯"}].map((x,i)=>(
          <div key={i} className="sc" style={{flex:1,minWidth:100}}><div style={{fontSize:18}}>{x.i}</div><div className="sc-num" style={{color:x.c}}>{x.n}</div><div className="sc-lbl">{x.l}</div></div>
        ))}
      </div>
      <div className="card mb16">
        <div className="ct">➕ Add Task</div>
        <div className="flex gap10" style={{flexWrap:"wrap"}}>
          <input className="inp" style={{flex:2,minWidth:160}} placeholder="Task name…" value={form.task} onChange={e=>setForm(f=>({...f,task:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&add()}/>
          <select className="inp" style={{flex:1,minWidth:100}} value={form.priority} onChange={e=>setForm(f=>({...f,priority:e.target.value}))}><option>High</option><option>Medium</option><option>Low</option></select>
          <select className="inp" style={{flex:1,minWidth:110}} value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>{["Study","Health","Deen","College","Personal"].map(c=><option key={c}>{c}</option>)}</select>
          <select className="inp" style={{flex:1,minWidth:100}} value={form.due} onChange={e=>setForm(f=>({...f,due:e.target.value}))}><option>Today</option><option>Tomorrow</option><option>This Week</option></select>
          <button className="btn btn-em" onClick={add}>Add</button>
        </div>
        <button className="btn btn-ghost mt12" onClick={aiPrioritize} disabled={aiLoading}>✦ {aiLoading?<LD/>:"AI Prioritize My Tasks"}</button>
        {aiText&&<div className="ai-box"><div className="ai-lbl">✦ AI Priority Order</div>{aiText}</div>}
      </div>
      <div className="flex gap8 mb16" style={{flexWrap:"wrap"}}>
        {cats.map(c=><div key={c} onClick={()=>setFilter(c)} style={{padding:"6px 16px",borderRadius:20,fontSize:12,fontWeight:600,cursor:"pointer",background:filter===c?EM:"#1C2333",color:filter===c?"#fff":"#8B949E",border:`1px solid ${filter===c?EM:"#30363D"}`,transition:"all 0.15s"}}>{c}</div>)}
      </div>
      <div className="card">
        <table className="tbl">
          <thead><tr><th style={{width:40}}>Done</th><th>Task</th><th>Priority</th><th>Due</th><th>Category</th><th style={{width:40}}></th></tr></thead>
          <tbody>{filtered.map(t=>(
            <tr key={t.id}>
              <td><Cb done={t.done} onToggle={()=>toggle(t.id)}/></td>
              <td style={{color:t.done?"#8B949E":"#F0F6FC",textDecoration:t.done?"line-through":"none"}}>{t.task}</td>
              <td><span className={`badge b${t.priority[0].toLowerCase()}`}>{t.priority}</span></td>
              <td style={{fontSize:12,color:"#8B949E"}}>{t.due}</td>
              <td style={{fontSize:12,color:"#8B949E"}}>{t.category}</td>
              <td><button className="btn btn-danger" style={{padding:"4px 10px",fontSize:11}} onClick={()=>del(t.id)}>×</button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

// ════════════════ WORKOUT (UPDATED — muscles + delete) ═════════════════
function WorkoutTracker({state,setState}){
  const [form,setForm]=useState({type:"Gym",duration:60,energy:8,muscles:[]});
  const doneCount=state.workouts.filter(w=>w.done).length;
  const totalMins=state.workouts.reduce((a,w)=>a+w.duration,0);

  const toggleMuscle=id=>{
    setForm(f=>{
      if(f.muscles.includes(id)) return{...f,muscles:f.muscles.filter(m=>m!==id)};
      if(f.muscles.length>=2) return f;
      return{...f,muscles:[...f.muscles,id]};
    });
  };

  const logToday=()=>{
    if(form.muscles.length===0) return;
    setState(s=>({...s,workouts:s.workouts.map((w,i)=>i===6?{...w,...form,done:true}:w)}));
  };

  const delSession=id=>setState(s=>({...s,workouts:s.workouts.filter(w=>w.id!==id)}));

  return(
    <div className="fu">
      <PH icon="🏋️" title="Workout Tracker" desc="Log up to 2 muscle groups per session. Build consistency, one day at a time."/>
      <div className="g3 mb20">
        <SC num={doneCount} label="Sessions This Week" icon="✅" color={EM}/>
        <SC num={`${totalMins}m`} label="Total Minutes" icon="⏱️" color="#F59E0B"/>
        <SC num={`${Math.round((doneCount/7)*100)}%`} label="Consistency" icon="📈" color="#A78BFA"/>
      </div>
      <div className="g2 mb16">
        {/* WEEK LOG */}
        <div className="card">
          <div className="ct">📅 This Week</div>
          {state.workouts.map(w=>(
            <div key={w.id} className="flex fc gap10" style={{marginBottom:9,padding:"10px 12px",background:"#1C2333",borderRadius:8,border:`1px solid ${w.done?"rgba(16,185,129,0.3)":"#30363D"}`}}>
              <span style={{fontSize:13,color:"#8B949E",width:30,flexShrink:0}}>{w.day}</span>
              <span style={{fontSize:17}}>{w.done?"🔥":"⬜"}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:13,color:w.done?"#F0F6FC":"#484F58"}}>{w.done?w.type:"Rest Day"}</div>
                {w.done&&w.muscles.length>0&&(
                  <div className="flex gap8" style={{marginTop:4,flexWrap:"wrap"}}>
                    {w.muscles.map(m=>{const mg=MUSCLES.find(x=>x.id===m);return<span key={m} style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:"rgba(16,185,129,0.15)",color:EM,fontWeight:600}}>{mg?.icon} {mg?.label||m}</span>;})}
                  </div>
                )}
              </div>
              {w.done&&<span style={{fontSize:11,color:"#8B949E",flexShrink:0}}>{w.duration}m · ⚡{w.energy}/10</span>}
              {w.done&&<button className="btn btn-danger" style={{padding:"4px 8px",fontSize:11,flexShrink:0}} onClick={()=>delSession(w.id)} title="Delete session">×</button>}
            </div>
          ))}
        </div>

        {/* LOG FORM */}
        <div className="card">
          <div className="ct">📝 Log Today's Workout</div>
          <div className="flex" style={{flexDirection:"column",gap:12}}>
            <select className="inp" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
              {["Gym","Cardio","Home Workout","Stretching"].map(t=><option key={t}>{t}</option>)}
            </select>

            {/* MUSCLE SELECTOR */}
            <div>
              <div style={{fontSize:11,color:"#8B949E",marginBottom:8,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase"}}>
                🎯 Muscle Groups
                <span style={{color:"#484F58",marginLeft:6,fontWeight:400,textTransform:"none",letterSpacing:0}}>
                  (select up to 2 — {form.muscles.length}/2 chosen)
                </span>
              </div>
              <div className="flex" style={{flexWrap:"wrap",gap:7}}>
                {MUSCLES.map(mg=>{
                  const isSelected=form.muscles.includes(mg.id);
                  const isDisabled=!isSelected&&form.muscles.length>=2;
                  return(
                    <div key={mg.id}
                      className={`muscle-chip${isSelected?" sel":""}${isDisabled?" disabled":""}`}
                      onClick={()=>!isDisabled&&toggleMuscle(mg.id)}
                    >
                      {mg.icon} {mg.label}
                    </div>
                  );
                })}
              </div>
              {form.muscles.length>0&&(
                <div style={{marginTop:8,fontSize:12,color:EM,fontWeight:600}}>
                  ✅ {form.muscles.map(m=>MUSCLES.find(x=>x.id===m)?.label).join(" + ")}
                </div>
              )}
            </div>

            <div className="flex gap10">
              <div style={{flex:1}}>
                <div style={{fontSize:11,color:"#8B949E",marginBottom:5}}>Duration (min)</div>
                <input type="number" className="inp" value={form.duration} onChange={e=>setForm(f=>({...f,duration:+e.target.value}))} min={0} max={180}/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:11,color:"#8B949E",marginBottom:5}}>Energy (1-10)</div>
                <input type="number" className="inp" value={form.energy} onChange={e=>setForm(f=>({...f,energy:+e.target.value}))} min={1} max={10}/>
              </div>
            </div>
            <button className="btn btn-em" onClick={logToday} disabled={form.muscles.length===0}>
              🔥 Log Workout
            </button>
            {form.muscles.length===0&&<div style={{fontSize:11,color:"#484F58"}}>⚠️ Select at least one muscle group to log</div>}
          </div>
          <div className="mt16">
            <div className="ct">⚡ Energy This Week</div>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={state.workouts}>
                <XAxis dataKey="day" tick={{fill:"#8B949E",fontSize:10}} axisLine={false} tickLine={false}/>
                <YAxis hide domain={[0,10]}/>
                <Tooltip content={<Tip/>}/>
                <Line type="monotone" dataKey="energy" name="Energy" stroke={EM} strokeWidth={2.5} dot={{fill:EM,r:4}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="ct">⏱️ Session Duration (minutes)</div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={state.workouts} barSize={32}>
            <CartesianGrid vertical={false} stroke="#30363D"/>
            <XAxis dataKey="day" tick={{fill:"#8B949E",fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis hide/>
            <Tooltip content={<Tip/>} formatter={v=>[`${v} min`,"Duration"]}/>
            <Bar dataKey="duration" name="Duration" fill="#A78BFA" radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ════════════════ SKINCARE (UPDATED — simplified daily routine) ════════════════
function SkincareTracker({state,setState}){
  const todaySkin = state.todaySkin || {};
  const options = [
    {key:"morning", label:"Morning Care", icon:"🌅", desc:"Start the day with gentle care."},
    {key:"night", label:"Night Care", icon:"🌙", desc:"Restore skin while you sleep."},
    {key:"faceMassage", label:"Face Massage", icon:"💆", desc:"Boost circulation and relaxation."},
  ];
  const doneCount = options.filter(o => !!todaySkin[o.key]).length;
  const overallPct = Math.round((doneCount/options.length)*100);
  const toggle = key => setState(s=>({...s,todaySkin:{...s.todaySkin,[key]:!s.todaySkin?.[key]}}));

  return(
    <div className="fu">
      <PH icon="🧴" title="Skincare Tracker" desc="Track morning care, night care, and face massage with three simple ticks."/>
      <div className="g3 mb16">
        <SC num={`${overallPct}%`} label="Daily Complete" icon="✨" color={EM}/>
        <SC num={`${doneCount}`} label="Done Today" icon="✅" color="#F59E0B"/>
        <SC num="3" label="Options" icon="📅" color="#A78BFA"/>
      </div>
      <div className="card">
        <div className="ct">🧴 Daily Skincare Options</div>
        {options.map(opt=>{
          const done = !!todaySkin[opt.key];
          return(
            <div key={opt.key} className="flex fc gap10" style={{marginBottom:10,padding:"11px 13px",background:"#0D1117",borderRadius:10,border:`1px solid ${done?"rgba(16,185,129,0.35)":"#30363D"}`}}>
              <Cb done={done} onToggle={()=>toggle(opt.key)}/>
              <span style={{fontSize:18}}>{opt.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600,color:done?"#F0F6FC":"#8B949E"}}>{opt.label}</div>
                <div style={{fontSize:11,color:"#484F58",marginTop:2}}>{opt.desc}</div>
              </div>
              {done&&<span style={{fontSize:13}}>✅</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════ STUDY (UPDATED — delete in session history) ════════════════
function StudyTracker({state,setState}){
  const [form,setForm]=useState({subject:"Python",hours:1,topic:"",focus:7});
  const subjects=["Python","SQL","Machine Learning","Data Science","English"];
  const addSession=()=>{
    if(!form.topic.trim()) return;
    const day=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date().getDay()]||"Mon";
    setState(s=>({...s,study:[...s.study,{...form,id:Date.now(),day}]}));
    setForm(f=>({...f,topic:""}));
  };
  // DELETE session
  const delSession=id=>setState(s=>({...s,study:s.study.filter(x=>x.id!==id)}));

  const bySubject=subjects.map(sub=>({name:sub.length>7?sub.substring(0,7)+"…":sub,hours:+state.study.filter(s=>s.subject===sub).reduce((a,s)=>a+s.hours,0).toFixed(1)}));
  const byDay=DAYS7.map(d=>({day:d,hours:+state.study.filter(s=>s.day===d).reduce((a,s)=>a+s.hours,0).toFixed(1)}));
  const total=state.study.reduce((a,s)=>a+s.hours,0).toFixed(1);
  const avgFocus=state.study.length?(state.study.reduce((a,s)=>a+s.focus,0)/state.study.length).toFixed(1):0;

  return(
    <div className="fu">
      <PH icon="📚" title="Study Tracker" desc="Every hour invested is a step closer to mastery."/>
      <div className="g3 mb20">
        <SC num={`${total}h`} label="Total Hours (Week)" icon="⏱️" color={EM}/>
        <SC num={state.study.length} label="Sessions Logged" icon="📝" color="#60A5FA"/>
        <SC num={`${avgFocus}/10`} label="Avg Focus Score" icon="🎯" color="#F59E0B"/>
      </div>
      <div className="g2 mb16">
        <div className="card">
          <div className="ct">📊 Hours by Subject</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={bySubject} layout="vertical" barSize={14}>
              <XAxis type="number" tick={{fill:"#8B949E",fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis dataKey="name" type="category" tick={{fill:"#8B949E",fontSize:11}} axisLine={false} tickLine={false} width={65}/>
              <Tooltip content={<Tip/>} formatter={v=>[`${v}h`,"Hours"]}/>
              <Bar dataKey="hours" name="Hours" fill={EM} radius={[0,4,4,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="ct">📈 Daily Study Hours</div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={byDay}>
              <CartesianGrid vertical={false} stroke="#30363D"/>
              <XAxis dataKey="day" tick={{fill:"#8B949E",fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:"#8B949E",fontSize:10}} axisLine={false} tickLine={false}/>
              <Tooltip content={<Tip/>} formatter={v=>[`${v}h`,"Hours"]}/>
              <Line type="monotone" dataKey="hours" name="Hours" stroke={EM} strokeWidth={2.5} dot={{fill:EM,r:4}}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="card mb16">
        <div className="ct">📝 Log Study Session</div>
        <div className="flex gap10" style={{flexWrap:"wrap"}}>
          <input className="inp" style={{flex:2,minWidth:200}} placeholder="Topic covered…" value={form.topic} onChange={e=>setForm(f=>({...f,topic:e.target.value}))}/>
          <input type="number" className="inp" style={{flex:1,minWidth:100}} placeholder="Hours" value={form.hours} onChange={e=>setForm(f=>({...f,hours:+e.target.value}))} min={0.5} max={12} step={0.5}/>
          <input type="number" className="inp" style={{flex:1,minWidth:100}} placeholder="Focus (1-10)" value={form.focus} onChange={e=>setForm(f=>({...f,focus:+e.target.value}))} min={1} max={10}/>
          <button className="btn btn-em" onClick={addSession}>Log</button>
        </div>
      </div>
      <div className="card">
        <div className="ct">📋 Session History</div>
        {state.study.length===0?(
          <div style={{textAlign:"center",color:"#484F58",fontSize:13,padding:"24px 0"}}>No sessions yet. Start studying! 📚</div>
        ):(
          <table className="tbl">
            <thead><tr><th>Topic</th><th>Hours</th><th>Focus</th><th>Day</th><th style={{width:50,textAlign:"center"}}>Del</th></tr></thead>
            <tbody>
              {[...state.study].reverse().map(s=>(
                <tr key={s.id}>
                  <td style={{color:"#F0F6FC"}}>{s.topic}</td>
                  <td style={{color:EM,fontWeight:700}}>{s.hours}h</td>
                  <td style={{color:"#8B949E"}}>{s.focus}/10</td>
                  <td style={{fontSize:12,color:"#8B949E"}}>{s.day}</td>
                  <td style={{textAlign:"center"}}>
                    <button className="btn btn-danger" style={{padding:"4px 10px",fontSize:11}} onClick={()=>delSession(s.id)} title="Delete session">×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ════════════════ HABITS (UPDATED — Quran Reading + DEEN badge) ═══════════
function HabitTracker({state,setState}){
  const toggle=(hid,di)=>setState(s=>({...s,habits:s.habits.map(h=>h.id===hid?{...h,done:h.done.map((d,i)=>i===di?!d:d)}:h)}));
  const streak=done=>{let s=0;for(let i=done.length-1;i>=0;i--){if(done[i])s++;else break;}return s;};
  const consistency=DAYS7.map((d,i)=>({day:d,habits:state.habits.filter(h=>h.done[i]).length}));
  return(
    <div className="fu">
      <PH icon="💪" title="Habit Tracker" desc="Small daily habits create extraordinary results."/>
      <div className="card mb16">
        <div style={{overflowX:"auto"}}>
          <table className="tbl" style={{minWidth:540}}>
            <thead>
              <tr>
                <th style={{width:160}}>Habit</th>
                {DAYS7.map(d=><th key={d} style={{textAlign:"center",width:42}}>{d}</th>)}
                <th style={{textAlign:"center",width:60}}>🔥</th>
                <th style={{textAlign:"center",width:50}}>Done</th>
              </tr>
            </thead>
            <tbody>
              {state.habits.map(h=>(
                <tr key={h.id}>
                  <td>
                    <div className="flex fc gap8">
                      <span>{h.icon}</span>
                      <span style={{fontWeight:500,fontSize:13}}>{h.name}</span>
                      {h.name==="Quran Reading"&&(
                        <span style={{fontSize:9,padding:"1px 6px",borderRadius:10,background:"rgba(16,185,129,0.2)",color:EM,fontWeight:700,border:"1px solid rgba(16,185,129,0.3)",flexShrink:0}}>DEEN</span>
                      )}
                    </div>
                  </td>
                  {h.done.map((d,i)=>(
                    <td key={i} style={{textAlign:"center",padding:"8px 4px"}}>
                      <div className={`ht-cell${d?" done":""}`} onClick={()=>toggle(h.id,i)}>{d?"✓":""}</div>
                    </td>
                  ))}
                  <td style={{textAlign:"center",color:EM,fontWeight:700}}>{streak(h.done)}</td>
                  <td style={{textAlign:"center",color:"#8B949E",fontSize:12}}>{h.done.filter(Boolean).length}/7</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card">
        <div className="ct">📊 Daily Habit Consistency</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={consistency} barSize={30}>
            <CartesianGrid vertical={false} stroke="#30363D"/>
            <XAxis dataKey="day" tick={{fill:"#8B949E",fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis hide domain={[0,state.habits.length]}/>
            <Tooltip content={<Tip/>} formatter={v=>[`${v}/${state.habits.length} habits`,"Completed"]}/>
            <Bar dataKey="habits" name="Habits" fill={EM} radius={[5,5,0,0]}>
              {consistency.map((_,i)=><Cell key={i} fill={_.habits===state.habits.length?"#10B981":_.habits>=4?"#059669":"#064E3B"}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ════════════════════════════════ JOURNAL ═════════════════════════════════
function Journal({state,setState}){
  const [view,setView]=useState("list");
  const [form,setForm]=useState({title:"",category:"Journal",mood:7,fav:false,content:""});
  const [aiPrompt,setAiPrompt]=useState("");
  const [aiLoading,setAiLoading]=useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const TEMPLATE="Today I felt:\n\nThings I completed:\n\nWhat I learned:\n\nWhat stressed me:\n\nWhat made me happy:\n\nTomorrow's focus:";
  const getPrompt=async()=>{setAiLoading(true);setAiPrompt("");try{const r=await callClaude("You are a thoughtful journaling coach for a young Muslim student balancing Deen, studies, health, and personal growth. Generate ONE insightful, open-ended reflection question. Keep it under 25 words. Output only the question.","Give me a daily journal reflection prompt.");setAiPrompt(r.trim());}catch{setAiPrompt("What is one thing I did today that my future self will thank me for?");}setAiLoading(false);};
  const save=()=>{if(!form.title.trim())return;const date=new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"});setState(s=>({...s,journal:[{...form,id:Date.now(),date},...s.journal]}));setForm({title:"",category:"Journal",mood:7,fav:false,content:""});setView("list");};
  const filteredJournal = state.journal.filter(j =>
    j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.content.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return(
    <div className="fu">
      <PH icon="📝" title="Journal & Notes" desc="Reflect. Learn. Grow every single day."/>
      <div className="flex gap10 mb20">
        <button className={`btn ${view==="list"?"btn-em":"btn-ghost"}`} onClick={()=>setView("list")}>📋 Entries ({state.journal.length})</button>
        <button className={`btn ${view==="new"?"btn-em":"btn-ghost"}`} onClick={()=>setView("new")}>✏️ New Entry</button>
      </div>
      {view==="list"?(
        <div>
          <input className="inp mb16" placeholder="Search entries by title or content…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          {filteredJournal.map(j=>{const c=CAT_COLORS[j.category]||EM;return(
          <div key={j.id} className="jc">
            <div className="flex fc gap10 mb16">
              <span style={{fontSize:14,fontWeight:700,color:"#F0F6FC",flex:1}}>{j.title}</span>
              {j.fav&&<span>⭐</span>}
              <span className="badge" style={{background:`${c}22`,color:c,border:`1px solid ${c}44`}}>{j.category}</span>
            </div>
            <div className="flex gap12 fs12" style={{color:"#484F58",marginBottom:8}}><span>📅 {j.date}</span><span>😊 Mood: {j.mood}/10</span></div>
            <div style={{fontSize:13,color:"#8B949E",lineHeight:1.55}}>{j.content.substring(0,130)}{j.content.length>130?"…":""}</div>
          </div>
        );})}
        </div>
      ):(
        <div className="card">
          <div className="flex" style={{flexDirection:"column",gap:12}}>
            <input className="inp" placeholder="Entry title…" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}/>
            <div className="flex gap10">
              <select className="inp" value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>{["Journal","Study Notes","Ideas","Personal"].map(c=><option key={c}>{c}</option>)}</select>
              <input type="number" className="inp" style={{maxWidth:140}} placeholder="Mood (1-10)" min={1} max={10} value={form.mood} onChange={e=>setForm(f=>({...f,mood:+e.target.value}))}/>
            </div>
            <div>
              <button className="btn btn-ghost" onClick={getPrompt} disabled={aiLoading} style={{marginBottom:8}}>✦ {aiLoading?<LD/>:"Get AI Reflection Prompt"}</button>
              {aiPrompt&&<div className="ai-box"><div className="ai-lbl">✦ Today's Prompt</div>{aiPrompt}</div>}
            </div>
            <textarea className="textarea" style={{minHeight:220}} placeholder={TEMPLATE} value={form.content} onChange={e=>setForm(f=>({...f,content:e.target.value}))}/>
            <div className="flex fc gap12">
              <button className="btn btn-em" onClick={save}>💾 Save Entry</button>
              <label className="flex fc gap8 fs13" style={{color:"#8B949E",cursor:"pointer"}}>
                <Cb done={form.fav} onToggle={()=>setForm(f=>({...f,fav:!f.fav}))} size={18}/> Favourite ⭐
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════ CALENDAR ════════════════════════════════
function CalendarPage({state,setState}){
  const [form,setForm]=useState({event:"",date:"",type:"Personal",important:false});
  const add=()=>{if(!form.event.trim()||!form.date.trim())return;setState(s=>({...s,events:[...s.events,{...form,id:Date.now()}]}));setForm(f=>({...f,event:"",date:""}));};
  const del=id=>setState(s=>({...s,events:s.events.filter(e=>e.id!==id)}));
  return(
    <div className="fu">
      <PH icon="📆" title="Calendar & Events" desc="Plan ahead. Never miss what matters."/>
      <div className="card mb16">
        <div className="ct">➕ Add Event</div>
        <div className="flex gap10" style={{flexWrap:"wrap"}}>
          <input className="inp" style={{flex:2,minWidth:160}} placeholder="Event name…" value={form.event} onChange={e=>setForm(f=>({...f,event:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&add()}/>
          <input className="inp" style={{flex:1,minWidth:110}} placeholder="Date (e.g. Jan 20)" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/>
          <select className="inp" style={{flex:1,minWidth:120}} value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>{["Exam","Assignment","Meeting","Personal","Reminder"].map(t=><option key={t}>{t}</option>)}</select>
          <button className="btn btn-em" onClick={add}>Add</button>
        </div>
      </div>
      <div className="card">
        <div className="ct">📋 Upcoming Events</div>
        {state.events.map(e=>{const c=EV_COLORS[e.type]||EM;return(
          <div key={e.id} className="ev" style={{borderLeftColor:c}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:c,flexShrink:0}}/>
            <div style={{flex:1}}>
              <div className="flex fc gap8"><span style={{fontSize:14,fontWeight:600,color:"#F0F6FC"}}>{e.event}</span>{e.important&&<span>⭐</span>}</div>
              <div style={{fontSize:12,color:"#8B949E",marginTop:2}}>📅 {e.date}</div>
            </div>
            <span className="badge" style={{background:`${c}20`,color:c,border:`1px solid ${c}40`}}>{e.type}</span>
            <button className="btn btn-danger" style={{padding:"4px 10px",fontSize:11}} onClick={()=>del(e.id)}>×</button>
          </div>
        );})}
      </div>
    </div>
  );
}

// ════════════════════════════════ ANALYTICS ═══════════════════════════════
function Analytics({state}){
  const salahAvg=Math.round(state.salahHist.reduce((a,d)=>a+d.pct,0)/7);
  const workoutPct=Math.round((state.workouts.filter(w=>w.done).length/7)*100);
  const skinAvg=Math.round(state.skinHist.reduce((a,d)=>a+d.pct,0)/7);
  const habitScore=Math.round((state.habits.reduce((a,h)=>a+h.done.filter(Boolean).length,0)/(state.habits.length*7))*100);
  const totalStudy=state.study.reduce((a,s)=>a+s.hours,0).toFixed(1);
  const overview=[{label:"Salah",pct:salahAvg,color:EM,icon:"🕌"},{label:"Workout",pct:workoutPct,color:"#A78BFA",icon:"🏋️"},{label:"Skincare",pct:skinAvg,color:"#60A5FA",icon:"🧴"},{label:"Habits",pct:habitScore,color:"#F59E0B",icon:"💪"}];
  const subjectData=["Python","SQL","Machine Learning","Data Science","English"].map(s=>({name:s.length>9?s.substring(0,9)+"…":s,hours:+state.study.filter(x=>x.subject===s).reduce((a,x)=>a+x.hours,0).toFixed(1)}));
  const muscleFreq=MUSCLES.map(mg=>({name:mg.label,count:state.workouts.filter(w=>w.muscles&&w.muscles.includes(mg.id)).length})).filter(m=>m.count>0);
  const monthlyData=["Jan","Feb","Mar","Apr","May","Jun"].map((month,idx)=>({
    month,
    score:Math.min(100,Math.round((salahAvg+workoutPct+skinAvg+habitScore)/4 + (idx-2)*4))
  }));
  return(
    <div className="fu">
      <PH icon="📊" title="Analytics Dashboard" desc="Your weekly productivity & Deen performance at a glance."/>
      <div className="g4 mb20">
        <SC num={`${salahAvg}%`} label="Prayer Avg" icon="🕌" color={EM}/>
        <SC num={`${habitScore}%`} label="Habit Score" icon="💪" color="#F59E0B"/>
        <SC num={`${totalStudy}h`} label="Study Hours" icon="📚" color="#60A5FA"/>
        <SC num={`${workoutPct}%`} label="Workout Rate" icon="🏋️" color="#A78BFA"/>
      </div>
      <div className="card mb20">
        <div className="ct">🎯 Weekly Completion Overview</div>
        <div className="flex" style={{justifyContent:"space-around",flexWrap:"wrap",gap:20,padding:"10px 0"}}>
          {overview.map(o=>(
            <div key={o.label} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
              <div style={{position:"relative",width:110,height:110}}>
                <PieChart width={110} height={110}>
                  <Pie data={[{v:o.pct},{v:100-o.pct}]} dataKey="v" innerRadius={36} outerRadius={50} startAngle={90} endAngle={-270} strokeWidth={0}>
                    <Cell fill={o.color}/><Cell fill={CARD2}/>
                  </Pie>
                </PieChart>
                <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center"}}>
                  <div style={{fontSize:17,fontWeight:800,color:"#F0F6FC"}}>{o.pct}%</div>
                </div>
              </div>
              <div style={{fontSize:12,color:"#8B949E"}}>{o.icon} {o.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="card mb16">
        <div className="ct">📅 Monthly Momentum</div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={monthlyData}>
            <CartesianGrid vertical={false} stroke="#30363D"/>
            <XAxis dataKey="month" tick={{fill:"#8B949E",fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fill:"#8B949E",fontSize:10}} axisLine={false} tickLine={false}/>
            <Tooltip content={<Tip/>} formatter={v=>[`${v}%`,"Momentum"]}/>
            <Line type="monotone" dataKey="score" name="Momentum" stroke="#A78BFA" strokeWidth={2.5} dot={{fill:"#A78BFA",r:4}}/>
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="g2 mb16">
        <div className="card">
          <div className="ct">🕌 Prayer Trend</div>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={state.salahHist}>
              <CartesianGrid vertical={false} stroke="#30363D"/>
              <XAxis dataKey="day" tick={{fill:"#8B949E",fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis hide domain={[0,100]}/>
              <Tooltip content={<Tip/>} formatter={v=>[`${v}%`,"Prayers"]}/>
              <Line type="monotone" dataKey="pct" name="Prayers" stroke={EM} strokeWidth={2.5} dot={{fill:EM,r:4}}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="ct">📚 Study by Subject</div>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={subjectData} layout="vertical" barSize={14}>
              <XAxis type="number" tick={{fill:"#8B949E",fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis dataKey="name" type="category" tick={{fill:"#8B949E",fontSize:10}} axisLine={false} tickLine={false} width={68}/>
              <Tooltip content={<Tip/>} formatter={v=>[`${v}h`,"Hours"]}/>
              <Bar dataKey="hours" name="Hours" fill={EM} radius={[0,4,4,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {muscleFreq.length>0&&(
        <div className="card mb16">
          <div className="ct">💪 Muscle Groups Trained (This Week)</div>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={muscleFreq} barSize={28}>
              <CartesianGrid vertical={false} stroke="#30363D"/>
              <XAxis dataKey="name" tick={{fill:"#8B949E",fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis hide/>
              <Tooltip content={<Tip/>} formatter={v=>[`${v} session${v>1?"s":""}`,"Trained"]}/>
              <Bar dataKey="count" name="Sessions" fill="#A78BFA" radius={[5,5,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="card">
        <div className="ct">🏋️ Workout Duration (minutes)</div>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={state.workouts} barSize={32}>
            <CartesianGrid vertical={false} stroke="#30363D"/>
            <XAxis dataKey="day" tick={{fill:"#8B949E",fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis hide/>
            <Tooltip content={<Tip/>} formatter={v=>[`${v} min`,"Duration"]}/>
            <Bar dataKey="duration" name="Duration" fill="#A78BFA" radius={[4,4,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ════════════════════════════════ APP ═════════════════════════════════════
export default function App(){
  const [tab,setTab]=useState("dashboard");
  const [sideOpen,setSideOpen]=useState(false);
  const [state,setState]=useState(() => {
    const saved = localStorage.getItem('huzaifa-os-state');
    if(!saved) return INIT;
    try {
      const parsed = JSON.parse(saved);
      const savedHabits = Array.isArray(parsed.habits) ? parsed.habits : [];
      const mergedHabits = [...savedHabits];
      INIT.habits.forEach(habit => {
        if(!savedHabits.some(sh => sh.name === habit.name)) mergedHabits.push(habit);
      });
      return {...INIT, ...parsed, habits: mergedHabits};
    } catch {
      return INIT;
    }
  });
  const [quran,setQuran]=useState("Loading today's verse…");
  useEffect(() => {
    localStorage.setItem('huzaifa-os-state', JSON.stringify(state));
  }, [state]);
  useEffect(()=>{
    callClaude("You are a knowledgeable Muslim. Share ONE short inspiring Quran verse in English translation related to patience, gratitude, consistency, or self-improvement. Format exactly: 'Translation...' — Surah Name (Chapter:Verse). Keep translation under 14 words.","Give me an inspiring Quran verse for today.")
      .then(setQuran).catch(()=>setQuran("'Verily, with hardship comes ease.' — Ash-Sharh (94:6)"));
  },[]);
  useEffect(() => {
    const cleanup = initializeSync();
    return cleanup;
  }, []);
  const PAGE={state,setState};
  const pages={
    dashboard:<Dashboard {...PAGE}/>,salah:<SalahTracker {...PAGE}/>,todos:<TodoList {...PAGE}/>,
    workout:<WorkoutTracker {...PAGE}/>,skincare:<SkincareTracker {...PAGE}/>,study:<StudyTracker {...PAGE}/>,
    habits:<HabitTracker {...PAGE}/>,journal:<Journal {...PAGE}/>,calendar:<CalendarPage {...PAGE}/>,analytics:<Analytics {...PAGE}/>,
  };
  return(
    <>
      <style>{STYLE}</style>
      <div className="layout">
        <nav className={`sb${sideOpen?" open":""}`}>
          <div className="sb-logo">H</div>
          {NAV.map(n=>(
            <div key={n.id} className={`ni${tab===n.id?" active":""}`} onClick={()=>setTab(n.id)} title={n.label}>
              <span className="ni-icon">{n.icon}</span>
              {sideOpen&&<span>{n.label}</span>}
            </div>
          ))}
          <div className="sb-tog" onClick={()=>setSideOpen(o=>!o)} title="Toggle sidebar">{sideOpen?"◀":"▶"}</div>
        </nav>
        <div className={`main${sideOpen?" shift":""}`}>
          <div className="topbar">
            <div>
              <div className="tb-title">Huzaifa's Personal Productivity Manager</div>
              <div className="tb-date">{TODAY_STR}</div>
            </div>
            <SyncStatusIndicator />
            <div className="qv">✦ {quran}</div>
          </div>
          <div className="content" key={tab}>{pages[tab]}</div>
        </div>
      </div>
    </>
  );
}
