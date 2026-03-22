import { useState, useMemo, useRef, useEffect } from "react";

const CATS={flight:{l:"Flight",e:"✈️",c:"#1a73a7",bg:"#e8f4fd"},transport:{l:"Transport",e:"🚗",c:"#2d7a3a",bg:"#ecf5ec"},hotel:{l:"Hotel",e:"🏨",c:"#8a6d3b",bg:"#f5f0e8"},sightseeing:{l:"Sightseeing",e:"🎌",c:"#c46b98",bg:"#f5dce8"},food:{l:"Food",e:"🍜",c:"#c27019",bg:"#fef3e2"},shopping:{l:"Shopping",e:"🛍️",c:"#6b48a8",bg:"#f0ecf8"},anime:{l:"Anime",e:"🎮",c:"#e03e6b",bg:"#fde8ee"},photo:{l:"Photo Spot",e:"📸",c:"#0891b2",bg:"#e0f7fa"},nightlife:{l:"Nightlife",e:"🌙",c:"#7c3aed",bg:"#ede9fe"}};
const TIMES=["Early Morning","Morning","Midday","Afternoon","Evening","Night","Late Night","Daytime"];
const gc=id=>CATS[id]||CATS.sightseeing;
const fN=n=>n>=1000?(n/1000).toFixed(1).replace(/\.0$/,"")+"k":String(n);
const pJ=(c,cur)=>{const n=parseFloat(String(c).replace(/[^0-9.]/g,""));if(isNaN(n))return 0;return cur==="MYR"?n*33.5:cur==="USD"?n*150:n;};
const fJ=v=>v>0?`¥${Math.round(v).toLocaleString()}`:"—";
const fM=v=>v>0?`MYR ${Math.round(v).toLocaleString()}`:"—";
const Stars=({r})=>r?<span style={{color:"#f59e0b",fontSize:12,letterSpacing:1}}>{"★".repeat(Math.floor(r))}{r%1>=0.3?"½":""}</span>:null;
const gmUrl=(la,lo)=>`https://www.google.com/maps/search/?api=1&query=${la},${lo}`;
const gmDir=(la,lo)=>`https://www.google.com/maps/dir/?api=1&destination=${la},${lo}`;

const HOTELS=[
  {name:"Osaka Hotel (TBD)",rating:null,addr:"Near Namba/Dotonbori, Osaka",checkIn:"Apr 5",checkOut:"Apr 7",nights:2,price:"~MYR 200/night",la:34.6687,lo:135.5013},
  {name:"Shinjuku Hotel (TBD)",rating:null,addr:"Shinjuku, Tokyo",checkIn:"Apr 7",checkOut:"Apr 11",nights:4,price:"~MYR 250/night",la:35.6938,lo:139.7034},
];

