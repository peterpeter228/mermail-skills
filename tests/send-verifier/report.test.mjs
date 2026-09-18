import test from 'node:test';
import assert from 'node:assert/strict';
import { buildReport, redact } from '../../skills/mermail-send-verifier/scripts/build-report.mjs';
import { renderReport } from '../../skills/mermail-send-verifier/scripts/render-report.mjs';
const evidence = (source = 'FIXTURE') => ({case_id:'demo',claim_type:'sent',assessment:'UNVERIFIED',evidence_source:source,observed_fields:{},limitations:['Body omitted; scanner retained.'],evidence_refs:['fixtures/demo.json#record'],captured_at:null});
test('three independent cards preserve unknowns and references', () => {
 const report = buildReport({mail:evidence(),chain:evidence(),capturedAt:'2026-09-18T00:00:00Z'});
 assert.equal(report.mail.captured_at,null); assert.equal(report.business.assessment,'NOT_VERIFIED');
 const html=renderReport(report);
 for (const s of ['Mermail Send Verifier','Evidence-based completion checks for AI agents','Mail Record','Avalanche Execution','Business / Payment Relationship','fixtures/demo.json#record','UNKNOWN','FIXTURE']) assert.ok(html.includes(s),s);
 assert.match(html,/PUBLIC THIRD-PARTY TRANSACTION FOR DEMO ONLY/);
 assert.doesNotMatch(html,/<script|<iframe|<link|<img|href=/i);
});
test('origins are validated without promotion or relabeling',()=>{
 for(const source of ['LIVE','RECORDED']) assert.throws(()=>buildReport({mail:evidence(source),chain:evidence()}),/offline/i);
 for(const source of ['LIVE','RECORDED','FIXTURE','SYNTHETIC','NOT_RUN','BLOCKED']) assert.equal(buildReport({mail:evidence(source),chain:evidence(),mode:'live'}).mail.evidence_source,source);
 assert.throws(()=>buildReport({mail:evidence('verified'),chain:evidence()}),/origin/i);
 assert.throws(()=>buildReport({mail:evidence(),chain:evidence(),mode:'oops'}),/mode/i);
});
test('hostile evidence renders as inert escaped text',()=>{
 const mail=evidence(); mail.case_id='<script>alert(1)</script>'; mail.evidence_refs=['javascript:alert(2)','<img src=x onerror=alert(3)>'];
 const html=renderReport(buildReport({mail,chain:evidence()}));
 assert.ok(html.includes('&lt;script&gt;')); assert.ok(html.includes('&lt;img')); assert.doesNotMatch(html,/<script|<img|href=/i);
});
test('recursive redaction before JSON and HTML removes secrets and raw mail bodies',()=>{
 const mail=evidence(); mail.observed_fields={api_key:'fake-secret-alpha',headers:{Authorization:'fake-secret-beta'},nested:[{private_key:'fake-secret-gamma'}],body:'private-mail-content',note:'Bearer fake-secret-delta',other:'API key: fake-secret-epsilon',seed:'seed phrase: abandon demo words only'};
 const report=buildReport({mail,chain:evidence()}); const serialized=JSON.stringify(report)+renderReport(report);
 for(const word of ['fake-secret','private-mail-content','abandon demo']) assert.ok(!serialized.includes(word),word);
 assert.ok(serialized.includes('[REDACTED]')); assert.ok(serialized.includes('[BODY OMITTED]'));
 assert.equal(redact({amount:999999999999999999999n}).amount,'999999999999999999999');
});
test('business claims cannot override fixed v1 business assessment',()=>{
 const chain={...evidence(),business_state:'PAID',business:{assessment:'PAYMENT_CONFIRMED'}};
 const report=buildReport({mail:evidence(),chain,business:{assessment:'INVOICE_SETTLED'}});
 assert.equal(report.chain.business_state,'NOT_VERIFIED'); assert.equal(report.business.assessment,'NOT_VERIFIED');
 assert.doesNotMatch(JSON.stringify(report),/PAID|PAYMENT_CONFIRMED|INVOICE_SETTLED/);
 const html=renderReport({...report,business:{assessment:'PAID'}}); assert.doesNotMatch(html,/\bPAID\b/);
});
test('offline demonstration uses FIXTURE on every card while live business remains NOT_RUN',()=>{
 const offline=buildReport({mail:evidence(),chain:evidence()});
 for(const card of [offline.mail,offline.chain,offline.business]) assert.equal(card.evidence_source,'FIXTURE');
 assert.equal(offline.business.assessment,'NOT_VERIFIED');
 const live=buildReport({mail:evidence('LIVE'),chain:evidence('BLOCKED'),mode:'live'});
 assert.equal(live.business.evidence_source,'NOT_RUN');
 assert.equal(live.business.assessment,'NOT_VERIFIED');
});
