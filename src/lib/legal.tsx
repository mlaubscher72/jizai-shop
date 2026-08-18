import type { ReactNode } from "react";
import type { Lang } from "./i18n";

/**
 * Inhalt der Datenschutzerklärung — bewusst hier und nicht im UI-Wörterbuch,
 * weil es Fliesstext ist und i18n.tsx sonst unlesbar wird.
 *
 * Die Angaben beschreiben den tatsächlichen Stand der Anwendung:
 *   - Schriften liegen lokal (next/font lädt sie beim Bauen herunter) —
 *     zur Laufzeit geht KEINE Anfrage an Google Fonts
 *   - keine Analyse- oder Werbewerkzeuge
 *   - Cookie-Namen und Laufzeiten stammen aus auth.ts, order-access.ts,
 *     LangSwitch.tsx und CartContext.tsx
 * Wer daran etwas ändert, muss diesen Text nachziehen.
 */

export const PRIVACY_UPDATED = "15. August 2026";
export const PRIVACY_UPDATED_EN = "15 August 2026";

/**
 * JIZAI ist eine Marke der Edgewind GmbH — bis eine eigene Gesellschaft
 * gegründet ist, tritt die Edgewind GmbH als verantwortliche Stelle auf.
 * Ändert sich das, sind Datenschutzerklärung und Impressum nachzuziehen.
 */
export const CONTROLLER = {
  brand: "JIZAI",
  company: "Edgewind GmbH",
  represented: "Michel Laubscher",
  street: "Benzburweg 32",
  city: "CH-4312 Liestal",
  country: "Schweiz",
  countryEn: "Switzerland",
  uid: "CHE-153.133.930",
  register: "Handelsregister des Kantons Basel-Landschaft",
  registerEn: "Commercial Register of the Canton of Basel-Landschaft",
  email: "hello@jizai.ch",
};

export interface LegalSection {
  n: string;
  title: string;
  body: ReactNode;
}

export interface LegalDoc {
  label: string;
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
  back: string;
}

/* ---------- Cookie-Tabelle, in beiden Sprachen dieselben Werte ---------- */

interface Row {
  name: string;
  purpose: string;
  life: string;
}

