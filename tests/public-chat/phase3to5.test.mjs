import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../../'+path,import.meta.url),'utf8');
const retention=read('supabase/migrations/20261115070000_public_chat_retention_draft.sql');

test('retention function requires service role',()=>{
 assert.match(retention,/auth\.role\(\)\s*<>\s*'service_role'/);
 assert.match(retention,/revoke all on function public\.public_chat_prune_ephemeral/);
 assert.match(retention,/grant execute on function public\.public_chat_prune_ephemeral\(integer\) to service_role/);
});
test('retention prevents unbounded deletion window',()=>{
 assert.match(retention,/p_message_hours < 24 or p_message_hours > 720/);
 assert.match(retention,/r\.closed_at < now\(\) - make_interval/);
});
test('retention exempts rooms with reports and safeguarding incidents',()=>{
 assert.match(retention,/not exists\(select 1 from public\.public_chat_reports/);
 assert.match(retention,/not exists\(select 1 from public\.public_chat_safety_incidents/);
});
test('retention does not contain autonomous scheduling',()=>{
 assert.doesNotMatch(retention,/cron\.schedule|pg_cron|create event trigger/i);
});
test('privacy page explains IP hash and message inspection',()=>{
 const p=read('apps/web/app/privacy/page.tsx');
 assert.match(p,/pseudonymous hash/);
 assert.match(p,/not end-to-end encrypted/);
 assert.match(p,/not yet launched/);
});
test('privacy page avoids pretending controller contact is settled',()=>{
 const p=read('apps/web/app/privacy/page.tsx');
 assert.match(p,/operator.s verified identity/);
 assert.match(p,/not yet contain all information required/);
});
test('terms and rules are draft and self-declaration is not verification',()=>{
 assert.match(read('apps/web/app/terms/page.tsx'),/Draft terms/);
 assert.match(read('apps/web/app/rules/page.tsx'),/self-declaration, not proof/);
});
test('support and accessibility pages exist with clear guidance',()=>{
 assert.match(read('apps/web/app/safety/page.tsx'),/112 or 999/);
 assert.match(read('apps/web/app/safety/page.tsx'),/Report message/);
 assert.match(read('apps/web/app/accessibility/page.tsx'),/screen-reader/);
});
test('homepage has a working preview link and is not pretending to be live',()=>{
 const home=read('apps/web/app/page.tsx');
 assert.match(home,/href="\/chat-preview"/);
 assert.match(home,/not accepting visitors/);
});
test('chat report flow puts keyboard focus on report heading',()=>{
 const chat=read('apps/web/app/chat/page.tsx');
 assert.match(chat,/reportHeadingRef\.current\?\.focus\(\)/);
 assert.match(chat,/aria-labelledby="report-heading"/);
});
test('chat displays status and error regions for assistive technologies',()=>{
 const chat=read('apps/web/app/chat/page.tsx');
 assert.match(chat,/role="status"/);
 assert.match(chat,/role="alert"/);
 assert.match(chat,/role="log"/);
});
test('sitewide styles support reduced motion and visible focus',()=>{
 const css=read('apps/web/app/globals.css');
 assert.match(css,/prefers-reduced-motion/);
 assert.match(css,/:focus-visible/);
});
test('read-only preflight checks are present',()=>{
 const cli=read('scripts/public-chat-preflight.mjs');
 assert.match(cli,/Read-only checks/);
 assert.match(cli,/PUBLIC_CHAT_GATEWAY_SECRET/);
});
test('workflow runs security tests and static frontend build',()=>{
 const workflow=read('.github/workflows/public-chat-review.yml');
 assert.match(workflow,/node --experimental-strip-types --test tests\/public-chat\/\*\.test\.mjs/);
 assert.match(workflow,/npm run build -w @lnl\/web/);
});

test('public route content does not nest a second main landmark',()=>{
 assert.match(read('apps/web/app/layout.tsx'),/<main id="main"/);
 assert.doesNotMatch(read('apps/web/app/page.tsx'),/<main\b/);
 assert.doesNotMatch(read('apps/web/app/chat/page.tsx'),/<main\b/);
});
