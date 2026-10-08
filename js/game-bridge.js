/* جسر الألعاب المرفوعة مع حساب WebChat وSupabase */
window.gameBridge = (() => {
  const client = window.supabaseClient;
  let user = null, profile = null;
  function getBet(){ return Number(new URLSearchParams(location.search).get('bet')||100); }
  async function ready(){
    if(!client) throw new Error('تعذر تهيئة اتصال الحساب');
    const {data,error}=await client.auth.getUser();
    if(error||!data.user) { location.href='../index.html'; throw new Error('يجب تسجيل الدخول أولاً'); }
    user=data.user;
    const {data:p,error:pe}=await client.from('profiles').select('id,coins,display_name,username').eq('id',user.id).single();
    if(pe) throw pe; profile=p;
    document.querySelectorAll('[data-game-balance]').forEach(el=>el.textContent=Number(p.coins||0).toLocaleString('ar-EG'));
    return {user,profile:p};
  }
  async function debit(game,amount,matchId=null){
    await ready();
    const {data,error}=await client.rpc('uploaded_game_debit',{p_game:game,p_amount:Number(amount),p_match:matchId});
    if(error) { alert(error.message.includes('insufficient_coins')?'رصيدك لا يكفي لبدء هذه الجولة.':'تعذر خصم الرهان: '+error.message); return null; }
    const remaining=Number(data.remaining_coins); document.querySelectorAll('[data-game-balance]').forEach(el=>el.textContent=remaining.toLocaleString('ar-EG')); return remaining;
  }
  async function credit(game,amount,matchId=null){
    await ready();
    const {data,error}=await client.rpc('uploaded_game_credit',{p_game:game,p_amount:Number(amount),p_match:matchId});
    if(error) return null; const value=Number(amount); document.querySelectorAll('[data-game-balance]').forEach(el=>el.textContent='تمت الإضافة'); if(value>=300) await client.rpc('publish_game_win',{p_game:game,p_amount:value,p_room:new URLSearchParams(location.search).get('room')||null}); return value;
  }
  function subscribe(matchId,handler){ return client.channel('game-match-'+matchId).on('postgres_changes',{event:'INSERT',schema:'public',table:'game_events',filter:'match_id=eq.'+matchId},payload=>handler(payload.new)).subscribe(); }
  async function event(matchId,type,payload){ await ready(); return client.from('game_events').insert({match_id:matchId,user_id:user.id,event_type:type,payload}); }
  function mountChat(matchId){if(!matchId||document.getElementById('webchat-game-chat'))return;const box=document.createElement('aside');box.id='webchat-game-chat';box.innerHTML='<b>دردشة المباراة</b><div class="wg-messages"></div><div class="wg-compose"><input placeholder="اكتب رسالة..." maxlength="240"><button>إرسال</button></div>';Object.assign(box.style,{position:'fixed',right:'18px',bottom:'18px',width:'280px',zIndex:9999,background:'#101722f5',color:'#fff',border:'1px solid #d8ad4c88',borderRadius:'16px',padding:'12px',fontFamily:'system-ui',boxShadow:'0 14px 40px #0008'});const messages=box.querySelector('.wg-messages');Object.assign(messages.style,{height:'150px',overflow:'auto',margin:'8px 0',fontSize:'13px'});const input=box.querySelector('input');const send=async()=>{const text=input.value.trim();if(!text)return;input.value='';await event(matchId,'game_chat',{text});messages.insertAdjacentHTML('beforeend',`<div><b>أنت:</b> ${text.replace(/[<>&]/g,'')}</div>`);messages.scrollTop=messages.scrollHeight;};box.querySelector('button').onclick=send;input.onkeydown=e=>{if(e.key==='Enter')send();};document.body.appendChild(box);client.channel('game-chat-'+matchId).on('postgres_changes',{event:'INSERT',schema:'public',table:'game_events',filter:'match_id=eq.'+matchId},p=>{if(p.new.event_type!=='game_chat'||p.new.user_id===user.id)return;const t=p.new.payload?.text||'';messages.insertAdjacentHTML('beforeend',`<div><b>مستخدم:</b> ${t.replace(/[<>&]/g,'')}</div>`);messages.scrollTop=messages.scrollHeight;}).subscribe();}
  return {ready,debit,credit,subscribe,event,mountChat,getBet,get profile(){return profile},get user(){return user}};
})();
