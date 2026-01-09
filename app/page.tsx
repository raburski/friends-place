export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="hero-content">
          <span className="badge">Domy Kolegów</span>
          <h1>
            Prywatne miejsca na wspólne wyjazdy, bez spiny i bez opłat.
          </h1>
          <p className="subtitle">
            Domy Kolegów to spokojna platforma dla znajomych, którzy chcą
            udostępniać sobie mieszkania i planować pobyty w swoim tempie. Od
            kolegów dla kolegów.
          </p>
          <div className="cta-row">
            <a className="cta" href="/api/auth/signin?callbackUrl=/places">
              Zaloguj / Pobierz aplikację
            </a>
            <a className="secondary" href="/places">
              Dowiedz się więcej
            </a>
          </div>
          <p className="footer-note">
            Najpierw zaproszenie od znajomego, potem dostęp do miejsc i
            kalendarzy.
          </p>
        </div>
      </section>
    </main>
  );
}
