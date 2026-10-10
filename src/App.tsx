import { useState, useEffect, useRef } from 'react';

/* DITTO - paste into src/App.tsx, leave src/index.css empty. No extra installs.
   Theme: deep brown #391E10 + Ditto pink #FFC4DA */

const N8N_URL = ((import.meta as any).env || {}).VITE_N8N_WEBHOOK_URL as string | undefined;

type Cmt = { by: string; text: string };
type Post = { id: number; name: string; handle: string; anon?: boolean; text: string; img?: string; badge?: string; sensitive: boolean; reacts: number[]; mine: number; horizon?: boolean; time: string; comments: Cmt[] };
type Moment = { id: number; by: string; text: string; g: [string, string]; img?: string };
type Msg = { from: 'me' | 'them'; text: string };
type Contact = { id: string; n: string; sub: string; kind: 'person' | 'doctor' | 'centre' };

// Replace these three links with your own picture URLs
const PIC_TRUTH = 'https://i.ibb.co/YFjvV6fN/e9594c15350aec16342f0d96bdb6e2ed.jpg';
const PIC_SUNRISE = 'https://picsum.photos/seed/ditto-sunrise/900/700';
const PIC_FRIENDS = 'https://picsum.photos/seed/ditto-friends/900/700';

const SEED: Post[] = [
  { id: 5, name: 'Unveiled Soul', handle: 'Unveiled_Soul', anon: true, text: "For the longest time, I thought I had to hide who I love just to survive the environment I was born into. Today, I am finally standing tall with the person who makes me feel safe, seen, and completely whole. To everyone still waiting in the dark or feeling trapped by the expectations of those around you: hold on. Your chosen family is out there, and your beautiful, true story is just beginning.", img: PIC_TRUTH, badge: 'Living My Truth', sensitive: false, reacts: [214, 98, 145], mine: -1, time: '1h', comments: [] },
  { id: 6, name: 'Restless Ink', handle: 'Restless_Ink', anon: true, text: "I used to think the only way to release the heavy pressure in my chest was to hurt myself. The urges still knock on my door, but today, I chose to walk outside instead. I closed my eyes, let the morning sun hit my face, and just breathed. Surviving trauma isn't about running perfectly; it's about learning to stand still in the calm after the storm. I am still here, and I am healing.", img: PIC_SUNRISE, badge: '60 Days Free', sensitive: true, reacts: [182, 120, 94], mine: -1, time: '3h', comments: [] },
  { id: 1, name: 'Steady Willow', handle: 'SteadyWillow27', anon: true, text: 'Day 90. Cooked dinner for the whole family tonight. Small thing, huge deal. #day90 #wins', badge: '90 days', sensitive: false, reacts: [148, 60, 40], mine: -1, time: '5h', comments: [{ by: 'Riya', text: 'So proud of you!' }] },
  { id: 2, name: 'Riya', handle: 'riya.draws', text: 'Painted this during group week. Colour helps when words do not. #art #process', img: 'https://picsum.photos/seed/ditto-art/900/700', sensitive: false, reacts: [231, 80, 52], mine: -1, time: '7h', comments: [] },
  { id: 3, name: 'Brave Comet', handle: 'BraveComet12', anon: true, text: 'Walked past the old bar and kept walking. Cravings were loud (hello, vodka) but I called my sponsor. #onedayatatime', sensitive: true, reacts: [96, 64, 30], mine: -1, time: '8h', comments: [] },
  { id: 4, name: 'Aarav', handle: 'aarav.runs', text: 'Morning 5k, no excuses. Day 45. Legs hurt, head is clear. #running #day45', img: 'https://picsum.photos/seed/ditto-run/900/700', sensitive: false, reacts: [187, 72, 41], mine: -1, time: '1d', comments: [] },
];
const HORIZON_SEED: Post[] = [
  { id: 103, name: 'Chasing Dawn', handle: 'Chasing_Dawn', anon: true, text: "When you are deep in active addiction or recovering from an abusive relationship, you feel completely isolated from the rest of the world. You think you'll never laugh like this again. But freedom is real. Surrounding myself with people who lift my soul instead of dragging it down changed everything. We survived the hardest chapters, and now we get to write the happy ones.", img: PIC_FRIENDS, badge: 'Out of the Dark', sensitive: false, reacts: [310, 85, 204], mine: -1, horizon: true, time: '2d', comments: [] },
  { id: 101, name: 'Lotus Rising', handle: 'LotusRising08', anon: true, text: 'One year free today. I thought I would never write those words. If you are on day 2, keep going. It is real.', badge: '1 Year Free', sensitive: false, reacts: [612, 150, 220], mine: -1, horizon: true, time: '3d', comments: [] },
  { id: 102, name: 'Aarav', handle: 'aarav.runs', text: 'Graduated rehab last week and moved into my own flat yesterday. First night of sleeping peacefully in years.', badge: 'Moved into Safe Housing', sensitive: false, reacts: [434, 120, 98], mine: -1, horizon: true, time: '5d', comments: [] },
];
const MOMENTS: Moment[] = [
  { id: 1, by: 'Steady Willow', text: 'Slept through the whole night for the first time in months.', g: ['#FFC4DA', '#F4A6C3'], img: 'https://picsum.photos/seed/ditto-m1/300/420' },
  { id: 2, by: 'Riya', text: 'Sketched for an hour instead of scrolling. Felt like me again.', g: ['#FFC4DA', '#F4A6C3'], img: 'https://picsum.photos/seed/ditto-m2/300/420' },
  { id: 3, by: 'Aarav', text: 'Day 45. The 5 a.m. air is a different kind of medicine.', g: ['#E2CEB1', '#C7A07A'], img: 'https://picsum.photos/seed/ditto-m3/300/420' },
  { id: 4, by: 'Brave Comet', text: 'Told my sister the truth today. She hugged me.', g: ['#FFD9E8', '#FFB3D0'], img: 'https://picsum.photos/seed/ditto-m4/300/420' },
];
const GRADS: [string, string][] = [['#FFC4DA', '#F4A6C3'], ['#E2CEB1', '#C7A07A'], ['#FFD9E8', '#FFB3D0']];
const momentBg = (m: Moment) => (m.img ? 'linear-gradient(180deg,rgba(57,30,16,.05) 30%,rgba(57,30,16,.85)),url(' + m.img + ') center/cover' : 'linear-gradient(160deg,' + m.g[0] + ',' + m.g[1] + ')');
const REACTS = [{ i: '\u{1F64C}', l: 'Proud' }, { i: '\u{1F4AA}', l: 'Stay strong' }, { i: '\u2728', l: 'Inspired' }];

