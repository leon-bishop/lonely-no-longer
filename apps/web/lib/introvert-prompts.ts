/**
 * Curated conversation starters for the optional Introvert Mode demo.
 * Static prompts: no profiling, third-party generation, or chat transcripts.
 * Future live-room sharing must go through server-side membership and safety checks.
 */
export type IntrovertCategory={
 id:string;
 label:string;
 icon:string;
 description:string;
 prompts:readonly string[];
};

export const INTROVERT_CATEGORIES:readonly IntrovertCategory[]=[
 {
  id:'everyday',label:'Everyday',icon:'☕',description:'Easy, ordinary things to chat about.',
  prompts:[
   "Tea, coffee, or something completely different?",
   "What's a tiny win you've had this week?",
   "What's your ideal lazy Sunday?",
   "Do you prefer rainy days or sunny ones?",
   "What's the most comforting snack?",
   "What's one boring task you secretly enjoy?",
  ],
 },
 {
  id:'interesting',label:'Interesting',icon:'✨',description:'A little curious, never too personal.',
  prompts:[
   "If you could learn any skill overnight, what would it be?",
   "What's a fact that surprised you recently?",
   "Would you rather explore deep space or the deep ocean?",
   "What's a small mystery you'd love answered?",
   "If you could invent something useful, what would it do?",
   "What's something ordinary that you find fascinating?",
  ],
 },
 {
  id:'geeky',label:'Geeky',icon:'🎮',description:'Games, sci-fi, gadgets and rabbit holes.',
  prompts:[
   "Which game world would you love to explore for a day?",
   "What's a fictional gadget you wish existed?",
   "What's a rabbit hole you could happily talk about?",
   "Which sci-fi idea feels closest to becoming real?",
   "If you built a robot, what harmless job would it do?",
   "What's your favourite underappreciated game mechanic?",
  ],
 },
 {
  id:'gentle',label:'Gentle',icon:'🌿',description:'Low-pressure questions for a quieter mood.',
  prompts:[
   "What song instantly improves your mood?",
   "What's your favourite way to unwind?",
   "Would you rather watch a sunrise or a sunset?",
   "What's something simple that makes you smile?",
   "What's the nicest part of a quiet evening?",
   "Is there a hobby you'd like to try just for fun?",
  ],
 },
 {
  id:'silly',label:'Silly',icon:'😄',description:'A light-hearted way to break the ice.',
  prompts:[
   "Which useless superpower would make life funnier?",
   "Would you pick a tiny dragon or a talking houseplant?",
   "What food deserves its own theme song?",
   "If your socks had a hobby, what would it be?",
   "What would you name a friendly spaceship?",
   "What's the funniest name for a very serious robot?",
  ],
 },
];
