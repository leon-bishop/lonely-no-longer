import Link from 'next/link';
export default function Home(){
 return <div className="mx-auto max-w-5xl px-5 py-12 sm:py-20">
  <span className="inline-block rounded-full bg-[#e5efdf] px-4 py-2 text-sm font-semibold text-[#205338]">☘ A little company goes a long way</span>
  <h1 className="mt-7 max-w-3xl font-serif text-4xl font-bold leading-tight text-[#153f30] sm:text-6xl">A good chat can change your day.</h1>
  <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[#52675a]">No profiles. No awkward introductions. Just two people, some kindness, and maybe a laugh over a cup of tea.</p>
  <section aria-label="Public chat development status" className="mt-9 rounded-3xl border border-[#cddcc9] bg-white p-6 shadow-sm sm:p-9">
   <p className="inline-flex rounded-full bg-[#fff1de] px-3 py-1 text-xs font-bold text-[#725028]">Development preview · Public chat not accepting visitors</p>
   <h2 className="mt-4 font-serif text-2xl font-bold text-[#153f30]">Come and see what we're building ☕</h2>
   <p className="mt-3 max-w-2xl text-[#52675a]">Our anonymous, text-only one-to-one chat is being prepared for adults. We’re working on moderation, privacy and testing before opening to visitors.</p>
   <div className="mt-6 flex flex-wrap items-center gap-4">
    <Link href="/chat-preview" className="btn rounded-xl">See the chat preview</Link>
    <Link href="/safety" className="btn-secondary rounded-xl">How to stay safe</Link>
   </div>
   <p className="mt-4 text-sm text-[#52675a]">Try the interactive demo with a fictional chat partner and optional Introvert Mode. Real matching is not open yet; the demo never sends or saves messages.</p>
  </section>
  <section aria-labelledby="how-it-works" className="mt-12">
   <h2 id="how-it-works" className="font-serif text-3xl font-bold text-[#153f30]">Good company. Simple steps.</h2>
   <div className="mt-5 grid gap-4 sm:grid-cols-3">
    <div className="rounded-2xl border border-[#d7e2d7] bg-[#f6faf2] p-5"><p aria-hidden="true" className="text-3xl">🌿</p><h3 className="mt-3 text-lg font-bold">1. Read the rules</h3><p className="mt-2 text-sm text-[#52675a]">Adults only. Keep your details private and treat people kindly.</p></div>
    <div className="rounded-2xl border border-[#d7e2d7] bg-[#f6faf2] p-5"><p aria-hidden="true" className="text-3xl">☕</p><h3 className="mt-3 text-lg font-bold">2. Find someone</h3><p className="mt-2 text-sm text-[#52675a]">A future chat will pair two available anonymous visitors.</p></div>
    <div className="rounded-2xl border border-[#d7e2d7] bg-[#f6faf2] p-5"><p aria-hidden="true" className="text-3xl">♡</p><h3 className="mt-3 text-lg font-bold">3. Chat at your pace</h3><p className="mt-2 text-sm text-[#52675a]">Say hello, report concerns, or end the conversation whenever you wish.</p></div>
   </div>
  </section>
  <p className="mt-11 text-center text-sm text-[#52675a]">Immediate danger in Ireland: 112 / 999 · Samaritans: 116 123. We are not a crisis service.</p>
 </div>;
}