const INIT_DAYS=[
  // ═══ PRE-TRIP: Preparations ═══
  {id:0,date:"Pre-Trip",dow:"",location:"准备",theme:"出发前准备 · 机票酒店签证租车",weather:"",isPreTrip:true,activities:[
    {id:"0a",type:"note",name:"机票预订",category:"flight",time:"Daytime",cost:"",currency:"MYR",notes:"确认往返航班"},
    {id:"0b",type:"note",name:"酒店预订",category:"hotel",time:"Daytime",cost:"",currency:"MYR",notes:"大阪2晚 + 东京4晚"},
    {id:"0c",type:"note",name:"租车预订",category:"transport",time:"Daytime",cost:"",currency:"MYR",notes:"Toyota/Nippon/Times，需国际驾照(IDP)"},
    {id:"0d",type:"note",name:"签证 & 护照检查",category:"sightseeing",time:"Daytime",cost:"",currency:"MYR",notes:"马来西亚护照免签90天，护照有效期6个月以上"},
    {id:"0e",type:"note",name:"eSIM / WiFi 安排",category:"sightseeing",time:"Daytime",cost:"",currency:"MYR",notes:"出发前激活数据流量"},
  ]},
  // ═══ DAY 1: Apr 5 — Arrive Osaka ═══
  {id:1,date:"Apr 5",dow:"Sat",location:"Osaka",theme:"到达大阪 · 造幣局夜桜 · 道顿堀宵夜",weather:"18°C 🌸",hotelIdx:0,activities:[
    {id:"1a",type:"note",name:"抵达关西国际机场 (KIX)，前往大阪市区酒店办理入住",category:"flight",time:"Afternoon",cost:"",currency:"MYR"},
    {id:"1b",type:"poi",name:"大阪造幣局 桜の通り抜け",category:"sightseeing",time:"Evening",rating:4.5,reviews:12000,img:"https://cdn.dev.beautifuldestinations.app/images/01KM5WNA74XNAYTQC8FM5VE0FZ.jpeg",la:34.6917,lo:135.5217,addr:"1-79 Temma, Kita-ku, Osaka (4/5-4/11开放！完美时间！)",notes:"300+樱花树，125品种，含稀有八重桜。需提前预约！"},
    {id:"1c",type:"restaurant",name:"道顿堀 · 宵夜探索",category:"nightlife",time:"Night",rating:4.4,reviews:79528,img:"https://cdn.dev.beautifuldestinations.app/images/01K9FF720N2FG3FVM4596BRJVK.jpeg",la:34.6687,lo:135.5013,addr:"Dotonbori, Chuo Ward, Osaka",notes:"章鱼烧、大阪烧、串カツ — 霓虹灯运河的经典体验"},
    {id:"1d",type:"poi",name:"法善寺横丁",category:"photo",time:"Late Night",rating:4.3,reviews:4078,img:"https://cdn.dev.beautifuldestinations.app/images/01KCKC1810P4AZT1RDQBC0HXBX.jpeg",la:34.6679,lo:135.5025,addr:"1-2-16 Namba, Chuo Ward, Osaka",notes:"石板小巷，苔藓佛像，大阪最有氛围的夜拍地点"},
  ]},

  // ═══ DAY 2: Apr 6 — Full Day Osaka ═══
  {id:2,date:"Apr 6",dow:"Sun",location:"Osaka",theme:"大阪城🌸 · 黒门市场美食 · 日本桥Den Den Town二次元",weather:"19°C ☀️",hotelIdx:0,activities:[
    {id:"2a",type:"poi",name:"大阪城公園 · 西の丸庭園",category:"sightseeing",time:"Morning",rating:4.4,reviews:48775,img:"https://cdn.dev.beautifuldestinations.app/images/01KFZQCM48CPEVNM8YYTRX5WX1.jpeg",la:34.6865,lo:135.5262,addr:"1-1 Osakajo, Chuo Ward, Osaka",notes:"日本最佳赏樱地之一。西の丸庭園入场¥200，天守阁¥600。"},
    {id:"2b",type:"poi",name:"毛馬桜之宮公園",category:"photo",time:"Morning",rating:4.1,reviews:2443,img:"https://cdn.dev.beautifuldestinations.app/images/01KM5WNA74XNAYTQC8FM5VE0FZ.jpeg",la:34.7052,lo:135.5188,addr:"Sakuranomiya, Miyakojima, Osaka",notes:"4,800+棵樱花树沿大川河畔，大阪最热闹的花見场所"},
    {id:"2c",type:"restaurant",name:"黒門市場",category:"food",time:"Midday",rating:4.3,reviews:15000,img:"https://cdn.dev.beautifuldestinations.app/images/01KD1EFWX9GAK2BJS3WE9XJ96X.jpeg",la:34.6627,lo:135.5068,addr:"Nipponbashi, Chuo Ward, Osaka",notes:"大阪的厨房 — 新鲜刺身、烤海鲜、玉子烧、水果"},
    {id:"2d",type:"poi",name:"日本桥 Den Den Town",category:"anime",time:"Afternoon",rating:4.2,reviews:5000,la:34.6594,lo:135.5055,addr:"Nipponbashi, Naniwa Ward, Osaka",notes:"大阪版秋叶原！动漫手办、复古游戏、女仆咖啡馆、まんだらけ"},
    {id:"2e",type:"restaurant",name:"新世界 · 串カツだるま",category:"food",time:"Evening",rating:4.1,reviews:1955,img:"https://cdn.dev.beautifuldestinations.app/images/01KD1EFWX9GAK2BJS3WE9XJ96X.jpeg",la:34.6516,lo:135.5062,addr:"Shinsekai, Naniwa Ward, Osaka",notes:"通天閣塔下的复古街区，必吃串カツ（炸串）"},
    {id:"2f",type:"restaurant",name:"道顿堀宵夜 Round 2",category:"nightlife",time:"Late Night",rating:4.4,reviews:79528,img:"https://cdn.dev.beautifuldestinations.app/images/01K9FF720N2FG3FVM4596BRJVK.jpeg",la:34.6687,lo:135.5013,addr:"Dotonbori, Osaka",notes:"深夜拉面、烤肉、居酒屋 — 大阪不夜城"},
  ]},

  // ═══ DAY 3: Apr 7 — Road Trip ═══
  {id:3,date:"Apr 7",dow:"Mon",location:"大阪 → 富士山 → 东京",theme:"自驾公路旅行 · Lawson打卡 · 忠靈塔 · 抵达东京",weather:"17°C 🌤️",hotelIdx:1,activities:[
    {id:"3a",type:"note",name:"退房。前往租车店提车 — 自驾旅程开始！",category:"transport",time:"Early Morning",cost:"",currency:"¥",notes:"提前预订Toyota/Nippon/Times。需要国际驾照(IDP)。日本靠左行驶！"},
    {id:"3b",type:"note",name:"大阪 → 富士山 (高速公路 ~5-6小时)",category:"transport",time:"Morning",cost:"",currency:"¥",notes:"途经名神/东名高速。SA休息站美食很棒！记得拿ETC卡"},
    {id:"3c",type:"poi",name:"Lawson 富士河口湖町役場前店",category:"photo",time:"Afternoon",rating:4.6,reviews:8000,img:"https://cdn.dev.beautifuldestinations.app/images/dfe765ab-d945-4cdc-92e2-ddf2ea19c5e6.jpg",la:35.5063,lo:138.7594,addr:"1395-1 Funatsu, Fujikawaguchiko, Yamanashi",notes:"全球最Famous的Lawson！富士山+Lawson的经典组合。推荐去Town Hall前的店（人少，角度更好）。早起拍最佳！"},
    {id:"3d",type:"poi",name:"新倉山浅間公園 · 忠靈塔",category:"photo",time:"Afternoon",rating:4.7,reviews:5364,img:"https://cdn.dev.beautifuldestinations.app/images/01KD20J175SAW7QR4YJT1BBBEY.jpeg",la:35.5013,lo:138.8014,addr:"Fujiyoshida, Yamanashi",notes:"THE 经典日本照：五重塔+樱花+富士山。约400步台阶，值得！"},
    {id:"3e",type:"poi",name:"大石公園 · 河口湖北岸",category:"sightseeing",time:"Afternoon",rating:4.4,reviews:20460,img:"https://cdn.dev.beautifuldestinations.app/images/dfe765ab-d945-4cdc-92e2-ddf2ea19c5e6.jpg",la:35.5229,lo:138.7458,addr:"Kawaguchiko, Yamanashi",notes:"湖畔望富士山，薰衣草和樱花季绝美风景"},
    {id:"3f",type:"note",name:"富士山 → 东京新宿 (~2小时) · 还车 · 入住酒店",category:"transport",time:"Evening",cost:"",currency:"¥",notes:"中央高速到新宿。还车后步行可达酒店"},
    {id:"3g",type:"restaurant",name:"思い出横丁 (Memory Lane)",category:"nightlife",time:"Night",rating:4.3,reviews:8000,la:35.6944,lo:139.6985,addr:"Nishi-Shinjuku 1, Shinjuku, Tokyo",notes:"新宿站旁的狭窄烤鸡肉串小巷，昭和怀旧氛围"},
  ]},

  // ═══ DAY 4: Apr 8 — Anime Day ═══
  {id:4,date:"Apr 8",dow:"Tue",location:"东京",theme:"二次元朝圣日 · 秋叶原 · 中野Broadway · 池袋",weather:"16°C 🌤️",hotelIdx:1,activities:[
    {id:"4a",type:"poi",name:"秋叶原 Electric Town",category:"anime",time:"Morning",rating:4.5,reviews:50000,img:"https://cdn.dev.beautifuldestinations.app/images/01KD6CAF0SJECYDE18QF4626CW.jpeg",la:35.7023,lo:139.7745,addr:"Akihabara, Chiyoda City, Tokyo",notes:"Radio Kaikan、AmiAmi、Kotobukiya、Mandarake — 手办、漫画、复古游戏天堂"},
    {id:"4b",type:"poi",name:"秋叶原 女仆咖啡馆体验",category:"anime",time:"Midday",la:35.6987,lo:139.7713,addr:"Akihabara, Tokyo",notes:"@home cafe 或 MaiDreamin — 必须体验一次的日本独特文化！"},
    {id:"4c",type:"poi",name:"中野Broadway",category:"anime",time:"Afternoon",rating:4.3,reviews:12000,la:35.7071,lo:139.6655,addr:"5-52-15 Nakano, Nakano City, Tokyo",notes:"比秋叶原更硬核的二次元圣地。まんだらけ迷宫般的分店群，绝版漫画、复古玩具"},
    {id:"4d",type:"poi",name:"池袋 Animate旗舰店 + 乙女路",category:"anime",time:"Evening",la:35.7295,lo:139.7109,addr:"Sunshine 60 Street, Toshima City, Tokyo",notes:"世界最大的Animate旗舰店。乙女路 — BL/女性向圣地。KIDDY LAND"},
    {id:"4e",type:"restaurant",name:"一蘭拉面 新宿歌舞伎町店",category:"food",time:"Night",rating:4.4,reviews:4071,img:"https://cdn.dev.beautifuldestinations.app/images/01KD0PDWX1VZPBYM3M9Z8TX121.jpeg",la:35.6944,lo:139.7016,addr:"Kabukichō, Shinjuku, Tokyo",notes:"个人隔间拉面体验，浓郁豚骨汤底"},
    {id:"4f",type:"poi",name:"歌舞伎町タワー + ゴジラロード",category:"nightlife",time:"Late Night",la:35.6946,lo:139.7018,addr:"Kabukichō, Shinjuku, Tokyo",notes:"新宿不夜城。哥斯拉头像、霓虹灯街拍圣地"},
  ]},

  // ═══ DAY 5: Apr 9 — Seaside + Photo ═══
  {id:5,date:"Apr 9",dow:"Wed",location:"东京",theme:"海边台场 · 独角兽高达 · 涩谷Sky · 夜景摄影",weather:"17°C ☀️",hotelIdx:1,activities:[
    {id:"5a",type:"poi",name:"台场 DiverCity · 独角兽高达 RX-0",category:"anime",time:"Morning",rating:4.5,reviews:30000,la:35.6252,lo:139.7754,addr:"DiverCity Tokyo Plaza, Odaiba",notes:"1:1实物大独角兽高达像！定时变形演出。Gundam Base Tokyo在楼内"},
    {id:"5b",type:"poi",name:"台场海滨公園 · 自由女神 · 彩虹大桥",category:"photo",time:"Morning",rating:4.4,reviews:20000,la:35.6290,lo:139.7734,addr:"Odaiba Marine Park, Minato City, Tokyo",notes:"海边散步+东京湾全景。彩虹大桥+东京塔的经典构图"},
    {id:"5c",type:"poi",name:"teamLab Borderless (麻布台Hills)",category:"sightseeing",time:"Afternoon",rating:4.7,reviews:25000,la:35.6580,lo:139.7432,addr:"Azabudai Hills Garden Plaza B, Tokyo",notes:"沉浸式数字艺术体验。2024新馆。门票¥3,800-4,800，务必提前预约！"},
    {id:"5d",type:"poi",name:"涩谷Sky 展望台",category:"photo",time:"Evening",rating:4.6,reviews:15000,img:"https://cdn.dev.beautifuldestinations.app/images/01KGYFXCCHRXFM9Y297G6WWA20.jpeg",la:35.6580,lo:139.7016,addr:"Shibuya Scramble Square, Shibuya, Tokyo",notes:"230米高空开放式屋顶。日落+东京夜景摄影绝佳。门票¥2,000"},
    {id:"5e",type:"poi",name:"涩谷十字路口 + 忠犬八公",category:"photo",time:"Evening",rating:4.3,reviews:40000,la:35.6594,lo:139.7006,addr:"Shibuya Crossing, Tokyo",notes:"全球最繁忙的十字路口！从Starbucks二楼或Mag's Park屋顶拍"},
    {id:"5f",type:"restaurant",name:"新宿 Golden Gai 宵夜",category:"nightlife",time:"Late Night",rating:4.4,reviews:10000,la:35.6937,lo:139.7046,addr:"Golden Gai, Kabukichō, Shinjuku",notes:"200+家微型酒吧的迷宫巷。每家只容3-8人。推荐找英语OK的店"},
  ]},

  // ═══ DAY 6: Apr 10 — Classic Tokyo ═══
  {id:6,date:"Apr 10",dow:"Thu",location:"东京",theme:"浅草寺 · 上野公園🌸 · 原宿 · 新宿御苑",weather:"16°C 🌧️",hotelIdx:1,activities:[
    {id:"6a",type:"poi",name:"浅草寺 · 仲見世通り",category:"sightseeing",time:"Morning",rating:4.5,reviews:60000,img:"https://cdn.dev.beautifuldestinations.app/images/01KD6CAF0SJECYDE18QF4626CW.jpeg",la:35.7148,lo:139.7967,addr:"2-3-1 Asakusa, Taito City, Tokyo",notes:"东京最古老的寺庙。雷门+仲见世商店街，和服体验拍照"},
    {id:"6b",type:"poi",name:"上野公園 · 不忍池",category:"sightseeing",time:"Midday",rating:4.4,reviews:30000,la:35.7141,lo:139.7744,addr:"Ueno Park, Taito City, Tokyo",notes:"1,000+樱花树。花見野餐圣地。还可逛东京国立博物馆(¥1,000)"},
    {id:"6c",type:"poi",name:"仲見世Shopping Street + Ameyoko市場",category:"shopping",time:"Midday",rating:4.3,reviews:14592,img:"https://cdn.dev.beautifuldestinations.app/images/01KD6CAF0SJECYDE18QF4626CW.jpeg",la:35.7118,lo:139.7965,addr:"Asakusa → Ueno, Tokyo",notes:"传统手信→铁路桥下的热闹市集。海鲜、零食、讨价还价"},
    {id:"6d",type:"poi",name:"明治神宮 + 原宿竹下通り",category:"sightseeing",time:"Afternoon",rating:4.6,reviews:50000,la:35.6764,lo:139.6993,addr:"Harajuku, Shibuya, Tokyo",notes:"宁静森林神社→潮流时尚街。可丽饼、卡哇伊文化、街拍"},
    {id:"6e",type:"poi",name:"新宿御苑",category:"photo",time:"Afternoon",rating:4.6,reviews:43017,img:"https://cdn.dev.beautifuldestinations.app/images/01KFMZFKWB2YKM7GTNCX94NDDS.jpeg",la:35.6852,lo:139.7101,addr:"11 Naitomachi, Shinjuku, Tokyo",notes:"东京最佳赏樱地。1,000+樱花树，¥500入场。禁酒所以很安静"},
    {id:"6f",type:"restaurant",name:"牛カツもと村 渋谷店",category:"food",time:"Evening",rating:4.8,reviews:11699,img:"https://cdn.dev.beautifuldestinations.app/images/01K9NYNZ0HTRZ4E9A5H70EJJPN.jpeg",la:35.6570,lo:139.7040,addr:"Shibuya, Tokyo",notes:"炸牛排！自己在石板上烤到喜欢的熟度。排队但值得"},
    {id:"6g",type:"restaurant",name:"思い出横丁 / 歌舞伎町 宵夜",category:"nightlife",time:"Late Night",la:35.6944,lo:139.6985,addr:"Shinjuku, Tokyo",notes:"最后一晚深夜美食巡游。拉面、烤鸡串、居酒屋"},
  ]},

  // ═══ DAY 7: Apr 11 — Departure ═══
  {id:7,date:"Apr 11",dow:"Fri",location:"东京 → JB",theme:"最后的便利店扫货 · 出发回家",weather:"16°C 🌤️",activities:[
    {id:"7a",type:"note",name:"最后的便利店扫货！7-11/Lawson/FamilyMart限定零食、お土産",category:"shopping",time:"Morning",cost:"",currency:"¥"},
    {id:"7b",type:"note",name:"退房。前往成田/羽田机场",category:"transport",time:"Morning",cost:"",currency:"¥",notes:"成田特快N'EX ¥3,250 或利木津巴士"},
    {id:"7c",type:"note",name:"飞回singapore 🏠 旅程结束！",category:"flight",time:"Daytime",cost:"",currency:"MYR"},
  ]},
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTS (same architecture as before, enhanced)
// ═══════════════════════════════════════════════════════════════
function PinMap({markers,height=220,singlePin=false}){
  const[hover,setHover]=useState(null);
  const pts=markers.filter(m=>m.la&&m.lo);
  if(!pts.length)return null;
  const P=40,W=500,H=height;
  let mla,xla,mlo,xlo;
  if(singlePin||pts.length===1){const p=pts[0];mla=p.la-0.005;xla=p.la+0.005;mlo=p.lo-0.008;xlo=p.lo+0.008;}
  else{mla=Math.min(...pts.map(p=>p.la))-0.003;xla=Math.max(...pts.map(p=>p.la))+0.003;mlo=Math.min(...pts.map(p=>p.lo))-0.005;xlo=Math.max(...pts.map(p=>p.lo))+0.005;}
  const lr=xla-mla||0.01,or=xlo-mlo||0.01;
  const tx=lo=>P+((lo-mlo)/or)*(W-P*2),ty=la=>P+((xla-la)/lr)*(H-P*2);
  const cols={sightseeing:"#c46b98",food:"#c27019",shopping:"#6b48a8",transport:"#2d7a3a",hotel:"#8a6d3b",flight:"#1a73a7",anime:"#e03e6b",photo:"#0891b2",nightlife:"#7c3aed"};
  return(
    <div style={{borderRadius:12,overflow:"hidden",border:"1px solid #e8e4de",background:"linear-gradient(135deg, #e8f0e8, #d4e4d4 30%, #c8dcc8 60%, #e0e8e0)"}}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:"auto",display:"block"}}>
        {[0.25,0.5,0.75].map(f=><g key={f}><line x1={P} y1={P+f*(H-P*2)} x2={W-P} y2={P+f*(H-P*2)} stroke="#b8ccb8" strokeWidth="0.5" strokeDasharray="4,4"/><line x1={P+f*(W-P*2)} y1={P} x2={P+f*(W-P*2)} y2={H-P} stroke="#b8ccb8" strokeWidth="0.5" strokeDasharray="4,4"/></g>)}
        {pts.length>1&&pts.map((p,i)=>i>0?<line key={`l${i}`} x1={tx(pts[i-1].lo)} y1={ty(pts[i-1].la)} x2={tx(p.lo)} y2={ty(p.la)} stroke="#c46b98" strokeWidth="1.5" strokeDasharray="6,4" opacity="0.4"/>:null)}
        {pts.map((p,i)=>{const x=tx(p.lo),y=ty(p.la),col=p.isH?"#1a73a7":(cols[p.cat]||"#c46b98"),isHv=hover===i;
          return(<g key={i} style={{cursor:"pointer"}} onMouseEnter={()=>setHover(i)} onMouseLeave={()=>setHover(null)} onClick={()=>window.open(gmUrl(p.la,p.lo),"_blank")}>
            <ellipse cx={x} cy={y+2} rx={isHv?8:6} ry={isHv?3:2} fill="rgba(0,0,0,0.15)"/>
            <path d={`M${x},${y-20}C${x-10},${y-20} ${x-10},${y-8} ${x},${y}C${x+10},${y-8} ${x+10},${y-20} ${x},${y-20}Z`} fill={col} stroke="#fff" strokeWidth="2" transform={isHv?"scale(1.15)":""} style={{transformOrigin:`${x}px ${y-10}px`,transition:"transform 0.15s"}}/>
            <circle cx={x} cy={y-13} r={3} fill="#fff"/>
            {(isHv||pts.length<=6)&&<><rect x={x-Math.min(p.name.length*3.5,60)} y={y-36} width={Math.min(p.name.length*7,120)} height={14} rx={4} fill="rgba(26,26,46,0.85)"/><text x={x} y={y-27} textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff" fontFamily="system-ui">{p.name.length>16?p.name.slice(0,16)+"…":p.name}</text></>}
          </g>);})}
        <text x={W-P} y={H-8} textAnchor="end" fontSize="8" fill="#999" fontFamily="system-ui">点击图钉 → Google Maps</text>
      </svg>
    </div>
  );
}

