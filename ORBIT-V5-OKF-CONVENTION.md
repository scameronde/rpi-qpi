# ORBIT-OKF-Konvention — Spezifikation

> Status: Entwurf · Version 0.1 · Datum: 2026-07-01 ·
> zuletzt ergänzt: 2026-08-06 (§13 gegen `ORBIT-V5-CONCEPT.md §10` abgeglichen;
> Referenz-Konzept-Dateiname korrigiert)
> Profiliert: Open Knowledge Format (OKF) v0.1
> Zweck: Definiert, wie der normative Soll-Wissensgraph von ORBIT V5 als
> OKF-konformes Bundle dargestellt wird. Grundlage für Fact-Finder,
> Planner-Gatekeeper und Compliance-Agent.
> Referenz-Konzept: `ORBIT-V5-CONCEPT.md`

---

## 1. Zweck und Verhältnis zu OKF

Diese Konvention ist ein **Profil** von OKF v0.1: Sie fügt nichts hinzu, was
OKF verbietet, und schränkt OKF für den Anwendungsfall „normativer
Wissensgraph" ein. Ein ORBIT-OKF-Bundle ist immer ein gültiges OKF-Bundle;
das Umgekehrte gilt nicht.

OKF liefert: Serialisierung (Markdown + YAML-Frontmatter), Bundle-/Ordnerform,
Cross-Link-Graph, Versionierung, git-Workflow, den mitgelieferten HTML-Viewer.

Diese Konvention ergänzt darauf: **typisierte Kanten, stabile IDs,
Code-Scoping, Regel-Semantik und strenge Validierung** — alles als erlaubte
OKF-Extensions.

### 1.1 Geltungsbereich

Diese Konvention beschreibt ausschließlich die **normative (Soll-)** Ebene:
Absicht (Intent), Spezifikation (Spec), Regeln (Rule) und
Architekturentscheidungen (ADR). Die deskriptive (Ist-)Ebene — Code-Fakten,
externe Recherche, Qualitätsergebnisse — ist **nicht** Gegenstand dieser
Konvention. Code-Fakten werden nicht gespeichert, sondern on-demand aus dem
Code abgeleitet (siehe `ORBIT-V5-CONCEPT.md`, §5).

### 1.2 Schlüsselwörter

MUSS / DARF NICHT / SOLLTE / KANN sind im Sinne von RFC 2119 zu verstehen.
„Konform" bezieht sich auf diese Konvention; „OKF-konform" auf OKF v0.1 §9.

---

## 2. Bundle-Struktur

Der Soll-Graph ist **ein** OKF-Bundle im Verzeichnis `knowledge/`:

```
knowledge/
  index.md                         # okf_version + Konventionsversion (siehe §9)
  log.md                           # optional: Entscheidungshistorie des Bundles
  intent/
    <slug>.md                      # type: Intent
  specs/
    <slug>.md                      # type: Spec
  rules/
    architecture/<slug>.md         # type: Rule, kind: architecture
    design/<slug>.md               # type: Rule, kind: design
    conventions/<slug>.md          # type: Rule, kind: convention
  adr/
    <slug>.md                      # type: ADR
```

Die Ordnergliederung ist Navigationshilfe, **nicht** die Wahrheit über
Beziehungen — diese stehen im Frontmatter (§5). `index.md`-Dateien SOLLTEN pro
Verzeichnis für progressive disclosure gepflegt werden (dürfen generiert
werden).

---

## 3. Knotentypen

Das OKF-Pflichtfeld `type` MUSS genau einen dieser Werte tragen:

| `type` | Ebene | Rolle |
|---|---|---|
| `Intent` | Soll | Absicht & Idee (Vision/Mission) — das Warum/Was. Wurzel der Traceability. |
| `Spec` | Soll | Funktionale Spezifikation einer Fähigkeit. |
| `Rule` | Soll | Konzept- & Regelebene: Architektur, Design, Konventionen. Regiert Code. |
| `ADR` | Soll | Architekturentscheidung mit Kontext, Entscheidung, Konsequenzen. |

