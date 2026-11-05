(()=>{"use strict";
const KEY="astral-regalia-save-v1";
const $=id=>document.getElementById(id);
const species=[
{name:"炎狼",icon:"🐺",el:"炎",hp:95,atk:24,spd:30,skill:"フレアバイト",power:1.65},
{name:"水竜",icon:"🐉",el:"水",hp:115,atk:20,spd:20,skill:"アクアブレス",power:1.6},
{name:"森鹿",icon:"🦌",el:"森",hp:110,atk:21,spd:24,skill:"リーフカッター",power:1.6},
{name:"雷狐",icon:"🦊",el:"雷",hp:85,atk:23,spd:36,skill:"スパーク",power:1.7},
{name:"闇蝙蝠",icon:"🦇",el:"闇",hp:90,atk:22,spd:32,skill:"ナイトウィング",power:1.65},
{name:"光馬",icon:"🐎",el:"光",hp:105,atk:21,spd:27,skill:"ホーリーライト",power:1.55}
];
const dungeons=[
{name:"星明かりの森",icon:"🌳",level:"Lv1〜5",floors:5,desc:"星の光が差し込む初心者向けの森。",boss:"森の守護獣 グランディア",reward:100},
{name:"星晶の洞窟",icon:"💎",level:"Lv5〜12",floors:6,desc:"結晶の魔物が巣食う地下洞窟。",boss:"晶岩竜クリスタロス",reward:180},
{name:"風鳴りの山脈",icon:"⛰️",level:"Lv12〜20",floors:7,desc:"強風と雷鳴が吹き荒れる高山。",boss:"嵐翼王ヴォルテガ",reward:280},
{name:"影喰らいの遺跡",icon:"🏚️",level:"Lv20〜35",floors:8,desc:"古代の呪いが残る暗黒の遺跡。",boss:"深淵の魔人ノクティス",reward:450},
{name:"星環の中枢",icon:"🌌",level:"Lv35〜",floors:10,desc:"世界を支える星環の中心部。",boss:"星環の破壊者アストラゼロ",reward:800}
];
const enemySets=[
[["森スライム","🟢",1,65,13,12],["森キノコ","🍄",1,72,15,10],["森狼","🐺",2,105,19,23]],
[["星晶虫","🪲",6,150,25,19],["岩トカゲ","🦎",7,180,28,16],["結晶ゴーレム","🗿",9,260,34,10]],
[["風鳥","🦅",13,240,36,40],["雷獣","🐆",15,280,42,38],["山岳ワイバーン","🐲",18,390,48,32]],
[["影獣","👹",21,380,52,30],["闇騎士","🛡️",25,450,58,25],["呪術師","🧙",29,410,62,28]],
[["星霊","✨",36,600,70,45],["古代竜","🐉",40,780,82,38],["星環の番人","👁️",45,950,95,42]]
];
const clone=o=>JSON.parse(JSON.stringify(o));
function initial(){return {version:1,coins:0,crystals:0,potions:3,tickets:0,unlocked:0,cleared:[],party:species.map((s,i)=>({...s,id:i,lv:1,xp:0,hp:s.hp,max:s.hp})),front:[0,1,2],activeDungeon:0,activeFloor:1,settings:{}}}
let state=load(),battle=null,returnTab="dungeons",pendingSummary=null;
function load(){try{let v=JSON.parse(localStorage.getItem(KEY));if(v&&v.version===1&&Array.isArray(v.party)&&v.party.length===6)return v}catch(e){}return initial()}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));$("save-status").textContent="保存済み："+new Date().toLocaleTimeString("ja-JP")}catch(e){$("save-status").textContent="保存できませんでした。ブラウザの容量・設定を確認してください。"}}
function tab(id){document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===id));document.querySelectorAll("nav [data-tab]").forEach(b=>b.classList.toggle("active",b.dataset.tab===id));}
function hpbar(v,m){return `<div class="bar"><i style="width:${Math.max(0,100*v/m)}%"></i></div>`}
function alive(m){return m.hp>0}
function frontMons(){return state.front.map(i=>state.party[i])}
function updateHeader(){$("coins").textContent=state.coins;$("crystals").textContent=state.crystals;$("clears").textContent=`${state.cleared.length} / 5`;$("rank").textContent=state.cleared.length>=5?"星環の冒険者":state.cleared.length>=3?"熟練冒険者":state.cleared.length>=1?"森を越えた冒険者":"駆け出し";}
function renderDungeons(){ $("dungeon-list").innerHTML=dungeons.map((d,i)=>{let unlocked=i<=state.unlocked,done=state.cleared.includes(i);return `<article class="dungeon ${unlocked?"":"locked"}"><div class="row"><span class="emoji">${d.icon}</span><span class="tiny">${done?"✅ クリア済み":unlocked?"🔓 解放中":"🔒 未解放"}</span></div><h2>${d.name}</h2><b>${d.level}</b><p>${d.desc}</p><p>全${d.floors}階層 / ボス：${d.boss}</p><button data-dungeon="${i}" ${unlocked?"":"disabled"} class="${unlocked?"primary":""}">${done?"再挑戦":"挑戦する"}</button></article>`}).join("");$("dungeon-list").querySelectorAll("[data-dungeon]").forEach(b=>b.onclick=()=>startDungeon(+b.dataset.dungeon));}
function monCard(m,i,withButton=false){return `<div class="monster"><div class="emoji">${m.icon}</div><div class="info"><strong>${m.name} Lv.${m.lv}</strong><div class="tiny">${m.el}属性 ・攻${m.atk} ・速${m.spd} ・HP ${m.hp}/${m.max}</div>${hpbar(m.hp,m.max)}<div class="tiny">経験値 ${m.xp}/${m.lv*30}　技：${m.skill}</div></div>${withButton?`<button data-front="${i}">${state.front.includes(i)?"前衛解除":"前衛にする"}</button>`:""}</div>`}
function renderParty(){$("front-list").innerHTML=state.front.map(i=>monCard(state.party[i],i)).join("")||"前衛がいません";$("bench-list").innerHTML=state.party.map((m,i)=>({m,i})).filter(x=>!state.front.includes(x.i)).map(x=>monCard(x.m,x.i,true)).join("")||"控えはいません";$("all-list").innerHTML=state.party.map((m,i)=>monCard(m,i,true)).join("");$("party").querySelectorAll("[data-front]").forEach(b=>b.onclick=()=>{let i=+b.dataset.front;if(state.front.includes(i)){if(state.front.length>1)state.front=state.front.filter(x=>x!==i)}else if(state.front.length<3)state.front.push(i);else state.front[2]=i;save();renderParty()})}
function renderItems(){$("inventory").innerHTML=`<div class="row"><span>🧪 回復薬</span><b>${state.potions}個</b></div><p class="muted">戦闘中に使用すると、HPが最も少ない前衛1匹を最大55回復。</p><hr style="border-color:var(--line)"><div class="row"><span>💎 星晶石</span><b>${state.crystals}</b></div><div class="row"><span>🎟️ 召喚チケット</span><b>${state.tickets}</b></div>`}
function startDungeon(i){state.activeDungeon=i;state.activeFloor=1;returnTab="dungeons";beginBattle();save()}
function startBattle(){beginBattle()}
function enemiesFor(d,f){let set=enemySets[d],boss=f===dungeons[d].floors;let chosen=set[Math.min(set.length-1,Math.floor((f-1)/(dungeons[d].floors-1)*set.length))];let count=boss?1:(f%3===0?2:1);return Array.from({length:count},(_,i)=>{let scale=1+(f-1)*.09+(d*.08);let bossName=boss?dungeons[d].boss:chosen[0];let hp=Math.round(chosen[3]*scale*(boss?2.2:1));return {name:bossName,icon:boss?["🦌","🐉","🦅","👹","👁️"][d]:chosen[1],lv:chosen[2]+Math.floor((f-1)*.6),hp,max:hp,atk:Math.round(chosen[4]*scale*(boss?1.25:1)),spd:chosen[5]+Math.floor(f*.5),boss}})}
function beginBattle(){let d=state.activeDungeon,f=state.activeFloor; if(frontMons().every(m=>!alive(m)))frontMons().forEach(m=>m.hp=Math.ceil(m.max*.5));battle={enemies:enemiesFor(d,f),round:1,commands:{},log:[`${dungeons[d].name} 第${f}階層。敵が現れた！`],busy:false};tab("battle");renderBattle()}
function addLog(s){battle.log.unshift(s);battle.log=battle.log.slice(0,35)}
function renderBattle(){$("battle-title").textContent=dungeons[state.activeDungeon].name;$("battle-floor").textContent=`${state.activeFloor} / ${dungeons[state.activeDungeon].floors}階層`;$("enemy-list").innerHTML=battle.enemies.map(e=>`<div class="monster enemy"><div class="emoji">${e.icon}</div><strong>${e.name}</strong><div class="tiny">Lv.${e.lv} ・HP ${e.hp}/${e.max}</div>${hpbar(e.hp,e.max)}</div>`).join("");$("ally-list").innerHTML=frontMons().map(m=>monCard(m)).join("");$("command-list").innerHTML=frontMons().map((m,i)=>`<div class="row" style="margin:8px 0"><b>${m.icon} ${m.name}</b><select data-command="${i}" ${!alive(m)?"disabled":""}><option value="attack">通常攻撃</option><option value="skill">${m.skill}</option><option value="guard">防御</option><option value="swap">控えと交代</option></select></div>`).join("");$("command-list").querySelectorAll("select").forEach(s=>s.onchange=()=>battle.commands[s.dataset.command]=s.value);$("battle-log").innerHTML=battle.log.map(x=>`・${x}`).join("<br>");$("execute-turn").disabled=battle.busy;$("use-potion").disabled=state.potions<=0||battle.busy}
function damage(m,e,mult){let n=Math.max(1,Math.round(m.atk*mult*(.9+Math.random()*.2)));e.hp=Math.max(0,e.hp-n);addLog(`${m.name}の攻撃！ ${e.name}に${n}ダメージ。`);if(!e.hp)addLog(`${e.name}を倒した！`)}
function gainXp(n){state.party.forEach(m=>{m.xp+=n;while(m.xp>=m.lv*30){m.xp-=m.lv*30;m.lv++;m.max+=8;m.atk+=2;m.spd++;m.hp=Math.min(m.max,m.hp+15);addLog(`${m.name}はLv.${m.lv}に上がった！`)}})}
function finishBattle(victory){battle.busy=true;let d=state.activeDungeon,f=state.activeFloor;if(victory){let xp=25+d*25+f*8,coin=30+d*40+f*10;gainXp(xp);state.coins+=coin;state.potions+=1;if(f===dungeons[d].floors){state.crystals+=dungeons[d].reward;state.cleared=Array.from(new Set([...state.cleared,d]));state.unlocked=Math.max(state.unlocked,Math.min(4,d+1));pendingSummary={title:"ダンジョンクリア！",icon:"🏆",text:`${dungeons[d].name}を踏破！ 経験値${xp}・コイン${coin}・星晶石${dungeons[d].reward}を獲得。`,next:"dungeons"};}else{pendingSummary={title:`第${f}階層クリア！`,icon:"✨",text:`経験値${xp}・コイン${coin}・回復薬1個を獲得。`,next:"next"};}}else{state.coins=Math.max(0,state.coins-20);state.party.forEach(m=>m.hp=Math.max(1,Math.ceil(m.max*.35)));pendingSummary={title:"撤退…",icon:"💫",text:"仲間を守るため撤退した。HPが少し回復し、コインを20失った。",next:"dungeons"};}save();$("summary-icon").textContent=pendingSummary.icon;$("summary-title").textContent=pendingSummary.title;$("summary-text").textContent=pendingSummary.text;$("summary-continue").textContent=pendingSummary.next==="next"?"次の階層へ":"戻る";tab("summary")}
function doTurn(){if(!battle||battle.busy)return;battle.busy=true;let actions=frontMons().map((m,i)=>({m,i,cmd:battle.commands[i]||"attack"})).filter(x=>alive(x.m)).sort((a,b)=>b.m.spd-a.m.spd);let guards=new Set();for(let a of actions){if(!battle.enemies.some(e=>e.hp>0))break;let m=a.m;if(a.cmd==="swap"){let bench=state.party.findIndex((x,i)=>!state.front.includes(i)&&alive(x));if(bench>=0){state.front[a.i]=bench;addLog(`${m.name}と${state.party[bench].name}が交代！`)}else addLog("交代できる仲間がいない！");continue}if(a.cmd==="guard"){guards.add(m);addLog(`${m.name}は防御した。`);continue}let e=battle.enemies.find(x=>x.hp>0);let mul=a.cmd==="skill"?m.power:1;damage(m,e,mul)}
if(!battle.enemies.some(e=>e.hp>0)){finishBattle(true);return}
let targets=frontMons().filter(alive).sort((a,b)=>a.hp/a.max-b.hp/b.max);battle.enemies.filter(e=>e.hp>0).sort((a,b)=>b.spd-a.spd).forEach(e=>{let m=targets.find(alive);if(!m)return;let n=e.atk;if(guards.has(m))n=Math.ceil(n*.45);m.hp=Math.max(0,m.hp-n);addLog(`${e.name}の攻撃！ ${m.name}は${n}ダメージ。`);if(!alive(m))addLog(`${m.name}は倒れた！`)});if(frontMons().every(m=>!alive(m))){finishBattle(false);return}battle.round++;battle.busy=false;battle.commands={};save();renderBattle()}
$("execute-turn").onclick=doTurn;
$("use-potion").onclick=()=>{if(!battle||battle.busy||state.potions<=0)return;let m=frontMons().filter(alive).sort((a,b)=>a.hp/a.max-b.hp/b.max)[0];if(!m)return;let n=Math.min(55,m.max-m.hp);m.hp+=n;state.potions--;addLog(`回復薬を使用。${m.name}のHPが${n}回復！`);save();renderBattle()};
$("run-away").onclick=()=>{if(battle?.busy)return;finishBattle(false)};
$("summary-continue").onclick=()=>{if(pendingSummary?.next==="next"){state.activeFloor++;save();beginBattle()}else{tab("dungeons");renderDungeons();updateHeader()}};
document.querySelectorAll("nav [data-tab]").forEach(b=>b.onclick=()=>{if(battle&&!battle.busy&&document.getElementById("battle").classList.contains("active"))return;tab(b.dataset.tab);if(b.dataset.tab==="party")renderParty();if(b.dataset.tab==="dungeons")renderDungeons();if(b.dataset.tab==="items")renderItems()});
document.querySelectorAll("[data-goto]").forEach(b=>b.onclick=()=>{tab(b.dataset.goto);if(b.dataset.goto==="dungeons")renderDungeons();if(b.dataset.goto==="party")renderParty()});
$("export-save").onclick=()=>{let blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="hoshiwa-regalia-save.json";a.click();URL.revokeObjectURL(a.href)};
$("import-save").onclick=()=>$("save-file").click();
$("save-file").onchange=async e=>{let f=e.target.files[0];if(!f)return;try{let v=JSON.parse(await f.text());if(v.version!==1||!Array.isArray(v.party)||v.party.length!==6)throw Error();state=v;save();location.reload()}catch(err){alert("セーブデータを読み込めませんでした。")}};
$("reset-save").onclick=()=>{if(confirm("セーブデータを削除して最初から始めますか？")){state=initial();save();location.reload()}};
document.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=>{}));
if("serviceWorker" in navigator && location.protocol.startsWith("http"))window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
save();updateHeader();renderDungeons();renderParty();renderItems();
})();