const MOODS = [
  { id: 'happy', icon: '\u{1F60A}', label: 'Happy' },
  { id: 'calm', icon: '\u{1F60C}', label: 'Calm' },
  { id: 'anxious', icon: '\u{1F630}', label: 'Anxious' },
  { id: 'confused', icon: '\u{1F615}', label: 'Confused' },
  { id: 'blocked', icon: '\u{1F9F1}', label: 'Blocked' },
  { id: 'selfharm', icon: '\u{1F494}', label: 'Self-harm urges' },
];
const PEOPLE = [
  { h: 'SteadyWillow27', n: 'Steady Willow', bio: 'Day 90. Cooks for everyone.', mood: 'happy' },
  { h: 'riya.draws', n: 'Riya', bio: 'Art and coffee. 8 months.', mood: 'calm' },
  { h: 'RisingEmber41', n: 'Rising Ember', bio: 'Runner. Day 45.', mood: 'anxious' },
  { h: 'aarav.runs', n: 'Aarav', bio: 'Graduated, now building.', mood: 'blocked' },
  { h: 'BraveComet12', n: 'Brave Comet', bio: 'One call at a time.', mood: 'selfharm' },
  { h: 'QuietMaple33', n: 'Quiet Maple', bio: 'Learning to sit with feelings.', mood: 'confused' },
];
const REPLIES = ['Thank you for reaching out. I am here.', 'I get it. It took me a while too. Want to talk more about it?', 'You are not alone in this. One small step at a time worked for me.'];
const REPLY_RULES: [RegExp, string][] = [
  [/crav|urge|relapse/i, 'Cravings are loud, but they pass. Try waiting ten minutes, drink some water, and tell me how it goes.'],
  [/anx|panic|scared|worr/i, 'That sounds heavy. Breathe in for four, out for six. What is making it hardest right now?'],
  [/sad|alone|lonely|tired|hopeless/i, 'You are not alone in this. I am here and I am listening. Tell me more.'],
  [/thank/i, 'Anytime. We look out for each other here.'],
  [/^(hi|hey|hello)/i, 'Hey, I am glad you reached out. How is your day going?'],
];
const DOC_REPLY = 'Thank you for sharing that. Would a 20 minute video consult this week help? I can find a time that suits you.';
const CENTRE_REPLY = 'Thank you for reaching out. Our admissions team can speak with you today, and everything is confidential. Would you like a call back?';
const replyFor = (kind: Contact['kind'], text: string) => {
  if (kind === 'doctor') return DOC_REPLY;
  if (kind === 'centre') return CENTRE_REPLY;
  const hit = REPLY_RULES.find(r => r[0].test(text));
  return hit ? hit[1] : REPLIES[Math.floor(Math.random() * REPLIES.length)];
};

const TRIGGER_WORDS = ['alcohol', 'vodka', 'whiskey', 'whisky', 'beer', 'wine', 'drunk', 'drugs', 'weed', 'cocaine', 'heroin', 'pills', 'needle', 'smoke', 'smoking', 'high on', 'meth'];
const CRISIS_WORDS = ['relapse', 'relapsed', 'want to die', 'kill myself', 'suicide', 'self-harm', 'self harm', 'hurt myself', 'end it all', 'give up', 'cant do this', "can't do this"];
const scan = (t: string, w: string[]) => w.some(x => t.toLowerCase().includes(x));

/* Skylight missions: every finished mission lights one star */
const MISSIONS: { id: string; title: string; desc: string; d?: number }[] = [
  { id: 'mood', title: 'Check in with yourself', desc: 'Pick how you feel on the mood board' },
  { id: 'post', title: 'Say it out loud', desc: 'Share your first moment or post' },
  { id: 'cheer', title: "Be someone's light", desc: 'Leave a kind comment' },
  { id: 'hello', title: 'Break the silence', desc: 'Send a message in Chat' },
  { id: 'd1', title: 'Day one', desc: 'Complete your first day', d: 1 },
  { id: 'd7', title: 'One week', desc: '7 days on your journey', d: 7 },
  { id: 'd30', title: 'One month', desc: '30 days on your journey', d: 30 },
  { id: 'd50', title: 'Fifty days', desc: '50 days on your journey', d: 50 },
  { id: 'd100', title: 'One hundred days', desc: '100 days on your journey', d: 100 },
];
const STAR_POS: [number, number][] = [[150, 100], [95, 70], [210, 60], [60, 130], [240, 125], [130, 160], [180, 150], [40, 60], [265, 70]];

const HORIZON_TAGS: { label: string; d?: number; note: string }[] = [
  { label: '1 Year Free', d: 365, note: 'Unlocks at day 365' },
  { label: 'Graduated Rehab', note: 'Program completed' },
  { label: 'Moved into Safe Housing', note: 'A fresh start' },
];
// Demo profiles (fictional). Replace with real verified partners.
const DOCTORS = [
  { name: 'Dr. Meera Kapoor', role: 'Trauma psychologist', tag: 'Anxiety, trauma, relapse prevention' },
  { name: 'Dr. Arjun Rao', role: 'Addiction psychiatrist', tag: 'Detox support, medication review' },
  { name: 'Dr. Naina Bose', role: 'Clinical psychologist', tag: 'CBT, family counselling' },
];
const CENTERS = [
  { name: 'Sunrise Recovery Centre', kind: 'Rehabilitation centre', where: 'Chandigarh', tag: '24/7 admissions, family programme' },
  { name: 'Haven Crisis Shelter', kind: 'Crisis shelter', where: 'Shimla', tag: 'Emergency stay, confidential intake' },
];
const AFFIRMATIONS = [
  'I am here. I am safe in this moment. I have already survived my hardest days.',
  'Every day I choose to stay is a win. I am allowed to ask for help.',
  'I am not alone, and I am worthy of a good life.',
  'Small steps still count. Today I will be gentle with myself.',
];
const CONTACTS: Contact[] = [
  ...PEOPLE.map(p => ({ id: p.h, n: p.n, sub: p.bio, kind: 'person' as const })),
  ...DOCTORS.map(d => ({ id: d.name, n: d.name, sub: d.role, kind: 'doctor' as const })),
  ...CENTERS.map(c => ({ id: c.name, n: c.name, sub: c.kind + ' \u00b7 ' + c.where, kind: 'centre' as const })),
];
const CHAT_SEED: Record<string, Msg[]> = {
  SteadyWillow27: [
    { from: 'them', text: 'Hey, I saw you checked in today. How are you holding up?' },
    { from: 'me', text: 'Better than yesterday, honestly.' },
    { from: 'them', text: 'That is how it works. Better than yesterday is a win.' },
  ],
  BraveComet12: [
    { from: 'them', text: 'Evenings are the hardest for me. What about you?' },
    { from: 'me', text: 'Same. I never know what to do with my hands.' },
    { from: 'them', text: 'I walk. Ten minutes outside and the craving loosens. Want to try it together tomorrow?' },
  ],
  'Dr. Meera Kapoor': [
    { from: 'them', text: 'Hello, I am Dr. Kapoor. This chat is a safe place to ask questions before booking a session.' },
    { from: 'me', text: 'I get anxious at night and cannot sleep.' },
    { from: 'them', text: 'Thank you for telling me. Night anxiety is common in early recovery. Would a 20 minute video call this week help?' },
  ],
  'Sunrise Recovery Centre': [
    { from: 'them', text: 'Welcome to Sunrise. Our admissions line is open 24/7 and everything you share is confidential.' },
  ],
};