Consumer MÜSSEN unbekannte `type`-Werte tolerieren (OKF §4.1) und als generische
Konzepte behandeln.

---

## 4. Gemeinsame Frontmatter-Felder

Für **alle** Knotentypen:

| Feld | Pflicht | Wert | Bedeutung |
|---|---|---|---|
| `type` | MUSS | s. §3 | OKF-Pflichtfeld. |
| `id` | MUSS | String, stabil | Dauerhafter Handle (§6). Ziel aller typisierten Referenzen. |
| `status` | MUSS | `draft`\|`active`\|`superseded`\|`deprecated` | Lebenszyklus. |
| `title` | SOLLTE | String | Anzeigename. |
| `description` | SOLLTE | String (1 Satz) | Kurzfassung für Index/Suche. |
| `timestamp` | SOLLTE | ISO 8601 | Letzte inhaltliche Änderung. |
| `tags` | KANN | Liste String | Querschnittskategorien. |
| `supersedes` | KANN | Liste `id` | Ersetzt genannte Knoten (§5). |

`id`, `status` und die typisierten Referenzfelder (§5) sind
ORBIT-Erweiterungen. Sie sind OKF-legal, weil OKF beliebige Zusatz-Keys
erlaubt und Consumer sie erhalten müssen (OKF §4.1).

---

## 5. Typisierte Kanten

OKF-Body-Links sind bewusst **untypisiert** (OKF §5.3). Diese Konvention hebt
die maschinell relevanten Beziehungen daher ins **Frontmatter**. Referenzen
zeigen stets auf `id` (nicht auf Pfade), damit sie Umbenennungen überleben.

| Feld | Erlaubt bei | Ziel | Semantik |
|---|---|---|---|
| `refines` | Spec, Rule | `id` von Intent/Spec | „konkretisiert / leitet ab von". |
| `scope` | Rule (MUSS) | Glob-Liste | `governs`-Kante zum **Code** (§7). |
| `supersedes` | alle | `id` | Ersetzt einen früheren Knoten. |
| `conflictsWith` | Rule | `id` von Rule | Bewusst anerkannter Regelkonflikt (§8). |
| `dependsOn` | Spec, Rule | `id` | Sachliche Abhängigkeit ohne Ableitung. |

**Body-Spiegelung (optional):** Da der mitgelieferte OKF-Viewer Kanten nur aus
Body-Links zeichnet, KÖNNEN wichtige Beziehungen zusätzlich als OKF-Body-Link
(bundle-relativ, §5.1 OKF) gespiegelt werden. Die Wahrheit über den Graphen ist
aber immer das Frontmatter.

---

## 6. Identität

- Jeder Knoten MUSS ein `id`-Feld tragen. `id` ist der **dauerhafte Handle**
  und Ziel aller typisierten Referenzen.
- Empfohlenes Schema: `<TYP-PRÄFIX>-<BEREICH>-<NUMMER>`, Großbuchstaben-Kebab,
  z. B. `RULE-ARCH-014`, `SPEC-DATA-ACCESS`, `INTENT-001`, `ADR-007`.
- Die OKF-Concept-ID (Dateipfad ohne `.md`) bleibt für OKF-native Body-Links
  und den Viewer bestehen, ist aber **nicht** die interne Referenz.
- `id` MUSS im Bundle eindeutig sein und DARF sich über die Lebensdauer des
  Knotens NICHT ändern (auch nicht bei Umbenennung/Verschiebung der Datei).

---

## 7. Code-Scoping (`governs`) — Ablösung von DOX

Regeln regieren Code über `scope` statt über verzeichnislokale AGENTS.md.

- `scope` ist eine Liste von Globs relativ zur Repo-Wurzel. Ausschlüsse mit
  führendem `!`. Beispiel: `["src/api/**", "!src/api/legacy/**"]`.
- Ein `Rule`-Knoten MUSS ein nicht-leeres `scope` haben.
- „Welche Regeln gelten für Pfad X?" = alle `Rule`, deren `scope` X matcht
  (Includes minus Excludes). Diese Abfrage ersetzt den DOX-Walk.

### 7.1 Präzedenz (ersetzt „closer file governs")

