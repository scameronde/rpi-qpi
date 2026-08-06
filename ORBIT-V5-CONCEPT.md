# ORBIT V5 — Konzept

> Status: Entwurf zur gemeinsamen Reflektion · Datum: 2026-07-01 ·
> zuletzt ergänzt: 2026-08-06 (§10: Granularität, Konfliktauflösung, initiale
> Erfassung geklärt; V3/V4-Beschriftung im ganzen Dokument auf V4/V5 korrigiert)
> Zweck: Ankerdokument für den Umbau von ORBIT V4 zu V5. Hält das Leitprinzip,
> die Wissensbasis-Architektur, den Rollen-Umbau und den Compliance-Mechanismus
> fest. Die Detailplanung der einzelnen Rollen baut auf diesem Dokument auf.

---

## 1. Ausgangsproblem

Der Ansatz von ORBIT V4 ist richtig, aber unvollständig umgesetzt.

Code wird gerne als "Single Source of Truth" bezeichnet, ist es aber nicht. Code
ist eine **verlustbehaftete Projektion** von Absicht, Konzept und Regeln
(Architektur, Design). Diese Aspekte sind im besten Fall im Code *reflektiert*,
lassen sich aber nicht mehr vollständig aus ihm *ableiten*. Und selbst wo es
ginge, ist der Aufwand, das immer wieder zu tun, zu hoch und das Ergebnis
fehleranfällig.

Ein Agentic-Engineering-Framework kann nur dann zuverlässig arbeiten, wenn es
billigen, direkten Zugriff auf diese Informationen hat. Also müssen sie
**separat, explizit und dauerhaft aktuell** dokumentiert werden.

V4 erfasst Absicht und Idee in der Mission. Konzept und Regeln sind jedoch nur
*implizit* — verteilt über Spec, Epics, erste Research-Dokumente und erste
Pläne. **Aus implizit muss explizit werden.**

---

## 2. Der fundamentale Charakterwechsel

**V4 ist eine Pipeline, die Artefakte als Nebenprodukt ausspuckt.** Mission und
Spec werden einmal geschrieben, dann wandert der Fokus zum Code. Die Artefakte
altern und driften vom Code weg.

**V5 ist eine wissensbasis-zentrierte Architektur.** Eine lebende, explizite
Wissensbasis ist das Zentrum. Die Pipeline ist nur der Mechanismus, der diese
Basis *pflegt und konsumiert*. Code und Wissensbasis sind zwei gleichberechtigte
Repräsentationen desselben Systems, die permanent gegeneinander abgeglichen
werden.

### Leitprinzip (ein Satz)

> Eine lebende, nach *Soll* (Intent → Regeln → Spec) und *Ist* (Code-, Extern-
> und Qualitäts-Fakten) gegliederte Wissensbasis ist die Single Source of Truth.
> Die Pipeline pflegt und konsumiert sie. Ein zweistufiger Drift-Mechanismus
> hält Code und Soll ständig abgeglichen. Kein Plan gilt als vollständig, solange
> nicht jede relevante Regel und jedes Faktum aktuell referenziert ist.

---

## 3. Das Rückgrat: Normativ (Soll) vs. Deskriptiv (Ist)

Alle Wissensarten ordnen sich auf einer einzigen Achse:

**Normativ (Soll) — präskriptiv, mensch-eigen, ändert sich durch Entscheidung:**

- **Intent** — Absicht & Idee (Vision/Mission): das *Warum* und *Was*. Langlebig.
- **Rules** — Konzept & Regeln: Architektur, Design, Konventionen, Leitplanken,
  ADRs. Das *Wie es sein soll*. **Die zentrale Neuerung von V5** — die bisher
  implizite Ebene wird erste Klasse.
- **Specs** — funktionale Spezifikationen pro Fähigkeit.

**Deskriptiv (Ist) — evidenzbasiert, agent-eigen, ändert sich durch Beobachtung:**

- **Facts / Code** — verifizierte Fakten über den bestehenden Code (Topologie,
  Ausführungspfade, Muster).
