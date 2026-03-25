import { useState, useEffect } from "react";
import { CreditCard, Users, LogOut, Plus, Eye, EyeOff, X, Bell, Phone, Mail,
  Calendar, DollarSign, AlertTriangle, ChevronRight, Check, TrendingUp, Shield,
  Trash2, ChevronDown, ChevronUp, Clock, MessageCircle, Send, ArrowRight } from "lucide-react";
import { useRef } from "react";

const now = () => new Date().toISOString();

// EmailJS notification
const sendEmail = async ({to, toName, subject, message}) => {
  console.log("📧 EmailJS [Demo]:", { to, subject, message: message.slice(0,60)+"..." });
  // To activate: replace with your EmailJS credentials from emailjs.com (free)
  // const SERVICE_ID = "YOUR_SERVICE_ID";
  // const TEMPLATE_ID = "YOUR_TEMPLATE_ID"; 
  // const PUBLIC_KEY = "YOUR_PUBLIC_KEY";
  return { success: true, demo: true };
};

// ─── BRAND ──────────────────────────────────────────────────────
const BH = { bg:"#0f1c2e", surface:"#1a2b42", card:"#1e3254", border:"#2a4060",
  gold:"#b68e4f", goldL:"#cba96e", cream:"#f7f4ea", gray:"#7a91aa",
  red:"#d94f4f", orange:"#cc7430", yellow:"#c4a020", green:"#3a9e72", blue:"#4a90d9" };

