'use client';

import {useEffect,useRef,useState,type FormEvent} from 'react';
import Link from 'next/link';
import {INTROVERT_CATEGORIES} from '../../lib/introvert-prompts';

type DemoMessage={
 id:number;
 kind:'you'|'guest'|'prompt';
 body:string;
 category?:string;
};

const SAMPLE_CHATS:DemoMessage[][]=[
 [
  {id:1,kind:'guest',body:"Hi there! ☕ I'm never quite sure how to start a conversation."},
  {id:2,kind:'you',body:"Same here. It's nice to say hello though!"},
  {id:3,kind:'guest',body:"Definitely. We can take our time."},
 ],
 [
  {id:1,kind:'guest',body:"Hello! Hope you're having a nice day. 🌿"},
  {id:2,kind:'you',body:"Hey! I could use a little conversation."},
  {id:3,kind:'guest',body:"Me too. No pressure to be an expert texter!"},
 ],
 [
  {id:1,kind:'guest',body:"Hey there! Have you tried one of the chat starter questions?"},
  {id:2,kind:'you',body:"Not yet, but I'm curious."},
  {id:3,kind:'guest',body:"They're a nice way to avoid the awkward first hello."},
 ],
];

export default function ChatPreview(){
 const [introvertOn,setIntrovertOn]=useState(false);
 const [categoryId,setCategoryId]=useState('everyday');
 const [promptIndex,setPromptIndex]=useState(0);
 const [messages,setMessages]=useState<DemoMessage[]>(SAMPLE_CHATS[0]);
 const [draft,setDraft]=useState('');
 const [ended,setEnded]=useState(false);
 const [sampleIndex,setSampleIndex]=useState(0);
 const [notice,setNotice]=useState('');
 const nextId=useRef(4);
 const messageListRef=useRef<HTMLDivElement>(null);
 const composerRef=useRef<HTMLTextAreaElement>(null);

 const category=INTROVERT_CATEGORIES.find(item=>item.id===categoryId)||INTROVERT_CATEGORIES[0];
 const currentPrompt=category.prompts[promptIndex%category.prompts.length];

 useEffect(()=>{
  if(messageListRef.current){
   messageListRef.current.scrollTop=messageListRef.current.scrollHeight;
  }
 },[messages.length]);

 function append(kind:DemoMessage['kind'],body:string,selectedCategory?:string){
  const id=nextId.current++;
  setMessages(old=>[...old,{id,kind,body,category:selectedCategory}]);
 }

 function send(e:FormEvent<HTMLFormElement>){
  e.preventDefault();
  if(ended||!draft.trim())return;
  append('you',draft.trim());
  setDraft('');
  setNotice('Your demo message appears here only. No real person received it.');
 }

 function showAnother(){
  setPromptIndex(index=>(index+1)%category.prompts.length);
  setNotice('');
 }

 function share(){
  if(ended)return;
  append('prompt',currentPrompt,category.label);
  setNotice('This is how a shared icebreaker would appear to both chatters. The demo stays on this screen.');
 }

 function useAsDraft(){
  if(ended)return;
  setDraft(currentPrompt);
  setNotice('Question copied into your message box. You can change it before pressing Send.');
  composerRef.current?.focus();
 }

 function freshSample(){
  const next=(sampleIndex+1)%SAMPLE_CHATS.length;
  setSampleIndex(next);
  setMessages(SAMPLE_CHATS[next]);
  nextId.current=4;
  setDraft('');
  setEnded(false);
  setNotice('A new fictional conversation has started. You are still in the demo.');
 }

 function endDemo(){
  setEnded(true);
  setIntrovertOn(false);
  setNotice('The demo has ended. No messages were sent to another person.');
 }

 return <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
   <div>
    <p className="text-sm font-bold text-[#326b49]">☘ LONELY NO LONGER · INTERACTIVE PREVIEW</p>
    <h1 className="mt-2 font-serif text-3xl font-bold text-[#153f30] sm:text-4xl">See how a friendly chat could feel.</h1>
    <p className="mt-2 max-w-2xl text-[#52675a]">Try typing a message or turn on Introvert Mode for a gentle conversation starter.</p>
   </div>
   <Link href="/" className="text-sm font-semibold text-[#185435] underline underline-offset-2">Back home</Link>
  </div>

  <div className="mb-5 rounded-2xl border border-[#efd5a9] bg-[#fff3de] px-5 py-4 text-sm text-[#69491d]" role="note">
   <strong>Demo only — you are not connected to another person.</strong>
   <span className="mt-1 block">The other chatter and messages are fictional. Anything you type stays in this browser session and is not saved or sent online.</span>
  </div>

  <section aria-label="Sample one-to-one chat" className="overflow-hidden rounded-3xl border border-[#cbdcc9] bg-white shadow-sm">
   <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d3e1d2] bg-[#eaf1e6] px-4 py-4 sm:px-6">
    <div>
     <h2 className="font-bold text-[#174a34]">☕ You + Sample Visitor</h2>
     <p className="mt-1 text-xs text-[#56705e]">Fictional conversation · No real match</p>
    </div>
    <div className="flex flex-wrap items-center gap-2">
     <button type="button" role="switch" aria-checked={introvertOn} aria-label="Introvert Mode"
      onClick={()=>{setIntrovertOn(on=>!on);setNotice('');}}
      disabled={ended}
      className={'inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-colors disabled:opacity-50 '+(introvertOn?'bg-[#185435] text-white':'border border-[#8ba890] bg-white text-[#185435] hover:bg-[#edf4e9]')}>
      <span aria-hidden="true">🌿</span> Introvert Mode <span className="text-xs opacity-80">{introvertOn?'On':'Off'}</span>
     </button>
     <button type="button" className="btn-secondary rounded-xl text-sm" onClick={freshSample}>Next person <span className="ml-1 text-xs opacity-75">(demo)</span></button>
     <button type="button" className="btn rounded-xl text-sm" onClick={endDemo} disabled={ended}>End chat</button>
    </div>
   </div>

   <div ref={messageListRef} role="log" aria-label="Sample conversation messages" aria-live="polite" aria-relevant="additions"
    className="h-[min(45vh,420px)] min-h-64 space-y-4 overflow-y-auto bg-[#fbfaf5] px-4 py-6 sm:px-6">
    {messages.map(m=>m.kind==='prompt'
     ? <div key={m.id} className="mx-auto max-w-md rounded-2xl border border-[#b5cfb7] bg-[#eaf4e7] px-4 py-4 text-center">
       <p className="text-xs font-bold uppercase tracking-wide text-[#345e42]">🌿 Shared icebreaker · {m.category} · Demo</p>
       <p className="mt-2 font-semibold text-[#1b4732]">{m.body}</p>
       <p className="mt-2 text-xs text-[#52675a]">In a real chat, both people would see this.</p>
      </div>
     : <div key={m.id} className={'flex '+(m.kind==='you'?'justify-end':'justify-start')}>
       <div className={'max-w-[88%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[74%] '+(m.kind==='you'?'rounded-br-sm bg-[#206242] text-white':'rounded-bl-sm border border-[#e3dfd4] bg-white text-[#263a2d]')}>
        <p className="mb-1 text-xs font-bold opacity-75">{m.kind==='you'?'You':'Sample Visitor · fictional'}</p>
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed sm:text-base">{m.body}</p>
       </div>
      </div>
    )}
   </div>

   {introvertOn&&!ended&&<section aria-label="Introvert Mode conversation starters" className="border-t border-[#dce7d9] bg-[#f2f7ef] p-4 sm:p-6">
    <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
     <div><h3 className="font-serif text-xl font-bold text-[#174a34]">🌿 Need a little help starting?</h3>
      <p className="mt-1 text-sm text-[#53695b]">Pick a vibe. Skip anything you don't fancy — no pressure.</p></div>
     <button type="button" className="text-sm font-semibold text-[#23583a] underline" onClick={()=>setIntrovertOn(false)}>Hide prompts</button>
    </div>
    <div className="flex flex-wrap gap-2" role="group" aria-label="Conversation starter categories">
     {INTROVERT_CATEGORIES.map(item=><button type="button" key={item.id}
      aria-pressed={categoryId===item.id}
      onClick={()=>{setCategoryId(item.id);setPromptIndex(0);setNotice('');}}
      className={'min-h-11 rounded-full border px-3 py-2 text-sm font-semibold '+(categoryId===item.id?'border-[#185435] bg-[#185435] text-white':'border-[#a6bda7] bg-white text-[#305540] hover:bg-[#e4efe0]')}>
      {item.icon} {item.label}</button>)}
    </div>
    <div className="mt-4 rounded-2xl border border-[#cddfc9] bg-white p-4 sm:p-5">
     <p className="text-xs font-bold uppercase tracking-wider text-[#56705f]">{category.icon} {category.label} · {category.description}</p>
     <p className="mt-2 text-lg font-semibold text-[#1b4732]">{currentPrompt}</p>
     <div className="mt-4 flex flex-wrap gap-2">
      <button type="button" className="btn-secondary rounded-xl text-sm" onClick={showAnother}>↻ Another idea</button>
      <button type="button" className="btn-secondary rounded-xl text-sm" onClick={useAsDraft}>Use as my draft</button>
      <button type="button" className="btn rounded-xl text-sm" onClick={share}>Show shared question</button>
     </div>
     <p className="mt-3 text-xs text-[#66796c]">Questions are optional. Sharing here adds a sample card to this demo, not to a real conversation.</p>
    </div>
   </section>}

   {ended
    ? <div className="border-t border-[#dce7d9] bg-[#eef5eb] px-4 py-5 text-center" role="status">
      <p className="font-bold text-[#174a34]">Demo conversation ended 🌿</p>
      <button type="button" className="btn mt-3 rounded-xl" onClick={freshSample}>Start another sample chat</button>
     </div>
    : <form onSubmit={send} className="flex items-end gap-3 border-t border-[#d3e1d2] bg-[#eaf1e6] p-3 sm:p-5">
      <label htmlFor="demo-chat-message" className="sr-only">Write a demo message</label>
      <textarea ref={composerRef} id="demo-chat-message" rows={2} maxLength={500}
       value={draft} onChange={e=>setDraft(e.target.value)}
       onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();e.currentTarget.form?.requestSubmit();}}}
       className="min-w-0 flex-1 resize-none rounded-xl border border-[#a8c1ad] bg-white px-4 py-3 text-base"
       placeholder="Type a message just to try it…"/>
      <button type="submit" className="btn min-h-12 rounded-xl" disabled={!draft.trim()}>Send</button>
     </form>
   }
  </section>

  {notice&&<p role="status" className="mt-4 rounded-xl border border-[#cddfc9] bg-[#eaf4e7] px-4 py-3 text-sm text-[#285138]">{notice}</p>}
  <p className="mt-6 text-center text-sm text-[#52675a]">This preview doesn't save messages, contact another visitor or make safety reports. <Link href="/safety" className="font-semibold underline">Read our safety guidance</Link>.</p>
 </div>;
}
