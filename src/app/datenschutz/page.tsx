import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
};

export default function DatenschutzPage() {
  return (
    <div className="container-narrow py-12">
      <div className="card p-8 prose prose-gray max-w-none">
        <h1>Datenschutzerklärung</h1>

        <h2>1. Verantwortliche Stelle</h2>
        <p>
          Verantwortlich für die Datenverarbeitung auf dieser Website ist:<br />
          Project Mesh<br />
          [Ihre Kontaktdaten]<br />
          E-Mail: kontakt@projectmesh.de
        </p>

        <h2>2. Erhobene Daten</h2>
        <p>Bei der Registrierung erheben wir folgende Daten:</p>
        <ul>
          <li>E-Mail-Adresse</li>
          <li>Benutzername</li>
          <li>Passwort (gespeichert als bcrypt-Hash)</li>
          <li>Optionale Profildaten (Anzeigename, Bio, Website, Ort)</li>
        </ul>

        <p>Bei der Nutzung der Plattform entstehen zudem:</p>
        <ul>
          <li>Posts und Kommentare</li>
          <li>Like-Daten</li>
          <li>Community-Mitgliedschaften</li>
          <li>Server-Logdaten (IP-Adresse, Zeitstempel, aufgerufene URL)</li>
        </ul>

        <h2>3. Zweck der Datenverarbeitung</h2>
        <p>
          Die erhobenen Daten werden ausschließlich für den Betrieb der
          Plattform und die Bereitstellung der Dienste verwendet (Art. 6 Abs. 1
          lit. b DSGVO).
        </p>

        <h2>4. Datenspeicherung und -löschung</h2>
        <p>
          Deine Daten werden gespeichert, solange du ein aktives Konto hast.
          Du kannst dein Konto jederzeit in den Einstellungen löschen. Nach
          einer Kontolöschung werden deine personenbezogenen Daten innerhalb
          von 30 Tagen endgültig gelöscht. Posts werden anonymisiert.
        </p>

        <h2>5. Deine Rechte</h2>
        <p>Du hast das Recht auf:</p>
        <ul>
          <li>Auskunft über deine gespeicherten Daten (Art. 15 DSGVO)</li>
          <li>Berichtigung falscher Daten (Art. 16 DSGVO)</li>
          <li>Löschung deiner Daten (Art. 17 DSGVO)</li>
          <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
          <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
          <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
        </ul>
        <p>
          Um diese Rechte auszuüben, kontaktiere uns unter:{" "}
          <a href="mailto:kontakt@projectmesh.de">kontakt@projectmesh.de</a>
        </p>

        <h2>6. Cookies und Session</h2>
        <p>
          Wir verwenden ausschließlich technisch notwendige Cookies für die
          Authentifizierung (Session-Cookie). Es werden keine Tracking- oder
          Werbe-Cookies verwendet.
        </p>

        <h2>7. Weitergabe an Dritte</h2>
        <p>
          Eine Weitergabe deiner Daten an Dritte findet nicht statt, außer
          dies ist gesetzlich vorgeschrieben.
        </p>

        <h2>8. Datensicherheit</h2>
        <p>
          Passwörter werden ausschließlich als bcrypt-Hash gespeichert.
          Die Kommunikation ist SSL/TLS-verschlüsselt. Regelmäßige
          Sicherheits-Updates werden durchgeführt.
        </p>

        <h2>9. Beschwerderecht</h2>
        <p>
          Du hast das Recht, dich bei einer Datenschutzaufsichtsbehörde zu
          beschweren. Die zuständige Behörde ist der Bundesbeauftragte für
          den Datenschutz und die Informationsfreiheit (BfDI).
        </p>

        <p className="text-sm text-gray-500">
          Stand: {new Date().toLocaleDateString("de-DE", { month: "long", year: "numeric" })}
        </p>
      </div>
    </div>
  );
}