// ─── HELPERS ───────────────────────────────────────────────────
const daysLeft  = d => Math.ceil((new Date(d) - Date.now()) / 86_400_000);
const monthsOld = d => Math.floor((Date.now() - new Date(d)) / (86_400_000 * 30.44));
const usedPct   = (o,e) => Math.min(100, Math.max(0, (Date.now()-new Date(o))/(new Date(e)-new Date(o))*100));
const $$ = n => "$" + (n||0).toLocaleString("en-US");
const fdt = d => { try { return new Date(d+"T12:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}); } catch{ return d; }};
const uid = () => "x"+Date.now()+Math.random().toString(36).slice(2,5);

const aprSt = d => {
  if(d<0)    return {txt:"VENCIÓ",  c:BH.red,    bg:"#d94f4f22", em:"💀"};
  if(d<=30)  return {txt:"¡1 MES!", c:BH.red,    bg:"#d94f4f22", em:"🚨"};
  if(d<=90)  return {txt:"3 MESES", c:BH.orange, bg:"#cc743022", em:"⚠️"};
  if(d<=180) return {txt:"6 MESES", c:BH.yellow, bg:"#c4a02022", em:"📢"};
  return            {txt:"ACTIVO",  c:BH.green,  bg:"#3a9e7222", em:"✅"};
};

const healthScore = cards => {
  if(!cards||!cards.length) return 100;
  let sc = 100;
  cards.forEach(c => {
    const u = (c.balance/c.limit)*100;
    if(u>50) sc-=15; else if(u>30) sc-=8;
    const d = daysLeft(c.exp);
    if(d>=0&&d<=30) sc-=20; else if(d>=0&&d<=90) sc-=10;
  });
  return Math.max(0,Math.min(100,Math.round(sc)));
};

// ─── AUTH ──────────────────────────────────────────────────────
const AUTH = {
  "admin@bighousecredit.com": { pw:"BH2024",       role:"admin" },
  "gian@bighousecredit.com":  { pw:"BHGian2024",  role:"client", cid:"c_gian" },
  "gordis@bighousecredit.com":{ pw:"BHGordis2024",role:"client", cid:"c_gordis" },
  "maria@demo.com":            { pw:"demo123",     role:"client", cid:"c1" },
  "carlos@demo.com":           { pw:"demo123",     role:"client", cid:"c2" },
};

// ─── SEED DATA ─────────────────────────────────────────────────
const SEED = {
  c_gian:{
    id:"c_gian",name:"Gianfranco Casagrandi",email:"gian@bighousecredit.com",phone:"(904) 555-0100",ronda:3,joined:"2025-06-01",onboarded:true,avatar:"GC",
    advisorNotes:[
      {id:"n1",date:"2026-03-20",text:"Gian — estás listo para Ronda 3. Amex Business Gold es tu próxima movida. Mantén utilización bajo 10% antes de aplicar y estaremos en una posición perfecta."},
      {id:"n2",date:"2026-03-10",text:"CLI aprobado en Chase Ink Cash. Límite subió a $35K. Excelente trabajo manteniendo los pagos puntuales. Eso es lo que construye el perfil para Ronda 3."},
    ],
    actionItems:[
      {id:"a1",text:"Solicitar CLI en Chase Sapphire Reserve (ya elegible)",done:false},
      {id:"a2",text:"Completar gasto mínimo Amex Business Gold — faltan $800",done:false},
      {id:"a3",text:"Transferir $5K del BoA a cuenta operativa BigHouse Holdings",done:true},
    ],
    fundingPipeline:[
      {bank:"US Bank",product:"Business Triple Cash Rewards",limit:"$25,000–$50,000",eta:"Q2 2026",note:"Requiere 12 meses de historial LLC activa"},
      {bank:"Truist",product:"Business Credit Card",limit:"$15,000–$30,000",eta:"Q3 2026",note:"Perfecto tras Ronda 3 para diversificar bancos"},
    ],
    cards:[
      {id:"k_g1",bank:"Amex",product:"Business Gold",limit:50000,balance:4800,open:"2025-06-15",exp:"2026-09-15",months:15,paymentDue:15,annualFee:295,annualFeeDate:"2026-06-15",signupBonus:{required:15000,spent:14200,deadline:"2026-05-15",reward:"150,000 Membership Rewards pts"},cliEligible:"2025-12-15",network:"Amex",benefits:[{cat:"Top 2 categorías del mes",mult:"4x MR",icon:"⭐",note:"Las 2 categorías donde más gastes ese ciclo"},{cat:"Vuelos (amextravel.com)",mult:"3x MR",icon:"✈️"},{cat:"Restaurantes",mult:"4x MR",icon:"🍽️"},{cat:"Todo lo demás",mult:"1x MR",icon:"🛒"}],perks:["$240 crédito select business anual","Sin límite de puntos MR","Sin foreign transaction fee","Compra protegida hasta $1,000/ítem"]},
      {id:"k_g2",bank:"Chase",product:"Ink Business Cash",limit:35000,balance:2100,open:"2025-08-01",exp:"2026-11-01",months:15,paymentDue:3,annualFee:0,annualFeeDate:null,signupBonus:{required:6000,spent:6000,deadline:"2026-02-01",reward:"$900 cash back",completed:true},cliEligible:"2026-02-01",network:"Visa",benefits:[{cat:"Telecom/Internet",mult:"5% cash back",icon:"📡"},{cat:"Oficina/Suministros",mult:"5% cash back",icon:"🖨️"},{cat:"Gas/Restaurantes",mult:"2% cash back",icon:"⛽"},{cat:"Todo lo demás",mult:"1% cash back",icon:"🛒"}],perks:["Sin cuota anual","Puntos transferibles Chase UR","Sin foreign transaction fee"]},
      {id:"k_g3",bank:"Chase",product:"Sapphire Reserve",limit:20000,balance:1500,open:"2024-12-01",exp:"2027-06-01",months:18,paymentDue:20,annualFee:550,annualFeeDate:"2025-12-01",signupBonus:{required:4000,spent:4000,deadline:"2025-06-01",reward:"60,000 UR pts",completed:true},cliEligible:"2025-06-01",network:"Visa",benefits:[{cat:"Viajes",mult:"3x UR",icon:"✈️"},{cat:"Restaurantes",mult:"3x UR",icon:"🍽️"},{cat:"Todo lo demás",mult:"1x UR",icon:"🛒"}],perks:["$300 travel credit anual","Priority Pass Select ilimitado","Global Entry/TSA Pre-Check gratis","Trip cancellation/delay insurance"]},
    ],
  },
  c_gordis:{
    id:"c_gordis",name:"Gordis (Andrea Zunino)",email:"gordis@bighousecredit.com",phone:"(904) 555-0101",ronda:2,joined:"2025-09-01",onboarded:false,avatar:"GZ",
    advisorNotes:[
      {id:"n3",date:"2026-03-18",text:"Gordis — tu perfil está creciendo muy bien. El próximo paso es solicitar CLI en Barclays a partir del 15 de abril (6 meses). También considera agregar una Amex Blue Business Cash para el portafolio de BH Properties."},
      {id:"n4",date:"2026-02-28",text:"Recuerda activar tu companion certificate de Aviator Red antes de que venza. ¡Es básicamente un vuelo gratis para Gian! Válido hasta octubre 2026."},
    ],
    actionItems:[
      {id:"a4",text:"Mantener utilización Barclays bajo 20% este mes",done:false},
      {id:"a5",text:"Activar companion certificate Aviator Red (vuelo Gian)",done:true},
      {id:"a6",text:"Programar recordatorio CLI Barclays — 15 de abril",done:false},
      {id:"a7",text:"Usar Freedom Unlimited en restaurantes este mes (3% back)",done:false},
    ],
    fundingPipeline:[
      {bank:"Amex",product:"Blue Business Cash",limit:"$15,000–$25,000",eta:"Q2 2026",note:"Ideal para gastos recurrentes — 2% flat sin categorías"},
      {bank:"Chase",product:"Ink Business Unlimited",limit:"$15,000–$30,000",eta:"Q3 2026",note:"Perfecto para diversificar con Chase"},
    ],
    cards:[
      {id:"k_gd1",bank:"Barclays",product:"AAdvantage Aviator Red",limit:12000,balance:1800,open:"2025-10-15",exp:"2026-10-15",months:12,paymentDue:10,annualFee:99,annualFeeDate:"2026-10-15",signupBonus:{required:2500,spent:2500,deadline:"2026-04-15",reward:"60,000 millas AA",completed:true},cliEligible:"2026-04-15",network:"Mastercard",benefits:[{cat:"American Airlines",mult:"2x millas",icon:"✈️"},{cat:"Hotels",mult:"2x millas",icon:"🏨"},{cat:"Todo lo demás",mult:"1x millas",icon:"🛒"}],perks:["1er equipaje gratis (tú + acompañante)","Companion certificate anual $99","$25 crédito in-flight","Preferred boarding AA","10% millas back al redimir"]},
      {id:"k_gd2",bank:"Chase",product:"Freedom Unlimited",limit:8500,balance:950,open:"2025-11-20",exp:"2026-11-20",months:12,paymentDue:25,annualFee:0,annualFeeDate:null,signupBonus:{required:500,spent:500,deadline:"2026-02-20",reward:"$200 cash back",completed:true},cliEligible:"2026-05-20",network:"Visa",benefits:[{cat:"Chase Travel",mult:"5% cash back",icon:"✈️"},{cat:"Farmacia",mult:"3% cash back",icon:"💊"},{cat:"Restaurantes",mult:"3% cash back",icon:"🍽️"},{cat:"Todo lo demás",mult:"1.5% cash back",icon:"🛒"}],perks:["Sin cuota anual","0% APR introductorio","Puntos transferibles con Sapphire Reserve de Gian"]},
    ],
  },
  c1:{
    id:"c1",name:"María Rodríguez",email:"maria@demo.com",phone:"(305) 555-0142",ronda:2,joined:"2025-10-15",onboarded:true,avatar:"MR",
    messages:[{id:"m3",from:"admin",text:"María, tu score subió 42 puntos. Excelente trabajo!",date:"2026-03-15T09:00:00Z",read:true}],advisorNotes:[{id:"n5",date:"2026-03-15",text:"María — excelente progreso. Tu score subió 42 puntos desde que empezamos. Próximo paso: bajar utilización Chase al 10% y estaremos listos para Ronda 3 en junio."}],
    actionItems:[{id:"a8",text:"Pagar Chase Ink a $2,500 (bajar utilización a 10%)",done:false},{id:"a9",text:"Verificar LLC Illinois activa en Secretary of State",done:true},{id:"a10",text:"Enviar estados de cuenta de últimos 3 meses",done:false}],
    fundingPipeline:[{bank:"Bank of America",product:"Business Advantage Unlimited",limit:"$20,000–$35,000",eta:"Q2 2026",note:"Ronda 3 — proyectado junio 2026"}],
    cards:[
      {id:"k1",bank:"Chase",product:"Ink Business Cash",limit:25000,balance:8500,open:"2025-10-20",exp:"2026-04-24",months:12,paymentDue:15,annualFee:0,annualFeeDate:null,signupBonus:{required:6000,spent:6000,deadline:"2026-04-20",reward:"$750 cash back",completed:true},cliEligible:"2026-04-20",network:"Visa",benefits:[{cat:"Telecom",mult:"5%",icon:"📡"},{cat:"Gas",mult:"2%",icon:"⛽"},{cat:"Todo",mult:"1%",icon:"🛒"}],perks:["Sin cuota anual"]},
      {id:"k2",bank:"Amex",product:"Business Gold",limit:35000,balance:12000,open:"2025-11-05",exp:"2026-08-05",months:15,paymentDue:8,annualFee:295,annualFeeDate:"2026-11-05",signupBonus:{required:10000,spent:7800,deadline:"2026-05-05",reward:"120,000 MR pts"},cliEligible:"2026-05-05",network:"Amex",benefits:[{cat:"Top 2 categorías",mult:"4x MR",icon:"💻"},{cat:"Todo",mult:"1x MR",icon:"🛒"}],perks:["$240 crédito business anual"]},
      {id:"k3",bank:"Bank of America",product:"Business Advantage",limit:25000,balance:5000,open:"2026-01-10",exp:"2027-01-10",months:12,paymentDue:22,annualFee:0,annualFeeDate:null,signupBonus:{required:3000,spent:1200,deadline:"2026-07-10",reward:"$300 cash back"},cliEligible:"2026-07-10",network:"Visa",benefits:[{cat:"Gas/EV",mult:"3%",icon:"⛽"},{cat:"Oficina",mult:"3%",icon:"🖨️"},{cat:"Todo",mult:"1.5%",icon:"🛒"}],perks:["Sin cuota anual","Banking rate discount"]},
    ],
  },
  c2:{
    id:"c2",name:"Carlos Mendoza",email:"carlos@demo.com",phone:"(786) 555-0289",ronda:1,joined:"2026-01-20",onboarded:false,avatar:"CM",
    messages:[{id:"m4",from:"admin",text:"Bienvenido Carlos! Este es tu portal BigHouseCredit. Configura primero el autopago.",date:"2026-03-22T11:00:00Z",read:false}],advisorNotes:[{id:"n6",date:"2026-03-22",text:"Carlos — buen comienzo. Prioridad #1: autopago configurado en ambas tarjetas. Un pago tarde nos regresa meses. En 60 días revisamos para Ronda 2."}],
    actionItems:[{id:"a11",text:"Configurar autopago mínimo en Capital One",done:false},{id:"a12",text:"Configurar autopago mínimo en Wells Fargo",done:false},{id:"a13",text:"Abrir cuenta corriente LLC en Wells Fargo",done:false},{id:"a14",text:"Confirmar número EIN con el IRS",done:true}],
    fundingPipeline:[{bank:"Chase",product:"Ink Business Cash",limit:"$15,000–$25,000",eta:"Q3 2026",note:"Esperar 6 meses de historial en Capital One antes de aplicar"}],
    cards:[
      {id:"k4",bank:"Capital One",product:"Spark Cash Plus",limit:20000,balance:4000,open:"2026-02-01",exp:"2026-08-01",months:9,paymentDue:18,annualFee:150,annualFeeDate:"2027-02-01",signupBonus:{required:6000,spent:4000,deadline:"2026-08-01",reward:"$1,200 cash back"},cliEligible:"2026-08-01",network:"Visa",benefits:[{cat:"Todo",mult:"2% cash back",icon:"🛒"},{cat:"Hotels/Autos (Cap1 Travel)",mult:"5%",icon:"🏨"}],perks:["No preset spending limit","No foreign transaction fee"]},
      {id:"k5",bank:"Wells Fargo",product:"Business Platinum",limit:22000,balance:0,open:"2026-03-01",exp:"2027-03-01",months:12,paymentDue:28,annualFee:0,annualFeeDate:null,signupBonus:{required:3000,spent:800,deadline:"2026-09-01",reward:"$500 cash back"},cliEligible:"2026-09-01",network:"Visa",benefits:[{cat:"Gas",mult:"2%",icon:"⛽"},{cat:"Restaurantes",mult:"2%",icon:"🍽️"},{cat:"Todo",mult:"1%",icon:"🛒"}],perks:["Sin cuota anual","0% APR 12 meses","WF banking integration"]},
    ],
  },
};

// ─── SHARED ATOMS ──────────────────────────────────────────────
const sm  = { color:BH.gray,  fontSize:11, fontFamily:"system-ui" };
const cm  = { color:BH.cream, fontFamily:"system-ui" };

const Tag = ({txt,c,bg,sm:small})=>(
  <span style={{background:bg,color:c,border:`1px solid ${c}44`,borderRadius:6,padding:small?"2px 7px":"3px 9px",fontSize:small?9:10,fontWeight:700,letterSpacing:.8,fontFamily:"system-ui",whiteSpace:"nowrap"}}>{txt}</span>
);

const Btn = ({ch,onClick,variant="gold",small,style:st={}})=>{
  const base={display:"inline-flex",alignItems:"center",gap:6,border:"none",cursor:"pointer",fontFamily:"system-ui",fontWeight:600,borderRadius:8,transition:"opacity .15s",padding:small?"7px 12px":"10px 18px",fontSize:small?11:13};
  const v={gold:{background:BH.gold,color:"#fff"},outline:{background:"transparent",color:BH.gold,border:`1.5px solid ${BH.gold}`},ghost:{background:"#ffffff0f",color:BH.cream},danger:{background:"#d94f4f14",color:BH.red,border:`1px solid ${BH.red}44`}};
  return <button style={{...base,...v[variant],...st}} onClick={onClick}>{ch}</button>;
};

const Inp = ({label,val,set,type="text",ph=""})=>(
  <div style={{marginBottom:13}}>
    {label&&<div style={{...sm,marginBottom:5}}>{label}</div>}
    <input type={type} value={val} onChange={e=>set(e.target.value)} placeholder={ph}
      style={{width:"100%",background:"#ffffff0a",border:`1.5px solid ${BH.border}`,borderRadius:8,color:BH.cream,fontSize:13,padding:"9px 12px",fontFamily:"system-ui",outline:"none",boxSizing:"border-box"}}/>
  </div>
);

// ─── APR BAR ──────────────────────────────────────────────────
const APRBar = ({open,exp})=>{
  const d=daysLeft(exp),pct=usedPct(open,exp),st=aprSt(d);
  const bc=pct>85?BH.red:pct>66?BH.orange:pct>45?BH.yellow:BH.green;
  return(
    <div style={{marginTop:12}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
        <span style={{...sm}}>0% APR — {Math.round(pct)}% usado</span>
        <Tag txt={st.txt} c={st.c} bg={st.bg} sm/>
      </div>
      <div style={{background:"#ffffff14",borderRadius:99,height:6,overflow:"hidden"}}>
        <div style={{width:`${pct}%`,height:"100%",borderRadius:99,background:bc}}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
        <span style={{...sm,fontSize:10}}>{fdt(open)}</span>
        <span style={{fontSize:10,fontWeight:700,color:st.c,fontFamily:"system-ui"}}>{d>0?`${d} días`:""}</span>
        <span style={{...sm,fontSize:10}}>{fdt(exp)}</span>
      </div>
    </div>
  );
};

// ─── SIGNUP BONUS BAR ─────────────────────────────────────────
const BonusBar = ({sb})=>{
  if(!sb) return null;
  if(sb.completed) return(
    <div style={{display:"flex",alignItems:"center",gap:6,marginTop:8,padding:"6px 10px",background:"#3a9e7218",border:`1px solid ${BH.green}44`,borderRadius:8}}>
      <Check size={11} color={BH.green}/><span style={{color:BH.green,fontSize:11,fontFamily:"system-ui"}}>Sign-up bonus completado — {sb.reward}</span>
    </div>
  );
  const pct=Math.min(100,Math.round((sb.spent/sb.required)*100));
  const left=$$(sb.required-sb.spent);
  return(
    <div style={{marginTop:10,padding:"8px 10px",background:"#b68e4f10",border:`1px solid ${BH.gold}33`,borderRadius:8}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
        <span style={{color:BH.gold,fontSize:10,fontWeight:700,fontFamily:"system-ui"}}>🎯 SIGN-UP BONUS</span>
        <span style={{...sm,fontSize:10}}>Vence {fdt(sb.deadline)}</span>
      </div>
      <div style={{background:"#ffffff14",borderRadius:99,height:5,overflow:"hidden",marginBottom:5}}>
        <div style={{width:`${pct}%`,height:"100%",borderRadius:99,background:BH.gold}}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between"}}>
        <span style={{...sm,fontSize:10}}>{$$(sb.spent)} / {$$(sb.required)}</span>
        <span style={{color:BH.goldL,fontSize:10,fontFamily:"system-ui"}}>Faltan {left} → {sb.reward}</span>
      </div>
    </div>
  );
};

// ─── CARD TILE FULL ────────────────────────────────────────────
const CardTile = ({card,onDel})=>{
  const [open,setOpen]=useState(false);
  const d=daysLeft(card.exp),st=aprSt(d),util=Math.round((card.balance/card.limit)*100);
  const age=monthsOld(card.open);
  const cliD=daysLeft(card.cliEligible);
  const cliReady=cliD<=0;
  const glow=d<=90?`0 0 16px ${st.c}25`:"none";

  return(
    <div style={{background:BH.card,border:`1.5px solid ${d<=90?st.c+"55":BH.border}`,borderRadius:14,overflow:"hidden",boxShadow:glow}}>
      {d<=30&&<div style={{height:3,background:BH.red}}/>}
      {d>30&&d<=90&&<div style={{height:3,background:BH.orange}}/>}
      <div style={{padding:16}}>
        {onDel&&<button onClick={()=>onDel(card.id)} style={{float:"right",background:"none",border:"none",cursor:"pointer",color:BH.gray,padding:0}}><Trash2 size={12}/></button>}
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
          <div>
            <div style={{color:BH.cream,fontWeight:700,fontSize:15}}>{card.bank}</div>
            <div style={{...sm}}>{card.product} · {card.network}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{color:BH.gold,fontWeight:700,fontSize:22,fontFamily:"Georgia,serif"}}>{$$(card.limit)}</div>
            <div style={{...sm,fontSize:10}}>Límite</div>
          </div>
        </div>
        {/* Stats grid */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7,marginBottom:12}}>
          {[
            {l:"Balance",v:$$(card.balance),c:BH.cream},
            {l:"Disponible",v:$$(card.limit-card.balance),c:BH.green},
            {l:"Utilización",v:`${util}%`,c:util>30?BH.orange:BH.green},
          ].map(r=>(
            <div key={r.l} style={{background:"#ffffff08",borderRadius:7,padding:"7px 9px"}}>
              <div style={{...sm,fontSize:9}}>{r.l}</div>
              <div style={{color:r.c,fontWeight:700,fontSize:13}}>{r.v}</div>
            </div>
          ))}
        </div>
        {/* Meta row */}
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
          <Tag txt={`${age} mes${age!==1?"es":""} antigüedad`} c={BH.gray} bg="#ffffff08" sm/>
          {card.paymentDue&&<Tag txt={`Pago: día ${card.paymentDue}`} c={BH.blue} bg="#4a90d918" sm/>}
          {card.annualFee>0&&<Tag txt={`Cuota anual $${card.annualFee}`} c={BH.gray} bg="#ffffff08" sm/>}
          {cliReady&&<Tag txt="CLI DISPONIBLE ↑" c={BH.green} bg="#3a9e7218" sm/>}
          {!cliReady&&cliD<=30&&<Tag txt={`CLI en ${cliD}d`} c={BH.yellow} bg="#c4a02018" sm/>}
        </div>
        <APRBar open={card.open} exp={card.exp}/>
        <BonusBar sb={card.signupBonus}/>
        {/* Expand toggle */}
        <button onClick={()=>setOpen(!open)} style={{width:"100%",marginTop:12,background:"#ffffff06",border:`1px solid ${BH.border}`,borderRadius:8,padding:"7px",cursor:"pointer",color:BH.gray,fontSize:11,fontFamily:"system-ui",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
          {open?<><ChevronUp size={12}/>Ocultar beneficios</>:<><ChevronDown size={12}/>Ver beneficios y perks</>}
        </button>
        {open&&(
          <div style={{marginTop:10,padding:12,background:"#ffffff06",borderRadius:10,border:`1px solid ${BH.border}`}}>
            <div style={{color:BH.gold,fontSize:10,fontWeight:700,letterSpacing:1,fontFamily:"system-ui",marginBottom:8}}>MULTIPLICADORES</div>
            {card.benefits?.map(b=>(
              <div key={b.cat} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:`1px solid ${BH.border}33`}}>
                <span style={{...sm,fontSize:11}}>{b.icon} {b.cat}</span>
                <span style={{color:BH.cream,fontSize:11,fontWeight:600,fontFamily:"system-ui"}}>{b.mult}</span>
              </div>
            ))}
            {card.perks?.length>0&&<>
              <div style={{color:BH.gold,fontSize:10,fontWeight:700,letterSpacing:1,fontFamily:"system-ui",marginTop:12,marginBottom:8}}>PERKS INCLUIDOS</div>
              {card.perks.map(p=>(
                <div key={p} style={{display:"flex",alignItems:"flex-start",gap:6,padding:"3px 0"}}>
                  <Check size={10} color={BH.green} style={{marginTop:2,flexShrink:0}}/>
                  <span style={{...sm,fontSize:11}}>{p}</span>
                </div>
              ))}
            </>}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── HEALTH SCORE CIRCLE ───────────────────────────────────────
const HealthCircle = ({score})=>{
  const r=36,circ=2*Math.PI*r;
  const c=score>=80?BH.green:score>=60?BH.yellow:score>=40?BH.orange:BH.red;
  const lbl=score>=80?"Excelente":score>=60?"Bueno":score>=40?"Regular":"Crítico";
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#ffffff14" strokeWidth="8"/>
        <circle cx="48" cy="48" r={r} fill="none" stroke={c} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={circ*(1-score/100)}
          strokeLinecap="round" transform="rotate(-90 48 48)"/>
        <text x="48" y="44" textAnchor="middle" fill={BH.cream} fontSize="22" fontWeight="700" fontFamily="Georgia,serif">{score}</text>
        <text x="48" y="60" textAnchor="middle" fill={BH.gray} fontSize="10" fontFamily="system-ui">/100</text>
      </svg>
      <div style={{color:c,fontSize:12,fontWeight:700,fontFamily:"system-ui",marginTop:-4}}>{lbl}</div>
    </div>
  );
};

// ─── LOGIN ─────────────────────────────────────────────────────
function Login({onAuth}){
  const [email,setEmail]=useState("");
  const [pw,setPw]=useState("");
  const [show,setShow]=useState(false);
  const [err,setErr]=useState("");

  const go=()=>{
    const u=AUTH[email.trim().toLowerCase()];
    if(!u||u.pw!==pw){setErr("Credenciales incorrectas");return;}
    onAuth({role:u.role,cid:u.cid});
  };
  const fill=(e,p)=>{setEmail(e);setPw(p);setErr("");};

  const demos=[
    {l:"🔑 Admin",      e:"admin@bighousecredit.com", p:"BH2024"},
    {l:"🏠 Gian",       e:"gian@bighousecredit.com",  p:"BHGian2024"},
    {l:"💙 Gordis",     e:"gordis@bighousecredit.com",p:"BHGordis2024"},
    {l:"👤 María",      e:"maria@demo.com",            p:"demo123"},
    {l:"👤 Carlos",     e:"carlos@demo.com",           p:"demo123"},
  ];

  return(
    <div style={{minHeight:"100vh",background:BH.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{textAlign:"center",marginBottom:32}}>
        <div style={{color:BH.gold,fontSize:40,fontFamily:"Georgia,serif",fontWeight:700,letterSpacing:2}}>BigHouse</div>
        <div style={{color:BH.gray,fontSize:10,letterSpacing:6,fontFamily:"system-ui"}}>CREDIT PORTAL</div>
      </div>
      <div style={{background:BH.surface,border:`1px solid ${BH.border}`,borderRadius:18,padding:32,width:"100%",maxWidth:420}}>
        <div style={{color:BH.cream,fontSize:20,fontFamily:"Georgia,serif",marginBottom:4}}>Bienvenido</div>
        <div style={{...sm,marginBottom:22}}>Ingresa tus credenciales para continuar</div>
        <Inp label="Email" val={email} set={setEmail} ph="tu@email.com"/>
        <div style={{marginBottom:13}}>
          <div style={{...sm,marginBottom:5}}>Contraseña</div>
          <div style={{position:"relative"}}>
            <input type={show?"text":"password"} value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()} placeholder="••••••••"
              style={{width:"100%",background:"#ffffff0a",border:`1.5px solid ${BH.border}`,borderRadius:8,color:BH.cream,fontSize:13,padding:"9px 38px 9px 12px",fontFamily:"system-ui",outline:"none",boxSizing:"border-box"}}/>
            <button onClick={()=>setShow(!show)} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:BH.gray}}>
              {show?<EyeOff size={14}/>:<Eye size={14}/>}
            </button>
          </div>
        </div>
        {err&&<div style={{color:BH.red,fontSize:12,background:"#d94f4f14",borderRadius:7,padding:"7px 11px",marginBottom:12}}>{err}</div>}
        <Btn ch="Entrar al Portal" onClick={go} style={{width:"100%",justifyContent:"center"}}/>
        <div style={{marginTop:24,padding:14,background:`${BH.gold}0a`,border:`1px solid ${BH.gold}2a`,borderRadius:10}}>
          <div style={{color:BH.gold,fontSize:9,fontWeight:700,letterSpacing:2,marginBottom:10,fontFamily:"system-ui"}}>ACCESOS DEMO</div>
          {demos.map(r=>(
            <div key={r.e} onClick={()=>fill(r.e,r.p)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",cursor:"pointer",borderBottom:`1px solid ${BH.border}22`}}>
              <span style={{color:BH.cream,fontSize:12,fontFamily:"system-ui"}}>{r.l}</span>
              <span style={{...sm,fontSize:10}}>{r.e}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN ─────────────────────────────────────────────────────
function Admin({clients,save,logout}){
  const [tab,setTab]=useState("overview");
  const [sel,setSel]=useState(null);
  const [addCl,setAddCl]=useState(false);
  const [addCard,setAddCard]=useState(false);
  const [nc,setNc]=useState({name:"",email:"",phone:"",ronda:1});
  const [nk,setNk]=useState({bank:"",product:"",limit:"",balance:"",open:"",exp:"",months:"12",paymentDue:"",annualFee:"0",cliEligible:""});
  const [noteText,setNoteText]=useState("");

  const allCards=Object.values(clients).flatMap(c=>c.cards.map(k=>({...k,cname:c.name,cid:c.id})));
  const exp90=allCards.filter(k=>{const d=daysLeft(k.exp);return d>=0&&d<=90;});
  const exp30=allCards.filter(k=>{const d=daysLeft(k.exp);return d>=0&&d<=30;});
  const cliReady=allCards.filter(k=>daysLeft(k.cliEligible)<=0);
  const totFund=Object.values(clients).reduce((s,c)=>s+c.cards.reduce((s2,k)=>s2+k.limit,0),0);

  const doAddClient=()=>{
    if(!nc.name||!nc.email)return;
    const id=uid();
    save({...clients,[id]:{id,...nc,joined:new Date().toISOString().slice(0,10),cards:[],advisorNotes:[],actionItems:[],fundingPipeline:[]}});
    setNc({name:"",email:"",phone:"",ronda:1});setAddCl(false);
  };
  const doAddCard=()=>{
    if(!nk.bank||!nk.open||!nk.exp)return;
    const card={id:uid(),bank:nk.bank,product:nk.product,limit:+nk.limit||0,balance:+nk.balance||0,open:nk.open,exp:nk.exp,months:+nk.months||12,paymentDue:+nk.paymentDue||1,annualFee:+nk.annualFee||0,annualFeeDate:null,cliEligible:nk.cliEligible||"",network:"Visa",benefits:[],perks:[]};
    save({...clients,[sel]:{...clients[sel],cards:[...clients[sel].cards,card]}});
    setNk({bank:"",product:"",limit:"",balance:"",open:"",exp:"",months:"12",paymentDue:"",annualFee:"0",cliEligible:""});setAddCard(false);
  };
  const delCard=(cid,kid)=>save({...clients,[cid]:{...clients[cid],cards:clients[cid].cards.filter(k=>k.id!==kid)}});
  const delClient=cid=>{const cp={...clients};delete cp[cid];save(cp);if(sel===cid)setSel(null);};
  const addNote=cid=>{
    if(!noteText.trim())return;
    const note={id:uid(),date:new Date().toISOString().slice(0,10),text:noteText.trim()};
    const cl=clients[cid];
    save({...clients,[cid]:{...cl,advisorNotes:[note,...(cl.advisorNotes||[])]}});
    setNoteText("");
  };

  const NAV=[{id:"overview",l:"Overview"},{id:"clients",l:"Clientes"},{id:"alerts",l:`Alertas${exp90.length?` (${exp90.length})`:""}`}];

  return(
    <div style={{minHeight:"100vh",background:BH.bg,fontFamily:"system-ui"}}>
      {/* Nav */}
      <div style={{background:BH.surface,borderBottom:`1px solid ${BH.border}`,padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:56}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{color:BH.gold,fontSize:20,fontFamily:"Georgia,serif",fontWeight:700}}>BigHouse</span>
          <span style={{...sm,fontSize:11}}>Admin Panel</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {exp30.length>0&&<div style={{background:"#d94f4f14",border:`1px solid ${BH.red}44`,borderRadius:7,padding:"4px 10px",color:BH.red,fontSize:10,fontWeight:700}}>🚨 {exp30.length} crítica{exp30.length>1?"s":""}</div>}
          {cliReady.length>0&&<div style={{background:"#3a9e7214",border:`1px solid ${BH.green}44`,borderRadius:7,padding:"4px 10px",color:BH.green,fontSize:10,fontWeight:700}}>📈 {cliReady.length} CLI listos</div>}
          <Btn ch={<><LogOut size={12}/>Salir</>} onClick={logout} variant="ghost" small/>
        </div>
      </div>
      <div style={{background:BH.surface,borderBottom:`1px solid ${BH.border}`,padding:"0 24px",display:"flex"}}>
        {NAV.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{background:"none",border:"none",cursor:"pointer",padding:"12px 16px",fontSize:12,fontWeight:600,color:tab===t.id?BH.gold:BH.gray,borderBottom:`2px solid ${tab===t.id?BH.gold:"transparent"}`,fontFamily:"system-ui"}}>{t.l}</button>
        ))}
      </div>
      <div style={{padding:"22px 24px",maxWidth:1100,margin:"0 auto"}}>

        {/* OVERVIEW */}
        {tab==="overview"&&<>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(185px,1fr))",gap:12,marginBottom:24}}>
            {[
              {icon:<Users size={17}/>,l:"Clientes Activos",v:Object.keys(clients).length,c:BH.gold},
              {icon:<DollarSign size={17}/>,l:"Total Funding",v:$$(totFund),c:BH.green},
              {icon:<AlertTriangle size={17}/>,l:"Expiran ≤90d",v:exp90.length,c:BH.orange},
              {icon:<TrendingUp size={17}/>,l:"CLI Disponibles",v:cliReady.length,c:BH.blue},
            ].map(s=>(
              <div key={s.l} style={{background:BH.card,border:`1px solid ${BH.border}`,borderRadius:11,padding:"14px 16px",display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:36,height:36,borderRadius:9,background:s.c+"1a",color:s.c,display:"flex",alignItems:"center",justifyContent:"center"}}>{s.icon}</div>
                <div><div style={{...sm,fontSize:10}}>{s.l}</div><div style={{color:BH.cream,fontSize:22,fontWeight:700,fontFamily:"Georgia,serif",lineHeight:1}}>{s.v}</div></div>
              </div>
            ))}
          </div>
          {Object.values(clients).map(cl=>{
            const worst=cl.cards.reduce((m,k)=>{const d=daysLeft(k.exp);return d<m?d:m;},Infinity);
            const st=aprSt(worst===Infinity?999:worst);
            const tot=cl.cards.reduce((s,k)=>s+k.limit,0);
            const hs=healthScore(cl.cards);
            return(
              <div key={cl.id} onClick={()=>{setSel(cl.id);setTab("clients");}} style={{background:BH.card,border:`1px solid ${BH.border}`,borderRadius:11,padding:"13px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",marginBottom:9,flexWrap:"wrap",gap:8}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{width:36,height:36,borderRadius:9,background:`${BH.gold}1a`,color:BH.gold,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:15,fontFamily:"Georgia,serif"}}>{cl.name.charAt(0)}</div>
                  <div>
                    <div style={{color:BH.cream,fontWeight:600,fontSize:14}}>{cl.name}</div>
                    <div style={{...sm,fontSize:11}}>Ronda {cl.ronda} · {cl.cards.length} tarjeta{cl.cards.length!==1?"s":""} · {$$(tot)}</div>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <Tag txt={`Health ${hs}`} c={hs>=80?BH.green:hs>=60?BH.yellow:BH.red} bg={hs>=80?"#3a9e7218":hs>=60?"#c4a02018":"#d94f4f18"} sm/>
                  {worst!==Infinity&&<Tag txt={`${worst>0?worst+"d":"Venció"}`} c={st.c} bg={st.bg} sm/>}
                  <ChevronRight size={14} color={BH.gray}/>
                </div>
              </div>
            );
          })}
        </>}

        {/* CLIENTS */}
        {tab==="clients"&&<>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
            <div style={{color:BH.cream,fontWeight:700,fontSize:14}}>Gestión de Clientes</div>
            <Btn ch={<><Plus size={12}/>Nuevo Cliente</>} onClick={()=>setAddCl(true)}/>
          </div>
          <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:20}}>
            {Object.values(clients).map(cl=>(
              <button key={cl.id} onClick={()=>setSel(sel===cl.id?null:cl.id)} style={{background:sel===cl.id?BH.gold:BH.card,border:`1.5px solid ${sel===cl.id?BH.gold:BH.border}`,borderRadius:8,padding:"7px 14px",cursor:"pointer",color:sel===cl.id?"#fff":BH.cream,fontSize:12,fontWeight:600,fontFamily:"system-ui"}}>{cl.name.split(" ")[0]}</button>
            ))}
          </div>
          {sel&&clients[sel]&&(()=>{const cl=clients[sel];return(
            <div>
              <div style={{background:BH.card,border:`1px solid ${BH.border}`,borderRadius:13,padding:18,marginBottom:18}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
                  <div>
                    <div style={{color:BH.cream,fontSize:18,fontFamily:"Georgia,serif"}}>{cl.name}</div>
                    <div style={{display:"flex",gap:14,flexWrap:"wrap",marginTop:5}}>
                      <span style={{...sm,display:"flex",alignItems:"center",gap:4}}><Mail size={10}/>{cl.email}</span>
                      <span style={{...sm,display:"flex",alignItems:"center",gap:4}}><Phone size={10}/>{cl.phone}</span>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:7,alignItems:"center",flexWrap:"wrap"}}>
                    <Tag txt={`RONDA ${cl.ronda}`} c={BH.gold} bg={`${BH.gold}1a`}/>
                    <Tag txt={`HEALTH ${healthScore(cl.cards)}`} c={BH.green} bg="#3a9e7218"/>
                    <Btn ch={<><Plus size={11}/>Tarjeta</>} onClick={()=>setAddCard(true)} small/>
                    <Btn ch={<Trash2 size={11}/>} onClick={()=>delClient(cl.id)} variant="danger" small/>
                  </div>
                </div>
                {/* Advisor note input */}
                <div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${BH.border}`}}>
                  <div style={{...sm,marginBottom:7}}>Nueva nota para {cl.name.split(" ")[0]}</div>
                  <div style={{display:"flex",gap:8}}>
                    <input value={noteText} onChange={e=>setNoteText(e.target.value)} placeholder="Escribe una nota estratégica visible al cliente..."
                      style={{flex:1,background:"#ffffff08",border:`1px solid ${BH.border}`,borderRadius:8,color:BH.cream,fontSize:12,padding:"8px 11px",fontFamily:"system-ui",outline:"none"}}/>
                    <Btn ch="Enviar" onClick={()=>addNote(cl.id)} small/>
                  </div>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:13}}>
                {cl.cards.map(card=><CardTile key={card.id} card={card} onDel={kid=>delCard(cl.id,kid)}/>)}
              </div>
            </div>
          );})()}
        </>}

        {/* ALERTS */}
        {tab==="alerts"&&<>
          <div style={{color:BH.cream,fontWeight:700,marginBottom:18,fontSize:14}}>Centro de Alertas</div>
          {/* CLI Opportunities */}
          {cliReady.length>0&&<>
            <div style={{color:BH.green,fontSize:11,fontWeight:700,letterSpacing:1,marginBottom:10,fontFamily:"system-ui"}}>📈 CLI DISPONIBLES (solicitar aumento de límite)</div>
            {cliReady.map(card=>(
              <div key={card.id} style={{background:BH.card,border:`1px solid ${BH.green}33`,borderRadius:11,padding:"13px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8,marginBottom:8}}>
                <div><div style={{color:BH.cream,fontSize:13,fontWeight:600}}>{card.cname} — {card.bank} {card.product}</div><div style={{...sm,fontSize:11}}>Elegible desde {fdt(card.cliEligible)} · Límite actual: {$$(card.limit)}</div></div>
                <Btn ch="Notificar cliente" onClick={()=>alert(`Zapier dispararía: email + SMS a ${card.cname} — "Tu ${card.bank} es elegible para aumento de límite"`)} variant="outline" small/>
              </div>
            ))}
            <div style={{height:1,background:BH.border,margin:"16px 0"}}/>
          </>}
          {/* APR Expirations */}
          <div style={{color:BH.orange,fontSize:11,fontWeight:700,letterSpacing:1,marginBottom:10,fontFamily:"system-ui"}}>⚠️ 0% APR PRÓXIMOS A VENCER</div>
          {exp90.length===0
            ?<div style={{color:BH.gray,textAlign:"center",padding:40}}>✅ Ninguna tarjeta expira en 90 días</div>
            :exp90.sort((a,b)=>daysLeft(a.exp)-daysLeft(b.exp)).map(card=>{
              const d=daysLeft(card.exp),st=aprSt(d);
              return(
                <div key={card.id} style={{background:BH.card,border:`1.5px solid ${st.c}44`,borderRadius:11,padding:"13px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8,marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:16}}>{st.em}</span>
                    <div><div style={{color:BH.cream,fontWeight:600,fontSize:13}}>{card.cname} — {card.bank} {card.product}</div><div style={{...sm,fontSize:11}}>Vence {fdt(card.exp)} · {$$(card.limit)}</div></div>
                  </div>
                  <div style={{display:"flex",gap:7}}>
                    <Tag txt={`${d} DÍAS`} c={st.c} bg={st.bg}/>
                    <Btn ch="Notificar" onClick={()=>alert(`→ Zapier: Email + SMS a ${card.cname}\n→ Asunto: "Tu 0% APR en ${card.bank} vence en ${d} días"\n→ Acción recomendada: Pagar balance o transferir antes de ${fdt(card.exp)}`)} variant="outline" small/>
                  </div>
                </div>
              );
            })
          }
          <div style={{marginTop:24,background:`${BH.gold}08`,border:`1px solid ${BH.gold}33`,borderRadius:13,padding:16}}>
            <div style={{color:BH.gold,fontWeight:700,fontSize:12,marginBottom:8}}>🔗 Zapier — Automatización Pendiente de Conectar</div>
            <div style={{...sm,lineHeight:1.9,fontSize:12}}>
              · <span style={{color:BH.cream}}>Email branded BigHouseCredit</span> automático a 6, 3 y 1 mes antes de vencimiento APR<br/>
              · <span style={{color:BH.cream}}>SMS/WhatsApp via Twilio</span> cuando queda 1 mes o menos<br/>
              · <span style={{color:BH.cream}}>Alerta CLI</span> — notifica al cliente cuando puede solicitar aumento de límite<br/>
              · <span style={{color:BH.cream}}>Recordatorio de sign-up bonus</span> — cuando faltan 60 días para el deadline<br/>
              · <span style={{color:BH.cream}}>Recordatorio de cuota anual</span> — 30 días antes para evaluar si conviene mantener la tarjeta
            </div>
          </div>
        </>}
      </div>

      {/* MODAL: Add Client */}
      {addCl&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,padding:20}}>
          <div style={{background:BH.surface,border:`1px solid ${BH.border}`,borderRadius:18,padding:30,width:"100%",maxWidth:400}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}>
              <div style={{color:BH.cream,fontWeight:700}}>Nuevo Cliente</div>
              <button onClick={()=>setAddCl(false)} style={{background:"none",border:"none",cursor:"pointer",color:BH.gray}}><X size={16}/></button>
            </div>
            <Inp label="Nombre *" val={nc.name} set={v=>setNc({...nc,name:v})}/>
            <Inp label="Email *" val={nc.email} set={v=>setNc({...nc,email:v})}/>
            <Inp label="Teléfono" val={nc.phone} set={v=>setNc({...nc,phone:v})}/>
            <div style={{marginBottom:16}}>
              <div style={{...sm,marginBottom:6}}>Ronda Actual</div>
              <div style={{display:"flex",gap:8}}>
                {[1,2,3].map(r=><button key={r} onClick={()=>setNc({...nc,ronda:r})} style={{flex:1,padding:"8px",borderRadius:7,cursor:"pointer",fontWeight:700,fontSize:12,fontFamily:"system-ui",background:nc.ronda===r?BH.gold:"#ffffff0a",color:nc.ronda===r?"#fff":BH.cream,border:`1.5px solid ${nc.ronda===r?BH.gold:BH.border}`}}>Ronda {r}</button>)}
              </div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <Btn ch="Cancelar" onClick={()=>setAddCl(false)} variant="outline" style={{flex:1,justifyContent:"center"}}/>
              <Btn ch="Crear" onClick={doAddClient} style={{flex:1,justifyContent:"center"}}/>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add Card */}
      {addCard&&sel&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,padding:20}}>
          <div style={{background:BH.surface,border:`1px solid ${BH.border}`,borderRadius:18,padding:30,width:"100%",maxWidth:460,maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}>
              <div style={{color:BH.cream,fontWeight:700}}>Nueva Tarjeta — {clients[sel]?.name.split(" ")[0]}</div>
              <button onClick={()=>setAddCard(false)} style={{background:"none",border:"none",cursor:"pointer",color:BH.gray}}><X size={16}/></button>
            </div>
            <Inp label="Banco *" val={nk.bank} set={v=>setNk({...nk,bank:v})} ph="Chase, Amex, BoA..."/>
            <Inp label="Producto" val={nk.product} set={v=>setNk({...nk,product:v})} ph="Ink Business Cash"/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <Inp label="Límite ($)" val={nk.limit} set={v=>setNk({...nk,limit:v})} ph="25000"/>
              <Inp label="Balance ($)" val={nk.balance} set={v=>setNk({...nk,balance:v})} ph="0"/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <Inp label="Apertura *" val={nk.open} set={v=>setNk({...nk,open:v})} type="date"/>
              <Inp label="Fin 0% APR *" val={nk.exp} set={v=>setNk({...nk,exp:v})} type="date"/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <Inp label="Día de pago" val={nk.paymentDue} set={v=>setNk({...nk,paymentDue:v})} ph="15"/>
              <Inp label="Cuota anual ($)" val={nk.annualFee} set={v=>setNk({...nk,annualFee:v})} ph="0"/>
            </div>
            <Inp label="Fecha elegible CLI" val={nk.cliEligible} set={v=>setNk({...nk,cliEligible:v})} type="date"/>
            <div style={{display:"flex",gap:8}}>
              <Btn ch="Cancelar" onClick={()=>setAddCard(false)} variant="outline" style={{flex:1,justifyContent:"center"}}/>
              <Btn ch="Guardar" onClick={doAddCard} style={{flex:1,justifyContent:"center"}}/>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CLIENT PORTAL ─────────────────────────────────────────────
function ClientPortal({client,logout,onSave,allClients,onSendMsg}){
  if(!client) return null;
  const [tab,setTab]=useState("dashboard");
  const [tasks,setTasks]=useState(client.actionItems||[]);

  const hs=healthScore(client.cards);
  const totalLimit=client.cards.reduce((s,k)=>s+k.limit,0);
  const totalBal=client.cards.reduce((s,k)=>s+k.balance,0);
  const totalAvail=totalLimit-totalBal;
  const avgUtil=Math.round((totalBal/totalLimit)*100)||0;

  // Build upcoming events
  const events=[];
  client.cards.forEach(c=>{
    const d=daysLeft(c.exp);
    if(d>=0&&d<=180) events.push({date:c.exp,type:"APR",label:`0% APR vence — ${c.bank} ${c.product}`,color:aprSt(d).c,icon:aprSt(d).em,days:d});
    const cd=daysLeft(c.cliEligible);
    if(cd>=-7&&cd<=60) events.push({date:c.cliEligible,type:"CLI",label:`CLI disponible — ${c.bank} ${c.product}`,color:BH.green,icon:"📈",days:cd});
    if(c.signupBonus&&!c.signupBonus.completed){const bd=daysLeft(c.signupBonus.deadline);if(bd>=0&&bd<=90) events.push({date:c.signupBonus.deadline,type:"BONUS",label:`Deadline bonus — ${c.bank} (${$$(c.signupBonus.required-c.signupBonus.spent)} restantes)`,color:BH.gold,icon:"🎯",days:bd});}
    if(c.annualFee>0&&c.annualFeeDate){const ad=daysLeft(c.annualFeeDate);if(ad>=0&&ad<=90) events.push({date:c.annualFeeDate,type:"FEE",label:`Cuota anual $${c.annualFee} — ${c.bank}`,color:BH.gray,icon:"💰",days:ad});}
  });
  events.sort((a,b)=>a.days-b.days);

  // Spend optimizer
  const optimizer=[];
  const catMap={};
  client.cards.forEach(card=>{
    (card.benefits||[]).forEach(b=>{
      if(!catMap[b.cat]||b.mult>"2") catMap[b.cat]={card:`${card.bank} ${card.product}`,mult:b.mult,icon:b.icon};
    });
  });
  Object.entries(catMap).forEach(([cat,v])=>optimizer.push({cat,card:v.card,mult:v.mult,icon:v.icon}));

  const TABS=[
    {id:"dashboard",l:"Dashboard"},
    {id:"cards",l:`Tarjetas (${client.cards.length})`},
    {id:"strategy",l:"Mi Estrategia"},
    {id:"benefits",l:"Beneficios"},
    {id:"calendar",l:"Calendario"},
  ];

  const toggleTask=id=>setTasks(ts=>ts.map(t=>t.id===id?{...t,done:!t.done}:t));

  return(
    <div style={{minHeight:"100vh",background:BH.bg,fontFamily:"system-ui"}}>
      {/* Nav */}
      <div style={{background:BH.surface,borderBottom:`1px solid ${BH.border}`,padding:"0 20px",display:"flex",alignItems:"center",justifyContent:"space-between",height:54}}>
        <span style={{color:BH.gold,fontSize:19,fontFamily:"Georgia,serif",fontWeight:700}}>BigHouse Credit</span>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {events.filter(e=>e.days<=30).length>0&&<div style={{background:"#d94f4f14",border:`1px solid ${BH.red}44`,borderRadius:7,padding:"3px 9px",color:BH.red,fontSize:10,fontWeight:700}}>🚨 {events.filter(e=>e.days<=30).length} evento{events.filter(e=>e.days<=30).length>1?"s":""} urgente{events.filter(e=>e.days<=30).length>1?"s":""}</div>}
          <Btn ch={<><LogOut size={12}/>Salir</>} onClick={logout} variant="ghost" small/>
        </div>
      </div>
      <div style={{background:BH.surface,borderBottom:`1px solid ${BH.border}`,padding:"0 20px",display:"flex",overflowX:"auto"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{background:"none",border:"none",cursor:"pointer",padding:"11px 14px",fontSize:11,fontWeight:600,color:tab===t.id?BH.gold:BH.gray,borderBottom:`2px solid ${tab===t.id?BH.gold:"transparent"}`,fontFamily:"system-ui",whiteSpace:"nowrap"}}>{t.l}</button>
        ))}
      </div>

      <div style={{padding:"20px",maxWidth:960,margin:"0 auto"}}>

        {/* DASHBOARD */}
        {tab==="dashboard"&&<>
          <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20,flexWrap:"wrap"}}>
            <HealthCircle score={hs}/>
            <div style={{flex:1}}>
              <div style={{...sm,fontSize:12}}>Hola,</div>
              <h1 style={{color:BH.cream,fontFamily:"Georgia,serif",fontSize:26,margin:"3px 0 4px",fontWeight:700}}>{client.name.split(" ")[0]}</h1>
              <div style={{...sm}}>Ronda {client.ronda} · Miembro desde {fdt(client.joined)}</div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:11,marginBottom:20}}>
            {[
              {l:"Funding Total",v:$$(totalLimit),c:BH.gold},
              {l:"Disponible",v:$$(totalAvail),c:BH.green},
              {l:"Utilización",v:`${avgUtil}%`,c:avgUtil>30?BH.orange:BH.green},
              {l:"Tarjetas Activas",v:client.cards.length,c:BH.gold},
            ].map(it=>(
              <div key={it.l} style={{background:BH.card,border:`1px solid ${BH.border}`,borderRadius:11,padding:"13px 15px"}}>
                <div style={{...sm,fontSize:10}}>{it.l}</div>
                <div style={{color:it.c,fontWeight:700,fontSize:20,fontFamily:"Georgia,serif"}}>{it.v}</div>
              </div>
            ))}
          </div>
          {/* Upcoming events */}
          {events.length>0&&<>
            <div style={{color:BH.cream,fontWeight:700,fontSize:13,marginBottom:12}}>Próximos Eventos</div>
            {events.slice(0,5).map((e,i)=>(
              <div key={i} style={{background:BH.card,border:`1px solid ${BH.border}`,borderRadius:10,padding:"11px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8,flexWrap:"wrap",gap:8}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:15}}>{e.icon}</span>
                  <div>
                    <div style={{color:BH.cream,fontSize:12,fontWeight:600}}>{e.label}</div>
                    <div style={{...sm,fontSize:10}}>{fdt(e.date)}</div>
                  </div>
                </div>
                <Tag txt={e.days<=0?"HOY":e.days===1?"MAÑANA":`${e.days} DÍAS`} c={e.color} bg={e.color+"18"}/>
              </div>
            ))}
          </>}
          {/* Pending tasks */}
          {tasks.filter(t=>!t.done).length>0&&<>
            <div style={{color:BH.cream,fontWeight:700,fontSize:13,margin:"16px 0 10px"}}>Pendientes</div>
            {tasks.filter(t=>!t.done).map(t=>(
              <div key={t.id} onClick={()=>toggleTask(t.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:`1px solid ${BH.border}`,cursor:"pointer"}}>
                <div style={{width:18,height:18,border:`1.5px solid ${BH.gold}`,borderRadius:5,flexShrink:0}}/>
                <span style={{color:BH.cream,fontSize:13}}>{t.text}</span>
              </div>
            ))}
          </>}
        </>}

        {/* CARDS */}
        {tab==="cards"&&<>
          <div style={{color:BH.cream,fontWeight:700,fontSize:14,marginBottom:16}}>Mis Tarjetas de Negocio</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:14}}>
            {client.cards.map(card=><CardTile key={card.id} card={card}/>)}
          </div>
        </>}

        {/* STRATEGY */}
        {tab==="strategy"&&<>
          {/* Action items */}
          <div style={{background:BH.card,border:`1px solid ${BH.border}`,borderRadius:13,padding:18,marginBottom:18}}>
            <div style={{color:BH.gold,fontSize:11,fontWeight:700,letterSpacing:1,marginBottom:14}}>✅ PLAN DE ACCIÓN — DE GIAN PARA TI</div>
            {tasks.map(t=>(
              <div key={t.id} onClick={()=>toggleTask(t.id)} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"10px 0",borderBottom:`1px solid ${BH.border}22`,cursor:"pointer"}}>
                <div style={{width:20,height:20,borderRadius:5,border:`1.5px solid ${t.done?BH.green:BH.gold}`,background:t.done?"#3a9e7222":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                  {t.done&&<Check size={11} color={BH.green}/>}
                </div>
                <span style={{color:t.done?BH.gray:BH.cream,fontSize:13,textDecoration:t.done?"line-through":"none"}}>{t.text}</span>
              </div>
            ))}
          </div>
          {/* Advisor notes */}
          <div style={{color:BH.cream,fontWeight:700,fontSize:13,marginBottom:12}}>Notas de tu Asesor</div>
          {(client.advisorNotes||[]).map(n=>(
            <div key={n.id} style={{background:BH.card,border:`1px solid ${BH.border}`,borderLeft:`3px solid ${BH.gold}`,borderRadius:10,padding:"13px 16px",marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                <span style={{color:BH.gold,fontSize:10,fontWeight:700,fontFamily:"system-ui"}}>GIANFRANCO CASAGRANDI · BigHouseCredit</span>
                <span style={{...sm,fontSize:10}}>{fdt(n.date)}</span>
              </div>
              <div style={{color:BH.cream,fontSize:13,lineHeight:1.7}}>{n.text}</div>
            </div>
          ))}
          {/* Funding pipeline */}
          <div style={{color:BH.cream,fontWeight:700,fontSize:13,margin:"18px 0 12px"}}>Funding Pipeline — Lo que viene</div>
          {(client.fundingPipeline||[]).map((p,i)=>(
            <div key={i} style={{background:BH.card,border:`1px solid ${BH.border}`,borderRadius:10,padding:"13px 16px",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
              <div>
                <div style={{color:BH.cream,fontWeight:600,fontSize:13}}>{p.bank} — {p.product}</div>
                {p.note&&<div style={{...sm,fontSize:11,marginTop:2}}>{p.note}</div>}
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{color:BH.gold,fontSize:12,fontWeight:700}}>{p.limit}</div>
                <div style={{...sm,fontSize:10}}>{p.eta}</div>
              </div>
            </div>
          ))}
        </>}

        {/* BENEFITS */}
        {tab==="benefits"&&<>
          <div style={{color:BH.cream,fontWeight:700,fontSize:14,marginBottom:16}}>Optimizador de Gastos</div>
          <div style={{background:`${BH.gold}0a`,border:`1px solid ${BH.gold}33`,borderRadius:12,padding:16,marginBottom:20}}>
            <div style={{color:BH.gold,fontSize:11,fontWeight:700,letterSpacing:1,marginBottom:12}}>💡 ¿QUÉ TARJETA USAR SEGÚN TU COMPRA?</div>
            {optimizer.map((r,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${BH.border}22`}}>
                <span style={{color:BH.cream,fontSize:13}}>{r.icon} {r.cat}</span>
                <div style={{textAlign:"right"}}>
                  <div style={{color:BH.goldL,fontSize:12,fontWeight:700}}>{r.mult}</div>
                  <div style={{...sm,fontSize:10}}>{r.card}</div>
                </div>
              </div>
            ))}
          </div>
          {client.cards.map(card=>(
            <div key={card.id} style={{background:BH.card,border:`1px solid ${BH.border}`,borderRadius:12,padding:16,marginBottom:14}}>
              <div style={{color:BH.cream,fontWeight:700,marginBottom:12}}>{card.bank} {card.product}</div>
              {(card.benefits||[]).map(b=>(
                <div key={b.cat} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${BH.border}33`}}>
                  <span style={{color:BH.gray,fontSize:12}}>{b.icon} {b.cat}</span>
                  <span style={{color:BH.cream,fontSize:12,fontWeight:600}}>{b.mult}</span>
                </div>
              ))}
              {(card.perks||[]).length>0&&<div style={{marginTop:12}}>
                <div style={{color:BH.gold,fontSize:10,fontWeight:700,letterSpacing:1,marginBottom:8}}>PERKS</div>
                {card.perks.map(p=><div key={p} style={{display:"flex",gap:7,alignItems:"flex-start",padding:"3px 0"}}><Check size={10} color={BH.green} style={{flexShrink:0,marginTop:2}}/><span style={{color:BH.gray,fontSize:11}}>{p}</span></div>)}
              </div>}
            </div>
          ))}
        </>}

        {/* CALENDAR */}
        {tab==="calendar"&&<>
          <div style={{color:BH.cream,fontWeight:700,fontSize:14,marginBottom:16}}>Calendario Financiero</div>
          {events.length===0&&<div style={{color:BH.gray,textAlign:"center",padding:60}}>Sin eventos próximos — ¡todo en orden! ✅</div>}
          {events.map((e,i)=>(
            <div key={i} style={{background:BH.card,border:`1.5px solid ${e.color}33`,borderRadius:11,padding:"13px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8,marginBottom:9}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:38,height:38,borderRadius:9,background:e.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>{e.icon}</div>
                <div>
                  <div style={{color:BH.cream,fontSize:13,fontWeight:600}}>{e.label}</div>
                  <div style={{...sm,fontSize:10}}>{fdt(e.date)} · {e.type}</div>
                </div>
              </div>
              <Tag txt={e.days<=0?"HOY":e.days===1?"MAÑANA":`${e.days} días`} c={e.color} bg={e.color+"18"}/>
            </div>
          ))}
          {/* Payment due dates */}
          <div style={{color:BH.blue,fontSize:11,fontWeight:700,letterSpacing:1,margin:"18px 0 12px",fontFamily:"system-ui"}}>💳 FECHAS DE PAGO MENSUAL</div>
          {client.cards.filter(c=>c.paymentDue).sort((a,b)=>a.paymentDue-b.paymentDue).map(c=>(
            <div key={c.id} style={{background:BH.card,border:`1px solid ${BH.border}`,borderRadius:10,padding:"11px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <span style={{color:BH.cream,fontSize:13}}>{c.bank} — {c.product}</span>
              <div style={{textAlign:"right"}}>
                <div style={{color:BH.blue,fontWeight:700,fontSize:13}}>Día {c.paymentDue} de cada mes</div>
                <div style={{...sm,fontSize:10}}>Mínimo: ~${Math.round(c.balance*0.02).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </>}

      </div>
    </div>
  );
}

// ─── ROOT ──────────────────────────────────────────────────────
export default function App(){
  const [auth,setAuth]=useState(null);
  const [clients,setClients]=useState(null);
  const [ready,setReady]=useState(false);

  useEffect(()=>{
    (async()=>{
      try{const r=await window.storage.get("bh_v3");if(r?.value)setClients(JSON.parse(r.value));else setClients(SEED);}
      catch{setClients(SEED);}
      setReady(true);
    })();
  },[]);

  const save=async data=>{setClients(data);try{await window.storage.set("bh_v3",JSON.stringify(data));}catch{}};

  if(!ready) return <div style={{minHeight:"100vh",background:BH.bg,display:"flex",alignItems:"center",justifyContent:"center",color:BH.gold,fontFamily:"Georgia,serif",fontSize:18}}>Cargando BigHouse Portal...</div>;
  if(!auth)  return <Login onAuth={setAuth}/>;
  if(auth.role==="admin") return <Admin clients={clients} save={save} logout={()=>setAuth(null)}/>;
  return <ClientPortal client={clients[auth.cid]} logout={()=>setAuth(null)}/>;
}
