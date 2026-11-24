import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {INTROVERT_CATEGORIES} from '../../apps/web/lib/introvert-prompts.ts';

const read=path=>readFileSync(new URL('../../'+path,import.meta.url),'utf8');
const demo=read('apps/web/app/chat-preview/page.tsx');

test('Introvert Mode includes Everyday, Interesting and Geeky categories',()=>{
 const ids=INTROVERT_CATEGORIES.map(c=>c.id);
 for(const id of ['everyday','interesting','geeky'])assert.ok(ids.includes(id));
 assert.equal(new Set(ids).size,ids.length);
});

test('Introvert Mode includes gentle and silly prompts',()=>{
 const ids=INTROVERT_CATEGORIES.map(c=>c.id);
 assert.ok(ids.includes('gentle'));
 assert.ok(ids.includes('silly'));
});

test('each category offers at least five different curated prompts',()=>{
 for(const category of INTROVERT_CATEGORIES){
  assert.ok(category.label&&category.icon&&category.description);
  assert.ok(category.prompts.length>=5,category.id);
  assert.equal(new Set(category.prompts).size,category.prompts.length);
  for(const prompt of category.prompts)assert.ok(prompt.length>12&&prompt.length<=160,category.id);
 }
});

test('prompts avoid asking for age, contact or precise location details',()=>{
 for(const category of INTROVERT_CATEGORIES){
  for(const prompt of category.prompts){
   assert.doesNotMatch(prompt,/\b(?:how old|your age|your address|your school|your phone|your email|your eircode|where do you live|meet in person|send (?:me )?your photo)\b/i,prompt);
  }
 }
});

test('demo is browser-local and does not call chat backend or save content',()=>{
 assert.doesNotMatch(demo,/\bfetch\s*\(|\blocalStorage\b|\bsessionStorage\b|sendBeacon\s*\(/);
 assert.match(demo,/you are not connected to another person/);
 assert.match(demo,/fictional/);
});

test('either demo visitor can experiment without sending an actual message',()=>{
 assert.match(demo,/role="switch"/);
 assert.match(demo,/aria-checked=\{introvertOn\}/);
 assert.match(demo,/setIntrovertOn\(on=>!on\)/);
 assert.match(demo,/append\('prompt',currentPrompt,category\.label\)/);
});

test('Introvert Mode has category choice, another idea and editable draft',()=>{
 assert.match(demo,/aria-pressed=\{categoryId===item\.id\}/);
 assert.match(demo,/Another idea/);
 assert.match(demo,/Use as my draft/);
 assert.match(demo,/setDraft\(currentPrompt\)/);
 assert.match(demo,/Show shared question/);
});

test('demo includes sample chat transcript, composer and reset controls',()=>{
 assert.match(demo,/role="log"/);
 assert.match(demo,/onSubmit=\{send\}/);
 assert.match(demo,/maxLength=\{500\}/);
 assert.match(demo,/Next person/);
 assert.match(demo,/End chat/);
 assert.match(demo,/Start another sample chat/);
});

test('homepage and navigation link to the working demo, not disabled live entry',()=>{
 assert.match(read('apps/web/app/page.tsx'),/href="\/chat-preview"/);
 assert.match(read('apps/web/app/layout.tsx'),/href="\/chat-preview"/);
 assert.match(read('apps/web/app/chat/page.tsx'),/href="\/chat-preview"/);
});

test('existing real chat entry continues to require a configured gateway and consent',()=>{
 const live=read('apps/web/app/chat/page.tsx');
 assert.match(live,/!gateway\|\|!adult\|\|!rules\|\|busy/);
 assert.match(live,/NEXT_PUBLIC_PUBLIC_CHAT_GATEWAY_URL\|\|''/);
});