function MapLinks({markers}){const pts=markers.filter(m=>m.la&&m.lo);if(!pts.length)return null;return(<div style={{display:"flex",flexWrap:"wrap",gap:5,padding:"8px 0"}}>{pts.slice(0,10).map((m,i)=>(<a key={i} href={gmUrl(m.la,m.lo)} target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:"#1a73a7",background:"#e8f4fd",padding:"4px 10px",borderRadius:20,textDecoration:"none",fontWeight:600}}>📍 {m.name.length>12?m.name.slice(0,12)+"…":m.name}</a>))}</div>);}

function ExperienceDetail({act,onClose,onEdit}){
  const c=gc(act.category);const tl=act.type==="restaurant"?"Restaurant":act.type==="poi"?"Place":"Activity";
  const mk=act.la&&act.lo?[{name:act.name,la:act.la,lo:act.lo,cat:act.category}]:[];
  return(
    <div style={S.overlay} onClick={onClose}><div style={{...S.panel,maxWidth:480}} onClick={e=>e.stopPropagation()}>
      {act.img?(<div style={{width:"100%",height:220,overflow:"hidden",position:"relative"}}><img src={act.img} alt={act.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/><div style={{position:"absolute",inset:0,background:"linear-gradient(transparent 50%, rgba(0,0,0,0.6))"}}/><button onClick={onClose} style={{position:"absolute",top:12,right:12,width:32,height:32,borderRadius:"50%",background:"rgba(0,0,0,0.5)",border:"none",color:"#fff",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button><div style={{position:"absolute",bottom:14,left:16}}><span style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,color:"#fff",background:c.c+"dd",padding:"3px 10px",borderRadius:6}}>{tl}</span></div></div>):(<div style={{display:"flex",justifyContent:"space-between",padding:"20px 20px 0"}}><span style={{fontSize:11,fontWeight:700,textTransform:"uppercase",background:c.bg,color:c.c,padding:"3px 10px",borderRadius:6}}>{tl}</span><button onClick={onClose} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:"#999"}}>✕</button></div>)}
      <div style={{padding:"16px 20px 20px"}}>
        <h2 style={{fontSize:20,fontWeight:800,color:"#1a1a2e",margin:"0 0 6px",lineHeight:1.3}}>{act.name}</h2>
        {act.rating&&<div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><span style={{background:"#1a73a7",color:"#fff",padding:"2px 8px",borderRadius:6,fontSize:14,fontWeight:800}}>{act.rating}</span><Stars r={act.rating}/>{act.reviews&&<span style={{fontSize:13,color:"#6b7280"}}>({fN(act.reviews)})</span>}</div>}
        {act.addr&&<a href={act.la?gmUrl(act.la,act.lo):`https://www.google.com/maps/search/${encodeURIComponent(act.addr)}`} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:6,fontSize:13,color:"#1a73a7",textDecoration:"none",marginBottom:8}}>📍 {act.addr}</a>}
        {act.notes&&<div style={{fontSize:13,color:"#4a4a5a",lineHeight:1.6,marginBottom:12,padding:"10px 14px",background:"#faf8f4",borderRadius:10,borderLeft:"3px solid "+c.c}}>{act.notes}</div>}
        <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
          {act.time&&<span style={{fontSize:12,padding:"4px 12px",borderRadius:20,background:"#f0f0f0",color:"#666",fontWeight:600}}>🕐 {act.time}</span>}
          <span style={{fontSize:12,padding:"4px 12px",borderRadius:20,background:c.bg,color:c.c,fontWeight:600}}>{c.e} {c.l}</span>
          {act.cost&&<span style={{fontSize:12,padding:"4px 12px",borderRadius:20,background:"#f5dce8",color:"#c46b98",fontWeight:700}}>💰 {act.currency||"¥"}{act.cost}</span>}
        </div>
        {mk.length>0&&<PinMap markers={mk} height={180} singlePin/>}
        {mk.length>0&&<MapLinks markers={mk}/>}
        <div style={{display:"flex",gap:8,marginTop:8}}>
          <button onClick={()=>onEdit(act)} style={{...S.savBtn,flex:1}}>✏️ 编辑</button>
          {act.la&&act.lo&&<a href={gmDir(act.la,act.lo)} target="_blank" rel="noopener noreferrer" style={{...S.canBtn,display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",gap:4}}>🧭 导航</a>}
        </div>
      </div>
    </div></div>
  );
}

function DayDetailModal({days,initialDayId,onClose,onViewExp}){
  const[aid,setAid]=useState(initialDayId);
  const day=days.find(d=>d.id===aid)||days[0];
  const mk=[];const h=day.hotelIdx!==undefined?HOTELS[day.hotelIdx]:null;
  if(h)mk.push({name:h.name,la:h.la,lo:h.lo,isH:true,cat:"hotel"});
  day.activities.filter(a=>a.la&&a.lo).forEach(a=>mk.push({name:a.name,la:a.la,lo:a.lo,cat:a.category}));
  return(
    <div style={S.overlay} onClick={onClose}><div style={S.dayModal} onClick={e=>e.stopPropagation()}>
      <div style={{padding:"18px 22px 12px",borderBottom:"1px solid #f0ede8",flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div><h2 style={{fontSize:16,fontWeight:800,color:"#1a1a2e",margin:"0 0 4px",lineHeight:1.3}}>{day.theme}</h2><div style={{fontSize:13,color:"#6b7280"}}>{day.location} · {day.date} · {day.weather}</div></div><button onClick={onClose} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#999"}}>✕</button></div>
        <div style={{display:"flex",gap:4,marginTop:10,overflowX:"auto",paddingBottom:2}}>{days.map(d=>(<button key={d.id} onClick={()=>setAid(d.id)} style={{padding:"5px 12px",borderRadius:20,border:"none",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap",background:d.id===aid?"#1a1a2e":"#f0f0f0",color:d.id===aid?"#fff":"#666",transition:"all 0.15s"}}>{d.date}</button>))}</div>
      </div>
      <div style={{overflowY:"auto",flex:1,padding:"10px 18px"}}>
        <div style={{fontSize:12,color:"#6b7280",marginBottom:8}}>• {day.location} • Day {day.id} • {day.activities.length} 体验</div>
        {h&&<div style={{padding:"10px 12px",background:"#fffcf5",border:"1px solid #f0e8d8",borderRadius:10,marginBottom:8}}><div style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,color:"#8a6d3b",marginBottom:4}}>🏨 住宿 · {h.nights}晚</div><div style={{fontSize:14,fontWeight:800}}>{h.name}</div><div style={{fontSize:11,color:"#9ca3af",marginTop:2}}>📍 {h.addr} · <strong style={{color:"#c46b98"}}>{h.price}</strong></div></div>}
        {day.activities.map(act=>{const ac=gc(act.category);const tl=act.type==="restaurant"?"Restaurant":act.type==="poi"?"Place":"Note";
          return(<div key={act.id} style={{marginBottom:8,borderRadius:10,border:"1px solid #f0ede8",overflow:"hidden",background:"#fff",boxShadow:"0 1px 3px rgba(0,0,0,0.03)"}}>
            <div style={{padding:"6px 12px 0"}}><span style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,color:ac.c}}>{tl}</span></div>
            <div style={{padding:"4px 12px 8px",display:"flex",gap:10,alignItems:"flex-start"}}>
              <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:"#1a1a2e",marginBottom:2}}>{act.name}</div>{act.rating&&<div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:12,fontWeight:700}}>{act.rating}</span><Stars r={act.rating}/>{act.reviews&&<span style={{fontSize:10,color:"#9ca3af"}}>({fN(act.reviews)})</span>}</div>}</div>
              {act.img&&<div style={{width:100,height:68,borderRadius:8,overflow:"hidden",flexShrink:0}}><img src={act.img} alt={act.name} style={{width:"100%",height:"100%",objectFit:"cover"}} loading="lazy"/></div>}
            </div>
            {act.type!=="note"&&<button onClick={()=>onViewExp(act)} style={{width:"100%",padding:"8px",background:"none",border:"none",borderTop:"1px solid #f0ede8",fontSize:12,fontWeight:600,color:"#1a73a7",cursor:"pointer",fontFamily:"inherit"}}>View Details</button>}
          </div>);
        })}
      </div>
      <div style={{padding:"10px 18px 16px",borderTop:"1px solid #f0ede8",flexShrink:0}}>{mk.length>0&&<PinMap markers={mk} height={180}/>}{mk.length>0&&<MapLinks markers={mk}/>}</div>
    </div></div>
  );
}

