let mode='content', authMode='signup', currentUser=null, lastReply='';
if(localStorage.getItem('damiluxa_theme')==='dark') document.body.classList.add('dark');
function toggleTheme(){ document.body.classList.toggle('dark'); localStorage.setItem('damiluxa_theme', document.body.classList.contains('dark')?'dark':'light'); }
function openAuth(t){ authMode=t; document.getElementById('authTitle').innerText=t==='signup'?'Create Account':'Login'; document.getElementById('authName').style.display=t==='signup'?'block':'none'; document.getElementById('switchText').innerText=t==='signup'?'Already have account? Login':'No account? Sign Up'; document.getElementById('authModal').style.display='flex'; }
function closeAuth(){ document.getElementById('authModal').style.display='none'; }
function switchAuth(){ openAuth(authMode==='signup'?'login':'signup'); }
function forgotPassword(){ let e=prompt('Put your email:'); if(!e) return; e=e.trim().toLowerCase(); let u=JSON.parse(localStorage.getItem('damiluxa_users')||'{}'); if(!u[e]) return alert('No account. Sign Up first'); let n=prompt('Put NEW password:'); if(!n) return; u[e].pass=n; localStorage.setItem('damiluxa_users',JSON.stringify(u)); alert('Password changed ✅'); }
function doAuth(){ let n=document.getElementById('authName').value.trim(), e=document.getElementById('authEmail').value.trim().toLowerCase(), p=document.getElementById('authPass').value.trim(); if(!e||!p) return alert('Put email and password'); let users=JSON.parse(localStorage.getItem('damiluxa_users')||'{}'); if(authMode==='signup'){ if(!n) return alert('Put your name'); if(users[e]) return alert('Account don exist, login'); users[e]={name:n,pass:p}; localStorage.setItem('damiluxa_users',JSON.stringify(users)); currentUser={name:n,email:e}; } else { if(!users[e]||users[e].pass!==p) return alert('Wrong email or password'); currentUser={name:users[e].name,email:e}; } localStorage.setItem('damiluxa_current',JSON.stringify(currentUser)); closeAuth(); showDashboard(); }
function showDashboard(){ if(!currentUser) currentUser=JSON.parse(localStorage.getItem('damiluxa_current')||'null'); if(!currentUser) return openAuth('signup'); document.getElementById('landing').style.display='none'; document.getElementById('dashboard').style.display='block'; document.getElementById('authBtns').style.display='none'; document.getElementById('dashBtns').style.display='inline'; document.getElementById('welcomeText').innerText='Welcome, '+currentUser.name+' 👋'; updatePlanText(); loadHistory(); }
function logout(){ localStorage.removeItem('damiluxa_current'); currentUser=null; document.getElementById('landing').style.display='block'; document.getElementById('dashboard').style.display='none'; document.getElementById('authBtns').style.display='inline'; document.getElementById('dashBtns').style.display='none'; }
function quickMode(m){ setMode(m); showDashboard(); }
function setMode(m){ mode=m; document.querySelectorAll('.modes button').forEach(b=>b.classList.remove('active')); document.getElementById('btn-'+m).classList.add('active'); }
// PAYSTACK
function isPremium(){ return localStorage.getItem('damiluxa_premium_'+(currentUser?currentUser.email:''))==='yes'; }
function updatePlanText(){ let el=document.getElementById('planText'); if(el) el.innerText = isPremium() ? 'Plan: PREMIUM ⭐ Unlimited' : 'Plan: FREE (5 chats)'; }
function payPremium(){
  if(!currentUser) return openAuth('signup');
  // REPLACE pk_test_xxx WITH YOUR PAYSTACK PUBLIC KEY
  let handler=PaystackPop.setup({ key:'pk_test_xxxxxxxxxxxxxxxx', email:currentUser.email, amount:100000, currency:'NGN', ref:''+Math.floor(Math.random()*1000000000), onClose:function(){ alert('Payment cancelled'); }, callback:function(res){ localStorage.setItem('damiluxa_premium_'+currentUser.email,'yes'); updatePlanText(); alert('Payment successful! Welcome to PREMIUM ⭐'); } });
  handler.openIframe();
}
async function sendMsg(){
  let input=document.getElementById('userInput'); let text=input.value.trim(); if(!text) return;
  // FREE LIMIT CHECK
  let key='hist_'+currentUser.email; let arr=JSON.parse(localStorage.getItem(key)||'[]');
  if(!isPremium() && arr.length>=5){ if(confirm('Free 5 chats don finish! Upgrade to Premium ₦1,000 to continue?')) payPremium(); return; }
  let chat=document.getElementById('chat');
  chat.innerHTML+=`<div style="margin-bottom:10px"><b>You:</b> ${text}</div><div class="ai-msg" id="loading">DAMILUXA dey think... 🤔</div>`;
  input.value=''; chat.scrollTop=chat.scrollHeight;
  let reply=await getRealAIReply(text);
  lastReply=reply;
  document.getElementById('loading').outerHTML=`<div class="ai-msg"><b>DAMILUXA:</b>\n${reply}<div class="small-btns"><button onclick="copyReply()">📋 Copy</button><button onclick="speakReply()">🔊 Voice</button><button onclick="shareWhatsApp()">💚 WhatsApp</button></div></div>`;
  chat.scrollTop=chat.scrollHeight; saveHistory(text);
}
async function getRealAIReply(text){
  let low=text.toLowerCase().trim();
  if(low==='hi'||low==='hello'||low==='hey'||low==='good morning'||low==='good afternoon') return `Hello ${currentUser?currentUser.name:''} 👋 Welcome!\n\nI fit help you with:\n✍️ Content - "give me content idea for hair"\n📚 Study - click Study, type topic\n💼 Business - click Business, type your business\n\nTry am now!`;
  try{
    let prompt=`You are DAMILUXA AI, a friendly Nigerian AI assistant for content, study and business. Mode: ${mode}. User asks: ${text}. Answer in simple, helpful, Nigerian-friendly style with steps and example. Keep it under 300 words.`;
    let res=await fetch('https://text.pollinations.ai/'+encodeURIComponent(prompt));
    let data=await res.text();
    if(data && data.length>20) return data;
  }catch(e){}
  return getSmartReply(text); // fallback if internet fails
}
function copyReply(){ if(!lastReply) return alert('No reply yet'); navigator.clipboard.writeText(lastReply).then(()=>alert('Copied! ✅')); }
function speakReply(){ if(!lastReply) return alert('No reply yet'); window.speechSynthesis.cancel(); window.speechSynthesis.speak(new SpeechSynthesisUtterance(lastReply)); }
function shareWhatsApp(){ if(!lastReply) return alert('No reply yet'); window.open('https://wa.me/?text='+encodeURIComponent('Made with DAMILUXA AI:\n\n'+lastReply),'_blank'); }
function getSmartReply(text){ let t=text.toLowerCase(); if(mode==='business') return `🔥 ADVERT FOR: "${text}"\n\nHOOK: "Stop scrolling! If you want ${text}, this is for you."\n\nBODY: We help real people get real results. No stress.\n\n✅ Save time\n✅ Save money\n✅ Get results fast\n\nCTA: Comment "INTERESTED" and we go reply you!`; if(mode==='study') return `📚 STUDY: "${text}"\n\n1. Break am into small parts\n2. Teach am to someone\n3. Practice 5 questions\n\nYou go pass am! 💪`; return `✍️ CONTENT IDEA: "${text}"\n\nTITLE: "3 Things Nobody Tells You About ${text}"\n\nHOOK: "If you want ${text}, stop these 3 mistakes!"\n\n1. Rush am - do step by step\n2. No plan - write plan first\n3. Give up quick - consistency na secret\n\nCTA: Comment 'YES' for Part 2!`; }
function saveHistory(text){ if(!currentUser) return; let k='hist_'+currentUser.email; let a=JSON.parse(localStorage.getItem(k)||'[]'); a.unshift(text); localStorage.setItem(k,JSON.stringify(a)); loadHistory(); }
function loadHistory(){ if(!currentUser) return; let a=JSON.parse(localStorage.getItem('hist_'+currentUser.email)||'[]'); document.getElementById('countText').innerText=`You have created ${a.length} contents.`; document.getElementById('historyList').innerHTML=a.length?a.map(h=>`<div style="padding:8px;border-bottom:1px solid #eee">• ${h}</div>`).join(''):'No history yet'; }
function clearHistory(){ if(!currentUser) return; localStorage.removeItem('hist_'+currentUser.email); loadHistory(); document.getElementById('chat').innerHTML=''; }
let saved=localStorage.getItem('damiluxa_current'); if(saved){ currentUser=JSON.parse(saved); showDashboard(); }
if('serviceWorker' in navigator){ navigator.serviceWorker.register('sw.js'); }