Matchen mehrere Regeln **gleicher `kind`** denselben Pfad mit widersprüchlichem
Inhalt, gilt in dieser Reihenfolge:

1. **Explizite Priorität:** höheres `priority` (Integer, optional) gewinnt.
2. **Spezifität:** das speziellere `scope` gewinnt (längster wildcard-freier
   Pfad-Präfix; bei Gleichstand weniger Wildcards).
3. **Ungelöst:** lässt sich so keine Rangfolge bilden, MUSS der Validator dies
   als Konflikt melden; die Autoren MÜSSEN ihn per `conflictsWith` +
   `priority` oder Zusammenlegen auflösen.

Damit ersetzt „das spezifischere Scope regiert" die frühere DOX-Regel „die
nähere Datei regiert".

---

## 8. Validierung (strenger als OKF-Konformität)

OKF ist absichtlich permissiv (kaputte Links tolerieren, OKF §9). Für
verlässliche, versiegelbare Pläne kehrt diese Konvention das für die
**typisierten Frontmatter-Kanten** um. Ein Bundle ist **ORBIT-valide**, wenn:

1. Jeder Knoten hat ein eindeutiges, nicht-leeres `id`.
2. `type` ∈ {Intent, Spec, Rule, ADR}.
3. Jeder `Rule`-Knoten hat nicht-leeres `scope`, `kind` und `enforcement`.
4. **Keine toten typisierten Referenzen:** jedes Ziel in `refines`,
   `supersedes`, `conflictsWith`, `dependsOn` existiert als `id` im Bundle.
5. **Keine Zyklen** in `refines` und in `supersedes`.
6. **Traceability:** jede `Spec` `refines` mindestens ein `Intent`; jede `Rule`
   `refines` mindestens eine `Spec` oder ein `Intent` (sonst Warnung).
7. **Keine ungelösten Scope-Konflikte** (§7.1).
8. **Status-Lebenszyklus:** ein Knoten mit `status: superseded` MUSS von
   mindestens einem Knoten via `supersedes` referenziert werden.

Anmerkung: Die OKF-Permissivität für **Body-Prosa-Links** bleibt erhalten —
dort ist ein Link auf noch nicht geschriebenes Wissen zulässig. Streng ist nur
die typisierte Frontmatter-Ebene.

Die Validierung läuft beim Index-Bau und KANN als CI-Gate fungieren.

---

## 9. Konsum (informativ)

Die Wahrheit sind die Dateien; der Graph ist ein abgeleiteter, neu baubarer
Index (SQLite oder In-Memory bei erwarteten 50–500 Knoten). Ein
Knowledge-Graph-MCP-Server SOLLTE mindestens bieten:

- `rules_for_path(path)` → geltende Regeln inkl. aufgelöster Präzedenz (§7).
- `get(id)` → Knoten mit Frontmatter + Body.
- `trace(id)` → transitive `refines`-Hülle (Impact-Analyse).
- `validate()` → Ergebnis der Prüfungen aus §8.
- `conflicts()` → offene Scope-/Regelkonflikte.

Agenten konsultieren diese Schnittstelle statt Dateien zu grep\'en.

---

## 10. OKF-Konformität und bewusste Divergenzen

**Konform zu OKF v0.1:** Pflichtfeld `type` vorhanden, parsebares Frontmatter,
reservierte Dateinamen (`index.md`, `log.md`) regelkonform, bundle-relative
Links.

**Bewusste Divergenzen (beide additiv, nicht brechend):**

1. **Typisierte Kanten im Frontmatter** statt untypisierter Body-Links.
   OKF erlaubt Zusatz-Keys → kein Konformitätsbruch.
2. **Strenge Validierung** über OKFs permissives Modell hinaus, begrenzt auf
   die typisierte Frontmatter-Ebene → betrifft nur unsere Consumer, nicht die
   OKF-Konformität des Bundles.

Ein anderer OKF-Consumer (z. B. der Referenz-Viewer) kann das Bundle weiterhin
lesen; er ignoriert lediglich unsere Zusatzfelder.

---

## 11. Versionierung