function EditModal({activity,onSave,onClose,onDelete}){
  const[form,setForm]=useState({...activity,currency:activity.currency||"¥",cost:activity.cost||""});
  const ref=useRef(null);useEffect(()=>{ref.current?.focus();},[]);const up=(k,v)=>setForm(p=>({...p,[k]:v}));
  return(<div style={S.overlay} onClick={onClose}><div style={S.modal} onClick={e=>e.stopPropagation()}>
    <div style={{display:"flex",justifyContent:"space-between",padding:"18px 22px 8px"}}><span style={{fontSize:17,fontWeight:700}}>{activity.id?.startsWith?.("new_")?"添加体验":"编辑体验"}</span><button onClick={onClose} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:"#9ca3af"}}>✕</button></div>
    <div style={{padding:"0 22px 12px"}}>
      <label style={S.fl}>名称</label><input ref={ref} style={S.inp} value={form.name} onChange={e=>up("name",e.target.value)} placeholder="e.g. 秋叶原"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><div><label style={S.fl}>时间</label><select style={S.inp} value={form.time} onChange={e=>up("time",e.target.value)}>{TIMES.map(t=><option key={t}>{t}</option>)}</select></div><div><label style={S.fl}>分类</label><select style={S.inp} value={form.category} onChange={e=>up("category",e.target.value)}>{Object.entries(CATS).map(([k,v])=><option key={k} value={k}>{v.e} {v.l}</option>)}</select></div></div>
      <label style={S.fl}>图片URL</label><input style={S.inp} value={form.img||""} onChange={e=>up("img",e.target.value)} placeholder="https://..."/>
      <label style={S.fl}>地址</label><input style={S.inp} value={form.addr||""} onChange={e=>up("addr",e.target.value)}/>
      <label style={S.fl}>备注</label><textarea style={{...S.inp,minHeight:60,resize:"vertical",fontFamily:"inherit"}} value={form.notes||""} onChange={e=>up("notes",e.target.value)}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 80px",gap:10}}><div><label style={S.fl}>评分</label><input style={S.inp} value={form.rating||""} onChange={e=>up("rating",parseFloat(e.target.value)||"")} placeholder="4.5"/></div><div><label style={S.fl}>费用</label><input style={S.inp} value={form.cost} onChange={e=>up("cost",e.target.value)} placeholder="2000"/></div><div><label style={S.fl}>币种</label><select style={S.inp} value={form.currency} onChange={e=>up("currency",e.target.value)}><option>¥</option><option>MYR</option><option>USD</option></select></div></div>
    </div>
    <div style={{display:"flex",gap:8,padding:"10px 22px 18px",borderTop:"1px solid #f0ede8"}}>{activity.id&&!activity.id.startsWith?.("new_")&&<button onClick={()=>{onDelete(activity.id);onClose();}} style={S.delBtn}>🗑 删除</button>}<div style={{flex:1}}/><button onClick={onClose} style={S.canBtn}>取消</button><button onClick={()=>{onSave(form);onClose();}} style={S.savBtn}>保存</button></div>
  </div></div>);
}

