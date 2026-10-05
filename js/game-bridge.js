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
    if(error) return null; const value=Number(amount); document.querySelectorAll('[data-game-balance]').forEach(el=>el.textContent='تمت الإضافة'); return value;
  }
  function subscribe(matchId,handler){ return client.channel('game-match-'+matchId).on('postgres_changes',{event:'INSERT',schema:'public',table:'game_events',filter:'match_id=eq.'+matchId},payload=>handler(payload.new)).subscribe(); }
  async function event(matchId,type,payload){ await ready(); return client.from('game_events').insert({match_id:matchId,user_id:user.id,event_type:type,payload}); }
  return {ready,debit,credit,subscribe,event,getBet,get profile(){return profile},get user(){return user}};
})();
