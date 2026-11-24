'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import Link from 'next/link';

type Stage='intro'|'waiting'|'connected'|'ended';
type Match={state:'waiting'|'connected'|'ended';room_id?:string};
type ChatMessage={id:number;body:string;mine:boolean;created_at:string};
const gateway=process.env.NEXT_PUBLIC_PUBLIC_CHAT_GATEWAY_URL||'';

export default function PublicChat(){
 const [adult,setAdult]=useState(false);
 const [rules,setRules]=useState(false);
 const [stage,setStage]=useState<Stage>('intro');
 const [roomId,setRoomId]=useState<string|null>(null);
 const [messages,setMessages]=useState<ChatMessage[]>([]);
 const [body,setBody]=useState('');
 const [error,setError]=useState('');
 const [notice,setNotice]=useState('');
 const [reportOpen,setReportOpen]=useState(false);
 const [reportTarget,setReportTarget]=useState<number|null>(null);
 const [reportReason,setReportReason]=useState('harassment');
 const [busy,setBusy]=useState(false);
 const tokenRef=useRef('');
 const roomRef=useRef<string|null>(null);
 const lastRoomRef=useRef<string|null>(null);
 const lastMessageRef=useRef(0);
 const bottomRef=useRef<HTMLDivElement>(null);
 const reportHeadingRef=useRef<HTMLHeadingElement>(null);
 const activeRef=useRef(true);
 const busyRef=useRef(false);
 const call=useCallback(async <T,>(action:string,extra:Record<string,unknown>={}):Promise<T>=>{
   if(!gateway)throw Error('Public chat is not available yet.');
   const response=await fetch(gateway,{method:'POST',headers:{'content-type':'application/json'},
     body:JSON.stringify({action,...(tokenRef.current?{token:tokenRef.current}:{}),...extra}),cache:'no-store'});
   const data=await response.json().catch(()=>({error:'Unable to reach chat'}));
   if(!response.ok)throw Error(typeof data.error==='string'?data.error:'Chat unavailable');
   return data as T;
 },[]);
 const applyMatch=useCallback((result:Match)=>{
   if(!activeRef.current)return;
   if(result.state==='connected'&&result.room_id){
     if(roomRef.current!==result.room_id){
       roomRef.current=result.room_id;lastRoomRef.current=result.room_id;setRoomId(result.room_id);setMessages([]);lastMessageRef.current=0;
     }
     setStage('connected');
   }else if(result.state==='waiting'){
     roomRef.current=null;setRoomId(null);setStage('waiting');
   }else{
     roomRef.current=null;setRoomId(null);setStage('ended');
   }
 },[]);
 useEffect(()=>{
   activeRef.current=true;
   return()=>{activeRef.current=false;};
 },[]);
 useEffect(()=>{
   if(!tokenRef.current||(stage!=='waiting'&&stage!=='connected'))return;
   let cancelled=false;
   const poll=async()=>{
     if(busyRef.current||cancelled)return;
     busyRef.current=true;
     try{
       const status=await call<Match>('state');
       if(cancelled)return;
       applyMatch(status);
       if(status.state!=='connected'||!status.room_id)return;
       const result=await call<{messages:ChatMessage[]}>('messages',{
         room_id:status.room_id,after_id:lastMessageRef.current});
       if(cancelled||roomRef.current!==status.room_id)return;
       if(Array.isArray(result.messages)&&result.messages.length){
         const fresh=result.messages.filter(m=>Number.isSafeInteger(m.id)&&m.id>lastMessageRef.current);
         if(fresh.length){lastMessageRef.current=fresh[fresh.length-1].id;
           setMessages(old=>[...old,...fresh].slice(-100));}
       }
       setError('');
     }catch(err){if(!cancelled){
       const message=err instanceof Error?err.message:'Unable to connect';
       if(message==='Session unavailable'||message.includes('adults-only')){
         tokenRef.current='';setStage('ended');setRoomId(null);roomRef.current=null;
       }
       setError(message);
     }}finally{busyRef.current=false;}
   };
   void poll();
   const timer=setInterval(()=>void poll(),2500);
   return()=>{cancelled=true;clearInterval(timer);};
 },[stage,roomId,call,applyMatch]);
 useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:'smooth',block:'end'});},[messages.length]);
 useEffect(()=>{if(reportOpen)reportHeadingRef.current?.focus();},[reportOpen]);
 async function start(e:React.FormEvent){
   e.preventDefault();if(busy||!adult||!rules||!gateway)return;
   setBusy(true);setError('');
   try{
     const session=await call<{token:string}>('start',{adult:true,agree_rules:true});
     if(!/^[a-f0-9]{64}$/.test(session.token))throw Error('Invalid session response');
     tokenRef.current=session.token;
     applyMatch(await call<Match>('match'));
   }catch(err){setError(err instanceof Error?err.message:'Unable to start');}
   finally{setBusy(false);}
 }
 async function next(){
   setReportOpen(false);setNotice('');
   if(busy||!tokenRef.current)return;
   setBusy(true);setError('');
   try{
     await call<{ok:boolean}>('leave',{end:false});
     roomRef.current=null;setRoomId(null);setMessages([]);lastMessageRef.current=0;
     applyMatch(await call<Match>('match'));
   }catch(err){setError(err instanceof Error?err.message:'Unable to find another chat');}
   finally{setBusy(false);}
 }
 async function end(){
   setReportOpen(false);setNotice('');
   if(busy)return;
   setBusy(true);setError('');
   try{
     if(tokenRef.current)await call<{ok:boolean}>('leave',{end:true});
     tokenRef.current='';roomRef.current=null;setRoomId(null);setMessages([]);
     lastMessageRef.current=0;setStage('ended');
   }catch(err){setError(err instanceof Error?err.message:'Unable to end chat');}
   finally{setBusy(false);}
 }
 function openReport(messageId:number|null){
   if(!tokenRef.current||!(roomRef.current||lastRoomRef.current))return;
   setReportTarget(messageId);setReportReason('harassment');setReportOpen(true);setError('');
 }
 async function submitReport(e:React.FormEvent){
   e.preventDefault();if(busy||!tokenRef.current)return;
   const targetRoom=roomRef.current||lastRoomRef.current;
   if(!targetRoom)return;
   setBusy(true);setError('');
   try{
     await call<{ok:boolean}>('report',{
       room_id:targetRoom,message_id:reportTarget,reason:reportReason});
     setReportOpen(false);setNotice('Your report has been recorded for review.');
   }catch(err){setError(err instanceof Error?err.message:'Unable to report');}
   finally{setBusy(false);}
 }
 async function blockVisitor(){
   if(busy||!tokenRef.current||!roomRef.current)return;
   if(!window.confirm('Block this visitor and leave this conversation?'))return;
   setBusy(true);setError('');setReportOpen(false);
   try{
     await call<{ok:boolean}>('block',{room_id:roomRef.current});
     roomRef.current=null;setRoomId(null);setMessages([]);
     lastMessageRef.current=0;setStage('ended');
     setNotice('This visitor is blocked for the rest of your current anonymous session.');
   }catch(err){setError(err instanceof Error?err.message:'Unable to block visitor');}
   finally{setBusy(false);}
 }
 async function send(e:React.FormEvent){
   e.preventDefault();if(busy||!body.trim()||!roomRef.current)return;
   setBusy(true);setError('');
   try{
     await call<{id:number}>('send',{room_id:roomRef.current,body});
     setBody('');
     const result=await call<{messages:ChatMessage[]}>('messages',{
       room_id:roomRef.current,after_id:lastMessageRef.current});
     if(Array.isArray(result.messages)&&result.messages.length){
       const fresh=result.messages.filter(m=>Number.isSafeInteger(m.id)&&m.id>lastMessageRef.current);
       if(fresh.length){lastMessageRef.current=fresh[fresh.length-1].id;
         setMessages(old=>[...old,...fresh].slice(-100));}
     }
   }catch(err){setError(err instanceof Error?err.message:'Unable to send message');}
   finally{setBusy(false);}
 }
 return <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
   <div className="mb-7"><span className="rounded-full bg-[#e5efdf] px-4 py-2 text-sm font-semibold text-[#205338]">☘ Lonely No Longer · Anonymous one-to-one chat</span>
     <h1 className="mt-5 font-serif text-4xl font-bold text-[#153f30] sm:text-5xl">Come as you are. Say hello.</h1>
     <p className="mt-3 max-w-2xl text-[#52675a]">No account, name or profile. A calm place for two adults to have a kind conversation.</p>
   </div>
   {stage==='intro'&&<section className="panel mx-auto max-w-2xl" aria-labelledby="welcome-heading">
     <h2 id="welcome-heading" className="font-serif text-2xl font-bold text-[#153f30]">Before you say hello ☕</h2>
     <p className="mt-2 text-[#52675a]">We ask everyone to read these rules first.</p>
     <form onSubmit={start} className="mt-6 space-y-5">
       <label className="flex cursor-pointer items-start gap-3"><input type="checkbox" className="mt-1 h-5 w-5 accent-[#185435]" checked={adult} onChange={e=>setAdult(e.target.checked)}/><span><strong>I confirm I am 18 or older.</strong><span className="block text-sm text-[#52675a]">This is self-declaration, not independent age verification.</span></span></label>
       <label className="flex cursor-pointer items-start gap-3"><input type="checkbox" className="mt-1 h-5 w-5 accent-[#185435]" checked={rules} onChange={e=>setRules(e.target.checked)}/><span><strong>I agree to be kind and protect my privacy.</strong><span className="block text-sm text-[#52675a]">No links, contact details, harassment or sexual content. <Link href="/rules" className="underline">Community rules</Link>, <Link href="/privacy" className="underline">privacy</Link> and <Link href="/safety" className="underline">safety advice</Link>.</span></span></label>
       {!gateway&&<p className="rounded-xl border border-[#ead7b1] bg-[#fff7e8] p-4 text-sm text-[#78572b]">Public matching is not open yet. <Link href="/chat-preview" className="font-semibold underline">Try the interactive chat demo with Introvert Mode</Link> instead.</p>}
       <button type="submit" disabled={!gateway||!adult||!rules||busy} className="btn w-full rounded-xl py-4 text-lg">{busy?'Connecting…':'Start an anonymous chat'}</button>
     </form>
   </section>}
   {(stage==='waiting'||stage==='connected')&&<section aria-label="Anonymous conversation" aria-busy={busy} className="overflow-hidden rounded-3xl border border-[#cfddcf] bg-white shadow-sm">
     <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dce7dc] bg-[#eaf1e6] px-4 py-4 sm:px-6">
       <div><h2 className="text-lg font-bold text-[#174a34]">☘ Your conversation</h2><p className="text-sm text-[#536d5a]" role="status">{stage==='waiting'?'Finding someone to talk to…':'Connected to one other visitor · Text only'}</p></div>
       <div className="flex flex-wrap gap-2">
         {stage==='connected'&&<><button type="button" onClick={()=>openReport(null)} disabled={busy} className="btn-secondary text-sm">Report chat</button>
         <button type="button" onClick={()=>void blockVisitor()} disabled={busy} className="btn-secondary text-sm">Block &amp; leave</button></>}
         <button type="button" onClick={()=>void next()} disabled={busy} className="btn-secondary text-sm">Next person</button>
         <button type="button" onClick={()=>void end()} disabled={busy} className="btn text-sm">End chat</button></div>
     </div>
     {stage==='waiting'?<div className="flex min-h-80 flex-col items-center justify-center px-6 py-16 text-center"><div aria-hidden="true" className="text-5xl">☕</div><h3 className="mt-5 text-2xl font-bold">A friendly hello is on its way.</h3><p className="mt-3 max-w-md text-[#52675a]">We're looking for another available visitor. You can end the search at any time.</p></div>:
       <><div className="h-[min(56vh,550px)] min-h-72 space-y-4 overflow-y-auto bg-[#fbfaf5] p-4 sm:p-6" role="log" aria-label="Chat messages" aria-live="polite" aria-relevant="additions text">
         {messages.length===0&&<p className="py-12 text-center text-[#52675a]">You're connected. A simple “hello” is a lovely start!</p>}
         {messages.map(m=><div key={m.id} className={'flex '+(m.mine?'justify-end':'justify-start')}><div className={'max-w-[90%] rounded-2xl px-4 py-3 sm:max-w-[75%] '+(m.mine?'bg-[#226343] text-white':'border border-[#dfdfd4] bg-white text-[#293a2d]')}><p className="mb-1 text-xs font-semibold opacity-80">{m.mine?'You':'Other visitor'}</p><p className="whitespace-pre-wrap break-words">{m.body}</p>
           {!m.mine&&<button type="button" className="mt-2 text-xs font-semibold underline underline-offset-2" disabled={busy} onClick={()=>openReport(m.id)} aria-label={`Report message ${m.id}`}>Report message</button>}</div></div>)}
         <div ref={bottomRef}/>
       </div><form onSubmit={send} className="flex items-end gap-3 border-t border-[#dce7dc] bg-[#eaf1e6] p-3 sm:p-5"><label htmlFor="public-chat-message" className="sr-only">Write your message</label><textarea id="public-chat-message" rows={2} maxLength={500} value={body} onChange={e=>setBody(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();e.currentTarget.form?.requestSubmit();}}} placeholder="Write a kind message…" className="min-w-0 flex-1 resize-none rounded-xl border border-[#b9cdbb] bg-white p-3 text-base"/><button className="btn min-h-12 rounded-xl" type="submit" disabled={busy||!body.trim()}>Send</button></form></>}
   </section>}
   {stage==='ended'&&<section className="panel mx-auto max-w-2xl text-center"><div aria-hidden="true" className="text-5xl">🌿</div><h2 className="mt-5 font-serif text-3xl font-bold">Conversation ended</h2><p className="mt-3 text-[#52675a]">Thanks for stopping by. You can choose to find someone else or return home.</p><div className="mt-6 flex flex-wrap justify-center gap-3">{tokenRef.current&&<button type="button" onClick={()=>void next()} disabled={busy} className="btn">Find someone else</button>}{tokenRef.current&&lastRoomRef.current&&<button type="button" onClick={()=>openReport(null)} disabled={busy} className="btn-secondary">Report previous chat</button>}<Link href="/" className="btn-secondary">Back home</Link></div></section>}
   {reportOpen&&<form onSubmit={submitReport} className="panel mx-auto mt-5 max-w-2xl" aria-labelledby="report-heading">
     <h2 ref={reportHeadingRef} tabIndex={-1} id="report-heading" className="text-xl font-bold text-[#174a34]">Report a concern</h2>
     <p className="mt-2 text-sm text-[#52675a]">Reports are submitted for human review. A report alone does not automatically ban anyone.</p>
     <label htmlFor="report-reason" className="mt-4 block font-semibold">Why are you reporting?</label>
     <select id="report-reason" value={reportReason} onChange={e=>setReportReason(e.target.value)} className="mt-2 w-full rounded-lg border border-[#b9cdbb] bg-white p-3">
       <option value="underage">Someone may be under 18</option>
       <option value="grooming">Grooming or manipulation</option>
       <option value="harassment">Harassment or bullying</option>
       <option value="threat">Threats or intimidation</option>
       <option value="sexual_content">Sexual content</option>
       <option value="personal_info">Sharing or requesting personal details</option>
       <option value="spam">Spam or advertising</option>
       <option value="other">Other safety concern</option>
     </select>
     <div className="mt-4 flex flex-wrap gap-3"><button className="btn" disabled={busy} type="submit">Submit report</button>
       <button type="button" disabled={busy} onClick={()=>setReportOpen(false)} className="btn-secondary">Cancel</button></div>
   </form>}
   {notice&&<p role="status" className="mx-auto mt-5 max-w-2xl rounded-xl border border-[#cddcc9] bg-[#e9f3e6] p-4 text-sm text-[#21533c]">{notice}</p>}
   {error&&<p role="alert" className="mx-auto mt-5 max-w-2xl rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
   <p className="mt-7 text-center text-sm text-[#52675a]">Do not share identifying information. This is not a crisis service. Emergency: 112 / 999 · Samaritans: 116 123.</p>
 </div>;
}