const TABS = [
  { id: 'feed', label: 'Feed', icon: 'home' }, { id: 'horizon', label: 'Horizon', icon: 'horizon' },
  { id: 'allies', label: 'Allies', icon: 'allies' }, { id: 'chat', label: 'Chat', icon: 'chat' }, { id: 'me', label: 'Me', icon: 'me' },
] as const;
type Tab = typeof TABS[number]['id'];

const ADJ = ['Hopeful', 'Gentle', 'Bright', 'Quiet', 'Golden', 'Warm', 'Kind', 'Fearless'];
const NOUN = ['Phoenix', 'Falcon', 'Aurora', 'Lotus', 'Meadow', 'Lantern', 'River', 'Sparrow'];
const pickOne = (a: string[]) => a[Math.floor(Math.random() * a.length)];
const makeAlias = () => pickOne(ADJ) + ' ' + pickOne(NOUN);
const daysSince = (iso: string) => Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000));
const today = () => new Date().toISOString().slice(0, 10);
const FALLBACK = ['#FFC4DA', '#C7A07A', '#E2CEB1', '#FDFCE8'];

const ICONS: Record<string, string> = {
  home: 'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
  horizon: 'M3 18h18M7 18a5 5 0 0 1 10 0M12 5v3M4.9 9l2 2M19.1 9l-2 2',
  allies: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20a6.5 6.5 0 0 1 13 0M16 4.3a3.5 3.5 0 0 1 0 6.4M18 14a6.5 6.5 0 0 1 3.5 6',
  chat: 'M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z',
  me: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  heart: 'M12 20s-7-4.4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.6-9 9-9 9z',
  image: 'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M9 9.5h.01',
  chev: 'M6 9l6 6 6-6',
  check: 'M5 12.5l4.5 4.5L19 7',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
  send: 'M4 12l16-8-6 16-3-7z',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18',
  mask: 'M3 10c3-3 15-3 18 0v2c0 3-3 5-5 5-2 0-2-2-4-2s-2 2-4 2c-2 0-5-2-5-5z',
  back: 'M15 5l-7 7 7 7',
  plus: 'M12 5v14M5 12h14',
};
function Ic({ n, s = 22, fill = false }: { n: string; s?: number; fill?: boolean }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={fill ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={ICONS[n]} /></svg>
  );
}
function Avatar({ seed, size = 40, anon = false }: { seed: string; size?: number; anon?: boolean }) {
  const [bad, setBad] = useState(false);
  const src = `https://api.dicebear.com/9.x/${anon ? 'shapes' : 'notionists-neutral'}/svg?seed=${encodeURIComponent(seed)}`;
  const bg = FALLBACK[[...seed].reduce((a, c) => a + c.charCodeAt(0), 0) % FALLBACK.length];
  if (bad) return <span className="av" style={{ width: size, height: size, background: bg, fontSize: size * 0.42, color: '#391E10' }}>{seed[0]?.toUpperCase()}</span>;
  return <img className="av" src={src} width={size} height={size} alt="" style={{ background: bg }} onError={() => setBad(true)} />;
}
const Rich = ({ t }: { t: string }) => <>{t.split(/(#\w+)/g).map((s, i) => (s.startsWith('#') ? <span key={i} className="tagx">{s}</span> : s))}</>;

/* night sky: one star per finished mission, starts empty */
function Sky({ count, fresh }: { count: number; fresh?: boolean }) {
  const dots = Array.from({ length: 60 }, (_, i) => ({ x: (i * 73) % 300, y: (i * 47 + (i * i) % 31) % 200, r: 0.4 + ((i * 13) % 5) * 0.15, o: 0.25 + ((i * 7) % 6) * 0.1 }));
  const pts = STAR_POS.slice(0, Math.min(count, STAR_POS.length));
  return (
    <svg viewBox="0 0 300 200" className="sky" role="img" aria-label={`Your sky with ${count} stars`}>
      <defs>
        <linearGradient id="skybg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#0A1128" /><stop offset="1" stopColor="#1B2753" /></linearGradient>
        <radialGradient id="skygl"><stop offset="0" stopColor="#fff" stopOpacity=".9" /><stop offset="1" stopColor="#9CC3FF" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="300" height="200" fill="url(#skybg)" />
      {dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#fff" opacity={d.o} />)}
      {pts.slice(1).map((p, i) => <line key={i} x1={pts[i][0]} y1={pts[i][1]} x2={p[0]} y2={p[1]} stroke="#cfe0ff" strokeOpacity=".45" strokeWidth=".6" />)}
      {pts.map((p, i) => {
        const nw = !!fresh && i === pts.length - 1;
        return (
          <g key={i} className={nw ? 'st new' : 'st'}>
            <circle cx={p[0]} cy={p[1]} r={nw ? 14 : 9} fill="url(#skygl)" />
            <circle cx={p[0]} cy={p[1]} r={nw ? 2.6 : 1.8} fill="#fff" />
          </g>
        );
      })}
      {count === 0 && <text x="150" y="104" textAnchor="middle" fill="#9fb3e8" fontSize="9">Your sky is empty. Finish a mission to light a star.</text>}
    </svg>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bagel+Fat+One&family=Outfit:wght@400;500;600;700&family=Caveat:wght@700&display=swap');
:root{--bg:#FFE6F0;--s1:#FFF8FB;--s2:#FFC4DA;--line:rgba(57,30,16,.14);--ink:#391E10;--muted:#734128;--acc:#391E10;--pk:#FFC4DA}
*{box-sizing:border-box;margin:0}
html,body{background:var(--bg);color-scheme:light}
body{font-family:Outfit,system-ui,sans-serif;color:var(--ink);line-height:1.5}
button{font-family:inherit;color:inherit}
input,textarea{font-family:inherit}
.muted{color:var(--muted);font-size:13px}
.row{display:flex;align-items:center;gap:10px}
.between{justify-content:space-between}
:focus-visible{outline:2px solid var(--acc);outline-offset:2px}
.splash{position:fixed;inset:0;z-index:50;background:var(--pk);display:grid;place-content:center;text-align:center;overflow:hidden;padding:20px}
.splash h1{font:400 clamp(88px,26vw,320px)/.9 'Bagel Fat One',sans-serif;color:var(--acc)}
.splash p{font:700 clamp(32px,7vw,72px) Caveat,cursive;color:var(--ink);transform:rotate(-3deg);margin-top:6px}
.splash .go{position:absolute;left:0;right:0;bottom:calc(7vh + env(safe-area-inset-bottom,0px));display:flex;justify-content:center}
.splash .go .btn{padding:16px 38px;font-size:18px}
@media (prefers-reduced-motion:no-preference){
 .splash h1{animation:pop .8s cubic-bezier(.2,1.4,.4,1) both}
 .splash p{animation:pop .8s .35s cubic-bezier(.2,1.4,.4,1) both}
 .splash .go{animation:rise .7s .9s ease both}
 .st.new circle:first-child{animation:glow 1.2s ease-in-out infinite alternate}
}
@keyframes pop{from{opacity:0;transform:scale(.7)}}
@keyframes rise{from{opacity:0;transform:translateY(14px)}}
@keyframes glow{from{opacity:.5}to{opacity:1}}
.shell{display:grid;grid-template-columns:240px minmax(0,640px);gap:28px;justify-content:center;max-width:960px;margin:0 auto;padding:22px 20px}
.side{position:sticky;top:22px;align-self:start;display:flex;flex-direction:column;gap:4px}
.nav{display:flex;align-items:center;gap:14px;padding:12px 14px;border-radius:14px;border:0;background:none;font:500 16px Outfit;color:var(--muted);cursor:pointer;width:100%;text-align:left}
.nav:hover{background:rgba(57,30,16,.06);color:var(--ink)}
.nav.on{background:var(--s2);color:var(--ink);font-weight:600}
.nav.on svg{color:var(--acc)}
.me-mini{margin-top:16px;display:flex;align-items:center;gap:10px;padding:10px;border-radius:14px;border:1px solid var(--line);background:var(--s1);cursor:pointer;width:100%;text-align:left}
.me-mini small{display:block;color:var(--muted);font-size:12px}
.brandwrap{position:relative;margin-bottom:14px}
.brandbtn{display:flex;align-items:center;gap:6px;background:none;border:0;cursor:pointer;padding:4px 6px;border-radius:12px}
.brandbtn:hover{background:rgba(57,30,16,.06)}
.logo{font:400 36px/1 'Bagel Fat One',sans-serif;color:var(--acc)}
.modepill{display:inline-flex;align-items:center;gap:5px;font:600 11px Outfit;padding:3px 9px;border-radius:999px;background:var(--s2);color:var(--ink)}
.scrim{position:fixed;inset:0;z-index:39}
.menu{position:absolute;top:100%;left:0;margin-top:8px;min-width:250px;background:var(--s2);border:1px solid var(--line);border-radius:16px;padding:6px;z-index:40;box-shadow:0 14px 34px rgba(57,30,16,.25)}
.menu button{display:flex;gap:12px;align-items:center;width:100%;padding:10px 12px;background:none;border:0;border-radius:12px;cursor:pointer;text-align:left;font:600 14px Outfit}
.menu button:hover{background:rgba(57,30,16,.06)}
.menu small{display:block;color:var(--muted);font-weight:400;font-size:12px}
.menu .tick{margin-left:auto;color:var(--acc)}
.menu .ico{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:var(--bg);color:var(--acc);flex:none}
.mtop{display:none;align-items:center;justify-content:space-between;padding:10px 14px;position:sticky;top:0;background:var(--bg);z-index:10;border-bottom:1px solid var(--line)}
.mtop .brandwrap{margin:0}
.mtop .logo{font-size:30px}
.mtop .link{background:none;border:0;cursor:pointer}
.bottom{display:none;position:fixed;left:0;right:0;bottom:0;z-index:20;background:var(--s1);border-top:1px solid var(--line);padding:6px 6px calc(6px + env(safe-area-inset-bottom,0px))}
.bottom button{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;background:none;border:0;font:500 11px Outfit;color:var(--muted);padding:6px 0;cursor:pointer}
.bottom button.on{color:var(--acc)}
@media (max-width:780px){.shell{display:block;padding:14px 14px 92px}.side{display:none}.mtop,.bottom{display:flex}}
.card{background:var(--s1);border:1px solid var(--line);border-radius:20px;padding:16px;margin-bottom:16px}
.btn{display:inline-flex;gap:8px;align-items:center;justify-content:center;padding:10px 18px;border-radius:999px;border:0;background:var(--acc);color:var(--bg);font:600 14px Outfit;cursor:pointer}
.btn:active{transform:scale(.97)}
.btn.ghost{background:transparent;color:var(--ink);border:1px solid var(--line)}
.btn.sm{padding:6px 14px;font-size:13px}
.btn.wide{width:100%;margin-top:10px}
.btn:disabled{opacity:.4;cursor:not-allowed}
.chip{display:inline-block;font:600 12px Outfit;padding:3px 11px;border-radius:999px;background:var(--s2);color:var(--ink);white-space:nowrap}
.chipbtn{font:500 13px Outfit;padding:7px 14px;border-radius:999px;border:1px solid var(--line);background:transparent;cursor:pointer;white-space:nowrap}
.chipbtn.on{background:var(--acc);color:var(--bg);border-color:var(--acc);font-weight:600}
.chipbtn:disabled{opacity:.4;cursor:not-allowed}
h2.t{font:700 22px/1.2 Outfit,sans-serif;margin:2px 0 4px}
h3.t{font:600 16px/1.2 Outfit,sans-serif;margin:4px 0 10px}
input,textarea{width:100%;padding:12px 14px;border-radius:14px;border:1px solid var(--line);background:rgba(255,255,255,.75);font-size:15px;color:var(--ink)}
input::placeholder,textarea::placeholder{color:#A98562}
textarea{resize:none;min-height:70px}
.scroll{display:flex;gap:8px;overflow-x:auto;padding-bottom:6px}
.av{border-radius:50%;object-fit:cover;flex:none;display:grid;place-items:center;font-weight:700}
.moments{display:flex;gap:10px;overflow-x:auto;padding:2px 0 14px}
.moment{flex:none;width:104px;height:140px;border-radius:18px;border:0;cursor:pointer;padding:10px;display:flex;flex-direction:column;justify-content:flex-end;text-align:left;font:500 12px/1.3 Outfit;color:var(--ink);background-size:cover}
.moment b{display:block;font-size:12px;margin-bottom:2px}
.moment.add{background:var(--s1);border:1px dashed var(--muted);align-items:center;justify-content:center;color:var(--acc);gap:6px;text-align:center}
.moods{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}
.mood{padding:12px 6px;border-radius:16px;border:1px solid var(--line);background:transparent;cursor:pointer;font:500 12px Outfit;text-align:center}
.mood span{display:block;font-size:26px}
.mood.on{background:var(--acc);color:var(--bg);border-color:var(--acc);font-weight:600}
.post{padding:0;overflow:hidden}
.phead{display:flex;align-items:center;gap:12px;padding:14px 16px}
.pmeta{flex:1;min-width:0;line-height:1.25}
.pmeta span{display:block;font-size:12px;color:var(--muted)}
.pbody{position:relative}
.pimg{display:block;width:100%;max-height:460px;object-fit:cover}
.cap{padding:12px 16px;font-size:15px}
.tagx{color:var(--acc);font-weight:600}
.blurred{filter:blur(14px);user-select:none;pointer-events:none}
.veil{position:absolute;inset:0;display:grid;place-content:center;justify-items:center;gap:10px;text-align:center;padding:16px;font-weight:600}
.pact{display:flex;gap:6px;padding:4px 10px 12px}
.act{background:none;border:0;font:600 14px Outfit;padding:8px 12px;border-radius:999px;cursor:pointer;display:flex;gap:6px;align-items:center;color:var(--muted)}
.act.on{background:var(--s2);color:var(--ink)}
.cmts{padding:0 16px 14px;font-size:14px}
.cmts p{margin-bottom:6px}
.cin{display:flex;gap:8px;margin-top:8px}
.crisis{background:var(--s2);border-color:var(--acc)}
.sky{width:100%;display:block;border-radius:16px}
.mission{display:flex;gap:12px;align-items:center;padding:10px 0;border-top:1px solid var(--line)}
.mission .dot{width:26px;height:26px;border-radius:50%;border:1.5px solid var(--muted);display:grid;place-items:center;flex:none;color:var(--bg)}
.mission.done .dot{background:var(--acc);border-color:var(--acc)}
.mission.done b{color:var(--acc)}
.mission b{display:block;font-weight:600;font-size:14px}
.bubble{width:fit-content;max-width:78%;padding:10px 16px;border-radius:20px;font-size:14px;margin:6px 0}
.bubble.me{margin-left:auto;background:var(--acc);color:var(--bg)}
.bubble.them{background:var(--s2)}
.person{display:flex;align-items:center;gap:10px;margin-bottom:12px}
.person div{flex:1;min-width:0;line-height:1.25;font-size:14px}
.person small{display:block;color:var(--muted);font-size:12px}
.modal{position:fixed;inset:0;z-index:60;background:rgba(20,8,2,.8);display:grid;place-items:center;padding:20px}
.modal .box{width:min(440px,100%);background:var(--s1);border:1px solid var(--line);border-radius:24px;padding:18px}
.vm.pic{color:#fff}
.vm{border-radius:24px;padding:36px 22px;min-height:300px;display:flex;flex-direction:column;justify-content:flex-end;font:600 22px/1.3 Outfit}
.head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px}
.head h2.t{margin:0;font-size:24px}
.moodwrap{position:relative}
.moodbtn{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:999px;border:1px solid var(--line);background:var(--s1);font:600 13px Outfit;cursor:pointer}
.moodpop{position:absolute;right:0;top:100%;margin-top:8px;width:min(320px,86vw);background:var(--s1);border:1px solid var(--line);border-radius:18px;padding:12px;z-index:40;box-shadow:0 14px 34px rgba(57,30,16,.25)}
.moment.pic{color:#fff}
.pact{flex-wrap:wrap}
.thread{height:min(52vh,480px);overflow-y:auto;padding:4px 2px;display:flex;flex-direction:column}
.convo{display:flex;align-items:center;gap:12px;width:100%;padding:10px 4px;background:none;border:0;border-top:1px solid var(--line);cursor:pointer;text-align:left}
.convo div{flex:1;min-width:0;line-height:1.3;font-size:14px}
.convo small{display:block;color:var(--muted);font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.grp{font:600 13px Outfit;color:var(--muted);margin:14px 0 4px}
`;

export default function App() {
  const [splash, setSplash] = useState(true);
  const [tab, setTab] = useState<Tab>('feed');
  const [mode, setMode] = useState<'public' | 'incognito'>('public');
  const [menu, setMenu] = useState(false);
  const [name, setName] = useState('');
  const [alias, setAlias] = useState(makeAlias());
  const [start, setStart] = useState(today());
  const [posts, setPosts] = useState<Post[]>([...HORIZON_SEED, ...SEED]);
  const [moments, setMoments] = useState<Moment[]>(MOMENTS);
  const [mv, setMv] = useState<Moment | 'new' | null>(null);
  const [mText, setMText] = useState('');
  const [revealed, setRevealed] = useState<number[]>([]);
  const [draft, setDraft] = useState('');
  const [img, setImg] = useState<string | undefined>();
  const [crisis, setCrisis] = useState(false);
  const [mood, setMood] = useState('');
  const [filter, setFilter] = useState('all');
  const [chatWith, setChatWith] = useState<string | null>(null);
  const [chats, setChats] = useState<Record<string, Msg[]>>(CHAT_SEED);
  const [msg, setMsg] = useState('');
  const [openCmt, setOpenCmt] = useState<number | null>(null);
  const [cmt, setCmt] = useState('');
  const [hzTag, setHzTag] = useState('');
  const [hzText, setHzText] = useState('');
  const [done, setDone] = useState<string[]>([]);
  const [popup, setPopup] = useState(false);
  const [moodOpen, setMoodOpen] = useState(false);
  const [breath, setBreath] = useState(false);
  const [aff, setAff] = useState(0);
  const [ally, setAlly] = useState<'people' | 'doctors' | 'centres'>('people');
  const fileRef = useRef<HTMLInputElement>(null);
  const prev = useRef(0);
  const threadRef = useRef<HTMLDivElement>(null);

  const anon = mode === 'incognito';
  const me = anon ? alias : name.trim() || 'Friend';
  const handle = me.replace(/\s+/g, '.').toLowerCase() || 'friend';
  const curMood = MOODS.find(m => m.id === mood);
  const contact = CONTACTS.find(c => c.id === chatWith);
  const days = daysSince(start);
  const dayIds = MISSIONS.filter(m => m.d !== undefined && days >= m.d).map(m => m.id);
  const earned = Array.from(new Set([...done, ...dayIds]));
  const count = earned.length;
  const lastTitle = MISSIONS.find(m => m.id === earned[count - 1])?.title;

  useEffect(() => { const t = setTimeout(() => setSplash(false), 4000); return () => clearTimeout(t); }, []);
  useEffect(() => { if (count > prev.current) setPopup(true); prev.current = count; }, [count]);
  useEffect(() => { const t = threadRef.current; if (t) t.scrollTop = t.scrollHeight; }, [chats, chatWith]);

  const win = (id: string) => setDone(d => (d.includes(id) ? d : [...d, id]));
  const alertCrisis = () => {
    setCrisis(true);
    if (N8N_URL) fetch(N8N_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user: me, event: 'crisis_detected', time: new Date().toISOString() }) }).catch(() => {});
  };
  const pickMood = (id: string) => { setMood(id); setMoodOpen(false); win('mood'); if (id === 'selfharm') alertCrisis(); };
  const addPost = (o: Partial<Post>) =>
    setPosts(p => [{ id: Date.now(), name: me, handle, anon, text: '', sensitive: scan(o.text || '', TRIGGER_WORDS), reacts: [0, 0, 0], mine: -1, time: 'now', comments: [], ...o }, ...p]);
  const pickImage = (f?: File) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setImg(r.result as string);
    r.readAsDataURL(f);
  };
  const publish = () => {
    if (!draft.trim() && !img) return;
    if (scan(draft, CRISIS_WORDS)) alertCrisis();
    addPost({ text: draft.trim(), img });
    win('post'); setDraft(''); setImg(undefined);
  };
  const publishHorizon = () => {
    const tag = HORIZON_TAGS.find(t => t.label === hzTag);
    if (!tag || (tag.d !== undefined && days < tag.d)) return;
    addPost({ text: hzText.trim() || `${tag.label}!`, badge: tag.label, horizon: true });
    win('post'); setHzText(''); setHzTag('');
  };
  const shareMoment = () => {
    if (!mText.trim()) return;
    if (scan(mText, CRISIS_WORDS)) alertCrisis();
    setMoments(m => [{ id: Date.now(), by: me, text: mText.trim(), g: GRADS[m.length % 3] }, ...m]);
    win('post'); setMText(''); setMv(null);
  };
  const react = (id: number, i: number) => setPosts(ps => ps.map(x => {
    if (x.id !== id) return x;
    const r = [...x.reacts];
    if (x.mine >= 0) r[x.mine] -= 1;
    const mine = x.mine === i ? -1 : i;
    if (mine >= 0) r[mine] += 1;
    return { ...x, reacts: r, mine };
  }));
  const addComment = (id: number) => {
    if (!cmt.trim()) return;
    if (scan(cmt, CRISIS_WORDS)) alertCrisis();
    setPosts(ps => ps.map(x => (x.id === id ? { ...x, comments: [...x.comments, { by: me, text: cmt.trim() }] } : x)));
    win('cheer'); setCmt('');
  };
  const send = () => {
    if (!chatWith || !msg.trim()) return;
    const who = chatWith;
    const reply = replyFor(CONTACTS.find(c => c.id === who)?.kind || 'person', msg.trim());
    if (scan(msg, CRISIS_WORDS)) alertCrisis();
    setChats(c => ({ ...c, [who]: [...(c[who] || []), { from: 'me', text: msg.trim() }] }));
    win('hello'); setMsg('');
    setTimeout(() => setChats(c => ({ ...c, [who]: [...(c[who] || []), { from: 'them', text: reply }] })), 1200);
  };
  const talkTo = (h: string) => { setChatWith(h); setTab('chat'); };

  const switcher = (
    <div className="brandwrap">
      <button className="brandbtn" onClick={() => setMenu(!menu)} aria-expanded={menu}>
        <span className="logo">ditto</span>
        <span className="modepill"><Ic n={anon ? 'mask' : 'globe'} s={12} /> {anon ? 'Incognito' : 'Public'}</span>
        <Ic n="chev" s={16} />
      </button>
      {menu && (
        <>
          <div className="scrim" onClick={() => setMenu(false)} />
          <div className="menu" role="menu">
            <button onClick={() => { setMode('public'); setMenu(false); }}>
              <span className="ico"><Ic n="globe" s={18} /></span>
              <span>Public<small>Post as {name.trim() || 'You'}</small></span>
              {!anon && <span className="tick"><Ic n="check" s={18} /></span>}
            </button>
            <button onClick={() => { setMode('incognito'); setMenu(false); }}>
              <span className="ico"><Ic n="mask" s={18} /></span>
              <span>Incognito<small>Post as {alias}</small></span>
              {anon && <span className="tick"><Ic n="check" s={18} /></span>}
            </button>
          </div>
        </>
      )}
    </div>
  );

  const renderPost = (p: Post) => {
    const hide = p.sensitive && !revealed.includes(p.id);
    return (
      <article className="card post" key={p.id}>
        <div className="phead">
          <Avatar seed={p.handle} anon={p.anon} />
          <div className="pmeta"><strong>{p.name}</strong><span>@{p.handle} {'\u00b7'} {p.time}</span></div>
          {p.badge && <span className="chip">{p.badge}</span>}
        </div>
        <div className="pbody">
          <div className={hide ? 'blurred' : ''}>
            {p.img && <img className="pimg" src={p.img} alt="" />}
            <p className="cap"><Rich t={p.text} /></p>
          </div>
          {hide && (
            <div className="veil">
              <span>This post may be sensitive.</span>
              <button className="btn sm" onClick={() => setRevealed(r => [...r, p.id])}>View anyway</button>
            </div>
          )}
        </div>
        <div className="pact">
          {REACTS.map((r, i) => (
            <button key={r.l} className={'act' + (p.mine === i ? ' on' : '')} onClick={() => react(p.id, i)} aria-pressed={p.mine === i}>{r.i} {r.l} {p.reacts[i]}</button>
          ))}
          <button className="act" onClick={() => setOpenCmt(openCmt === p.id ? null : p.id)}><Ic n="chat" s={18} /> {p.comments.length}</button>
        </div>
        {openCmt === p.id && (
          <div className="cmts">
            {p.comments.map((c, i) => <p key={i}><strong>{c.by}</strong> {c.text}</p>)}
            <div className="cin">
              <input value={cmt} onChange={e => setCmt(e.target.value)} onKeyDown={e => e.key === 'Enter' && addComment(p.id)} placeholder="Write something kind" />
              <button className="btn sm" onClick={() => addComment(p.id)}>Send</button>
            </div>
          </div>
        )}
      </article>
    );
  };

  const personRow = (x: typeof PEOPLE[number]) => (
    <div className="person" key={x.h}>
      <Avatar seed={x.h} />
      <div><strong>{x.n}</strong> <span>{MOODS.find(m => m.id === x.mood)?.icon}</span><small>@{x.h} {'\u00b7'} {x.bio}</small></div>
      <button className="btn sm ghost" onClick={() => talkTo(x.h)}>Talk</button>
    </div>
  );

  const convoRow = (c: Contact) => {
    const last = (chats[c.id] || []).slice(-1)[0];
    return (
      <button className="convo" key={c.id} onClick={() => setChatWith(c.id)}>
        <Avatar seed={c.id} />
        <div><strong>{c.n}</strong><small>{last ? (last.from === 'me' ? 'You: ' : '') + last.text : 'Say hello'}</small></div>
      </button>
    );
  };

  if (splash)
    return (
      <>
        <style>{CSS}</style>
        <div className="splash">
          <div><h1>ditto</h1><p>us bro us</p></div>
          <div className="go"><button className="btn" onClick={() => setSplash(false)}>Get started</button></div>
        </div>
      </>
    );

  return (
    <>
      <style>{CSS}</style>

      <div className="mtop">
        {switcher}
        <button className="link" onClick={() => setTab('me')} aria-label="Open my profile"><Avatar seed={handle} anon={anon} size={34} /></button>
      </div>

      <div className="shell">
        <aside className="side">
          {switcher}
          {TABS.map(t => (
            <button key={t.id} className={`nav ${tab === t.id ? 'on' : ''}`} onClick={() => setTab(t.id)}><Ic n={t.icon} /> {t.label}</button>
          ))}
          <button className="me-mini" onClick={() => setTab('me')}>
            <Avatar seed={handle} anon={anon} size={36} />
            <div><strong>{me}</strong><small>{anon ? 'Incognito' : 'Public'} {'\u00b7'} Day {days}</small></div>
          </button>
        </aside>

        <main>
          <div className="head">
            <h2 className="t">{TABS.find(t => t.id === tab)?.label}</h2>
            <div className="moodwrap">
              <button className="moodbtn" onClick={() => setMoodOpen(!moodOpen)} aria-expanded={moodOpen}>
                <span>{curMood ? curMood.icon : '\u{1F642}'}</span> {curMood ? curMood.label : 'My mood'}
              </button>
              {moodOpen && (
                <>
                  <div className="scrim" onClick={() => setMoodOpen(false)} />
                  <div className="moodpop">
                    <strong style={{ fontSize: 14 }}>How are you today?</strong>
                    <div className="moods">
                      {MOODS.map(m => (
                        <button key={m.id} className={'mood' + (mood === m.id ? ' on' : '')} onClick={() => pickMood(m.id)}><span>{m.icon}</span>{m.label}</button>
                      ))}
                    </div>
                    <p className="muted" style={{ marginTop: 10 }}>People feeling the same can reach you in Allies.</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {crisis && (
            <section className="card crisis" role="alert">
              <h3 className="t">You matter, and you are not alone</h3>
              <p style={{ fontSize: 14 }}>If you are in danger or thinking of hurting yourself, please call Tele-MANAS at <strong>14416</strong> or your local emergency number now. We can also breathe together.</p>
              {breath && <p style={{ fontSize: 14, marginTop: 10 }}>Breathe in slowly for four. Hold gently. Let it out for six. Repeat three times. Then name five things you can see, four you can touch and three you can hear. This feeling will pass.</p>}
              <div className="row" style={{ marginTop: 10 }}>
                <button className="btn sm" onClick={() => setBreath(!breath)}>{breath ? 'Hide' : 'Breathe with me'}</button>
                <button className="btn sm ghost" onClick={() => { setAlly('doctors'); setTab('allies'); }}>Find help</button>
                <button className="btn sm ghost" onClick={() => setCrisis(false)}>Close</button>
              </div>
            </section>
          )}

          {tab === 'feed' && (
            <>
              <div className="moments">
                <button className="moment add" onClick={() => setMv('new')}><Ic n="plus" s={26} />Share a moment</button>
                {moments.map(m => (
              <button key={m.id} className={'moment' + (m.img ? ' pic' : '')} style={{ background: momentBg(m) }} onClick={() => setMv(m)}><b>{m.by}</b>{m.text.slice(0, 44)}{m.text.length > 44 ? '...' : ''}</button>
                ))}
              </div>

              <section className="card">
                <div className="row" style={{ alignItems: 'flex-start' }}>
                  <Avatar seed={handle} anon={anon} />
                  <textarea value={draft} onChange={e => setDraft(e.target.value)} placeholder={`What's on your mind, ${me}?`} />
                </div>
                {img && <img src={img} alt="Preview" style={{ width: '100%', borderRadius: 14, marginTop: 10, maxHeight: 220, objectFit: 'cover' }} />}
                <div className="row between" style={{ marginTop: 10 }}>
                  <button className="btn sm ghost" onClick={() => fileRef.current?.click()}><Ic n="image" s={16} /> Photo</button>
                  <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => pickImage(e.target.files?.[0])} />
                  <button className="btn" onClick={publish} disabled={!draft.trim() && !img}>Share</button>
                </div>
              </section>

              {posts.filter(p => !p.horizon).map(renderPost)}
            </>
          )}

          {tab === 'horizon' && (
            <>
              <p className="muted" style={{ marginBottom: 14 }}>Big life wins, from people who made it there.</p>
              <section className="card">
                <h3 className="t">Share a milestone</h3>
                <div className="scroll">
                  {HORIZON_TAGS.map(t => {
                    const locked = t.d !== undefined && days < t.d;
                    return <button key={t.label} className={`chipbtn ${hzTag === t.label ? 'on' : ''}`} disabled={locked} onClick={() => setHzTag(t.label)} title={t.note}>{t.label}</button>;
                  })}
                </div>
                <textarea style={{ marginTop: 10 }} value={hzText} onChange={e => setHzText(e.target.value)} placeholder="Tell the story behind it" />
                <button className="btn wide" onClick={publishHorizon} disabled={!hzTag}>Post to Horizon</button>
              </section>
              {posts.filter(p => p.horizon).map(renderPost)}
            </>
          )}

          {tab === 'allies' && (
            <>
              <div className="scroll" style={{ marginBottom: 12 }}>
                <button className={'chipbtn' + (ally === 'people' ? ' on' : '')} onClick={() => setAlly('people')}>People</button>
                <button className={'chipbtn' + (ally === 'doctors' ? ' on' : '')} onClick={() => setAlly('doctors')}>Doctors</button>
                <button className={'chipbtn' + (ally === 'centres' ? ' on' : '')} onClick={() => setAlly('centres')}>Rehab centres</button>
              </div>
              {ally === 'people' && (
                <>
                  <p className="muted" style={{ marginBottom: 10 }}>Find people by how they feel right now.</p>
                  <div className="scroll">
                    <button className={'chipbtn' + (filter === 'all' ? ' on' : '')} onClick={() => setFilter('all')}>Everyone</button>
                    {MOODS.map(m => <button key={m.id} className={'chipbtn' + (filter === m.id ? ' on' : '')} onClick={() => setFilter(m.id)}>{m.icon} {m.label}</button>)}
                  </div>
                  <section className="card" style={{ marginTop: 12 }}>
                    {PEOPLE.filter(x => filter === 'all' || x.mood === filter).map(personRow)}
                    {PEOPLE.filter(x => filter === 'all' || x.mood === filter).length === 0 && <p className="muted">No one here right now. Check back soon.</p>}
                  </section>
                </>
              )}
              {ally === 'doctors' && (
                <>
                  <p className="muted" style={{ marginBottom: 10 }}>Talk privately with a doctor. These are demo profiles.</p>
                  {DOCTORS.map(d => (
                    <section className="card" key={d.name}>
                      <div className="person" style={{ marginBottom: 0 }}>
                        <Avatar seed={d.name} size={48} />
                        <div><strong>{d.name}</strong><small>{d.role}</small><small>{d.tag}</small></div>
                      </div>
                      <button className="btn wide" onClick={() => talkTo(d.name)}>Message doctor</button>
                    </section>
                  ))}
                </>
              )}
              {ally === 'centres' && (
                <>
                  <p className="muted" style={{ marginBottom: 10 }}>Rehab centres and shelters you can contact. These are demo profiles.</p>
                  {CENTERS.map(c => (
                    <section className="card" key={c.name}>
                      <div className="person" style={{ marginBottom: 0 }}>
                        <Avatar seed={c.name} size={48} />
                        <div><strong>{c.name}</strong><small>{c.kind} {'\u00b7'} {c.where}</small><small>{c.tag}</small></div>
                      </div>
                      <button className="btn wide" onClick={() => talkTo(c.name)}>Message centre</button>
                    </section>
                  ))}
                </>
              )}
            </>
          )}

          {tab === 'chat' && (
            <>
              {!chatWith ? (
                <>
                  <p className="muted" style={{ marginBottom: 10 }}>Private and kind. Pick a conversation.</p>
                  <section className="card">
                    <div className="grp" style={{ marginTop: 0 }}>People</div>
                    {CONTACTS.filter(c => c.kind === 'person').map(convoRow)}
                    <div className="grp">Doctors</div>
                    {CONTACTS.filter(c => c.kind === 'doctor').map(convoRow)}
                    <div className="grp">Rehab centres</div>
                    {CONTACTS.filter(c => c.kind === 'centre').map(convoRow)}
                  </section>
                </>
              ) : (
                <section className="card">
                  <div className="row" style={{ marginBottom: 10 }}>
                    <button className="btn sm ghost" onClick={() => setChatWith(null)} aria-label="Back"><Ic n="back" s={16} /></button>
                    <Avatar seed={chatWith} size={36} />
                    <div style={{ lineHeight: 1.25 }}><strong>{contact?.n || chatWith}</strong><div className="muted">{contact?.sub}</div></div>
                  </div>
                  {contact && contact.kind !== 'person' && <p className="muted" style={{ marginBottom: 8 }}>Demo chat. Replies are automatic until a real partner is connected.</p>}
                  <div className="thread" ref={threadRef}>
                    {(chats[chatWith] || []).length === 0 && <p className="muted">Say hello. Your first message lights a star.</p>}
                    {(chats[chatWith] || []).map((m, i) => <div key={i} className={'bubble ' + m.from}>{m.text}</div>)}
                  </div>
                  <div className="cin">
                    <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Type a message" />
                    <button className="btn" onClick={send} aria-label="Send"><Ic n="send" s={18} /></button>
                  </div>
                </section>
              )}
            </>
          )}

          {tab === 'me' && (
            <>
              <section className="card">
                <div className="row">
                  <Avatar seed={handle} anon={anon} size={56} />
                  <div><h2 className="t">{me}</h2><span className="chip">{anon ? 'Incognito' : 'Public'} {'\u00b7'} Day {days}</span></div>
                </div>
                <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Your public name" />
                  <div className="row between"><span className="muted">Incognito name: {alias}</span><button className="btn sm ghost" onClick={() => setAlias(makeAlias())}>Shuffle</button></div>
                  <label className="muted">Journey start date</label>
                  <input type="date" value={start} max={today()} onChange={e => setStart(e.target.value || today())} />
                </div>
              </section>

              <section className="card">
                <h3 className="t">Your skylight</h3>
                <Sky count={count} />
                <p className="muted" style={{ margin: '8px 0 4px' }}>{count} of {MISSIONS.length} stars lit</p>
                {MISSIONS.map(m => {
                  const ok = earned.includes(m.id);
                  return (
                    <div key={m.id} className={`mission ${ok ? 'done' : ''}`}>
                      <span className="dot">{ok && <Ic n="check" s={16} />}</span>
                      <div><b>{m.title}</b><span className="muted">{m.desc}</span></div>
                    </div>
                  );
                })}
              </section>

              <section className="card">
                <h3 className="t">Daily affirmation</h3>
                <p style={{ fontSize: 15 }}>{AFFIRMATIONS[aff]}</p>
                <button className="btn wide" onClick={() => setAff((aff + 1) % AFFIRMATIONS.length)}>Show another</button>
              </section>
            </>
          )}
        </main>
      </div>

      <nav className="bottom" aria-label="Main">
        {TABS.map(t => <button key={t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}><Ic n={t.icon} />{t.label}</button>)}
      </nav>

      {mv && (
        <div className="modal" onClick={() => setMv(null)}>
          {mv === 'new' ? (
            <div className="box" onClick={e => e.stopPropagation()}>
              <h3 className="t">Share a moment</h3>
              <textarea value={mText} onChange={e => setMText(e.target.value)} placeholder="One small thing that happened today" />
              <button className="btn wide" onClick={shareMoment} disabled={!mText.trim()}>Share moment</button>
            </div>
          ) : (
            <div className="box" onClick={e => e.stopPropagation()} style={{ padding: 0 }}>
              <div className={'vm' + (mv.img ? ' pic' : '')} style={{ background: momentBg(mv) }}>
                <span className="muted" style={{ color: 'inherit', opacity: 0.85 }}>{mv.by}</span>{mv.text}
              </div>
            </div>
          )}
        </div>
      )}

      {popup && (
        <div className="modal" onClick={() => setPopup(false)} role="dialog" aria-label="New star">
          <div className="box" onClick={e => e.stopPropagation()}>
            <Sky count={count} fresh />
            <h2 className="t" style={{ marginTop: 12 }}>A new star is lit</h2>
            <p className="muted">{lastTitle}. {count} {count === 1 ? 'star' : 'stars'} in your sky now.</p>
            <button className="btn wide" onClick={() => setPopup(false)}>Keep going</button>
          </div>
        </div>
      )}
    </>
  );
}