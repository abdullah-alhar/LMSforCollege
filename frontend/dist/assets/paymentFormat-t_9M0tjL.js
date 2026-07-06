import{m as i}from"./index-N1Doda8z.js";const l="https://altoppers-default-rtdb.firebaseio.com/new/main/payments",f=async()=>(await i.get(`${l}.json`)).data||{},A=async e=>(await i.get(`${l}/${encodeURIComponent(e)}.json`)).data||{},r=e=>String(e).replace(/([a-z])([A-Z])/g,"$1 $2").replace(/[_-]+/g," ").replace(/\b\w/g,t=>t.toUpperCase()),h=/(^| )(created|created at|date|id|key|timestamp|updated|updated at|subject id|title|type|image|photo|logo)( |$)/i,u=/(contact|phone|mobile|whatsapp|email|e mail|gmail|admin name|teacher name|^name$)/i,b=/(payment|bank|account|branch|holder|beneficiary|amount|fee|price|commercial|\bhnb\b|\bboc\b|amana)/i,g=/^[^\s@]+@[^\s@]+\.[^\s@]+$/i,y=/^\+?[\d][\d\s()+-]{6,}$/,m=(e,t=[])=>Object.entries(e||{}).flatMap(([n,a])=>{const s=[...t,r(n)];if(a==null||h.test(r(n)))return[];if(["string","number"].includes(typeof a)&&String(a).trim()){const c=String(a).split(`
`).filter(p=>p.trim().toLowerCase()!=="test").join(`
`).trim();return c?[{path:s.join(" · "),key:r(n),value:c}]:[]}return typeof a=="object"?m(a,s):[]}),o=e=>{const t=[],n=[];return m(e).forEach(a=>{const s=`${a.path} ${a.value}`;b.test(s)?n.push(a):u.test(a.path)||g.test(a.value)||y.test(a.value)?t.push(a):n.push(a)}),{contact:t,payment:n}},B=e=>{const t=o(e);return t.contact.length+t.payment.length>0},$=e=>{const t=String(e||"").split(`
`).filter(a=>a.trim().toLowerCase()!=="test").join(`
`).trim();if(!t||t.includes(`
`))return t;let n=t.match(/^8112003486\s+Weligama branch\s+S\.?M\.?Faizer$/i);return n?`8112003486 (Commercial Bank)
S.M.Faizer
Weligama branch`:(n=t.match(/^250020140392\s+\(?HNB\)?\s+S\.?M\.?Faizer\s+Aluthgama Branch$/i),n?`250020140392 (HNB)
S.M.Faizer
Aluthgama Branch`:(n=t.match(/^Faizer\s+Amana Bank\s+Galle branch\s+0110233283001$/i),n?`Faizer
Amana Bank
Galle branch
0110233283001`:(n=t.match(/^BOC\s+S\.?M\.?Faizer\s+87183233\s+Weligama branch$/i),n?`BOC
S.M.Faizer
87183233
Weligama branch`:(n=t.match(/^(?:Account:\s*)?(?:Name:\s*)?RIFAN M I Z\s+(?:Acc\.?\s*No:?\s*)?8112015558\s+(?:Bank:\s*)?Commercial Bank\s+(?:Branch:\s*)?WELIGAMA Branch$/i),n?`Account:
Name: RIFAN M I Z
Acc. No: 8112015558
Bank: Commercial Bank
Branch: WELIGAMA Branch`:t))))},P=(e,t)=>{const n=e||{},a=o(t||{}),s=o(n);return s.contact.length&&s.payment.length?n:{...n,...!s.contact.length&&a.contact.length?{fallbackContactDetails:a.contact.map(c=>c.value)}:{},...!s.payment.length&&a.payment.length?{fallbackPaymentDetails:a.payment.map(c=>c.value)}:{}}},F=e=>({admin:"Admin",bio:"Biology",phy:"Physics",chem:"Chemistry",math:"Combined Maths"})[String(e).toLowerCase()]||r(e);export{A as a,P as b,$ as f,o as g,B as h,f as l,F as p};