function ActivityCard({act,onClick}){const c=gc(act.category);const tl=act.type==="restaurant"?"Restaurant":act.type==="poi"?"Place":"Note";const cd=act.cost?`${act.currency||"¥"}${act.cost}`:"";
  return(<div onClick={onClick} style={S.actCard} onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,0.07)";e.currentTarget.style.transform="translateY(-2px)";}} onMouseLeave={e=>{e.currentTarget.style.boxShadow="";e.currentTarget.style.transform="";}}>
    <div style={{display:"flex",gap:12}}>{act.img?(<div style={{width:100,height:72,borderRadius:10,overflow:"hidden",flexShrink:0}}><img src={act.img} alt={act.name} style={{width:"100%",height:"100%",objectFit:"cover"}} loading="lazy"/></div>):(<div style={{width:36,height:36,borderRadius:"50%",background:c.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0,marginTop:2}}>{c.e}</div>)}
      <div style={{flex:1,minWidth:0}}><div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:3}}><span style={{fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:0.4,color:c.c,background:c.bg,padding:"2px 8px",borderRadius:5}}>{tl}</span><span style={{fontSize:11,color:"#9ca3af"}}>{act.time}</span>{cd&&<span style={{fontSize:12,fontWeight:700,color:"#c46b98",marginLeft:"auto"}}>{cd}</span>}</div>
        <div style={{fontSize:14,fontWeight:700,color:"#1a1a2e",lineHeight:1.3}}>{act.name}</div>
        {act.rating&&<div style={{display:"flex",alignItems:"center",gap:5,marginTop:2}}><Stars r={act.rating}/><span style={{fontSize:12,fontWeight:700}}>{act.rating}</span>{act.reviews&&<span style={{fontSize:11,color:"#9ca3af"}}>({fN(act.reviews)})</span>}</div>}
        {act.notes&&<div style={{fontSize:11,color:"#9ca3af",marginTop:2,lineHeight:1.4,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{act.notes}</div>}
      </div>
    </div>
  </div>);
}

function DaySection({day,expanded,onToggle,onClickAct,onOpenDay,onAdd,onRemove}){
  const dc=day.activities.reduce((s,a)=>s+pJ(a.cost,a.currency),0);
  const isPre=day.isPreTrip;
  const headerBg=isPre?"linear-gradient(135deg, #2d7a3a, #1a5c2a)":S.dayHeader.background;
  return(<div style={{...S.daySection,...(isPre?{border:"2px dashed #2d7a3a",background:"#f0f7f0"}:{})}}>
    <div style={{...S.dayHeader,background:headerBg}} onClick={onToggle}><div style={S.dayNum}>{isPre?"📋":String(day.id).padStart(2,"0")}</div><div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}><span style={{fontSize:15,fontWeight:700,color:"#fff"}}>{isPre?"出发前准备":day.dow+", "+day.date}</span><span style={S.locBadge}>{day.location}</span>{day.weather&&<span style={{fontSize:12,color:"rgba(255,255,255,0.45)"}}>{day.weather}</span>}</div><div style={{fontSize:12,color:"rgba(255,255,255,0.5)",marginTop:2}}>{day.theme} · {day.activities.length} items{dc>0?` · ~${fJ(dc)}`:""}
    </div></div>{!isPre&&<button onClick={e=>{e.stopPropagation();onOpenDay(day.id);}} style={S.mapBtn} title="日视图+地图">🗺️</button>}<button onClick={e=>{e.stopPropagation();if(confirm(`确定删除${isPre?"准备项":"Day "+day.id+" ("+day.date+")"}？`))onRemove(day.id);}} style={{background:"none",border:"none",color:"rgba(255,255,255,0.4)",fontSize:16,cursor:"pointer",padding:"4px 6px",borderRadius:6}} title="删除">✕</button><div style={{fontSize:18,color:"rgba(255,255,255,0.4)",transform:expanded?"rotate(180deg)":"",transition:"transform 0.2s"}}>▾</div></div>
    {expanded&&<div style={{padding:"8px 14px 14px"}}>{day.activities.map(a=><ActivityCard key={a.id} act={a} onClick={()=>onClickAct(a,day.id)}/>)}<button onClick={()=>onAdd(day.id)} style={S.addBtn}><span style={{fontSize:18}}>+</span> {isPre?"添加准备项":"添加体验"}</button></div>}
  </div>);
}