- **Facts / External** — Bibliotheken, APIs, Web-Research.
- **Facts / Quality** — Ergebnisse von Qualitätsanalysen (QA).

Compliance-Prüfung ist damit definitorisch der **Abgleich Deskriptiv (Code-Ist)
gegen Normativ (dokumentierte Regeln)**. Bei Drift entscheidet der Mensch:
Code anpassen (Soll gewinnt) oder Regel anpassen (Ist war die bessere Realität).

---

## 4. Wissensbasis-Taxonomie (Verzeichnisstruktur)

```
knowledge/              # umbenannt von thoughts/shared — es ist Wissen, keine Gedanken
  intent/               # SOLL · Vision & Mission (selten, langlebig)
  rules/                # SOLL · Architektur, Design, Konventionen, ADRs — NEU, erste Klasse
  specs/                # SOLL · funktionale Spezifikationen
  facts/
    code/               # IST  · verifizierte Fakten über bestehenden Code
    external/           # IST  · Bibliotheken, APIs, Web
    quality/            # IST  · QA-Ergebnisse
  epics/                # BRÜCKE · Dekomposition
  plans/                # BRÜCKE · Umsetzungspläne (+ STATE)
  compliance/           # META · Drift-Reports Ist-vs-Soll + Entscheidungsprotokolle
  unknowns/             # META · "Dinge, an die noch nicht gedacht wurde" — persistentes Register
```

Der `rules/`-Ordner ist der Dreh- und Angelpunkt: die explizit gemachte,
bisher implizite Konzept- und Regelebene.

`unknowns/` ist ein bewusster Demuts-Slot: ein persistentes Register offener
Fragen und blinder Flecken — anders als V4, wo "Open Questions" pro Report
entstehen und wieder verschwinden.

---

## 5. Fakten-Modell (Voraussetzung für alles Weitere)

Damit Aktualität *messbar* wird und Pläne sich zu 100% verlassen können, muss
jedes Faktum seine Quelle maschinenlesbar referenzieren:

- **Quelle** — Datei + Zeilenspanne (`path:line-line`) bzw. URL + Abrufdatum
- **Content-Hash** der zitierten Code-Stelle zum Erhebungszeitpunkt
- **Art-Tag** — `architecture` | `design` | `library` | `code` | `quality`
- **Erhebungszeitpunkt** und **Zuverlässigkeit**

Ändert sich die Quelle (Hash weicht ab), ist das Faktum automatisch **stale**.
Das ist derselbe Mechanismus, der die Compliance-Prüfung trägt — nur aus der
Gegenrichtung.

---

## 6. Rollen-Umbau gegenüber V4

| V4 | V5 | Änderung |
|---|---|---|
| Researcher | **Fact-Finder** | Umbenannt. Produziert ausschließlich die *deskriptive* Ebene. Output nach Art getaggt und in `facts/{code,external,quality}/` getrennt abgelegt. Explizit erkennbar, ob Architektur-, Design- oder Bibliotheks-Fakt. |
| Planner | **Planner (Vollständigkeits-Gatekeeper)** | Referenziert konkret die Regeln und Fakten, auf denen der Plan beruht (per ID). Plan ist erst "versiegelt", wenn alle referenzierten Regeln/Fakten aktuell sind. Fehlt/veraltet ein Faktum → Plan ungültig, zurück zum Fact-Finder. |
| — | **Compliance-Agent** (neu) | Gleicht Code-Ist gegen dokumentierte Regeln ab, erzeugt Drift-Reports in `compliance/`, eskaliert Mismatches an den Menschen. |
| Mission-/Feature-Architect | **Intent-Rolle** | Pflegt `intent/`. Weitgehend wie V4, aber als dauerhaft gepflegte Basis, nicht als Einmal-Artefakt. |
| Specifier | **Rules- + Spec-Rolle** | Macht die bisher implizite Konzept-/Regelebene explizit in `rules/`; funktionale Spec bleibt in `specs/`. |
| DOX / AGENTS.md | **aufgelöst → skopierte Regeln** | Siehe §7. |
| Implementation Controller (`/implement`) | **unverändert im Prinzip** | Kann sich jetzt aber zu 100% auf den versiegelten Plan verlassen. |

