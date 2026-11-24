import './globals.css';
import Link from 'next/link';
export const metadata={
 title:'Lonely No Longer | Someone to talk to',
 description:'A friendly anonymous one-to-one text-chat project for adults in Ireland. Public chat is under development.',
};
export default function Layout({children}:{children:React.ReactNode}){
 return <html lang="en-IE"><body className="min-h-screen">
  <a className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:rounded-lg focus:bg-white focus:p-3" href="#main">Skip to main content</a>
  <header className="border-b border-[#e8e5da] bg-[#fffaf0]">
   <nav aria-label="Main navigation" className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-5">
    <Link href="/" className="text-xl font-black tracking-tight text-[#174a34]">♡ Lonely No Longer</Link>
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm font-semibold">
     <Link href="/chat-preview" className="hover:underline">Chat preview</Link>
     <Link href="/safety" className="hover:underline">Stay safe</Link>
     <Link href="/rules" className="hover:underline">Rules</Link>
     <Link href="/privacy" className="hover:underline">Privacy</Link>
    </div>
   </nav>
  </header>
  <main id="main" tabIndex={-1}>{children}</main>
  <footer className="mx-auto mt-12 flex max-w-6xl flex-wrap gap-x-5 gap-y-3 border-t border-[#d9e3da] px-5 py-8 text-sm text-[#4b6156]">
   <span>Made for connection in Ireland.</span>
   <Link href="/privacy" className="underline">Privacy</Link>
   <Link href="/terms" className="underline">Terms</Link>
   <Link href="/rules" className="underline">Community rules</Link>
   <Link href="/accessibility" className="underline">Accessibility</Link>
   <span>Not an emergency or counselling service.</span>
  </footer>
 </body></html>;
}