function BudgetSummary({days}){
  const d=useMemo(()=>{const cs={};Object.keys(CATS).forEach(k=>{cs[k]=0;});const pd=[];days.forEach(dy=>{let dt=0;dy.activities.forEach(a=>{const v=pJ(a.cost,a.currency);cs[a.category]=(cs[a.category]||0)+v;dt+=v;});pd.push({id:dy.id,date:dy.date,total:dt});});return{cs,pd,g:Object.values(cs).reduce((s,v)=>s+v,0)};},[days]);
  const has=d.g>0;const ci=Object.entries(CATS).filter(([k])=>d.cs[k]>0);const mx=Math.max(...Object.values(d.cs),1);
  return(<div style={S.budgetBox}><h3 style={{fontSize:18,fontWeight:800,margin:"0 0 2px"}}>💰 预算汇总</h3><div style={{fontSize:12,color:"#9ca3af",marginBottom:16}}>自动计算 · ¥1 ≈ MYR 0.030</div>
    {!has?<div style={{textAlign:"center",padding:"20px",color:"#9ca3af",fontStyle:"italic",background:"#faf8f4",borderRadius:10,fontSize:14}}>点击体验 → 添加费用即可看到预算明细</div>:(<>
      <div style={{marginBottom:16}}>{ci.map(([k,c])=>(<div key={k} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><span style={{fontSize:14,width:20,textAlign:"center"}}>{c.e}</span><span style={{fontSize:12,color:"#6b7280",width:75,flexShrink:0}}>{c.l}</span><div style={{flex:1,height:18,background:"#f5f3f0",borderRadius:5,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.max((d.cs[k]/mx)*100,3)}%`,background:`linear-gradient(90deg, ${c.bg}, ${c.c}22)`,borderRadius:5,transition:"width 0.4s"}}/></div><span style={{fontSize:12,fontWeight:700,color:c.c,width:80,textAlign:"right",flexShrink:0}}>{fJ(d.cs[k])}</span></div>))}</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(120px, 1fr))",gap:5,marginBottom:14}}>{d.pd.map(p=>(<div key={p.id} style={{padding:"7px 10px",background:"#faf8f4",borderRadius:7}}><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:11,color:"#6b7280"}}>Day {p.id}</span><span style={{fontSize:10,color:"#b0b0b0"}}>{p.date}</span></div><div style={{fontSize:13,fontWeight:700,color:p.total>0?"#1a1a2e":"#d1d5db",marginTop:1}}>{p.total>0?fJ(p.total):"—"}</div></div>))}</div>
      <div style={S.grandTotal}><div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}><span style={{fontSize:13,color:"rgba(255,255,255,0.6)"}}>总计 (JPY)</span><span style={{fontSize:22,fontWeight:800,color:"#f5dce8"}}>{fJ(d.g)}</span></div><div style={{display:"flex",justifyContent:"space-between",marginTop:5,paddingTop:7,borderTop:"1px solid rgba(255,255,255,0.1)"}}><span style={{fontSize:12,color:"rgba(255,255,255,0.5)"}}>≈ MYR</span><span style={{fontSize:16,fontWeight:700,color:"rgba(255,255,255,0.7)"}}>{fM(d.g/33.5)}</span></div></div>
    </>)}</div>);
}

// ═══════════════════════════════════════════════════════════════
export default function App(){
  const[days,setDays]=useState(INIT_DAYS);const[exp,setExp]=useState({1:true});const[viewE,setViewE]=useState(null);const[dayM,setDayM]=useState(null);const[editA,setEditA]=useState(null);const[editD,setEditD]=useState(null);const[notes,setNotes]=useState(false);
  const[copied,setCopied]=useState(false);const[saveStatus,setSaveStatus]=useState("");const[showPasteModal,setShowPasteModal]=useState(false);const[pasteText,setPasteText]=useState("");const[showMobile,setShowMobile]=useState(false);
  const fileRef=useRef(null);
  const tripDays=days.filter(d=>!d.isPreTrip);
  const cities=[];let prev="";tripDays.forEach(d=>{const l=d.location.split("→")[0].split("/")[0].trim();if(l!==prev){cities.push({name:l,start:d.id});prev=l;}});
  const tA=tripDays.reduce((s,d)=>s+d.activities.length,0);
  const dateRange=useMemo(()=>{const td=days.filter(d=>!d.isPreTrip);if(!td.length)return"";const months={Jan:"1月",Feb:"2月",Mar:"3月",Apr:"4月",May:"5月",Jun:"6月",Jul:"7月",Aug:"8月",Sep:"9月",Oct:"10月",Nov:"11月",Dec:"12月"};const first=td[0].date,last=td[td.length-1].date;const[fm,fd]=first.split(" ");const[lm,ld]=last.split(" ");if(fm===lm)return`2026年${months[fm]}${fd}–${ld}日`;return`2026年${months[fm]}${fd}日–${months[lm]}${ld}日`;},[days]);
  const allMk=useMemo(()=>{const m=[];HOTELS.forEach(h=>m.push({name:h.name,la:h.la,lo:h.lo,isH:true,cat:"hotel"}));days.forEach(d=>d.activities.filter(a=>a.la&&a.lo).forEach(a=>m.push({name:a.name,la:a.la,lo:a.lo,cat:a.category})));const s=new Set();return m.filter(p=>{if(s.has(p.name))return false;s.add(p.name);return true;});},[days]);

  const hSave=form=>{setDays(p=>p.map(d=>{if(d.id!==editD)return d;const ex=d.activities.find(a=>a.id===form.id);if(ex)return{...d,activities:d.activities.map(a=>a.id===form.id?form:a)};return{...d,activities:[...d.activities,{...form,id:`${d.id}_${Date.now()}`}]};}));};
  const hDel=id=>setDays(p=>p.map(d=>({...d,activities:d.activities.filter(a=>a.id!==id)})));
  const hClick=(act,did)=>{if(act.type==="note"){setEditA(act);setEditD(did);}else setViewE(act);};
  const hEditExp=act=>{setViewE(null);setEditA(act);setEditD(days.find(d=>d.activities.some(a=>a.id===act.id))?.id);};

  // Export JSON
  const handleExport=()=>{
    const data=JSON.stringify({version:1,exportDate:new Date().toISOString(),days},null,2);
    const blob=new Blob([data],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;a.download=`japan-trip-${new Date().toISOString().split("T")[0]}.json`;a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON from file
  const handleImport=(e)=>{
    const file=e.target.files?.[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=(ev)=>{
      try{
        const data=JSON.parse(ev.target.result);
        if(data.days&&Array.isArray(data.days)){
          setDays(data.days);setExp({[data.days[0]?.id]:true});
          alert(`✅ 已导入 ${data.days.length} 天, ${data.days.reduce((s,d)=>s+d.activities.length,0)} 个体验`);
        }else{alert("❌ 无效的JSON格式：缺少 days 数组");}
      }catch(err){alert("❌ JSON解析失败: "+err.message);}
    };
    reader.readAsText(file);e.target.value="";
  };

  // Copy JSON to clipboard
  const handleCopy=async()=>{
    const data=JSON.stringify({version:1,exportDate:new Date().toISOString(),days},null,2);
    await navigator.clipboard.writeText(data);
    setCopied(true);setTimeout(()=>setCopied(false),2000);
  };

  // Import from paste modal
  const handlePasteImport=()=>{
    try{
      const data=JSON.parse(pasteText);
      if(data.days&&Array.isArray(data.days)){
        setDays(data.days);setShowPasteModal(false);setPasteText("");
        alert(`✅ 已导入 ${data.days.length} 天`);
      }else{alert("❌ 无效格式");}
    }catch(err){alert("❌ JSON解析失败");}
  };

  // Auto-save (debounced)
  useEffect(()=>{
    const timer=setTimeout(async()=>{
      try{
        await window.storage.set("trip-planner-data",JSON.stringify({version:1,days}));
        setSaveStatus("saved");
      }catch(e){/* storage may not be available */}
    },2000);
    return()=>clearTimeout(timer);
  },[days]);

  // Auto-load on mount
  useEffect(()=>{
    (async()=>{
      try{
        const result=await window.storage.get("trip-planner-data");
        if(result?.value){const data=JSON.parse(result.value);if(data.days)setDays(data.days);}
      }catch(e){/* Key doesn't exist yet, use defaults */}
    })();
  },[]);

  return(<div style={S.root}>
    <div style={{position:"fixed",inset:0,background:"radial-gradient(ellipse at 15% 20%, rgba(232,160,191,0.1) 0%, transparent 50%), radial-gradient(ellipse at 85% 60%, rgba(232,160,191,0.06) 0%, transparent 40%)",pointerEvents:"none",zIndex:0}}/>
    <div style={S.container}>
      <div style={{textAlign:"center",marginBottom:20,paddingTop:4}}>
        <div style={{fontSize:11,letterSpacing:6,color:"#c46b98",opacity:0.7,marginBottom:6,fontWeight:700}}>旅の計画 · 互动行程规划</div>
        <h1 style={{fontSize:"clamp(22px, 5vw, 32px)",fontWeight:800,color:"#1a1a2e",margin:"0 0 6px",lineHeight:1.2}}>日本春季樱花自驾之旅</h1>
        <div style={{fontSize:14,color:"#6b7280"}}>{dateRange} · {tA}个体验 · 🌸樱花 🍜美食 🎮二次元 📸摄影 🌊海边</div>
        <div style={S.routeBadge}>JB <span style={{color:"#c46b98"}}>✈</span> 大阪 <span style={{color:"#c46b98"}}>🚗</span> 富士山 <span style={{color:"#c46b98"}}>🚗</span> 东京 <span style={{color:"#c46b98"}}>✈</span> JB</div>
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",flexWrap:"wrap",padding:"8px 0",marginBottom:8}}>
        {cities.map((c,i)=>(<div key={c.name} style={{display:"flex",alignItems:"center"}}><div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}><div style={{width:12,height:12,borderRadius:"50%",background:"linear-gradient(135deg,#c46b98,#e8a0bf)",border:"3px solid #faf8f4",boxShadow:"0 0 0 2px #c46b98"}}/><span style={{fontSize:12,fontWeight:700,color:"#1a1a2e"}}>{c.name}</span><span style={{fontSize:10,color:"#9ca3af"}}>Day {c.start}</span></div>{i<cities.length-1&&<div style={{width:40,height:2,background:"linear-gradient(90deg,#c46b98,#e8a0bf)",margin:"0 6px",marginBottom:26,opacity:0.35}}/>}</div>))}
      </div>
      <PinMap markers={allMk} height={240}/><MapLinks markers={allMk.slice(0,12)}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:8,margin:"12px 0 16px"}}>
        {[["天数",tripDays.length+"天"],["体验",tA],["城市",cities.length],["住宿","2处"]].map(([l,v])=>(<div key={l} style={S.sumItem}><span style={S.sumLabel}>{l}</span><span style={S.sumValue}>{v}</span></div>))}
      </div>
      {days.some(d=>d.isPreTrip)?days.filter(d=>d.isPreTrip).map(day=>(<DaySection key={day.id} day={day} expanded={!!exp[day.id]} onToggle={()=>setExp(p=>({...p,[day.id]:!p[day.id]}))} onClickAct={(a)=>hClick(a,day.id)} onOpenDay={id=>setDayM(id)} onAdd={did=>{setEditA({id:"new_"+Date.now(),type:"note",name:"",category:"sightseeing",time:"Daytime",cost:"",currency:"MYR",notes:""});setEditD(did);}} onRemove={id=>setDays(p=>p.filter(d=>d.id!==id))}/>)):<button onClick={()=>{setDays(p=>[{id:0,date:"Pre-Trip",dow:"",location:"准备",theme:"出发前准备",weather:"",isPreTrip:true,activities:[]},...p]);setExp(prev=>({...prev,[0]:true}));}} style={{...S.pillBtn,background:"#ecf5ec",color:"#2d7a3a",border:"2px dashed #2d7a3a",fontSize:13,padding:"8px 20px",margin:"0 auto 8px",display:"block"}}>+ 添加出发前准备</button>}
      {tripDays.map(day=>(<DaySection key={day.id} day={day} expanded={!!exp[day.id]} onToggle={()=>setExp(p=>({...p,[day.id]:!p[day.id]}))} onClickAct={(a)=>hClick(a,day.id)} onOpenDay={id=>setDayM(id)} onAdd={did=>{setEditA({id:"new_"+Date.now(),type:"poi",name:"",category:"sightseeing",time:"Morning",cost:"",currency:"¥",notes:""});setEditD(did);}} onRemove={id=>setDays(p=>p.filter(d=>d.id!==id))}/>))}
      <button onClick={()=>{const DOWS=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];const MONS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];const MDAYS=[31,28,31,30,31,30,31,31,30,31,30,31];const last=tripDays[tripDays.length-1];let nid=(last?.id||0)+1;let ndate="",ndow="";if(last?.date){const[m,d]=last.date.split(" ");const mi=MONS.indexOf(m);const di=parseInt(d)+1;if(di>MDAYS[mi]){ndate=MONS[(mi+1)%12]+" 1";}else{ndate=m+" "+di;}const base=new Date(2026,mi,parseInt(d)+1);ndow=DOWS[base.getDay()];}else{ndate="";ndow="";}const nd={id:nid,date:ndate,dow:ndow,location:"",theme:"",weather:"",activities:[]};setDays(p=>[...p,nd]);setExp(prev=>({...prev,[nid]:true}));}} style={{...S.pillBtn,background:"linear-gradient(135deg,#c46b98,#e8a0bf)",color:"#fff",border:"none",fontSize:14,padding:"10px 24px",margin:"8px auto",display:"block"}}>+ 添加新天</button>
      <div style={{display:"flex",gap:8,justifyContent:"center",margin:"12px 0 20px"}}><button style={S.pillBtn} onClick={()=>{const a={};days.forEach(d=>a[d.id]=true);setExp(a);}}>全部展开</button><button style={S.pillBtn} onClick={()=>setExp({})}>全部折叠</button></div>
      {/* Save/Load Toolbar */}
      <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",padding:"14px 0",margin:"0 0 16px",borderTop:"1px solid #e8e4de",borderBottom:"1px solid #e8e4de"}}>
        <button onClick={handleExport} style={S.toolBtn}>📥 导出JSON</button>
        <button onClick={()=>fileRef.current?.click()} style={S.toolBtn}>📤 导入JSON</button>
        <button onClick={handleCopy} style={{...S.toolBtn,background:copied?"#ecf5ec":"#fff"}}>{copied?"✅ 已复制!":"📋 复制JSON"}</button>
        <button onClick={()=>setShowPasteModal(true)} style={S.toolBtn}>📋 粘贴导入</button>
        {saveStatus==="saved"&&<span style={{fontSize:12,color:"#2d7a3a",alignSelf:"center"}}>☁️ 已自动保存</span>}
        <input ref={fileRef} type="file" accept=".json" style={{display:"none"}} onChange={handleImport}/>
      </div>
      <BudgetSummary days={days}/>
      <div style={{...S.notesBox,marginTop:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}} onClick={()=>setNotes(!notes)}><span style={{fontSize:16,fontWeight:700}}>📋 旅行备忘 & 提醒</span><span style={{fontSize:18,color:"#9ca3af",transform:notes?"rotate(180deg)":"",transition:"transform 0.2s"}}>▾</span></div>
        {notes&&(<div style={{marginTop:14,fontSize:14,color:"#4a4a5a",lineHeight:1.9}}>
          <div>◆ <strong>护照:</strong> 有效期6个月以上</div>
          <div>◆ <strong>签证:</strong> 马来西亚护照免签90天</div>
          <div>◆ <strong>国际驾照 (IDP):</strong> 出发前在马来西亚办理！日本不能现场办</div>
          <div>◆ <strong>靠左行驶!</strong> 日本和马来西亚一样靠左</div>
          <div>◆ <strong>租车:</strong> Toyota/Nippon/Times。要求ETC卡过高速。单程还车有"乗り捨て"附加费</div>
          <div>◆ <strong>IC卡:</strong> 机场买Suica/ICOCA，可坐车+便利店+自动贩卖机</div>
          <div>◆ <strong>现金:</strong> 日本仍以现金为主 — 7-11 ATM接受国际卡</div>
          <div>◆ <strong>eSIM:</strong> 出发前激活数据流量</div>
          <div>◆ <strong>造幣局预约:</strong> 4/5-4/11开放，需要提前在japan-mint.go.jp预约!</div>
          <div>◆ <strong>teamLab:</strong> 门票务必提前在官网预约!</div>
          <div>◆ <strong>天气:</strong> 4月10-20°C — 分层穿搭+轻便雨衣</div>
        </div>)}
      </div>
      <div style={{...S.notesBox,marginTop:14}}>
        <div style={{display:"flex",justifyContent:"space-between",cursor:"pointer"}} onClick={()=>setShowMobile(!showMobile)}>
          <span style={{fontSize:16,fontWeight:700}}>📱 如何在手机上使用</span>
          <span style={{transform:showMobile?"rotate(180deg)":"",transition:"0.2s"}}>▾</span>
        </div>
        {showMobile&&(
          <div style={{marginTop:14,fontSize:14,color:"#4a4a5a",lineHeight:1.9}}>
            <div><strong>方法1: Claude App (推荐)</strong></div>
            <div>◆ 下载 Claude iOS/Android App</div>
            <div>◆ 打开同一个对话，artifact会自动渲染</div>
            <div>◆ 所有交互功能（点击、编辑、地图）均可用</div>
            <div style={{marginTop:8}}><strong>方法2: 导出JSON → 其他设备</strong></div>
            <div>◆ 在电脑上点击"📋 复制JSON"</div>
            <div>◆ 通过微信/Telegram/邮件发给自己</div>
            <div>◆ 在手机Claude App中打开对话，点击"📋 粘贴导入"</div>
            <div style={{marginTop:8}}><strong>方法3: 分享链接</strong></div>
            <div>◆ 在Claude.ai网页版，点击对话右上角"Share"</div>
            <div>◆ 生成分享链接，手机浏览器直接打开</div>
            <div style={{marginTop:8}}><strong>离线使用提示:</strong></div>
            <div>◆ 导出JSON保存到手机本地</div>
            <div>◆ 旅途中可随时导入恢复行程</div>
            <div>◆ Google Maps链接在离线状态也能打开（如已缓存）</div>
          </div>
        )}
      </div>
      <div style={{textAlign:"center",fontSize:12,color:"#b0b0b0",margin:"24px 0 16px"}}>点击体验查看详情 · 点击 <strong>🗺️</strong> 打开日视图+地图 · 点击 <strong>+</strong> 添加</div>
    </div>
    {showPasteModal&&(
      <div style={S.overlay} onClick={()=>setShowPasteModal(false)}>
        <div style={S.modal} onClick={e=>e.stopPropagation()}>
          <div style={{padding:"20px 24px"}}>
            <h3 style={{fontSize:18,fontWeight:700,marginBottom:12}}>📋 粘贴JSON导入</h3>
            <p style={{fontSize:13,color:"#6b7280",marginBottom:12}}>将之前导出的JSON内容粘贴到下方：</p>
            <textarea value={pasteText} onChange={e=>setPasteText(e.target.value)} placeholder='{"version":1,"days":[...]}' style={{...S.inp,minHeight:200,resize:"vertical",fontFamily:"monospace",fontSize:12}}/>
            <div style={{display:"flex",gap:8,marginTop:12}}>
              <button onClick={()=>setShowPasteModal(false)} style={S.canBtn}>取消</button>
              <button onClick={handlePasteImport} style={{...S.savBtn,flex:1}}>导入</button>
            </div>
          </div>
        </div>
      </div>
    )}
    {viewE&&<ExperienceDetail act={viewE} onClose={()=>setViewE(null)} onEdit={hEditExp}/>}
    {dayM&&<DayDetailModal days={days} initialDayId={dayM} onClose={()=>setDayM(null)} onViewExp={act=>{setDayM(null);setViewE(act);}}/>}
    {editA&&<EditModal activity={editA} onSave={hSave} onDelete={hDel} onClose={()=>{setEditA(null);setEditD(null);}}/>}
  </div>);
}

const S={
  root:{fontFamily:"'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",background:"#faf8f4",minHeight:"100vh",color:"#1a1a2e"},
  container:{maxWidth:700,margin:"0 auto",padding:"20px 16px",position:"relative",zIndex:1},
  routeBadge:{display:"inline-flex",alignItems:"center",gap:7,marginTop:10,padding:"8px 18px",background:"#fff",border:"1px solid #e8e4de",borderRadius:100,fontSize:13,fontWeight:600,boxShadow:"0 2px 8px rgba(26,26,46,0.06)"},
  daySection:{marginBottom:12,borderRadius:14,overflow:"hidden",background:"#fff",border:"1px solid #e8e4de",boxShadow:"0 2px 8px rgba(0,0,0,0.03)"},
  dayHeader:{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",background:"linear-gradient(135deg,#1a1a2e,#2d2d4a)",cursor:"pointer",userSelect:"none"},
  dayNum:{width:36,height:36,borderRadius:"50%",border:"2px solid #e8a0bf",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,color:"#f5dce8",flexShrink:0},
  locBadge:{background:"rgba(255,255,255,0.12)",padding:"3px 10px",borderRadius:100,fontSize:10,fontWeight:700,letterSpacing:0.8,color:"rgba(255,255,255,0.75)",textTransform:"uppercase"},
  mapBtn:{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:8,padding:"5px 8px",cursor:"pointer",fontSize:14},
  actCard:{padding:"12px 14px",marginBottom:8,borderRadius:12,border:"1px solid #f0ede8",cursor:"pointer",transition:"all 0.15s",boxShadow:"0 1px 4px rgba(0,0,0,0.04)",background:"#fff"},
  addBtn:{display:"flex",alignItems:"center",justifyContent:"center",gap:6,width:"100%",padding:"10px",borderRadius:10,border:"2px dashed #e8e4de",background:"transparent",cursor:"pointer",fontSize:13,fontWeight:600,color:"#9ca3af",fontFamily:"inherit"},
  pillBtn:{padding:"7px 18px",borderRadius:100,border:"1px solid #e8e4de",background:"#fff",cursor:"pointer",fontSize:12,fontWeight:600,color:"#6b7280",fontFamily:"inherit"},
  sumItem:{background:"#fff",border:"1px solid #e8e4de",borderRadius:12,padding:"12px 8px",textAlign:"center",boxShadow:"0 1px 3px rgba(0,0,0,0.03)"},
  sumLabel:{display:"block",fontSize:10,textTransform:"uppercase",letterSpacing:1.2,color:"#9ca3af",fontWeight:700,marginBottom:3},
  sumValue:{fontSize:16,fontWeight:800,color:"#1a1a2e"},
  budgetBox:{padding:"22px",background:"#fff",border:"1px solid #e8e4de",borderRadius:16,boxShadow:"0 2px 12px rgba(0,0,0,0.04)"},
  grandTotal:{background:"linear-gradient(135deg,#1a1a2e,#2d2d4a)",borderRadius:12,padding:"16px 18px",marginTop:4},
  notesBox:{padding:"18px 22px",background:"#fff",border:"1px solid #e8e4de",borderRadius:14,boxShadow:"0 2px 10px rgba(0,0,0,0.04)"},
  overlay:{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16},
  modal:{background:"#fff",borderRadius:20,maxWidth:500,width:"100%",maxHeight:"90vh",overflow:"auto",boxShadow:"0 24px 80px rgba(0,0,0,0.2)"},
  panel:{background:"#fff",borderRadius:20,width:"100%",maxHeight:"90vh",overflow:"auto",boxShadow:"0 24px 80px rgba(0,0,0,0.25)"},
  dayModal:{background:"#fff",borderRadius:20,maxWidth:520,width:"100%",maxHeight:"90vh",overflow:"hidden",boxShadow:"0 24px 80px rgba(0,0,0,0.25)",display:"flex",flexDirection:"column"},
  fl:{display:"block",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,color:"#6b7280",marginTop:12,marginBottom:5},
  inp:{width:"100%",padding:"10px 14px",borderRadius:10,border:"1.5px solid #e8e4de",fontSize:14,fontFamily:"inherit",outline:"none",color:"#1a1a2e",background:"#faf8f4"},
  savBtn:{padding:"10px 22px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#c46b98,#e8a0bf)",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"inherit"},
  canBtn:{padding:"10px 16px",borderRadius:10,border:"1px solid #e8e4de",background:"#fff",color:"#6b7280",fontWeight:600,fontSize:14,cursor:"pointer",fontFamily:"inherit"},
  delBtn:{padding:"10px 16px",borderRadius:10,border:"1px solid #fecaca",background:"#fef2f2",color:"#dc2626",fontWeight:600,fontSize:14,cursor:"pointer",fontFamily:"inherit"},
  toolBtn:{padding:"8px 16px",borderRadius:10,border:"1px solid #e8e4de",background:"#fff",cursor:"pointer",fontSize:13,fontWeight:600,color:"#4a4a5a",fontFamily:"inherit",boxShadow:"0 1px 3px rgba(0,0,0,0.03)",transition:"all 0.15s"},
};