Alle Skills und Agenten müssen die relevante Wissensbasis vor ihrer Arbeit
konsultieren und nach ihrer Arbeit aktualisieren.

---

## 7. DOX-Ablösung: zentrale, aber skopierte Regeln

DOX/AGENTS.md hatte eine echte Funktion: Wer Datei X anfasst, stößt auf dem Weg
durch die Verzeichnisse automatisch auf den lokal geltenden Vertrag.
Zentralisierung darf diese **Lokalität der Anwendung** nicht verlieren.

Lösung: Regeln werden **zentral in `rules/` gespeichert, aber pfad-skopiert.**
Jedes Regeldokument trägt einen Geltungsbereich (Glob, z. B. `src/api/**`).

- Statt "vom Root abwärts AGENTS.md einsammeln" gilt: **"frage den Regel-Index:
  welche Regeln gelten für Pfad X"**.
- Der Compliance-Checker nutzt denselben Geltungsbereich, um zu wissen, welchen
  Code er gegen welche Regel prüft.

DOX verschwindet als *Speicherort*; seine Kernidee (Regel trifft Ort) lebt im
Scoping weiter — jetzt aber compliance-prüfbar und als erste Klasse.

---

## 8. Compliance / Drift — zweistufig

Nicht jede Regel ist maschinell prüfbar. "Kontinuierlich automatisiert" zerfällt
daher in zwei Ebenen:

**Stufe 1 — mechanisch, billig, ständig (bei jedem Lauf / per Hook):**

- Fakten-Aktualität über Content-Hashes der zitierten Code-Stellen
  (ändert sich `file:line`, wird das Faktum als stale markiert).
- Strukturelle Regeln über Arch-Tests / Linter
  (z. B. "Modul A darf B nicht importieren", Namenskonventionen, Layer-Grenzen).

**Stufe 2 — semantisch, teurer, getaktet (on-demand / geplant):**

- LLM-Judge-Durchlauf für intentionale Regeln, die Urteilsvermögen erfordern
  (z. B. "bevorzuge Komposition vor Vererbung").

Bei jedem festgestellten Mismatch: **gemeinsame Mensch-Entscheidung** — Code an
Regel anpassen oder Regel an Realität anpassen. Die Entscheidung wird in
`compliance/` protokolliert.

---

## 9. Pipeline V5 (revidiert)

Die Pipeline bleibt in ihrer Grundform, wird aber zur wissensbasis-pflegenden
Schleife statt einer Einbahnstraße:

```
Intent  →  Rules + Specs  →  Epics  →  Fact-Finding  →  Plan (versiegelt)  →  Implement
   ↑                                        ↑                                    │
   └──────────── Compliance/Drift ◄─────────┴──────────── Code-Ist ◄────────────┘
```

- **Fact-Finding** speist `facts/*` und versorgt sowohl Plan als auch Compliance.
- **Plan** wird nur versiegelt, wenn alle referenzierten Regeln/Fakten aktuell sind.
- **Compliance** läuft kontinuierlich gegen den Code und speist Entscheidungen
  zurück in `rules/` (Regeländerung) oder in neue Pläne (Codeänderung).

---

## 10. Offene Punkte (→ `unknowns/`)

### Geklärt (Stand 2026-08-06)

- **Granularität von Regeln:** Ein Regelknoten pro **prüfbarer Aussage**, nicht
  pro Thema. Ein Themenblock wie "Monitoring" oder "Logging" zerfällt in
  mehrere `Rule`-Knoten, je einen pro Enforcement-Pfad — z. B.
  `RULE-ARCH-health-endpoint` (`enforcement: mechanical`) neben
  `RULE-DESIGN-alerting-strategy` (`enforcement: semantic`). Begründung: §8
  der OKF-Convention verlangt für jeden `Rule`-Knoten ein nicht-leeres
  `enforcement`; eine Sammelregel über ein ganzes Thema kann das nicht
  erfüllen, weil sie mechanisch und semantisch Prüfbares vermischt. Die
  Entscheidung selbst (z. B. "wir führen Audit-Logging ein, weil …") bleibt
  eine `ADR`; die daraus folgenden prüfbaren Aussagen sind die `Rule`-Knoten,
  die per `refines` auf die ADR zurückzeigen. Regel-IDs werden bei Anlage
  einmalig nach dem Schema aus §6 vergeben (`<TYP-PRÄFIX>-<BEREICH>-<NUMMER>`)
  und nie aus dem Titel abgeleitet, damit eine Umbenennung sie nicht bricht.

