import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Atom, BookOpen, Calculator, Dna, FlaskConical,
  GraduationCap, PlayCircle, ShieldCheck, Sparkles
} from 'lucide-react';

const subjects = [
  {
    name: 'Biology',
    description: 'Explore life science, genetics, human biology, ecology, and exam-focused lessons.',
    Icon: Dna,
    color: '#0f9f86',
  },
  {
    name: 'Chemistry',
    description: 'Learn organic, inorganic, physical, and analytical chemistry with guided video lessons.',
    Icon: FlaskConical,
    color: '#2563eb',
  },
  {
    name: 'Physics',
    description: 'Build confidence in mechanics, electricity, waves, matter, and modern physics.',
    Icon: Atom,
    color: '#7c3aed',
  },
  {
    name: 'Mathematics',
    description: 'Strengthen algebra, calculus, geometry, statistics, and problem-solving skills.',
    Icon: Calculator,
    color: '#ea580c',
  },
];

const PublicLanding = () => (
  <div className="seo-landing">
    <header className="seo-nav">
      <Link to="/" className="seo-brand" aria-label="Science Toppers home">
        <span><FlaskConical size={25} /></span>
        <div>
          <strong>Science Toppers</strong>
          <small>Crystal Science · Arafa</small>
        </div>
      </Link>
      <Link to="/login" className="seo-login-link">
        Student login <ArrowRight size={17} />
      </Link>
    </header>

    <main>
      <section className="seo-hero">
        <div className="seo-hero-copy">
          <p className="seo-eyebrow"><Sparkles size={15} /> Learn science with confidence</p>
          <h1>Science Toppers: Biology, Chemistry, Physics &amp; Mathematics</h1>
          <p className="seo-lead">
            Science Toppers—also known through Crystal Science and Arafa—is an online
            learning platform with focused lessons, revision resources, and exam preparation
            for science and mathematics students.
          </p>
          <div className="seo-actions">
            <Link to="/login" className="seo-primary">
              Open learning platform <ArrowRight size={18} />
            </Link>
            <a href="#subjects" className="seo-secondary">
              Browse subjects
            </a>
          </div>
          <div className="seo-trust">
            <span><PlayCircle size={17} /> Video learning</span>
            <span><BookOpen size={17} /> Study resources</span>
            <span><ShieldCheck size={17} /> Secure student access</span>
          </div>
        </div>
        <div className="seo-hero-art" aria-hidden="true">
          <span className="seo-orbit seo-orbit-one"><Atom size={38} /></span>
          <span className="seo-orbit seo-orbit-two"><Dna size={34} /></span>
          <div className="seo-art-card">
            <GraduationCap size={58} />
            <strong>Learn. Practise. Excel.</strong>
            <small>Science education made clearer.</small>
          </div>
        </div>
      </section>

      <section id="subjects" className="seo-subject-section" aria-labelledby="subjects-title">
        <div className="seo-section-heading">
          <p>Our learning areas</p>
          <h2 id="subjects-title">Study the subjects that shape your future</h2>
          <span>Clear explanations, structured lessons, and resources designed for effective revision.</span>
        </div>
        <div className="seo-subject-grid">
          {subjects.map(({ name, description, Icon, color }) => (
            <article className="seo-subject-card" key={name}>
              <span className="seo-subject-icon" style={{ '--subject-color': color }}>
                <Icon size={29} />
              </span>
              <h3>{name}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="seo-cta">
        <div>
          <p>Already a registered student?</p>
          <h2>Continue learning with Science Toppers</h2>
        </div>
        <Link to="/login">Sign in now <ArrowRight size={18} /></Link>
      </section>
    </main>

    <footer className="seo-footer">
      <strong>Science Toppers</strong>
      <span>Crystal Science · Arafa · Biology · Chemistry · Physics · Mathematics</span>
      <small>© {new Date().getFullYear()} Science Toppers. All rights reserved.</small>
    </footer>

    <style>{`
      .seo-landing {
        min-height: 100vh;
        overflow: hidden;
        background:
          radial-gradient(circle at 8% 5%, rgba(96,165,250,.22), transparent 25rem),
          radial-gradient(circle at 94% 30%, rgba(14,165,233,.13), transparent 26rem),
          #f7faff;
        color: #14213d;
        font-family: Inter, system-ui, sans-serif;
      }
      .seo-nav {
        width: min(1180px, calc(100% - 40px));
        min-height: 82px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .seo-brand { display:flex; align-items:center; gap:12px; color:#14213d; text-decoration:none; }
      .seo-brand > span {
        width:46px; height:46px; display:grid; place-items:center; border-radius:14px;
        color:#fff; background:linear-gradient(135deg,#60a5fa,#2563eb);
        box-shadow:0 10px 25px rgba(37,99,235,.22);
      }
      .seo-brand div { display:flex; flex-direction:column; }
      .seo-brand strong { font:800 1.05rem/1.2 "Space Grotesk",Inter,sans-serif; }
      .seo-brand small { margin-top:3px; color:#718096; font-size:.72rem; letter-spacing:.03em; }
      .seo-login-link, .seo-primary, .seo-cta a {
        display:inline-flex; align-items:center; justify-content:center; gap:8px;
        min-height:46px; padding:0 19px; border-radius:12px; text-decoration:none;
        color:#fff; background:linear-gradient(135deg,#3b82f6,#2563eb);
        font-weight:750; box-shadow:0 10px 24px rgba(37,99,235,.2);
      }
      .seo-hero {
        width:min(1180px,calc(100% - 40px)); margin:55px auto 95px;
        display:grid; grid-template-columns:minmax(0,1.1fr) minmax(360px,.9fr);
        align-items:center; gap:70px;
      }
      .seo-eyebrow {
        display:flex; align-items:center; gap:8px; margin-bottom:18px;
        color:#2563eb; font-weight:800; font-size:.77rem; letter-spacing:.1em; text-transform:uppercase;
      }
      .seo-hero h1 {
        max-width:760px; margin:0; color:#10214a;
        font:800 clamp(2.6rem,5vw,4.8rem)/1.04 "Space Grotesk",Inter,sans-serif;
        letter-spacing:-.045em;
      }
      .seo-lead { max-width:730px; margin:25px 0 0; color:#5c6f8e; font-size:1.08rem; line-height:1.75; }
      .seo-actions { display:flex; flex-wrap:wrap; gap:12px; margin-top:31px; }
      .seo-primary { min-height:52px; padding:0 23px; }
      .seo-secondary {
        min-height:52px; padding:0 23px; display:inline-flex; align-items:center;
        color:#24549b; border:1px solid #bfd5f7; border-radius:12px; background:rgba(255,255,255,.7);
        text-decoration:none; font-weight:750;
      }
      .seo-trust { display:flex; flex-wrap:wrap; gap:18px; margin-top:28px; color:#64748b; font-size:.82rem; }
      .seo-trust span { display:flex; align-items:center; gap:6px; }
      .seo-hero-art { position:relative; min-height:430px; display:grid; place-items:center; }
      .seo-hero-art::before {
        content:""; position:absolute; inset:6%; border-radius:50%;
        background:linear-gradient(145deg,rgba(191,219,254,.55),rgba(239,246,255,.25));
        border:1px solid rgba(147,197,253,.35);
      }
      .seo-art-card {
        position:relative; z-index:2; width:min(315px,78%); aspect-ratio:1;
        display:flex; flex-direction:column; align-items:center; justify-content:center; gap:13px;
        border:1px solid rgba(255,255,255,.9); border-radius:34px;
        color:#2563eb; background:rgba(255,255,255,.82); backdrop-filter:blur(18px);
        box-shadow:0 28px 70px rgba(30,64,175,.16);
      }
      .seo-art-card strong { color:#172554; font:800 1.35rem "Space Grotesk",sans-serif; }
      .seo-art-card small { color:#718096; }
      .seo-orbit {
        position:absolute; z-index:3; width:74px; height:74px; border-radius:22px;
        display:grid; place-items:center; background:#fff; box-shadow:0 18px 40px rgba(30,64,175,.14);
      }
      .seo-orbit-one { top:8%; right:4%; color:#7c3aed; transform:rotate(8deg); }
      .seo-orbit-two { bottom:7%; left:2%; color:#0f9f86; transform:rotate(-8deg); }
      .seo-subject-section { width:min(1180px,calc(100% - 40px)); margin:0 auto 92px; }
      .seo-section-heading { max-width:690px; margin-bottom:34px; }
      .seo-section-heading > p { color:#2563eb; font-size:.76rem; font-weight:800; letter-spacing:.1em; text-transform:uppercase; }
      .seo-section-heading h2 { margin:9px 0 12px; color:#10214a; font:800 clamp(2rem,3.5vw,3rem)/1.12 "Space Grotesk",sans-serif; letter-spacing:-.035em; }
      .seo-section-heading span { color:#64748b; line-height:1.65; }
      .seo-subject-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:17px; }
      .seo-subject-card {
        min-height:250px; padding:27px; border:1px solid #dbe7f6; border-radius:21px;
        background:rgba(255,255,255,.84); box-shadow:0 15px 38px rgba(30,64,175,.07);
      }
      .seo-subject-icon {
        width:58px; height:58px; display:grid; place-items:center; border-radius:16px;
        color:var(--subject-color); background:color-mix(in srgb,var(--subject-color) 10%,white);
      }
      .seo-subject-card h3 { margin:23px 0 10px; color:#172554; font:800 1.25rem "Space Grotesk",sans-serif; }
      .seo-subject-card p { margin:0; color:#64748b; font-size:.9rem; line-height:1.65; }
      .seo-cta {
        width:min(1180px,calc(100% - 40px)); margin:0 auto 70px; padding:36px 40px;
        display:flex; align-items:center; justify-content:space-between; gap:25px;
        border:1px solid #bfdbfe; border-radius:24px;
        background:linear-gradient(120deg,#eff6ff,#fff);
      }
      .seo-cta p { margin:0 0 5px; color:#2563eb; font-size:.78rem; font-weight:800; text-transform:uppercase; letter-spacing:.08em; }
      .seo-cta h2 { margin:0; color:#172554; font:800 clamp(1.45rem,3vw,2rem) "Space Grotesk",sans-serif; }
      .seo-footer {
        width:min(1180px,calc(100% - 40px)); margin:auto; padding:28px 0 36px;
        display:flex; flex-wrap:wrap; justify-content:space-between; gap:12px;
        border-top:1px solid #dbe7f6; color:#718096; font-size:.78rem;
      }
      .seo-footer strong { color:#172554; }
      @media(max-width:900px) {
        .seo-hero { grid-template-columns:1fr; margin-top:35px; gap:25px; }
        .seo-hero-art { min-height:370px; }
        .seo-subject-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
      }
      @media(max-width:600px) {
        .seo-nav { width:min(100% - 28px,1180px); min-height:72px; }
        .seo-brand small { display:none; }
        .seo-login-link { min-height:42px; padding:0 13px; font-size:.78rem; }
        .seo-hero,.seo-subject-section,.seo-cta,.seo-footer { width:calc(100% - 28px); }
        .seo-hero { margin:34px auto 70px; }
        .seo-hero h1 { font-size:clamp(2.35rem,12vw,3.25rem); }
        .seo-lead { font-size:.98rem; }
        .seo-actions { display:grid; }
        .seo-trust { display:grid; gap:10px; }
        .seo-hero-art { min-height:330px; }
        .seo-subject-grid { grid-template-columns:1fr; }
        .seo-subject-card { min-height:unset; }
        .seo-cta { padding:28px 22px; align-items:flex-start; flex-direction:column; }
        .seo-cta a { width:100%; }
        .seo-footer { flex-direction:column; }
      }
    `}</style>
  </div>
);

export default PublicLanding;