- Das Bundle deklariert im Wurzel-`index.md`-Frontmatter `okf_version: "0.1"`
  (der laut OKF §11 einzige erlaubte Frontmatter-Ort in einer `index.md`) sowie
  `orbit_okf_convention: "0.1"`.
- Diese Konvention folgt `<major>.<minor>`: Minor = rückwärtskompatible
  Ergänzungen (neue optionale Felder/Kantentypen), Major = brechende Änderungen.

---

## 12. Beispielknoten

### 12.1 Rule (Architektur)

```markdown
---
type: Rule
id: RULE-ARCH-014
kind: architecture
status: active
title: API-Layer greift nur über Repository auf Persistenz zu
description: Kein direkter Persistenzzugriff aus dem API-Layer.
scope: ["src/api/**", "!src/api/legacy/**"]
enforcement: mechanical
priority: 100
refines: [SPEC-DATA-ACCESS]
supersedes: [RULE-ARCH-009]
timestamp: 2026-07-01T10:00:00Z
tags: [architecture, layering]
---

Der API-Layer greift nicht direkt auf die Persistenz zu, sondern
ausschließlich über die Repository-Schnittstelle
(siehe [Repository-Interface](/rules/design/repository-interface.md)).

**Rationale:** entkoppelt Transport von Speicherung, hält den Domain-Kern testbar.

# Verifikation

`mechanical`: kein Import aus `src/persistence/**` innerhalb `src/api/**` (Arch-Test).
```

### 12.2 Spec

```markdown
---
type: Spec
id: SPEC-DATA-ACCESS
status: active
title: Datenzugriff
description: Wie Fähigkeiten auf persistente Daten zugreifen.
refines: [INTENT-001]
timestamp: 2026-07-01T09:00:00Z
tags: [data]
---

# Verhalten

Jeder Datenzugriff erfolgt über eine abstrakte Repository-Schnittstelle …

# Akzeptanzkriterien

- Ein Aufruf … liefert …
```

### 12.3 ADR

```markdown
---
type: ADR
id: ADR-007
status: active
title: Repository-Pattern für Persistenzzugriff
description: Entscheidung, Persistenz hinter Repositories zu kapseln.
refines: [SPEC-DATA-ACCESS]
timestamp: 2026-06-20T15:00:00Z
tags: [architecture, decision]
---

# Kontext

Direkter DB-Zugriff aus mehreren Layern führte zu …

# Entscheidung

Wir kapseln jeden Persistenzzugriff hinter Repository-Schnittstellen.

# Konsequenzen

Positiv: Testbarkeit, Austauschbarkeit. Negativ: eine Indirektionsschicht mehr.
Etabliert Regel [RULE-ARCH-014](/rules/architecture/api-no-direct-persistence.md).
```

---

## 13. Offene Punkte (→ `unknowns/`)

- **Regel-Granularität:** geklärt in `ORBIT-V5-CONCEPT.md §10` — ein Knoten
  pro prüfbarer Aussage (ein `enforcement`), nicht pro Prinzip oder Komponente.
- **Hash-/Anker-Strategie für `enforcement: mechanical`:** wie werden Arch-Tests
  an Regeln gebunden und ausgeführt (gehört teils zur Ist-/Compliance-Seite).
- **`kind`-Vokabular:** reichen architecture/design/convention, oder braucht es
  z. B. `security`, `performance`? (Die Beispiele in `ORBIT-V5-CONCEPT.md §10`
  — Audit, Monitoring, Logging, Teststrategie, Code-Konventionen — kamen alle
  ohne neue `kind`-Werte aus; bleibt trotzdem offen, ob das bei Sicherheits-
  oder Performance-Regeln so bleibt.)
- **Verhältnis ADR-`status` ↔ gemeinsamer `status`:** eigener ADR-Lebenszyklus
  (proposed/accepted) oder Vereinheitlichung?
- **Initiale Erfassung (vormals "Migration V4 → V5"):** geklärt in
  `ORBIT-V5-CONCEPT.md §10` — kein Migrations-Fall (kein V3-Bestand), sondern
  zwei Erfassungspfade für neue bzw. laufende V4-Projekte.
```