- **Konflikt-Auflösung bei Regeln:** Bereits gelöst, nur nicht an dieser
  Stelle beantwortet — siehe `ORBIT-V5-OKF-CONVENTION.md §7.1`: explizite
  `priority` gewinnt, sonst die Spezifität des `scope`, sonst meldet der
  Validator einen offenen Konflikt. Ersetzt DOX' "closer file governs" durch
  "spezifischeres `scope` governs". Dieser Punkt zählt nicht mehr als offen.

- **Initiale Erfassung (vormals "Migration V4 → V5"):** Die alte Formulierung
  ging von einer falschen Prämisse aus. Die aktuell laufende ORBIT-Version
  ist **V4**, nicht V3 — ein V3-Bestand existiert seit langem nicht mehr und
  soll auch nicht rekonstruiert werden, es gibt also keine V3-Projekte zu
  migrieren. Die eigentliche Frage ist damit nicht "wie migrieren wir alte
  Projekte", sondern: **wie nimmt ein laufendes V4-Projekt den neuen
  `rules/`-Layer nachträglich auf?** Zwei Erfassungspfade, je nach Zustand:
  - **Neues Projekt:** ein eigener Erfassungsschritt zwischen Intent- und
    Rules-/Spec-Rolle, mit festem Fragenkatalog statt beiläufiger Erwähnung
    in der Spec-Konversation — mindestens: Audit/Compliance, Observability,
    Logging-Inhalt, Teststrategie, Code-Konventionen. Ergebnis sind initiale
    `Rule`-Knoten mit `status: draft` und grobem `scope: ["**"]`, verfeinert
    sobald Epics oder Fact-Finding echte Pfade liefern.
  - **Laufendes Projekt (brownfield):** kein reines Interview, sondern Scan +
    Interview kombiniert — der Scan liefert deskriptive Kandidaten (was der
    Code faktisch schon tut), das Interview klärt pro Kandidat, ob daraus
    eine normative Regel wird (`status: active`) oder er verworfen wird.
    Deckungsgleich mit dem Ist/Soll-Rückgrat aus §3: der Scan-Befund bleibt
    deskriptiv, bis ein Mensch ihn explizit ins Normative hebt.

  Beide Pfade schreiben in denselben `rules/`-Ordner; nur die Erfassung
  unterscheidet sich, nicht das Zielformat.

### Weiterhin offen

- **Hash-Granularität:** Zeilenspannen verschieben sich bei jeder Umformatierung.
  Braucht es semantische Anker statt Zeilennummern (Symbol-/AST-basiert)?
- **Kosten von Stufe-2-Compliance:** Taktung, Scope-Begrenzung, wann lohnt der
  LLM-Judge-Durchlauf?
- **Verhältnis Intent ↔ Vision:** Sind das zwei Ebenen (Vision = Fernziel,
  Mission = aktuelle Ausbaustufe) oder eine?

---

## 11. Nächste Schritte

1. Dieses Konzept gemeinsam schärfen (offene Punkte aus §10).
2. Je Schlüsselrolle ein Detailkonzept: **Fact-Finder**, **Planner-Gatekeeper**,
   **Compliance-Agent**, **Rules-Scoping / DOX-Ablösung**.
3. Erfassungskonzept für den `rules/`-Layer in laufenden V4-Projekten
   ausarbeiten (kein Migrations-Konzept — es gibt keinen V3-Bestand).
4. Erst danach: Umsetzung durch Claude Code entlang der ORBIT-Pipeline selbst.
```
