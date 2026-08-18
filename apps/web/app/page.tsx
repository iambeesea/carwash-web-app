import { ArrowRight, CalendarCheck, Car, CreditCard, ShieldCheck, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import { HeroCar } from "@/components/hero-car";
import { LiveCapacity } from "@/components/live-capacity";
import { ServiceCards } from "@/components/service-cards";
import { Logo } from "@/components/logo";

export default function HomePage() {
  return (
    <main>
      <section className="hero-section">
        <div className="hero-grid container">
          <div className="hero-copy">
            <div className="eyebrow"><span /> SMARTER CAR CARE</div>
            <h1>YOUR SHINE.<br /><em>ON YOUR TIME.</em></h1>
            <p>Book ahead, skip the line, and drive away spotless. Your car-wash routine—finally made effortless.</p>
            <div className="hero-actions">
              <Link className="button button-yellow button-large" href="/book">Book your wash <ArrowRight size={18} /></Link>
              <Link className="text-link" href="#services">Explore services <span>↘</span></Link>
            </div>
            <div className="trust-row">
              <div className="avatar-stack"><span>JC</span><span>AM</span><span>RL</span></div>
              <div><div className="stars">★★★★★</div><small>Loved by 500+ local drivers</small></div>
            </div>
          </div>
          <HeroCar />
        </div>
        <div className="container capacity-wrap"><LiveCapacity /></div>
      </section>

      <section className="section services-section" id="services">
        <div className="container">
          <div className="section-heading split-heading">
            <div><span className="kicker">CHOOSE YOUR CLEAN</span><h2>A WASH FOR<br />EVERY <em>RIDE.</em></h2></div>
            <p>From a quick reset to a full detail, every service uses quality products and careful hands.</p>
          </div>
          <ServiceCards />
        </div>
      </section>

      <section className="section how-section" id="how-it-works">
        <div className="container how-grid">
          <div className="how-copy">
            <span className="kicker kicker-dark">HOW IT WORKS</span>
            <h2>THREE STEPS.<br /><em>ZERO HASSLE.</em></h2>
            <p>Plan the wash from your phone, then follow its progress without guessing when your car will be ready.</p>
            <Link className="button button-yellow" href="/book">Schedule now <ArrowRight size={17} /></Link>
          </div>
          <div className="steps-list">
            <article><span>01</span><CalendarCheck /><div><h3>Pick a time</h3><p>Choose your vehicle, wash package, date, and available time.</p></div></article>
            <article><span>02</span><Car /><div><h3>Arrive & relax</h3><p>We already have your plate and model, so check-in is quick.</p></div></article>
            <article><span>03</span><Sparkles /><div><h3>Drive out shining</h3><p>Track the wash live, pay at the shop, and receive your loyalty stamp.</p></div></article>
          </div>
        </div>
      </section>

      <section className="section loyalty-section" id="loyalty">
        <div className="container loyalty-grid">
          <div className="loyalty-card-visual">
            <div className="loyalty-card-top"><Logo compact /><span>SHINE CLUB</span></div>
            <h3>7 WASHES.<br /><em>8TH IS ON US.</em></h3>
            <div className="stamp-row">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((stamp) => <span key={stamp} className={stamp <= 5 ? "stamped" : ""}>{stamp <= 5 ? <Star size={19} fill="currentColor" /> : stamp}</span>)}
            </div>
            <small>DIGITAL STAMPS • NO CARD TO LOSE</small>
          </div>
          <div className="loyalty-copy">
            <span className="kicker">LOYALTY THAT PAYS</span>
            <h2>KEEP IT CLEAN.<br /><em>GET REWARDED.</em></h2>
            <p>Every completed wash earns a digital stamp. See your progress anytime and claim a complimentary wash when the card is full.</p>
            <ul className="feature-list">
              <li><ShieldCheck /> Stamps are tied securely to your account</li>
              <li><CreditCard /> No physical card or paper record needed</li>
              <li><Sparkles /> Admin-verified stamps prevent duplicates</li>
            </ul>
            <Link className="button button-dark" href="/sign-up">Join Shine Club <ArrowRight size={17} /></Link>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container">
          <div><span>READY WHEN YOU ARE</span><h2>YOUR CLEANEST DRIVE<br />STARTS <em>HERE.</em></h2></div>
          <Link className="button button-light button-large" href="/book">Book a wash <ArrowRight size={18} /></Link>
        </div>
      </section>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div><Logo /><p>Smarter car care for busy drivers.</p></div>
          <div><strong>Visit us</strong><span>Malolos, Bulacan</span><span>Mon–Sun • 8:00 AM–6:00 PM</span></div>
          <div><strong>Quick links</strong><Link href="/book">Book a wash</Link><Link href="/sign-in">Customer login</Link></div>
        </div>
        <div className="container footer-bottom"><span>© 2026 WashWise Car Care</span><span>Built for better operations.</span></div>
      </footer>
    </main>
  );
}
