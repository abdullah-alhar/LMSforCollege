import{c as N,r as i,j as e,X as L,L as k,C as z,b as O,A as Y,P as I,d as R,a as W,u as G,S as q,e as E,G as H,f as _}from"./index-N1Doda8z.js";import{g as F,p as P,l as B,h as $,a as b,b as M,f as U}from"./paymentFormat-t_9M0tjL.js";/**
 * @license lucide-react v0.364.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Q=N("EyeOff",[["path",{d:"M9.88 9.88a3 3 0 1 0 4.24 4.24",key:"1jxqfv"}],["path",{d:"M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68",key:"9wicm4"}],["path",{d:"M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61",key:"1jreej"}],["line",{x1:"2",x2:"22",y1:"2",y2:"22",key:"a6p6uj"}]]);/**
 * @license lucide-react v0.364.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const V=N("Eye",[["path",{d:"M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z",key:"rwhkz3"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]);/**
 * @license lucide-react v0.364.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const X=N("MonitorCheck",[["path",{d:"m9 10 2 2 4-4",key:"1gnqz4"}],["rect",{width:"20",height:"14",x:"2",y:"3",rx:"2",key:"48i651"}],["path",{d:"M12 17v4",key:"1riwvh"}],["path",{d:"M8 21h8",key:"1ev6f3"}]]),f=["admin","bio","phy","chem","math"],A=({title:d,rows:a,icon:r})=>a.length?e.jsxs("section",{className:"essential-payment-block",children:[e.jsxs("h3",{children:[r,d]}),e.jsx("div",{className:"essential-payment-values",children:a.map((m,g)=>e.jsx("div",{className:"payment-detail-value",children:U(m.value)},`${m.path}-${g}`))})]}):null,Z=({onClose:d,subjectId:a="admin"})=>{const[r,m]=i.useState(null),[g,y]=i.useState(a==="all"?null:a),[h,c]=i.useState(""),[l,p]=i.useState(!1);i.useEffect(()=>{(async()=>{try{if(a==="all"){const n=await R.get("/payment-info/all").catch(()=>({data:{}})),o=n.data&&Object.keys(n.data).length?n.data:await B();m(o||{})}else{const n=await R.get(`/payment-info/${a}`).catch(()=>({data:{}})),o=$(n.data)?n.data:await b(a),u=a==="admin"?o:await b("admin").catch(()=>({}));m({[a]:M(o,u)})}}catch{try{m(a==="all"?await B():{[a]:await b(a)})}catch{c("Payment information is temporarily unavailable.")}}})()},[a]);const w=i.useMemo(()=>{if(!r)return[];const s=Object.keys(r).filter(n=>r[n]&&typeof r[n]=="object").sort((n,o)=>(f.indexOf(n)<0?99:f.indexOf(n))-(f.indexOf(o)<0?99:f.indexOf(o)));return s.length?s:f},[r]),x=g?F((r==null?void 0:r[g])||{}):{contact:[],payment:[]},C=async s=>{y(s);const n=F((r==null?void 0:r[s])||{});if(!(n.contact.length&&n.payment.length)){p(!0);try{const o=(r==null?void 0:r[s])||await b(s),u=s==="admin"?o:(r==null?void 0:r.admin)||await b("admin").catch(()=>({}));m(j=>({...j||{},[s]:M(o,u)}))}finally{p(!1)}}};return e.jsx("div",{className:"modal-backdrop",onClick:d,children:e.jsxs("section",{className:"payment-sheet",onClick:s=>s.stopPropagation(),children:[e.jsx("button",{className:"icon-button modal-close",onClick:d,"aria-label":"Close",children:e.jsx(L,{size:18})}),!r&&!h?e.jsxs("div",{className:"modal-loading",children:[e.jsx(k,{className:"spin",size:20})," Loading payment details…"]}):h?e.jsx("div",{className:"form-alert error",children:h}):g?e.jsxs(e.Fragment,{children:[a==="all"&&e.jsxs("button",{className:"payment-back-button",onClick:()=>y(null),children:[e.jsx(Y,{size:17})," Subjects"]}),e.jsx("div",{className:"payment-sheet-title",children:"Payment & Contact"}),e.jsx("p",{className:"payment-subject-name",children:P(g)}),l?e.jsxs("div",{className:"modal-loading",children:[e.jsx(k,{className:"spin",size:20})," Loading payment details…"]}):e.jsxs(e.Fragment,{children:[e.jsx(A,{title:"Contact Details",rows:x.contact,icon:e.jsx(I,{size:17})}),e.jsx(A,{title:"Payment Details",rows:x.payment,icon:e.jsx(z,{size:17})})]}),!l&&!x.contact.length&&!x.payment.length&&e.jsx("div",{className:"form-alert error",children:"Payment details are not configured for this subject."})]}):e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"payment-sheet-title",children:"Select Your Subject"}),e.jsx("div",{className:"payment-subject-list",children:w.map(s=>e.jsxs("button",{onClick:()=>C(s),children:[e.jsxs("span",{children:[e.jsx(z,{size:17}),P(s)]}),e.jsx(O,{size:18})]},s))})]})]})})},ee=()=>{const[d,a]=i.useState(""),[r,m]=i.useState(""),[g,y]=i.useState(!1),[h,c]=i.useState(""),[l,p]=i.useState(!1),[w,x]=i.useState(!1),[C,s]=i.useState(!1),[n,o]=i.useState(!1),{login:u,user:j}=W(),v=G();i.useEffect(()=>{j&&v("/",{replace:!0})},[j,v]),i.useEffect(()=>{setTimeout(()=>x(!0),80)},[]);const T=async t=>{if(t.preventDefault(),c(""),!d.trim()){c("Please enter your index number.");return}if(!r){c("Please enter your password.");return}p(!0);try{const S=await u(d.trim(),r);S.ok?v("/"):S.code==="BROWSER_REGISTRATION_REQUIRED"?o(!0):S.code==="DIFFERENT_BROWSER"?c(S.message):c("Incorrect index number or password.")}catch{c("Connection error. Please try again.")}finally{p(!1)}},D=async()=>{p(!0),c("");try{const t=await u(d.trim(),r,!0);t.ok?(o(!1),v("/")):(o(!1),c(t.message||"This browser could not be registered. Please contact an administrator."))}catch{o(!1),c("Connection error. Please try again.")}finally{p(!1)}};return e.jsxs("div",{className:"auth-page",style:{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--bg-deep)",fontFamily:"'Inter', sans-serif",padding:"1.5rem"},children:[C&&e.jsx(Z,{subjectId:"all",onClose:()=>s(!1)}),n&&e.jsx("div",{className:"browser-register-overlay",role:"dialog","aria-modal":"true","aria-labelledby":"browser-register-title",children:e.jsxs("div",{className:"browser-register-modal",children:[e.jsx("button",{type:"button",className:"browser-register-close","aria-label":"Cancel browser registration",onClick:()=>o(!1),disabled:l,children:e.jsx(L,{size:20})}),e.jsx("div",{className:"browser-register-icon",children:e.jsx(X,{size:32})}),e.jsxs("p",{className:"browser-register-eyebrow",children:[e.jsx(q,{size:15})," Secure web access"]}),e.jsx("h2",{id:"browser-register-title",children:"Register this browser?"}),e.jsx("p",{children:"Your student account can use only one web browser. Registering this browser will allow access here until an administrator resets it."}),e.jsx("div",{className:"browser-register-note",children:"Your mobile app registration is separate and will not be changed."}),e.jsxs("div",{className:"browser-register-actions",children:[e.jsx("button",{type:"button",className:"btn btn-ghost",onClick:()=>o(!1),disabled:l,children:"No, back to login"}),e.jsx("button",{type:"button",className:"btn",onClick:D,disabled:l,children:l?e.jsxs(e.Fragment,{children:[e.jsx(k,{size:16,className:"spin"})," Registering…"]}):e.jsxs(e.Fragment,{children:["Yes, register browser ",e.jsx(E,{size:16})]})})]})]})}),e.jsxs("div",{className:"auth-card",style:{width:"100%",maxWidth:535,background:"rgba(255,255,255,.97)",border:"1px solid var(--border)",borderRadius:"var(--r-xl)",padding:"3.25rem 3.25rem",boxShadow:"var(--shadow-lg)",opacity:w?1:0,transform:w?"none":"translateY(10px)",transition:"opacity .5s ease, transform .5s ease"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"0.625rem",marginBottom:"2rem",justifyContent:"center"},children:[e.jsx("div",{style:{width:52,height:52,background:"linear-gradient(135deg, #60A5FA, #3B82F6)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"var(--shadow-teal)"},children:e.jsx(H,{size:27,color:"#ffffff"})}),e.jsx("span",{style:{fontFamily:"'Space Grotesk', sans-serif",fontWeight:800,fontSize:"1.1rem",color:"var(--text)",letterSpacing:"-0.01em"},children:"LMS for College"})]}),e.jsxs("div",{style:{textAlign:"center",marginBottom:"2rem"},children:[e.jsx("h1",{style:{fontFamily:"'Space Grotesk', sans-serif",fontSize:"1.75rem",fontWeight:800,color:"var(--text)",marginBottom:"0.5rem",letterSpacing:"-0.02em",lineHeight:1.2},children:"Welcome Back"}),e.jsx("p",{style:{color:"var(--text-muted)",fontSize:"0.9rem"},children:"Enter your credentials to access your account"})]}),h&&e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"0.5rem",background:"rgba(239,68,68,.08)",border:"1px solid rgba(239,68,68,.2)",color:"var(--danger)",padding:"0.8rem 1rem",borderRadius:"var(--r-sm)",fontSize:"0.85rem",marginBottom:"1.5rem",animation:"slideDown .3s ease"},children:[e.jsx(_,{size:15,style:{flexShrink:0}}),h]}),e.jsxs("form",{onSubmit:T,children:[e.jsxs("div",{style:{marginBottom:"1.25rem"},children:[e.jsx("label",{style:{display:"block",fontSize:"0.8rem",fontWeight:600,color:"var(--text-muted)",marginBottom:"0.5rem",letterSpacing:".03em",textTransform:"uppercase"},children:"Index Number"}),e.jsx("input",{type:"text",placeholder:"e.g. 2024/SCI/0042",value:d,onChange:t=>a(t.target.value),required:!0,autoComplete:"username",style:{width:"100%",padding:"0.875rem 1rem",background:"var(--bg-2)",border:"1.5px solid var(--border)",borderRadius:"var(--r-sm)",color:"var(--text)",fontFamily:"Inter, sans-serif",fontSize:"0.95rem",outline:"none",boxSizing:"border-box",transition:"border-color .2s, box-shadow .2s"},onFocus:t=>{t.target.style.borderColor="var(--teal)",t.target.style.boxShadow="0 0 0 3px var(--teal-glow-sm)"},onBlur:t=>{t.target.style.borderColor="var(--border)",t.target.style.boxShadow="none"}})]}),e.jsxs("div",{style:{marginBottom:"2rem"},children:[e.jsx("label",{style:{display:"block",fontSize:"0.8rem",fontWeight:600,color:"var(--text-muted)",marginBottom:"0.5rem",letterSpacing:".03em",textTransform:"uppercase"},children:"Password"}),e.jsxs("div",{style:{position:"relative"},children:[e.jsx("input",{type:g?"text":"password",placeholder:"Enter your password",value:r,onChange:t=>m(t.target.value),required:!0,autoComplete:"current-password",style:{width:"100%",padding:"0.875rem 3rem 0.875rem 1rem",background:"var(--bg-2)",border:"1.5px solid var(--border)",borderRadius:"var(--r-sm)",color:"var(--text)",fontFamily:"Inter, sans-serif",fontSize:"0.95rem",outline:"none",boxSizing:"border-box",transition:"border-color .2s, box-shadow .2s"},onFocus:t=>{t.target.style.borderColor="var(--teal)",t.target.style.boxShadow="0 0 0 3px var(--teal-glow-sm)"},onBlur:t=>{t.target.style.borderColor="var(--border)",t.target.style.boxShadow="none"}}),e.jsx("button",{type:"button",onClick:()=>y(t=>!t),style:{position:"absolute",right:"0.875rem",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"var(--text-muted)",cursor:"pointer",padding:0,lineHeight:1,display:"flex",alignItems:"center"},children:g?e.jsx(Q,{size:18}):e.jsx(V,{size:18})})]})]}),e.jsx("button",{type:"submit",disabled:l,style:{width:"100%",padding:"0.925rem",background:"var(--grad-teal)",border:"none",borderRadius:"var(--r-sm)",color:"#ffffff",fontFamily:"'Space Grotesk', sans-serif",fontWeight:700,fontSize:"0.975rem",cursor:l?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"0.5rem",boxShadow:"var(--shadow-teal)",transition:"all .2s",letterSpacing:".01em",opacity:l?.7:1},onMouseEnter:t=>{l||(t.currentTarget.style.transform="translateY(-1px)",t.currentTarget.style.boxShadow="0 8px 30px var(--teal-glow)")},onMouseLeave:t=>{t.currentTarget.style.transform="",t.currentTarget.style.boxShadow="var(--shadow-teal)"},children:l?e.jsxs(e.Fragment,{children:[e.jsx(k,{size:17,className:"spin"})," Signing in…"]}):e.jsxs(e.Fragment,{children:["Sign In ",e.jsx(E,{size:17})]})})]}),e.jsx("div",{className:"auth-divider",children:e.jsx("span",{children:"New to Science Toppers?"})}),e.jsxs("button",{type:"button",className:"register-payment-button",onClick:()=>s(!0),children:[e.jsx(z,{size:17}),"Register"]}),e.jsxs("p",{style:{fontSize:"0.75rem",color:"var(--text-dim)",textAlign:"center",marginTop:"2.5rem"},children:["© ",new Date().getFullYear()," LMS for College. All rights reserved."]})]}),e.jsx("style",{children:`
        @keyframes slideDown {
          from { opacity:0; transform:translateY(-6px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes spin { to { transform:rotate(360deg); } }
        .spin { animation: spin .8s linear infinite; display:inline-block; }
        input::placeholder { color: var(--text-dim); }
        .browser-register-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: grid;
          place-items: center;
          padding: 1.25rem;
          background: rgba(15, 23, 42, .42);
          backdrop-filter: blur(12px);
        }
        .browser-register-modal {
          position: relative;
          width: min(100%, 500px);
          padding: 2.25rem;
          border: 1px solid rgba(148, 163, 184, .3);
          border-radius: 24px;
          background: rgba(255, 255, 255, .98);
          box-shadow: 0 30px 90px rgba(15, 23, 42, .24);
          text-align: center;
          animation: browserModalIn .22s ease-out;
        }
        .browser-register-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          width: 42px;
          height: 42px;
          border: 1px solid #e2e8f0;
          border-radius: 50%;
          background: #f8fafc;
          color: #64748b;
          display: grid;
          place-items: center;
          cursor: pointer;
        }
        .browser-register-icon {
          width: 72px;
          height: 72px;
          margin: 0 auto 1.15rem;
          border-radius: 20px;
          display: grid;
          place-items: center;
          color: #fff;
          background: linear-gradient(135deg, #60a5fa, #2563eb);
          box-shadow: 0 14px 32px rgba(37, 99, 235, .25);
        }
        .browser-register-eyebrow {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: .4rem;
          margin-bottom: .6rem;
          color: #2563eb !important;
          font-size: .76rem !important;
          font-weight: 800;
          letter-spacing: .08em;
          text-transform: uppercase;
        }
        .browser-register-modal h2 {
          margin: 0 0 .75rem;
          color: #172554;
          font: 800 1.65rem/1.2 "Space Grotesk", sans-serif;
        }
        .browser-register-modal > p {
          color: #64748b;
          font-size: .94rem;
          line-height: 1.65;
        }
        .browser-register-note {
          margin: 1.25rem 0;
          padding: .85rem 1rem;
          border: 1px solid #bfdbfe;
          border-radius: 12px;
          background: #eff6ff;
          color: #1e40af;
          font-size: .84rem;
          line-height: 1.5;
        }
        .browser-register-actions {
          display: grid;
          grid-template-columns: 1fr 1.25fr;
          gap: .75rem;
        }
        .browser-register-actions .btn {
          min-height: 48px;
          justify-content: center;
        }
        @keyframes browserModalIn {
          from { opacity: 0; transform: translateY(10px) scale(.98); }
          to { opacity: 1; transform: none; }
        }
        @media (max-width: 560px) {
          .browser-register-modal { padding: 2rem 1.15rem 1.25rem; border-radius: 20px; }
          .browser-register-actions { grid-template-columns: 1fr; }
          .browser-register-actions .btn:last-child { order: -1; }
        }
      `})]})};export{ee as default};