function Table({ head, rows }: { head: [string, string, string]; rows: Row[] }) {
  return (
    <div className="legal-table-wrap">
      <table className="legal-table">
        <thead>
          <tr>
            <th>{head[0]}</th>
            <th>{head[1]}</th>
            <th>{head[2]}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name}>
              <td><code>{r.name}</code></td>
              <td>{r.purpose}</td>
              <td>{r.life}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const COOKIES_DE: Row[] = [
  { name: "jizai_lang", purpose: "Merkt deine Sprachwahl, damit die Seite dich nicht erneut umleitet", life: "1 Jahr" },
  { name: "jizai_cart_v1", purpose: "Warenkorb (lokale Speicherung, verlässt dein Gerät nicht)", life: "bis du ihn löschst" },
  { name: "jizai_prefill", purpose: "Lieferadresse für eine Nachbestellung (Sitzungsspeicher)", life: "bis der Tab geschlossen wird" },
  { name: "jizai_order", purpose: "Zugriff auf genau eine nachgeschlagene Bestellung", life: "30 Minuten" },
  { name: "jizai_admin", purpose: "Anmeldung im Backoffice (nur Mitarbeitende)", life: "12 Stunden" },
  { name: "jizai_2fa", purpose: "Zwischenschritt der Zwei-Faktor-Anmeldung", life: "5 Minuten" },
  { name: "jizai_totp_setup", purpose: "Einrichtung der Zwei-Faktor-Anmeldung", life: "15 Minuten" },
];

const COOKIES_EN: Row[] = [
  { name: "jizai_lang", purpose: "Remembers your language choice so the site stops redirecting you", life: "1 year" },
  { name: "jizai_cart_v1", purpose: "Your cart (local storage, never leaves your device)", life: "until you clear it" },
  { name: "jizai_prefill", purpose: "Delivery address for a repeat order (session storage)", life: "until the tab is closed" },
  { name: "jizai_order", purpose: "Access to one specific order you looked up", life: "30 minutes" },
  { name: "jizai_admin", purpose: "Backoffice sign-in (staff only)", life: "12 hours" },
  { name: "jizai_2fa", purpose: "Intermediate step of two-factor sign-in", life: "5 minutes" },
  { name: "jizai_totp_setup", purpose: "Setting up two-factor sign-in", life: "15 minutes" },
];

/* ---------- Deutsch ---------- */

const de: LegalDoc = {
  label: "Rechtliches",
  title: "Datenschutzerklärung",
  updated: `Stand: ${PRIVACY_UPDATED}`,
  intro:
    "Diese Erklärung beschreibt, welche Daten beim Besuch von jizaihouse.com anfallen, wozu wir sie verwenden und welche Rechte du hast. Wir halten die Verarbeitung so knapp wie möglich — wir setzen keine Analyse-, Werbe- oder Tracking-Werkzeuge ein.",
  back: "← Zur Startseite",
  sections: [
    {
      n: "01",
      title: "Verantwortliche Stelle",
      body: (
        <>
          <p>
            {CONTROLLER.brand} ist eine Marke der {CONTROLLER.company}. Verantwortlich für
            die Bearbeitung deiner Daten ist:
          </p>
          <p>
            {CONTROLLER.company}
            <br />
            {CONTROLLER.street}
            <br />
            {CONTROLLER.city}, {CONTROLLER.country}
            <br />
            {CONTROLLER.uid}
            <br />
            <a href={`mailto:${CONTROLLER.email}`} data-hover>{CONTROLLER.email}</a>
          </p>
          <p>
            Für alle Fragen zum Datenschutz und für die Ausübung deiner Rechte genügt eine
            E-Mail an diese Adresse.
          </p>
        </>
      ),
    },
    {
      n: "02",
      title: "Beim blossen Besuch der Seite",
      body: (
        <>
          <p>
            Die Website wird von der Vercel Inc. (340 S Lemon Ave, Walnut, CA 91789, USA)
            betrieben. Beim Aufruf einer Seite übermittelt dein Browser technisch notwendige
            Angaben, die dort in Server-Protokollen erfasst werden: IP-Adresse, Datum und
            Uhrzeit, aufgerufene Adresse, übermittelter Verweis, Browser- und
            Betriebssystemkennung.
          </p>
          <p>
            Diese Daten sind nötig, damit die Seite überhaupt ausgeliefert werden kann, und
            dienen der Betriebssicherheit. Wir führen sie nicht mit anderen Daten zusammen und
            erstellen daraus keine Nutzungsprofile.
          </p>
        </>
      ),
    },
    {
      n: "03",
      title: "Cookies und lokale Speicherung",
      body: (
        <>
          <p>
            Wir setzen keine Cookies zu Werbe- oder Analysezwecken. Verwendet werden
            ausschliesslich die folgenden technisch notwendigen oder von dir selbst
            ausgelösten Einträge:
          </p>
          <Table head={["Name", "Zweck", "Dauer"]} rows={COOKIES_DE} />
          <p>
            Warenkorb und Lieferadresse für eine Nachbestellung liegen in der lokalen
            Speicherung deines Browsers und werden nicht an uns übertragen, solange du keine
            Bestellung abschickst. Du kannst alle Einträge jederzeit in den
            Browser-Einstellungen löschen.
          </p>
        </>
      ),
    },
    {
      n: "04",
      title: "Video auf der Startseite",
      body: (
        <>
          <p>
            Auf der Startseite ist ein Film eingebunden, der über YouTube ausgeliefert wird
            (Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland). Wir nutzen
            dafür den erweiterten Datenschutzmodus über die Domain{" "}
            <code>youtube-nocookie.com</code>: Google setzt dabei keine Cookies zu
            Werbezwecken.
          </p>
          <p>
            <strong>Der Film startet von selbst.</strong> Das bedeutet, dass bereits beim
            Aufruf der Seite eine Verbindung zu Servern von Google aufgebaut und dabei deine
            IP-Adresse übermittelt wird — auch dann, wenn du den Film nicht ansiehst. Google
            kann diese Angaben in den USA verarbeiten. Auf Art und Umfang der Verarbeitung
            durch Google haben wir keinen Einfluss; es gilt deren{" "}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" data-hover>
              Datenschutzerklärung
            </a>.
          </p>
          <p>
            Wenn du in deinem Betriebssystem „Bewegung reduzieren“ eingeschaltet hast, startet
            der Film nicht automatisch. Es wird dann nur ein Standbild von unserem eigenen
            Server geladen, und es entsteht keine Verbindung zu Google, solange du nicht auf
            Abspielen klickst.
          </p>
        </>
      ),
    },
    {
      n: "05",
      title: "Warteliste",
      body: (
        <p>
          Trägst du dich in die Warteliste ein, speichern wir deine E-Mail-Adresse und den
          Zeitpunkt der Eintragung. Wir verwenden sie ausschliesslich, um dich über den Start
          eines Drops zu informieren. Eine Abmeldung ist jederzeit formlos per E-Mail möglich;
          danach löschen wir den Eintrag.
        </p>
      ),
    },
    {
      n: "06",
      title: "Bestellungen",
      body: (
        <>
          <p>
            Für eine Bestellung benötigen wir deinen Namen, deine Lieferadresse und deine
            E-Mail-Adresse. Diese Daten verwenden wir, um den Vertrag zu erfüllen — also um
            die Bestellung zu bearbeiten, die Ware zu versenden und dir eine Bestätigung zu
            schicken. Ein Kundenkonto ist nicht nötig; die Bestellverfolgung funktioniert über
            E-Mail-Adresse und Bestellnummer.
          </p>
          <p>
            Bestell- und Rechnungsdaten bewahren wir zehn Jahre auf, soweit uns das
            handels- und steuerrechtliche Aufbewahrungspflichten vorschreiben.
          </p>
        </>
      ),
    },
    {
      n: "07",
      title: "Zahlung",
      body: (
        <p>
          Die Zahlung wickeln wir über Stripe ab (Stripe Payments Europe Ltd., 1 Grand Canal
          Street Lower, Dublin 2, Irland). Deine Zahlungsdaten — etwa Karten- oder
          TWINT-Angaben — gibst du direkt bei Stripe ein. Wir sehen und speichern sie zu
          keinem Zeitpunkt; wir erfahren lediglich, ob eine Zahlung erfolgreich war. Es gilt
          die{" "}
          <a href="https://stripe.com/privacy" target="_blank" rel="noreferrer" data-hover>
            Datenschutzerklärung von Stripe
          </a>.
        </p>
      ),
    },
    {
      n: "08",
      title: "E-Mail-Versand",
      body: (
        <p>
          Bestellbestätigungen versenden wir über Resend (Resend, Inc., USA). Dabei werden
          deine E-Mail-Adresse und der Inhalt der Bestätigung übermittelt. Resend verwendet
          diese Daten ausschliesslich zur Zustellung in unserem Auftrag.
        </p>
      ),
    },
    {
      n: "09",
      title: "Datenbank und Bilder",
      body: (
        <p>
          Produktdaten, Bestellungen und Wartelisten-Einträge liegen bei Supabase
          (Supabase, Inc.), das wir als Auftragsverarbeiter einsetzen. Produktbilder und der
          Standbild-Ausschnitt des Films werden über dessen Speicherdienst ausgeliefert.
        </p>
      ),
    },
    {
      n: "10",
      title: "Schriften",
      body: (
        <p>
          Die verwendeten Schriften liegen auf unserem eigenen Server und werden von dort
          geladen. Es wird beim Aufruf der Seite <strong>keine</strong> Verbindung zu Google
          Fonts aufgebaut.
        </p>
      ),
    },
    {
      n: "11",
      title: "Keine Analyse, keine Werbung",
      body: (
        <p>
          Wir setzen keine Analysedienste, keine Werbenetzwerke, keine Zählpixel und keine
          Weitergabe an soziale Netzwerke ein. Es findet kein Profiling und keine
          automatisierte Entscheidungsfindung statt.
        </p>
      ),
    },
    {
      n: "12",
      title: "Weitergabe und Übermittlung ins Ausland",
      body: (
        <p>
          Wir geben Daten nur an die oben genannten Dienstleister weiter, und nur soweit das
          für den jeweiligen Zweck nötig ist. Ein Verkauf von Daten findet nicht statt. Einige
          dieser Anbieter verarbeiten Daten in den USA. Die Übermittlung stützt sich auf die
          Standardvertragsklauseln der Europäischen Kommission beziehungsweise auf
          entsprechende Zusatzvereinbarungen.
        </p>
      ),
    },
    {
      n: "13",
      title: "Sicherheit",
      body: (
        <p>
          Die Seite ist durchgehend per HTTPS verschlüsselt. Passwörter des Backoffice werden
          ausschliesslich als Streuwert gespeichert und nie im Klartext; zusätzlich steht eine
          Zwei-Faktor-Anmeldung zur Verfügung. Der Zugriff auf Bestelldaten ist auf berechtigte
          Personen beschränkt.
        </p>
      ),
    },
    {
      n: "14",
      title: "Deine Rechte",
      body: (
        <>
          <p>
            Du hast das Recht auf Auskunft über die zu dir gespeicherten Daten, auf
            Berichtigung, auf Löschung und auf Einschränkung der Verarbeitung. Du kannst der
            Verarbeitung widersprechen und die Herausgabe deiner Daten in einem gängigen
            Format verlangen.
          </p>
          <p>
            Eine E-Mail an{" "}
            <a href={`mailto:${CONTROLLER.email}`} data-hover>{CONTROLLER.email}</a> genügt.
            Ausserdem steht dir der Beschwerdeweg an eine Aufsichtsbehörde offen — in der
            Schweiz an den Eidgenössischen Datenschutz- und Öffentlichkeitsbeauftragten
            (EDÖB), im EWR an die für dich zuständige Datenschutzbehörde.
          </p>
        </>
      ),
    },
    {
      n: "15",
      title: "Rechtsgrundlagen",
      body: (
        <p>
          Die Verarbeitung stützt sich auf das schweizerische Datenschutzgesetz (DSG) und,
          soweit die Datenschutz-Grundverordnung anwendbar ist, auf Art. 6 Abs. 1 lit. b DSGVO
          (Erfüllung des Vertrags bei Bestellungen), lit. f (berechtigtes Interesse am
          sicheren und funktionsfähigen Betrieb der Seite) sowie lit. a (Einwilligung, etwa
          bei der Warteliste).
        </p>
      ),
    },
    {
      n: "16",
      title: "Änderungen",
      body: (
        <p>
          Wir passen diese Erklärung an, wenn sich die Website oder die eingesetzten Dienste
          ändern. Es gilt jeweils die hier veröffentlichte Fassung.
        </p>
      ),
    },
  ],
};

/* ---------- Englisch ---------- */

const en: LegalDoc = {
  label: "Legal",
  title: "Privacy Policy",
  updated: `Last updated: ${PRIVACY_UPDATED_EN}`,
  intro:
    "This policy explains what data is collected when you visit jizaihouse.com, what we use it for and what rights you have. We keep processing to a minimum — we use no analytics, advertising or tracking tools.",
  back: "← Back to home",
  sections: [
    {
      n: "01",
      title: "Controller",
      body: (
        <>
          <p>
            {CONTROLLER.brand} is a brand of {CONTROLLER.company}. The controller responsible
            for processing your data is:
          </p>
          <p>
            {CONTROLLER.company}
            <br />
            {CONTROLLER.street}
            <br />
            {CONTROLLER.city}, {CONTROLLER.countryEn}
            <br />
            {CONTROLLER.uid}
            <br />
            <a href={`mailto:${CONTROLLER.email}`} data-hover>{CONTROLLER.email}</a>
          </p>
          <p>
            For any privacy question and to exercise your rights, an email to this address is
            enough.
          </p>
        </>
      ),
    },
    {
      n: "02",
      title: "When you simply visit the site",
      body: (
        <>
          <p>
            The website is hosted by Vercel Inc. (340 S Lemon Ave, Walnut, CA 91789, USA).
            When you open a page, your browser transmits technically necessary information
            that is recorded in server logs there: IP address, date and time, the address
            requested, the referring page, and browser and operating system identifiers.
          </p>
          <p>
            This data is required to deliver the site at all and serves operational security.
            We do not combine it with other data and we build no usage profiles from it.
          </p>
        </>
      ),
    },
    {
      n: "03",
      title: "Cookies and local storage",
      body: (
        <>
          <p>
            We set no cookies for advertising or analytics. Only the following technically
            necessary entries — or ones you trigger yourself — are used:
          </p>
          <Table head={["Name", "Purpose", "Lifetime"]} rows={COOKIES_EN} />
          <p>
            Your cart and the delivery address used for a repeat order live in your browser&apos;s
            local storage and are not transmitted to us unless you place an order. You can
            delete all entries at any time in your browser settings.
          </p>
        </>
      ),
    },
    {
      n: "04",
      title: "Video on the home page",
      body: (
        <>
          <p>
            The home page embeds a film delivered through YouTube (Google Ireland Limited,
            Gordon House, Barrow Street, Dublin 4, Ireland). We use privacy-enhanced mode via
            the domain <code>youtube-nocookie.com</code>, so Google sets no advertising
            cookies.
          </p>
          <p>
            <strong>The film starts on its own.</strong> This means a connection to Google
            servers is established as soon as the page loads, transmitting your IP address —
            even if you do not watch the film. Google may process this data in the United
            States. We have no influence over the nature or extent of Google&apos;s processing;
            their{" "}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" data-hover>
              privacy policy
            </a>{" "}
            applies.
          </p>
          <p>
            If you have &ldquo;reduce motion&rdquo; enabled in your operating system, the film does not
            start automatically. Only a still image from our own server is loaded, and no
            connection to Google is made unless you press play.
          </p>
        </>
      ),
    },
    {
      n: "05",
      title: "Waiting list",
      body: (
        <p>
          If you join the waiting list, we store your email address and the time you signed
          up. We use it solely to tell you when a drop opens. You can unsubscribe at any time
          by email, and we then delete the entry.
        </p>
      ),
    },
    {
      n: "06",
      title: "Orders",
      body: (
        <>
          <p>
            To process an order we need your name, delivery address and email address. We use
            this data to perform the contract — to process the order, ship the goods and send
            you a confirmation. No customer account is required; order tracking works with
            your email address and order number.
          </p>
          <p>
            Order and invoice data is retained for ten years where commercial and tax law
            require it.
          </p>
        </>
      ),
    },
    {
      n: "07",
      title: "Payment",
      body: (
        <p>
          Payments are handled by Stripe (Stripe Payments Europe Ltd., 1 Grand Canal Street
          Lower, Dublin 2, Ireland). You enter your payment details — card or TWINT
          information — directly with Stripe. We never see or store them; we only learn
          whether a payment succeeded.{" "}
          <a href="https://stripe.com/privacy" target="_blank" rel="noreferrer" data-hover>
            Stripe&apos;s privacy policy
          </a>{" "}
          applies.
        </p>
      ),
    },
    {
      n: "08",
      title: "Email delivery",
      body: (
        <p>
          Order confirmations are sent via Resend (Resend, Inc., USA). Your email address and
          the content of the confirmation are transmitted in the process. Resend uses this
          data solely to deliver the message on our behalf.
        </p>
      ),
    },
    {
      n: "09",
      title: "Database and images",
      body: (
        <p>
          Product data, orders and waiting-list entries are stored with Supabase
          (Supabase, Inc.), which acts as our processor. Product images and the film&apos;s still
          image are served from its storage service.
        </p>
      ),
    },
    {
      n: "10",
      title: "Fonts",
      body: (
        <p>
          The fonts used are hosted on our own server and loaded from there.{" "}
          <strong>No</strong> connection to Google Fonts is made when you open the site.
        </p>
      ),
    },
    {
      n: "11",
      title: "No analytics, no advertising",
      body: (
        <p>
          We use no analytics services, no advertising networks, no tracking pixels and no
          social network integrations. There is no profiling and no automated decision-making.
        </p>
      ),
    },
    {
      n: "12",
      title: "Disclosure and transfers abroad",
      body: (
        <p>
          We pass data only to the service providers named above, and only as far as necessary
          for the respective purpose. We do not sell data. Some of these providers process
          data in the United States. Such transfers are based on the European Commission&apos;s
          standard contractual clauses or equivalent supplementary agreements.
        </p>
      ),
    },
    {
      n: "13",
      title: "Security",
      body: (
        <p>
          The site is encrypted throughout via HTTPS. Backoffice passwords are stored only as
          hashes, never in plain text, and two-factor sign-in is available. Access to order
          data is restricted to authorised people.
        </p>
      ),
    },
    {
      n: "14",
      title: "Your rights",
      body: (
        <>
          <p>
            You have the right to access the data we hold about you, to have it corrected or
            deleted, and to have its processing restricted. You may object to processing and
            request your data in a common format.
          </p>
          <p>
            An email to{" "}
            <a href={`mailto:${CONTROLLER.email}`} data-hover>{CONTROLLER.email}</a> is
            enough. You may also lodge a complaint with a supervisory authority — in
            Switzerland the Federal Data Protection and Information Commissioner (FDPIC), in
            the EEA your local data protection authority.
          </p>
        </>
      ),
    },
    {
      n: "15",
      title: "Legal bases",
      body: (
        <p>
          Processing is based on the Swiss Federal Act on Data Protection (FADP) and, where
          the GDPR applies, on Art. 6(1)(b) GDPR (performance of the contract for orders),
          (f) (legitimate interest in a secure and functioning website) and (a) (consent, for
          example for the waiting list).
        </p>
      ),
    },
    {
      n: "16",
      title: "Changes",
      body: (
        <p>
          We update this policy when the website or the services it uses change. The version
          published here is the one that applies.
        </p>
      ),
    },
  ],
};

export const PRIVACY: Record<Lang, LegalDoc> = { de, en };

/* ================= Impressum ================= */

const imprintDe: LegalDoc = {
  label: "Rechtliches",
  title: "Impressum",
  updated: `Stand: ${PRIVACY_UPDATED}`,
  intro: `${CONTROLLER.brand} ist eine Marke der ${CONTROLLER.company}. Betreiberin dieser Website und Vertragspartnerin bei Bestellungen ist die ${CONTROLLER.company}.`,
  back: "← Zur Startseite",
  sections: [
    {
      n: "01",
      title: "Betreiberin",
      body: (
        <p>
          {CONTROLLER.company}
          <br />
          {CONTROLLER.street}
          <br />
          {CONTROLLER.city}, {CONTROLLER.country}
        </p>
      ),
    },
    {
      n: "02",
      title: "Kontakt",
      body: (
        <p>
          <a href={`mailto:${CONTROLLER.email}`} data-hover>{CONTROLLER.email}</a>
        </p>
      ),
    },
    {
      n: "03",
      title: "Handelsregister und Unternehmens-Identifikationsnummer",
      body: (
        <p>
          Eingetragen im {CONTROLLER.register}
          <br />
          UID: {CONTROLLER.uid}
        </p>
      ),
    },
    {
      n: "04",
      title: "Vertretungsberechtigte Person",
      body: <p>{CONTROLLER.represented}</p>,
    },
    {
      n: "05",
      title: "Haftung für Inhalte",
      body: (
        <p>
          Wir erstellen die Inhalte dieser Website mit Sorgfalt, können für Richtigkeit,
          Vollständigkeit und Aktualität aber keine Gewähr übernehmen. Für Schäden
          materieller oder immaterieller Art, die aus dem Zugriff auf diese Website oder aus
          deren Nutzung entstehen, wird jede Haftung ausgeschlossen.
        </p>
      ),
    },
    {
      n: "06",
      title: "Verweise auf andere Websites",
      body: (
        <p>
          Verweise auf Websites Dritter liegen ausserhalb unseres Verantwortungsbereichs. Für
          deren Inhalte wird jede Verantwortung abgelehnt; der Zugriff und die Nutzung
          erfolgen auf eigene Gefahr.
        </p>
      ),
    },
    {
      n: "07",
      title: "Urheberrecht",
      body: (
        <p>
          Texte, Bilder, Grafiken, der Markenname {CONTROLLER.brand} und dessen
          Gestaltungselemente sind urheber- und markenrechtlich geschützt. Jede Verwendung —
          insbesondere Vervielfältigung, Verbreitung oder Bearbeitung — bedarf der
          vorgängigen schriftlichen Zustimmung der {CONTROLLER.company}.
        </p>
      ),
    },
    {
      n: "08",
      title: "Datenschutz",
      body: (
        <p>
          Wie wir mit deinen Daten umgehen, steht in der{" "}
          <a href="/datenschutz" data-hover>Datenschutzerklärung</a>.
        </p>
      ),
    },
  ],
};

const imprintEn: LegalDoc = {
  label: "Legal",
  title: "Legal Notice",
  updated: `Last updated: ${PRIVACY_UPDATED_EN}`,
  intro: `${CONTROLLER.brand} is a brand of ${CONTROLLER.company}. This website is operated by ${CONTROLLER.company}, which is also your contracting party for any order.`,
  back: "← Back to home",
  sections: [
    {
      n: "01",
      title: "Operator",
      body: (
        <p>
          {CONTROLLER.company}
          <br />
          {CONTROLLER.street}
          <br />
          {CONTROLLER.city}, {CONTROLLER.countryEn}
        </p>
      ),
    },
    {
      n: "02",
      title: "Contact",
      body: (
        <p>
          <a href={`mailto:${CONTROLLER.email}`} data-hover>{CONTROLLER.email}</a>
        </p>
      ),
    },
    {
      n: "03",
      title: "Commercial register and company identification number",
      body: (
        <p>
          Registered with the {CONTROLLER.registerEn}
          <br />
          UID: {CONTROLLER.uid}
        </p>
      ),
    },
    {
      n: "04",
      title: "Authorised representative",
      body: <p>{CONTROLLER.represented}</p>,
    },
    {
      n: "05",
      title: "Liability for content",
      body: (
        <p>
          We compile the content of this website with care but give no warranty as to its
          accuracy, completeness or timeliness. Any liability for material or immaterial
          damage arising from access to or use of this website is excluded.
        </p>
      ),
    },
    {
      n: "06",
      title: "Links to other websites",
      body: (
        <p>
          Links to third-party websites lie outside our area of responsibility. We accept no
          responsibility for their content; access and use are at your own risk.
        </p>
      ),
    },
    {
      n: "07",
      title: "Copyright",
      body: (
        <p>
          Texts, images, graphics, the brand name {CONTROLLER.brand} and its design elements
          are protected by copyright and trademark law. Any use — in particular reproduction,
          distribution or modification — requires the prior written consent of{" "}
          {CONTROLLER.company}.
        </p>
      ),
    },
    {
      n: "08",
      title: "Privacy",
      body: (
        <p>
          How we handle your data is set out in our{" "}
          <a href="/en/privacy" data-hover>privacy policy</a>.
        </p>
      ),
    },
  ],
};

export const IMPRINT: Record<Lang, LegalDoc> = { de: imprintDe, en: imprintEn };
