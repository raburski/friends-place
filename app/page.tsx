import { LandingCtas } from "./_components/LandingCtas";

export default function Home() {
  return (
    <main className="landing-main">
      <section className="hero">
        <div className="hero-content">
          <span className="badge">Domy Kolegów</span>
          <h1>
            Prywatne miejsce na chatę twoją, i twojego kolegi.
          </h1>
          <p className="subtitle">
            Domy Kolegów to spokojna platforma dla znajomych, którzy chcą
            udostępniać sobie mieszkania i planować pobyty w swoim tempie. Od
            kolegów dla kolegów.
          </p>
          <LandingCtas />
          <p className="footer-note">
            Najpierw zaproszenie od znajomego, potem dostęp do miejsc i
            kalendarzy.
          </p>
        </div>
      </section>
    </main>
  );
}
