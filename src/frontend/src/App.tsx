import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useActor } from "./hooks/useActor";
import type { FamilyMember, Guarantee } from "./backend.d";
import { ArrowRight, CheckCircle2, Calendar, ChevronUp, ChevronDown, Loader2, Search, ExternalLink, Clock, Cloud, BookOpen, Mic, MicOff, ChevronRight, BookMarked, Mail, Phone, Lock, SlidersHorizontal, RotateCcw } from "lucide-react";
import { BROCHURE_KENNISBANK } from "./brochureKennisbank";

// ─── Translations ─────────────────────────────────────────────────────────────

const TRANSLATIONS = {
  NL: {
    subtitle: "Uw AI-assistent",
    uiModeDefault: "Standaard",
    uiModeCustom: "Aanpassen",
    uiModeReset: "Reset",
    uiModeBanner: "Aangepaste lay-out actief — sleep de chatbot-rand om de breedte aan te passen",
    aangeslotene: "Aangeslotene",
    taal: "Taal",
    nrExternAanhangsel: "Nr. Extern Aanhangsel",
    onderwerp: "Onderwerp",
    situatieDatum: "Situatie op datum van",
    tabPolis: "Polis",
    tabGezin: "Gezin",
    tabGaranties: "Garanties",
    tabDocumenten: "Documenten",
    tabSalesforce: "Salesforce",
    tabOpzoeken: "Opzoeken",
    tabCommands: "Bewerkingen",
    chatbotWelcome: "Hallo! Ik ben Mathias. Stel mij een vraag over de brochures, garanties, hospitalisatie, ambulante zorg of een specifieke organisatie.",
    chatbotPlaceholder: "Stel een vraag aan Mathias...",
    chatbotAssistant: "Assistent",
    chatbotModeAssistent: "Assistent",
    chatbotModeIMS: "IMS",
    imsSearchPlaceholder: "Zoek een procedure...",
    imsModTitle: "IMS — Bewerkingen",
    imsModSubtitle: "Raadpleeg IMS-commando's voor uw case",
    chatbotSpeechLabel: "Spraak invoer",
    chatbotSpeechTitle: "Spreek uw vraag in",
    chatbotHide: "Chatbot verbergen",
    chatbotShow: "Chatbot tonen",
    dekkingsstatus: "Dekkingsstatus",
    actief: "Actief",
    vanaf: "Vanaf",
    dekkingsniveau: "Dekkingsniveau",
    gedektePersonen: "Gedekte personen",
    titularis: "Titularis",
    rechthebbenden: "Rechthebbenden",
    hospitalisatie: "Hospitalisatie",
    eenpersoonskamer: "Eenpersoonskamer",
    franchise: "Franchise",
    polis: "Polis",
    polisnummer: "Polisnummer",
    polistype: "Polistype",
    gezin: "Gezin",
    status: "Status",
    actiefOpSituatiedatum: "Actief op situatiedatum",
    geenWijzigingen: "Geen bekende wijzigingen tot op heden",
    contractdatums: "Contractdatums",
    ingangsdatum: "Ingangsdatum",
    einde: "Einde",
    onbepaald: "Onbepaald",
    referentieformule: "Referentieformule",
    vanToepassing: "Van toepassing op situatiedatum",
    situatiedatumRef: "Situatiedatum (referentie)",
    begunstigden: "Begunstigden",
    ziekte: "Ziekte",
    stadium: "Stadium",
    geboortedatum: "Geboortedatum",
    medVoorgeschiedenis: "Med. voorgeschiedenis",
    formule: "Formule",
    garanties: "Garanties",
    code: "Code",
    risico: "Risico",
    dienst: "Dienst",
    tussenkomst: "Tussenkomst",
    bedrag: "Bedrag",
    geenDocumenten: "Geen documenten beschikbaar",
    salesforceZoeken: "Salesforce zoeken",
    zoekInSalesforce: "Zoeken in Salesforce",
    direkteSFLink: "Directe Salesforce-link voor:",
    sfAangemeld: "Zorg dat u aangemeld bent in Salesforce voordat u op de link klikt.",
    recenteZoekopdrachten: "Recente zoekopdrachten",
    zoekEenPersoon: "Zoek een persoon in Salesforce",
    typeEenNaam: 'Typ een naam hierboven en klik op "Zoeken in Salesforce" om direct naar het Salesforce-profiel te gaan.',
    vbPlaceholder: "Vb. John Doe",
    imsTitle: "S1ASI – Klant opzoeken",
    stap1: "Stap 1 — Open IMS",
    openInIMS: "Openen in IMS",
    imsGeopend: "IMS geopend in nieuw tabblad",
    stap2: "Stap 2 — Kopieer en plak in het IMS-scherm (rij 4: NAAM… VOORNAAM)",
    naamLabel: "NAAM (Achternaam) → plak in het 1e veld",
    voornaamLabel: "VOORNAAM → plak in het 2e veld",
    kopieer: "Kopieer",
    gekopieerd: "Gekopieerd!",
    imsTip: 'Tip: klik eerst "Openen in IMS", ga dan naar rij 4 (NAAM… VOORNAAM), klik "Kopieer" naast Achternaam, plak in het 1e veld, dan "Kopieer" naast Voornaam en plak in het 2e veld.',
    imsRaadplegen: "Raadplegen Signaletiek",
    imsNieuwTabblad: "IMS opent in een nieuw tabblad. Zorg dat u aangemeld bent op het Ethias-netwerk.",
    imsAndereSchermen: "Andere IMS-schermen",
    confidenceHoog: (naam: string) => `Volgens de brochure "${naam}":\n\n`,
    confidenceMatig: (naam: string) => `Waarschijnlijk uit de brochure "${naam}":\n\n`,
    confidenceLaag: (naam: string) => `Mogelijke informatie uit de brochure "${naam}" (controleer dit zelf):\n\n`,
    ookRelevant: "--- Ook relevant ---",
    fallbackTekst: (top3: string) => `Ik kon geen gericht antwoord vinden. De meest relevante brochures voor dit onderwerp zijn:\n${top3}\n\nProbeer uw vraag te herformuleren met meer specifieke termen.`,
    noMatchTekst: (orgNamen: string, total: number) => `Ik kon geen specifieke informatie vinden over uw vraag in de ${total} beschikbare brochures.\n\nProbeer vragen zoals:\n• "Wat is de franchise bij [organisatie]?"\n• "Wie kan aansluiten bij [organisatie]?"\n• "Hoe vraag ik terugbetaling aan?"\n• "Wat dekt de hospitalisatieverzekering?"\n\nOf vraag rechtstreeks naar een organisatie zoals ${orgNamen}, en nog ${total - 3} andere.`,
    bronLabel: "Bron",
    ernstigeZiekten: "Ernstige ziekten",
    ambulanteZorg: "Ambulante zorg",
  },
  FR: {
    subtitle: "Votre assistant IA",
    uiModeDefault: "Standard",
    uiModeCustom: "Personnaliser",
    uiModeReset: "Réinitialiser",
    uiModeBanner: "Mise en page personnalisée active — faites glisser le bord du chatbot pour redimensionner",
    aangeslotene: "Affilié",
    taal: "Langue",
    nrExternAanhangsel: "Nr. Annexe Externe",
    onderwerp: "Sujet",
    situatieDatum: "Situation à la date du",
    tabPolis: "Police",
    tabGezin: "Famille",
    tabGaranties: "Garanties",
    tabDocumenten: "Documents",
    tabSalesforce: "Salesforce",
    tabOpzoeken: "Rechercher",
    tabCommands: "Commandes",
    chatbotWelcome: "Bonjour! Je suis Mathias. Posez-moi une question sur les brochures, les garanties, l'hospitalisation, les soins ambulatoires ou une organisation spécifique.",
    chatbotPlaceholder: "Posez une question à Mathias...",
    chatbotAssistant: "Assistant",
    chatbotModeAssistent: "Assistant",
    chatbotModeIMS: "IMS",
    imsSearchPlaceholder: "Rechercher une procédure...",
    imsModTitle: "IMS — Opérations",
    imsModSubtitle: "Consultez les commandes IMS pour votre dossier",
    chatbotSpeechLabel: "Saisie vocale",
    chatbotSpeechTitle: "Parlez votre question",
    chatbotHide: "Masquer le chatbot",
    chatbotShow: "Afficher le chatbot",
    dekkingsstatus: "Statut de couverture",
    actief: "Actif",
    vanaf: "Depuis",
    dekkingsniveau: "Niveau de couverture",
    gedektePersonen: "Personnes couvertes",
    titularis: "Titulaire",
    rechthebbenden: "Ayants droit",
    hospitalisatie: "Hospitalisation",
    eenpersoonskamer: "Chambre individuelle",
    franchise: "Franchise",
    polis: "Police",
    polisnummer: "Numéro de police",
    polistype: "Type de police",
    gezin: "Famille",
    status: "Statut",
    actiefOpSituatiedatum: "Actif à la date de situation",
    geenWijzigingen: "Aucune modification connue à ce jour",
    contractdatums: "Dates du contrat",
    ingangsdatum: "Date d'entrée en vigueur",
    einde: "Fin",
    onbepaald: "Indéterminée",
    referentieformule: "Formule de référence",
    vanToepassing: "Applicable à la date de situation",
    situatiedatumRef: "Date de situation (référence)",
    begunstigden: "Bénéficiaires",
    ziekte: "Maladie",
    stadium: "Stade",
    geboortedatum: "Date de naissance",
    medVoorgeschiedenis: "Antécédents méd.",
    formule: "Formule",
    garanties: "Garanties",
    code: "Code",
    risico: "Risque",
    dienst: "Service",
    tussenkomst: "Intervention",
    bedrag: "Montant",
    geenDocumenten: "Aucun document disponible",
    salesforceZoeken: "Recherche Salesforce",
    zoekInSalesforce: "Rechercher dans Salesforce",
    direkteSFLink: "Lien direct Salesforce pour :",
    sfAangemeld: "Assurez-vous d'être connecté à Salesforce avant de cliquer sur le lien.",
    recenteZoekopdrachten: "Recherches récentes",
    zoekEenPersoon: "Rechercher une personne dans Salesforce",
    typeEenNaam: 'Tapez un nom ci-dessus et cliquez sur "Rechercher dans Salesforce" pour accéder directement au profil Salesforce.',
    vbPlaceholder: "Ex. John Doe",
    imsTitle: "S1ASI – Klant opzoeken",
    stap1: "Étape 1 — Ouvrir IMS",
    openInIMS: "Ouvrir dans IMS",
    imsGeopend: "IMS ouvert dans un nouvel onglet",
    stap2: "Étape 2 — Copiez et collez dans l'écran IMS (ligne 4 : NOM… PRÉNOM)",
    naamLabel: "NOM (Nom de famille) → coller dans le 1er champ",
    voornaamLabel: "PRÉNOM → coller dans le 2e champ",
    kopieer: "Copier",
    gekopieerd: "Copié!",
    imsTip: 'Conseil : cliquez d\'abord sur "Ouvrir dans IMS", allez à la ligne 4 (NOM… PRÉNOM), cliquez "Copier" à côté du nom, collez dans le 1er champ, puis "Copier" à côté du prénom et collez dans le 2e champ.',
    imsRaadplegen: "Consulter Signaletiek",
    imsNieuwTabblad: "IMS s'ouvre dans un nouvel onglet. Assurez-vous d'être connecté au réseau Ethias.",
    imsAndereSchermen: "Autres écrans IMS",
    confidenceHoog: (naam: string) => `Selon la brochure "${naam}" :\n\n`,
    confidenceMatig: (naam: string) => `Probablement issu de la brochure "${naam}" :\n\n`,
    confidenceLaag: (naam: string) => `Information possible de la brochure "${naam}" (vérifiez par vous-même) :\n\n`,
    ookRelevant: "--- Aussi pertinent ---",
    fallbackTekst: (top3: string) => `Je n'ai pas trouvé de réponse ciblée. Les brochures les plus pertinentes pour ce sujet sont :\n${top3}\n\nEssayez de reformuler votre question avec des termes plus spécifiques.`,
    noMatchTekst: (orgNamen: string, total: number) => `Je n'ai pas trouvé d'informations spécifiques sur votre question dans les ${total} brochures disponibles.\n\nEssayez des questions comme :\n• "Quelle est la franchise chez [organisation] ?"\n• "Qui peut s'affilier à [organisation] ?"\n• "Comment demander un remboursement ?"\n• "Que couvre l'assurance hospitalisation ?"\n\nOu interrogez directement une organisation comme ${orgNamen}, et encore ${total - 3} autres.`,
    bronLabel: "Source",
    ernstigeZiekten: "Maladies graves",
    ambulanteZorg: "Soins ambulatoires",
  },
} as const;

type Lang = "NL" | "FR";
type T = typeof TRANSLATIONS[Lang];

// ─── Brochure Search Engine ────────────────────────────────────────────────────

type VraagType = "prijs" | "wie" | "wat" | "wanneer" | "hoe" | "dekking" | "uitsluiting" | "algemeen";

// ── Dutch Stopwords ──────────────────────────────────────────────────────────
const STOPWORDS = new Set([
  "een", "de", "het", "van", "in", "is", "dat", "die", "dit", "wat", "hoe", "wie", "welke",
  "voor", "bij", "met", "zijn", "aan", "als", "ook", "maar", "naar", "dan", "nog", "wel",
  "niet", "kan", "over", "wordt", "werd", "heeft", "hebben", "er", "ze", "hij", "zij",
  "wij", "ons", "hun", "hen", "mij", "jij", "jou", "uw", "hun", "dit", "dat", "deze",
  "die", "der", "des", "den", "ter", "ten", "uit", "tot", "om", "op", "na", "te",
  "mag", "moet", "moeten", "kunnen", "zal", "zou", "waren", "was", "ben", "bent",
  "worden", "werd", "worde", "geeft", "geven", "maken", "doen", "zien", "komen",
  "gaan", "staan", "liggen", "zijn", "hebben", "worden", "zullen", "mogen", "willen",
]);

// ── Lightweight Dutch Stemmer ────────────────────────────────────────────────
function stemNL(word: string): string {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length < 4) return w;

  // Ordered from longest suffix to shortest — strip first match, stop
  const suffixes = [
    "ingskosten", "ingstermijn", "ingsdatum", "sluiting", "stelling",
    "ingsvorm", "ingsrecht", "dekking", "verzekering", "verzekerde",
    "verzekerden", "verzekerd", "betaling", "terugbetaling", "vergoeding",
    "aansluiting", "prestatie", "ziekenhuis", "opname", "kosten",
    "ering", "eling", "ingen", "atie",
    "ing", "elijk", "lijke", "lijker", "lijkst",
    "heid", "heden",
    "end", "ende", "enden",
    "ens", "ers", "er", "en", "es", "s",
  ];

  for (const suffix of suffixes) {
    if (w.endsWith(suffix)) {
      const stem = w.slice(0, w.length - suffix.length);
      if (stem.length >= 4) return stem;
    }
  }
  return w;
}

// ── IDF Map (built once at module level) ────────────────────────────────────
const IDF_MAP: Map<string, number> = buildIdfMap();

function buildIdfMap(): Map<string, number> {
  const docFreq = new Map<string, number>();
  const N = BROCHURE_KENNISBANK.length;
  for (const entry of BROCHURE_KENNISBANK) {
    const stems = new Set(
      entry.tekst
        .toLowerCase()
        .split(/\s+/)
        .map(w => stemNL(w.replace(/[^a-z]/g, "")))
        .filter(s => s.length >= 4)
    );
    for (const stem of stems) {
      docFreq.set(stem, (docFreq.get(stem) ?? 0) + 1);
    }
  }
  const idf = new Map<string, number>();
  for (const [stem, df] of docFreq) {
    // Smoothed IDF
    idf.set(stem, Math.log((N + 1) / (df + 1)) + 1);
  }
  return idf;
}

// ── Question Type Detection ──────────────────────────────────────────────────
function detectVraagType(query: string): VraagType {
  const q = query.toLowerCase();
  if (/premie|prijs|hoeveel|kost|bedrag|franchise|euro|€|betaal/.test(q)) return "prijs";
  if (/wie|welke personen|aangesloten|begunstigde|deelnemen/.test(q)) return "wie";
  if (/wanneer|datum|ingangsdatum|wachttijd|termijn|vanaf/.test(q)) return "wanneer";
  if (/uitsluiting|uitsluit|niet gedekt|niet vergoed|uitgesloten/.test(q)) return "uitsluiting";
  if (/hoe|procedure|aanvragen|indienen|stap|formulier/.test(q)) return "hoe";
  if (/gedekt|dekt|waarborg|garantie|terugbetaling|vergoed|dekking|hospitalisatie|ambulante/.test(q)) return "dekking";
  if (/wat is|wat zijn|doel|betekent|omschrijf|uitleg/.test(q)) return "wat";
  return "algemeen";
}

// ── Organisation Name Detection ──────────────────────────────────────────────
function detectOrgInQuery(query: string): string | null {
  const q = query.toLowerCase();
  for (const entry of BROCHURE_KENNISBANK) {
    const orgWords = entry.naam.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    for (const word of orgWords) {
      if (q.includes(word)) return entry.naam;
    }
  }
  return null;
}

// ── Main Search Function ─────────────────────────────────────────────────────
function zoekInBrochures(
  query: string,
  context: { lastOrg?: string; lastTopic?: string } | undefined,
  t: T
): { antwoord: string; bron: string; confidence: "hoog" | "matig" | "laag" } | null {
  const vraagType = detectVraagType(query);

  // 1. Normalise query
  const queryLower = query.toLowerCase().replace(/[?!.,;:]/g, "");
  const rawWords = queryLower.split(/\s+/).filter(w => w.length >= 3 && !STOPWORDS.has(w));
  if (rawWords.length === 0) return null;

  // 2. Stem query words
  const queryStems = rawWords.map(w => stemNL(w.replace(/[^a-z]/g, ""))).filter(s => s.length >= 4);
  if (queryStems.length === 0) return null;

  // 3. Detect organisation
  const detectedOrg = detectOrgInQuery(query) ?? context?.lastOrg ?? null;

  // 4. Score each brochure using TF-IDF
  type BrochureScore = { naam: string; score: number; tekst: string };
  const scoredBrochures: BrochureScore[] = [];

  for (const entry of BROCHURE_KENNISBANK) {
    const tekst = entry.tekst.toLowerCase();
    const words = tekst.split(/\s+/);
    const totalWords = Math.max(words.length, 1);
    let brochureScore = 0;

    for (const stem of queryStems) {
      // TF: count occurrences of stem in the brochure text
      let tf = 0;
      for (const w of words) {
        if (stemNL(w.replace(/[^a-z]/g, "")) === stem) tf++;
      }
      if (tf > 0) {
        const normTf = tf / totalWords;
        const idfVal = IDF_MAP.get(stem) ?? 1.0;
        brochureScore += normTf * idfVal;
      }
    }

    if (brochureScore > 0) {
      // Org name boost
      if (detectedOrg && entry.naam === detectedOrg) {
        brochureScore *= 3.0;
      } else if (context?.lastOrg && entry.naam === context.lastOrg) {
        brochureScore *= 1.5;
      }
      scoredBrochures.push({ naam: entry.naam, score: brochureScore, tekst: entry.tekst });
    }
  }

  if (scoredBrochures.length === 0) {
    // Fallback: return partial matches
    const partialScores: BrochureScore[] = BROCHURE_KENNISBANK.map(entry => {
      const tekst = entry.tekst.toLowerCase();
      let s = 0;
      for (const stem of queryStems) {
        if (tekst.includes(stem)) s += 0.1;
      }
      return { naam: entry.naam, score: s, tekst: entry.tekst };
    });
    partialScores.sort((a, b) => b.score - a.score);
    const top3 = partialScores.slice(0, 3).map(b => `• ${b.naam}`).join("\n");
    return {
      antwoord: t.fallbackTekst(top3),
      bron: "",
      confidence: "laag",
    };
  }

  // 5. Sort descending
  scoredBrochures.sort((a, b) => b.score - a.score);
  const top = scoredBrochures[0];
  const second = scoredBrochures[1];

  // 6. Confidence determination
  let confidence: "hoog" | "matig" | "laag";
  if (second) {
    const ratio = second.score / top.score;
    if (ratio < 0.5 || top.score > 0.05) {
      confidence = "hoog";
    } else if (ratio < 0.8) {
      confidence = "matig";
    } else {
      confidence = "laag";
    }
  } else {
    confidence = top.score > 0.02 ? "hoog" : "matig";
  }

  // ── Extract best sentence passage from a brochure ────────────────────────
  function extractPassage(brochureTekst: string): string {
    const zinnen = brochureTekst
      .split(/(?<=[.!?])\s+|[\n]+/)
      .map(z => z.trim())
      .filter(z => z.length > 30 && z.length < 600);

    if (zinnen.length === 0) return brochureTekst.slice(0, 300);

    // Score each sentence
    const zinScores = zinnen.map((zin, idx) => {
      const zinLower = zin.toLowerCase();
      let score = 0;

      for (const stem of queryStems) {
        const zinWords = zinLower.split(/\s+/);
        for (const w of zinWords) {
          if (stemNL(w.replace(/[^a-z]/g, "")) === stem) {
            const idfVal = IDF_MAP.get(stem) ?? 1.0;
            score += idfVal;
          }
        }
      }

      // Question-type boosts
      if (vraagType === "prijs" && /\d+[\.,]?\d*\s*(€|euro|%|procent)/i.test(zin)) score += 4;
      if (vraagType === "wanneer" && /\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\d{1,2}\s+(januari|februari|maart|april|mei|juni|juli|augustus|september|oktober|november|december)/i.test(zin)) score += 4;
      if (vraagType === "wie" && /(kan|personeelsleden|echtgen|kinderen|nevenverzekerde|begunstigden|aangesloten)/i.test(zin)) score += 3;
      if (vraagType === "dekking" && /(gedekt|vergoed|terugbetaling|waarborg|garantie)/i.test(zin)) score += 3;
      if (vraagType === "uitsluiting" && /(uitgeslo|niet gedekt|niet vergoed|uitsluiting|beperking)/i.test(zin)) score += 4;
      if (vraagType === "hoe" && /(formulier|aanvragen|indienen|stap|procedure|terugsturen)/i.test(zin)) score += 3;

      return { zin, score, idx };
    });

    // Find best sentence
    const sorted = [...zinScores].filter(z => z.score > 0).sort((a, b) => b.score - a.score);
    if (sorted.length === 0) {
      // Return first meaningful sentences
      return zinnen.slice(0, 2).join(" ");
    }

    const best = sorted[0];
    const bestIdx = best.idx;

    // Include 1 adjacent sentence (whichever scores higher: before or after)
    const before = bestIdx > 0 ? zinScores[bestIdx - 1] : null;
    const after = bestIdx < zinScores.length - 1 ? zinScores[bestIdx + 1] : null;

    let companion: typeof before = null;
    if (before && after) {
      companion = before.score >= after.score ? before : after;
    } else if (before) {
      companion = before;
    } else if (after) {
      companion = after;
    }

    // Build final passage (max 3 sentences)
    const passages: string[] = [];
    if (companion && companion.idx < bestIdx) {
      passages.push(companion.zin, best.zin);
    } else {
      passages.push(best.zin);
      if (companion) passages.push(companion.zin);
    }

    // If we still have room, add the second-ranked sentence if it's different
    if (passages.length < 3 && sorted.length > 1) {
      const second2 = sorted[1];
      if (second2.idx !== bestIdx && (!companion || second2.idx !== companion.idx)) {
        passages.push(second2.zin);
      }
    }

    return passages.slice(0, 3).join(" ");
  }

  // 7. Format answer prefix based on confidence
  function confidencePrefix(naam: string, conf: "hoog" | "matig" | "laag"): string {
    if (conf === "hoog") return t.confidenceHoog(naam);
    if (conf === "matig") return t.confidenceMatig(naam);
    return t.confidenceLaag(naam);
  }

  // 8. Check if top-2 brochures are close enough to include both
  const includeSecond = second && (second.score / top.score) >= 0.80;

  const topPassage = extractPassage(top.tekst);
  let antwoord = confidencePrefix(top.naam, confidence) + topPassage;
  let bron = top.naam;

  if (includeSecond) {
    const secondPassage = extractPassage(second.tekst);
    antwoord += `\n\n${t.ookRelevant}\n\n` + confidencePrefix(second.naam, "matig") + secondPassage;
    bron = `${top.naam} + ${second.naam}`;
  }

  return { antwoord, bron, confidence };
}

// ─── Static fallback data ─────────────────────────────────────────────────────

const STATIC_FAMILY: FamilyMember[] = [
  { nom: "John Appleseed", maladieY: false, maladies: "", garantir: "", stade: "O", dateNaissance: "25/09/1986", antecedents: "Y", formule: "1" },
  { nom: "Jane Appleseed", maladieY: true, maladies: "", garantir: "", stade: "1", dateNaissance: "25/09/2000", antecedents: "N", formule: "1" },
  { nom: "Baby Appleseed", maladieY: false, maladies: "", garantir: "", stade: "O", dateNaissance: "25/09/2024", antecedents: "N", formule: "O" },
];

const STATIC_GUARANTEES: Guarantee[] = [
  { code: "****", risque: "Alle risicoklassen", service: "Diverse kosten", intervention: "% sur certaines prestations", montant: 0n, pourcentage: 0n },
  { code: "****", risque: "Alle risicoklassen", service: "Brillenmontuur v/RIZIV", intervention: "Niet gedekt (vrijstelling 100% op aangerekende prestatie)", montant: 0n, pourcentage: 0n },
  { code: "****", risque: "Alle risicoklassen", service: "Begrafeniskosten", intervention: "", montant: 2500n, pourcentage: 0n },
  { code: "****", risque: "Alle risicoklassen", service: "Lijkenhuis kosten", intervention: "% sur certaines prestations", montant: 0n, pourcentage: 0n },
  { code: "****", risque: "Alle risicoklassen", service: "Osteopathie", intervention: "", montant: 0n, pourcentage: 0n },
  { code: "****", risque: "Alle risicoklassen", service: "Diëtetiek / Voedingssuppl.", intervention: "% sur certaines prestations", montant: 0n, pourcentage: 0n },
  { code: "****", risque: "Alle risicoklassen", service: "", intervention: "", montant: 25000n, pourcentage: 0n },
];

const AGE_PRICING = [
  { age: 0, alloc: 103.16, notAlloc: 110.16 },
  { age: 20, alloc: 330.13, notAlloc: 350.16 },
  { age: 65, alloc: 800.16, notAlloc: 850.16 },
];

const POLICIES = ["4.499.748", "4.499.541", "4.499.542"];

// ─── Tab config ───────────────────────────────────────────────────────────────

type TabKey = "Polis" | "Gezin" | "Garanties" | "Documenten" | "Salesforce" | "Opzoeken" | "Commands";

const TAB_LABEL_KEYS: Record<TabKey, keyof T> = {
  Polis: "tabPolis",
  Gezin: "tabGezin",
  Garanties: "tabGaranties",
  Documenten: "tabDocumenten",
  Salesforce: "tabSalesforce",
  Opzoeken: "tabOpzoeken",
  Commands: "tabCommands",
};

const TAB_KEYS: TabKey[] = ["Polis", "Gezin", "Garanties", "Documenten", "Salesforce", "Opzoeken", "Commands"];

// ─── Sub-components ───────────────────────────────────────────────────────────

function MathiasAvatar() {
  return (
    <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 bg-sky-100 flex items-center justify-center border-2 border-sky-200">
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-label="Mathias avatar">
        {/* Background */}
        <circle cx="40" cy="40" r="40" fill="#e0f2fe" />
        {/* Body */}
        <rect x="18" y="52" width="44" height="28" rx="10" fill="#3b82f6" />
        {/* Neck */}
        <rect x="33" y="46" width="14" height="12" rx="3" fill="#fbbf24" />
        {/* Head */}
        <ellipse cx="40" cy="34" rx="18" ry="20" fill="#fbbf24" />
        {/* Hair */}
        <ellipse cx="40" cy="16" rx="18" ry="8" fill="#92400e" />
        {/* Left eye */}
        <circle cx="33" cy="32" r="4" fill="white" />
        <circle cx="34" cy="32" r="2" fill="#1e3a5f" />
        {/* Right eye */}
        <circle cx="47" cy="32" r="4" fill="white" />
        <circle cx="48" cy="32" r="2" fill="#1e3a5f" />
        {/* Glasses */}
        <rect x="27" y="27" width="12" height="10" rx="3" fill="none" stroke="#ef4444" strokeWidth="2" />
        <rect x="41" y="27" width="12" height="10" rx="3" fill="none" stroke="#ef4444" strokeWidth="2" />
        <line x1="39" y1="32" x2="41" y2="32" stroke="#ef4444" strokeWidth="2" />
        {/* Smile */}
        <path d="M33 42 Q40 48 47 42" stroke="#92400e" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// ─── Speech Recognition Type Declarations ────────────────────────────────────

interface SpeechRecognitionResultItem {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionResultItem;
  [index: number]: SpeechRecognitionResultItem;
  isFinal: boolean;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

// Local message type for brochure-based chat (client-side only)
interface LocalMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  bron?: string;
}

interface ChatbotProps {
  messages: LocalMessage[];
  onSend: (content: string) => void;
  isSending: boolean;
  sidebar?: boolean;
  t: T;
  language: Lang;
}

function Chatbot({ messages, onSend, isSending, sidebar = false, t, language }: ChatbotProps) {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const isSpeechSupported = "SpeechRecognition" in window || "webkitSpeechRecognition" in window;

  const startListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = language === "NL" ? "nl-NL" : "fr-FR";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript.trim();
      if (transcript) {
        onSend(transcript);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  // Scroll to bottom whenever new messages arrive
  const prevCountRef = useRef(0);
  if (prevCountRef.current !== messages.length) {
    prevCountRef.current = messages.length;
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;
    onSend(trimmed);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={sidebar ? "flex flex-col h-full" : "bg-white rounded-xl shadow-sm border border-gray-100 mx-4 my-3"}>
      {/* Messages area */}
      <div className={`p-4 space-y-3 ${sidebar ? "flex-1 overflow-y-auto" : "min-h-[80px] max-h-72 overflow-y-auto"}`}>
        {messages.length === 0 ? (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-sky-100 flex items-center justify-center mr-2 shrink-0 mt-0.5">
              <span className="text-xs font-bold text-sky-600">M</span>
            </div>
            <div className="max-w-xs lg:max-w-2xl px-3 py-2 rounded-2xl rounded-bl-sm text-sm leading-relaxed bg-gray-100 text-gray-800">
              {t.chatbotWelcome}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role !== "user" && (
                <div className="w-7 h-7 rounded-full bg-sky-100 flex items-center justify-center mr-2 shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-sky-600">M</span>
                </div>
              )}
              <div className="max-w-xs lg:max-w-2xl">
                <div
                  className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-sky-500 text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-800 rounded-bl-sm"
                  }`}
                >
                  {msg.content.split("\n\n").map((part, i) => (
                    <p key={`${msg.id}-p${i}`} className={i > 0 ? "mt-2" : ""}>{part}</p>
                  ))}
                </div>
                {msg.bron && (
                  <div className="flex items-center gap-1 mt-1 ml-1">
                    <BookOpen className="w-3 h-3 text-orange-400" />
                    <span className="text-xs text-orange-500 font-medium">{msg.bron}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {isSending && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-sky-100 flex items-center justify-center mr-2 shrink-0">
              <span className="text-xs font-bold text-sky-600">M</span>
            </div>
            <div className="bg-gray-100 px-3 py-2 rounded-2xl rounded-bl-sm">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Input area */}
      <div className="relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.chatbotPlaceholder}
          disabled={isSending}
          rows={2}
          className="w-full resize-none border-0 rounded-b-xl bg-transparent p-4 pr-28 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-0 disabled:opacity-60"
        />
        {isSpeechSupported && (
          <div className="absolute bottom-3 right-14 flex flex-col items-center gap-0.5">
            <button
              type="button"
              onClick={startListening}
              disabled={isSending}
              aria-label={t.chatbotSpeechLabel}
              title={t.chatbotSpeechTitle}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors shadow-sm ${
                isListening
                  ? "bg-red-500 hover:bg-red-600 animate-pulse"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {isListening ? (
                <MicOff className="w-4 h-4 text-white" />
              ) : (
                <Mic className="w-4 h-4 text-gray-600" />
              )}
            </button>
            <span className={`text-[9px] font-bold leading-none ${isListening ? "text-red-500" : "text-gray-400"}`}>
              {language}
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={handleSend}
          disabled={!input.trim() || isSending}
          className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-sm"
          aria-label="Verzenden"
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 text-white animate-spin" />
          ) : (
            <ArrowRight className="w-4 h-4 text-white" />
          )}
        </button>
      </div>
    </div>
  );
}

// ─── IMS Stappenplan Generator ───────────────────────────────────────────────

interface IMSStap {
  stap: number;
  title: string;
  screen?: string;
  screenUrl?: string;
  command?: string;
  details: string[];
  isDocCommand?: boolean;
}

interface IMSPlan {
  samenvatting: string;
  stappen: IMSStap[];
  detected: {
    actie: string;
    persoon?: string;
    werkgever?: string;
    datum?: string;
  };
}

const IMS_SCREEN_URLS: Record<string, string> = {
  S1ASI: "https://mydesk.ethias.be/terminal?actionKey=S1ASI&actionType=100",
  S1ISI: "https://mydesk.ethias.be/terminal?actionKey=S1ISI&actionType=100",
  MSIFA: "https://mydesk.ethias.be/terminal?actionKey=MSIFA&actionType=100",
  S1GSI: "https://mydesk.ethias.be/terminal?actionKey=S1GSI&actionType=100",
  MSGFA: "https://mydesk.ethias.be/terminal?actionKey=MSGFA&actionType=100",
  MSGPO: "https://mydesk.ethias.be/terminal?actionKey=MSGPO&actionType=100",
  COCAI: "https://mydesk.ethias.be/terminal?actionKey=COCAI&actionType=100",
  SMJOB: "https://mydesk.ethias.be/terminal?actionKey=SMJOB&actionType=100",
};

function extractPersonFromQuery(q: string): string | undefined {
  // Look for "Mevrouw/Dhr/De heer + Name" or "Name wil/wilt/wenst"
  const titels = /\b(mevrouw|mevr\.|dhr\.|dhr|de heer|meneer|mr\.?|mme\.?)\s+([A-Z][a-zÀ-ÿ]+(?:\s+[A-Z][a-zÀ-ÿ]+)*)/i;
  const m = q.match(titels);
  if (m) return m[2].trim();
  // "Naam wilt/wil/wenst"
  const wil = /\b([A-Z][a-zÀ-ÿ]+(?:\s+[A-Z][a-zÀ-ÿ]+)*)\s+(?:wil|wilt|wenst)\b/;
  const m2 = q.match(wil);
  if (m2) return m2[1].trim();
  return undefined;
}

function extractWerkgeverFromQuery(q: string): string | undefined {
  const known = [
    "STAD LEUVEN", "BOSA", "VLAAMSE OVERHEID", "FEDERALE POLITIE",
    "STAD HAMONT", "FABRICOM", "IQVIA", "TEMPOTEAM", "ETHIAS",
    "GEMEENTE", "PROVINCIE", "OCMW",
  ];
  const upper = q.toUpperCase();
  for (const k of known) {
    if (upper.includes(k)) return k;
  }
  // "via werkgever X" pattern
  const match = q.match(/via\s+werkgever\s+([A-Z][A-Za-zÀ-ÿ\s]+?)(?:\s+op\b|\.|\,|$)/i);
  if (match) return match[1].trim().toUpperCase();
  // "via [CAPS WORD]"
  const caps = q.match(/\bvia\s+([A-Z]{3,}(?:\s+[A-Z]{3,})*)/);
  if (caps) return caps[1].trim();
  return undefined;
}

function extractDatumFromQuery(q: string): string | undefined {
  const m = q.match(/\b(\d{1,2}\/\d{1,2}\/\d{2,4})\b/);
  if (m) return m[1];
  return undefined;
}

function generateIMSStappenplan(vraag: string, lang: Lang): IMSPlan {
  const q = vraag.toLowerCase();
  const isNL = lang === "NL";

  const persoon = extractPersonFromQuery(vraag);
  const werkgever = extractWerkgeverFromQuery(vraag);
  const datum = extractDatumFromQuery(vraag);

  const persoonLabel = persoon ?? (isNL ? "de klant" : "le client");
  const datumLabel = datum ?? (isNL ? "eerstvolgende 1ste van de maand" : "premier du mois suivant");

  // ── 1. New policy affiliation ──
  if (
    (q.includes("aansluiting") || q.includes("aansluiten") || q.includes("hospitalisatieaansluiting")) &&
    (q.includes("polis") || q.includes("werkgever") || q.includes("hospitalis") || q.includes("via"))
  ) {
    const wg = werkgever ?? (isNL ? "de werkgever" : "l'employeur");
    return {
      samenvatting: isNL
        ? `Nieuwe hospitalisatieaansluiting via ${wg}`
        : `Nouvelle affiliation hospitalisation via ${wg}`,
      detected: { actie: "aansluiting", persoon, werkgever, datum },
      stappen: [
        {
          stap: 1,
          title: isNL ? "Klant opzoeken" : "Rechercher le client",
          screen: "S1ASI",
          screenUrl: IMS_SCREEN_URLS.S1ASI,
          details: [
            isNL ? `Zoek ${persoonLabel} op via S1ASI` : `Rechercher ${persoonLabel} via S1ASI`,
            isNL ? "Noteer het aansluitingsnummer indien aanwezig" : "Noter le numéro d'affiliation si présent",
            isNL ? "Geen aansluitingsnummer? → Ga naar stap 2 (aanmaken)" : "Pas de numéro d'affiliation? → Aller à l'étape 2",
          ],
        },
        {
          stap: 2,
          title: isNL ? "Aansluitingsnummer aanmaken (indien nodig)" : "Créer numéro d'affiliation (si nécessaire)",
          screen: "S1ISI",
          screenUrl: IMS_SCREEN_URLS.S1ISI,
          details: [
            isNL ? "Alleen indien geen aansluitingsnummer gevonden in S1ASI" : "Seulement si aucun numéro trouvé dans S1ASI",
            isNL ? "Vul in: AANSPR (dhr/mev), TAAL: N, NAAM, VOORNAAM" : "Remplir: AANSPR (m/mme), LANGUE: N, NOM, PRÉNOM",
            isNL ? "Vul adres in: Straat, Nr, Postcode, Gemeente" : "Remplir adresse: Rue, Nr, CP, Commune",
            isNL ? "Geboortedatum invullen, Ber.: 99" : "Date de naissance, Ber.: 99",
          ],
        },
        {
          stap: 3,
          title: isNL ? "Polis aansluiten" : "Affilier à la police",
          screen: "MSIFA",
          screenUrl: IMS_SCREEN_URLS.MSIFA,
          details: [
            isNL ? `Open MSIFA, voer polisnummer in (raadpleeg ${wg}-polis)` : `Ouvrir MSIFA, entrer numéro de police (consulter police ${wg})`,
            isNL ? "Vul in: ONDERTEK (ondertekeningscode werkgever), Casenummer" : "Remplir: ONDERTEK (code signature employeur), numéro de dossier",
            isNL ? `AANVDAT: ${datumLabel}` : `AANVDAT: ${datumLabel}`,
            isNL ? "BS (spreiding): 1=jaarlijks, 2=semestrieel, 3=trimestrieel, 4=maandelijks" : "BS (échelonnement): 1=annuel, 2=semestriel, 3=trimestriel, 4=mensuel",
            isNL ? "BW (briefwisseling): 1 | Overdracht: N N N" : "BW (correspondance): 1 | Transfert: N N N",
          ],
        },
        {
          stap: 4,
          title: isNL ? "Begunstigden invullen" : "Remplir les bénéficiaires",
          screen: "MSIFA",
          screenUrl: IMS_SCREEN_URLS.MSIFA,
          details: [
            isNL ? "Naam + Voornaam met 2 spaties, H (hoedanigheid): 1=hoofdverzekerde, 2=kind, 3=partner" : "Nom + Prénom avec 2 espaces, H: 1=assuré principal, 2=enfant, 3=partenaire",
            isNL ? "GEB (geboortedatum): dd/mm/jjjj | G (geslacht): 1=man, 2=vrouw" : "GEB (date naissance): dd/mm/aaaa | G: 1=homme, 2=femme",
            isNL ? "W (waarborg): 1=uitgebreid, 2=basis" : "W (garantie): 1=étendue, 2=base",
            isNL ? "I (wachttijd): Y=normaal, N=attest/pasgeborene | Z: 9=normaal, 0=attest/pasgeborene" : "I (délai): Y=normal, N=attestation/nouveau-né | Z: 9=normal, 0=attestation",
            isNL ? "E (uitsluitingen): N normaal, Y=pasgeborene | T: 2 bij basis, leeg bij uitgebreid | K=N, X=N" : "E (exclusions): N normal, Y=nouveau-né | T: 2 pour base | K=N, X=N",
          ],
        },
        {
          stap: 5,
          title: isNL ? "Verificatie in MSGFA" : "Vérification dans MSGFA",
          screen: "MSGFA",
          screenUrl: IMS_SCREEN_URLS.MSGFA,
          details: [
            isNL ? `Zoek ${persoonLabel} op via MSGFA` : `Rechercher ${persoonLabel} via MSGFA`,
            isNL ? "Controleer aansluiting, aanvangsdatum en begunstigden" : "Vérifier l'affiliation, la date de début et les bénéficiaires",
            isNL ? "Sluit Salesforce-case af: status = Gekwalificeerd → Sluiten, Subtype = Wijziging" : "Clôturer le dossier Salesforce: statut = Qualifié → Clôturer, Sous-type = Modification",
          ],
        },
      ],
    };
  }

  // ── 2. Family member add/remove ──
  if (
    q.includes("kind") || q.includes("partner") || q.includes("familielid") ||
    (q.includes("toevoegen") && !q.includes("domiciliering")) ||
    q.includes("schrappen") || q.includes("gezinslid")
  ) {
    const isToevoegen = q.includes("toevoegen") || q.includes("aansluiten") || q.includes("toevoeg");
    return {
      samenvatting: isNL
        ? (isToevoegen ? `Familielid toevoegen voor ${persoonLabel}` : `Familielid schrappen voor ${persoonLabel}`)
        : (isToevoegen ? `Ajouter membre famille pour ${persoonLabel}` : `Supprimer membre famille pour ${persoonLabel}`),
      detected: { actie: "familielid", persoon, werkgever, datum },
      stappen: [
        {
          stap: 1,
          title: isNL ? "Klant opzoeken" : "Rechercher le client",
          screen: "MSGFA",
          screenUrl: IMS_SCREEN_URLS.MSGFA,
          details: [
            isNL ? `Zoek ${persoonLabel} op via MSGFA` : `Rechercher ${persoonLabel} via MSGFA`,
            isNL ? "Controleer de huidige gezinssamenstelling" : "Vérifier la composition familiale actuelle",
          ],
        },
        {
          stap: 2,
          title: isNL ? (isToevoegen ? "Familielid toevoegen" : "Familielid schrappen") : (isToevoegen ? "Ajouter membre famille" : "Supprimer membre famille"),
          screen: "MSGFA",
          screenUrl: IMS_SCREEN_URLS.MSGFA,
          command: isNL ? (isToevoegen ? "F M FAM (reden 04)" : "F R FAM (reden 02)") : undefined,
          details: [
            isNL
              ? "F R FAM (reden 02): bij overlijden, geldig attest met einddatum, uitbreiding waarborg, factuur al geprint"
              : "F R FAM (raison 02): décès, attestation avec date fin, extension garantie, facture déjà imprimée",
            isNL
              ? "F M FAM (reden 04): bij verhuizing, naamsverandering, adresaanpassing (factuur nog niet geprint)"
              : "F M FAM (raison 04): déménagement, changement de nom, modification adresse (facture pas encore imprimée)",
            isNL
              ? `Aanvangsdatum: ${datumLabel}`
              : `Date de début: ${datumLabel}`,
            isNL
              ? "H (hoedanigheid): 1=hoofdverzekerde, 2=kind, 3=partner | W: 1=uitgebreid, 2=basis"
              : "H: 1=assuré principal, 2=enfant, 3=partenaire | W: 1=étendue, 2=base",
          ],
        },
        {
          stap: 3,
          title: isNL ? "Afsluiten" : "Clôturer",
          details: [
            isNL ? "Salesforce-case afsluiten: Gekwalificeerd → Sluiten, Subtype: Wijziging" : "Clôturer dossier Salesforce: Qualifié → Clôturer, Sous-type: Modification",
          ],
        },
      ],
    };
  }

  // ── 3. Domiciliation ──
  if (q.includes("domiciliering") || q.includes("rekeningnummer") || q.includes("domicilier")) {
    const isNieuw = q.includes("toevoegen") || q.includes("nieuwe") || q.includes("nieuw") || q.includes("aanvrag");
    const isWijziging = q.includes("wijzig") || q.includes("aanpass") || q.includes("verandering");
    return {
      samenvatting: isNL
        ? (isWijziging ? `Domiciliering wijzigen voor ${persoonLabel}` : `Domiciliering toevoegen voor ${persoonLabel}`)
        : (isWijziging ? `Modifier domiciliation pour ${persoonLabel}` : `Ajouter domiciliation pour ${persoonLabel}`),
      detected: { actie: "domiciliering", persoon, werkgever, datum },
      stappen: [
        {
          stap: 1,
          title: isNL ? "Klant opzoeken" : "Rechercher le client",
          screen: "MSGFA",
          screenUrl: IMS_SCREEN_URLS.MSGFA,
          details: [isNL ? `Zoek ${persoonLabel} op via MSGFA → Enter` : `Rechercher ${persoonLabel} via MSGFA → Enter`],
        },
        {
          stap: 2,
          title: isNL ? (isWijziging ? "Domiciliering wijzigen" : "Domiciliering toevoegen") : (isWijziging ? "Modifier domiciliation" : "Ajouter domiciliation"),
          screen: "MSGFA",
          screenUrl: IMS_SCREEN_URLS.MSGFA,
          command: isWijziging ? "C R MDT" : "C I MDT",
          details: [
            isNL ? `Mod: ${isWijziging ? "C R MDT" : "C I MDT"} → A01 bij naam → 2× Enter → F2` : `Mod: ${isWijziging ? "C R MDT" : "C I MDT"} → A01 → 2× Entrée → F2`,
            isNL ? "Rekeningnummer invullen" : "Entrer le numéro de compte",
            isNL ? (isWijziging ? "Datum van ondertekening" : "Datum van vandaag") : (isWijziging ? "Date de signature" : "Date du jour"),
            isNL ? "P (of M indien klant belt/mailt)" : "P (ou M si le client appelle/écrit)",
            isNL ? "F I MOD → F1" : "F I MOD → F1",
          ],
        },
        {
          stap: 3,
          title: isNL ? "Afsluiten" : "Clôturer",
          details: [
            isNL ? "Salesforce-case afsluiten: Subtype = Wijziging" : "Clôturer dossier Salesforce: Sous-type = Modification",
          ],
        },
      ],
    };
  }

  // ── 4. Death registration ──
  if (q.includes("overlijden") || q.includes("overledene") || q.includes("gestorven") || q.includes("deceased") || q.includes("overleden")) {
    return {
      samenvatting: isNL ? `Overlijden registreren voor ${persoonLabel}` : `Enregistrer le décès de ${persoonLabel}`,
      detected: { actie: "overlijden", persoon, werkgever, datum },
      stappen: [
        {
          stap: 1,
          title: isNL ? "Klant opzoeken" : "Rechercher le client",
          screen: "MSGFA",
          screenUrl: IMS_SCREEN_URLS.MSGFA,
          details: [isNL ? `Zoek ${persoonLabel} op via MSGFA` : `Rechercher ${persoonLabel} via MSGFA`],
        },
        {
          stap: 2,
          title: isNL ? "Overlijden registreren" : "Enregistrer le décès",
          screen: "MSGFA",
          screenUrl: IMS_SCREEN_URLS.MSGFA,
          command: "F R FAM",
          details: [
            isNL ? "Commando: F R FAM" : "Commande: F R FAM",
            isNL ? `Commentaar toevoegen: "b0x overleden op ${datum ?? "xx/xx/xx"}"` : `Ajouter commentaire: "b0x décédé le ${datum ?? "xx/xx/xx"}"`,
            isNL ? "Aanvangsdatum + einddatum overledene aanpassen naar 1ste van de maand volgend op overlijden" : "Adapter date début + fin du défunt au 1er du mois suivant le décès",
            isNL ? "Indien b01 overleden: aansluitingsnummer partner overtypen om briefwisseling te vermijden" : "Si b01 décédé: retaper numéro affiliation partenaire pour éviter correspondance au nom du défunt",
          ],
        },
        {
          stap: 3,
          title: isNL ? "Afsluiten" : "Clôturer",
          details: [
            isNL ? "Salesforce-case afsluiten: Subtype = Wijziging" : "Clôturer dossier Salesforce: Sous-type = Modification",
          ],
        },
      ],
    };
  }

  // ── 5. Address change ──
  if (q.includes("adres") || q.includes("verhuist") || q.includes("verhuizen") || q.includes("adreswijziging")) {
    return {
      samenvatting: isNL ? `Adreswijziging voor ${persoonLabel}` : `Changement d'adresse pour ${persoonLabel}`,
      detected: { actie: "adres", persoon, werkgever, datum },
      stappen: [
        {
          stap: 1,
          title: isNL ? "Klant opzoeken & adres aanpassen" : "Rechercher le client & modifier adresse",
          screen: "S1ASI",
          screenUrl: IMS_SCREEN_URLS.S1ASI,
          details: [
            isNL ? `Zoek ${persoonLabel} op via S1ASI` : `Rechercher ${persoonLabel} via S1ASI`,
            isNL ? "Adresgegevens aanpassen: Straat, Nr, Postcode, Gemeente" : "Modifier adresse: Rue, Nr, CP, Commune",
            isNL ? "Bevestigen met Enter, reden aanpassing: 02" : "Confirmer avec Entrée, raison: 02",
          ],
        },
        {
          stap: 2,
          title: isNL ? "Afsluiten" : "Clôturer",
          details: [
            isNL ? "Salesforce-case afsluiten: Subtype = Wijziging" : "Clôturer dossier Salesforce: Sous-type = Modification",
          ],
        },
      ],
    };
  }

  // ── 6. Financial lookup ──
  if (
    q.includes("factuur") || q.includes("betaling") || q.includes("creditnota") ||
    q.includes("terugbetaling") || q.includes("financieel") || q.includes("rappel")
  ) {
    return {
      samenvatting: isNL ? `Financiële opzoekingen voor ${persoonLabel}` : `Recherches financières pour ${persoonLabel}`,
      detected: { actie: "financieel", persoon, werkgever, datum },
      stappen: [
        {
          stap: 1,
          title: isNL ? "Klant opzoeken" : "Rechercher le client",
          screen: "COCAI",
          screenUrl: IMS_SCREEN_URLS.COCAI,
          details: [
            isNL ? `Zoek ${persoonLabel} op via COCAI` : `Rechercher ${persoonLabel} via COCAI`,
            isNL ? "Shift+F6 voor financieel overzicht" : "Shift+F6 pour vue financière",
            isNL ? "F7 / F8 om te navigeren tussen periodes" : "F7 / F8 pour naviguer entre les périodes",
            isNL ? "R voor de lijn = rappel nakijken | P voor de lijn = periode dekking factuur" : "R sur la ligne = vérifier rappel | P sur la ligne = période couverture facture",
          ],
        },
        {
          stap: 2,
          title: isNL ? "Creditnota terugbetaling (indien van toepassing)" : "Remboursement note de crédit (si applicable)",
          details: [
            isNL ? "Rekeningnummer nakijken in COCAI" : "Vérifier numéro de compte dans COCAI",
            isNL ? "Geen rekeningnummer: klant mailt naar boekhouding@ethias.be met rekeningnummer" : "Pas de numéro: client envoie email à boekhouding@ethias.be avec le numéro",
            isNL ? "Wel rekeningnummer: wij mailen naar boekhouding@ethias.be" : "Numéro présent: nous envoyons email à boekhouding@ethias.be",
          ],
        },
      ],
    };
  }

  // ── 7. Policy lookup ──
  if (
    (q.includes("polis") && (q.includes("opzoeken") || q.includes("nakijken") || q.includes("voorwaarden"))) ||
    q.includes("polisvoorwaarden") || q.includes("vvd")
  ) {
    return {
      samenvatting: isNL ? `Polisgegevens opzoeken voor ${persoonLabel}` : `Consulter données police pour ${persoonLabel}`,
      detected: { actie: "polis", persoon, werkgever, datum },
      stappen: [
        {
          stap: 1,
          title: isNL ? "Polis opzoeken" : "Rechercher police",
          screen: "MSGPO",
          screenUrl: IMS_SCREEN_URLS.MSGPO,
          details: [
            isNL ? `Zoek polis op via MSGPO (polisnummer + type 2)` : `Rechercher police via MSGPO (numéro police + type 2)`,
            isNL ? "F11 → klik op Waarborg → Enter voor polisvoorwaarden" : "F11 → cliquer sur Garantie → Entrée pour conditions de police",
            isNL ? "Shift+F11 vanuit MSIFA/MSGOP/MSGFA voor VVD" : "Shift+F11 depuis MSIFA/MSGOP/MSGFA pour VVD",
          ],
        },
        {
          stap: 2,
          title: isNL ? "Klant opzoeken (alternatief)" : "Rechercher client (alternative)",
          screen: "MSGFA",
          screenUrl: IMS_SCREEN_URLS.MSGFA,
          details: [
            isNL ? "Klant zonder individueel polisnummer: MSGFA → Type 2 + naam" : "Client sans numéro individuel: MSGFA → Type 2 + nom",
          ],
        },
      ],
    };
  }

  // ── 8. Assurcard ──
  if (q.includes("assurcard") || q.includes("nieuwe kaart") || (q.includes("kaart") && q.includes("aanvrag"))) {
    return {
      samenvatting: isNL ? `Nieuwe Assurcard aanvragen voor ${persoonLabel}` : `Demander nouvelle Assurcard pour ${persoonLabel}`,
      detected: { actie: "assurcard", persoon, werkgever, datum },
      stappen: [
        {
          stap: 1,
          title: isNL ? "Klant opzoeken" : "Rechercher le client",
          screen: "MSGFA",
          screenUrl: IMS_SCREEN_URLS.MSGFA,
          details: [isNL ? `Zoek ${persoonLabel} op via MSGFA` : `Rechercher ${persoonLabel} via MSGFA`],
        },
        {
          stap: 2,
          title: isNL ? "Assurcard aanvragen" : "Demander Assurcard",
          screen: "MSGFA",
          screenUrl: IMS_SCREEN_URLS.MSGFA,
          command: "F I LAS",
          details: [
            isNL ? "Optie 1: F I LAS (eventueel m:mailadres@provider.be)" : "Option 1: F I LAS (éventuellement m:email@provider.be)",
            isNL ? "Optie 2: F10 in memoscherm → Assurcard selecteren → G S CAR b0x/oud assurcardnummer → G I CAR b0x" : "Option 2: F10 dans mémo → sélectionner Assurcard → G S CAR b0x/ancien numéro → G I CAR b0x",
          ],
        },
      ],
    };
  }

  // ── 9. Default fallback ──
  return {
    samenvatting: isNL
      ? `Algemeen IMS stappenplan voor: "${vraag.length > 50 ? vraag.slice(0, 50) + "…" : vraag}"`
      : `Plan IMS général pour: "${vraag.length > 50 ? vraag.slice(0, 50) + "…" : vraag}"`,
    detected: { actie: "algemeen", persoon, werkgever, datum },
    stappen: [
      {
        stap: 1,
        title: isNL ? "Klant opzoeken" : "Rechercher le client",
        screen: "S1ASI",
        screenUrl: IMS_SCREEN_URLS.S1ASI,
        details: [
          isNL ? `Zoek ${persoonLabel} op via S1ASI` : `Rechercher ${persoonLabel} via S1ASI`,
          isNL ? "Noteer het aansluitingsnummer" : "Noter le numéro d'affiliation",
        ],
      },
      {
        stap: 2,
        title: isNL ? "Dossier raadplegen" : "Consulter le dossier",
        screen: "MSGFA",
        screenUrl: IMS_SCREEN_URLS.MSGFA,
        details: [
          isNL ? `Open MSGFA voor dossierdetails van ${persoonLabel}` : `Ouvrir MSGFA pour détails du dossier de ${persoonLabel}`,
          isNL ? "Controleer gezinssamenstelling, aansluitingen en polissen" : "Vérifier composition familiale, affiliations et polices",
        ],
      },
      {
        stap: 3,
        title: isNL ? "Tip: verfijn uw vraag" : "Conseil: précisez votre question",
        details: [
          isNL
            ? "Verfijn uw vraag in het Assistent-tabblad voor een specifieker stappenplan"
            : "Précisez votre question dans l'onglet Assistant pour un plan d'action plus ciblé",
          isNL
            ? "Voorbeelden: 'aansluiting toevoegen', 'domiciliering wijzigen', 'overlijden registreren', 'factuur opzoeken'"
            : "Exemples: 'ajouter affiliation', 'modifier domiciliation', 'enregistrer décès', 'rechercher facture'",
        ],
      },
    ],
  };
}

// ─── IMS Chat Panel (sidebar mode) ───────────────────────────────────────────

interface IMSChatPanelProps {
  language: Lang;
  t: T;
  lastUserMessage?: string;
}

function IMSChatPanel({ language, t: _t, lastUserMessage = "" }: IMSChatPanelProps) {
  const plan = lastUserMessage.trim() ? generateIMSStappenplan(lastUserMessage, language) : null;
  const isNL = language === "NL";

  if (!plan) {
    // Empty state — no question yet
    return (
      <div className="flex flex-col h-full items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-4 border-2 border-green-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <rect x="2" y="3" width="20" height="14" rx="2" strokeLinejoin="round" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8M12 17v4" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h4M6 11h8" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          {isNL ? "IMS Stappenplan" : "Plan d'action IMS"}
        </h3>
        <p className="text-xs text-gray-400 leading-relaxed max-w-[200px]">
          {isNL
            ? 'Stel eerst een vraag in het "Assistent" tabblad. Klik dan op "IMS" voor een automatisch stappenplan.'
            : 'Posez d\'abord une question dans l\'onglet "Assistant". Cliquez ensuite sur "IMS" pour un plan d\'action automatique.'}
        </p>
        <div className="mt-4 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-[10px] font-medium text-green-700">
          {isNL ? "Geen actieve vraag" : "Aucune question active"}
        </div>
      </div>
    );
  }

  // Render the generated plan
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header with summary */}
      <div className="px-3 pt-3 pb-2 shrink-0 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold border border-green-200">IMS</span>
          <span className="text-xs font-semibold text-gray-700">
            {isNL ? "Stappenplan" : "Plan d'action"}
          </span>
        </div>
        {/* Detected info badges */}
        <div className="flex flex-wrap gap-1 mb-2">
          {plan.detected.persoon && (
            <span className="text-[9px] bg-sky-50 border border-sky-200 text-sky-700 rounded-full px-2 py-0.5 font-medium">
              👤 {plan.detected.persoon}
            </span>
          )}
          {plan.detected.werkgever && (
            <span className="text-[9px] bg-orange-50 border border-orange-200 text-orange-700 rounded-full px-2 py-0.5 font-medium">
              🏢 {plan.detected.werkgever}
            </span>
          )}
          {plan.detected.datum && (
            <span className="text-[9px] bg-purple-50 border border-purple-200 text-purple-700 rounded-full px-2 py-0.5 font-medium">
              📅 {plan.detected.datum}
            </span>
          )}
        </div>
        {/* Question preview */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 mb-1">
          <p className="text-[9px] text-gray-500 italic leading-relaxed line-clamp-2">"{lastUserMessage}"</p>
        </div>
        <p className="text-[10px] text-green-700 font-medium">{plan.samenvatting}</p>
      </div>

      {/* Steps */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {plan.stappen.map((stap) => (
          <div key={stap.stap} className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm">
            {/* Step header */}
            <div className="flex items-center gap-2 px-2.5 py-2 border-b border-gray-50 bg-gray-50/50">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-600 text-white text-[9px] font-bold shrink-0">
                {stap.stap}
              </span>
              <span className="flex-1 text-xs font-semibold text-gray-800">{stap.title}</span>
              {stap.screen && (
                stap.screenUrl ? (
                  <a
                    href={stap.screenUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-2 py-0.5 rounded font-mono bg-blue-600 text-white text-[10px] font-bold hover:bg-blue-700 transition-colors"
                  >
                    {stap.screen} ↗
                  </a>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded font-mono bg-blue-100 text-blue-800 text-[10px] font-bold border border-blue-200">
                    {stap.screen}
                  </span>
                )
              )}
            </div>
            {/* Step details */}
            <div className="px-2.5 py-2">
              <ul className="space-y-1">
                {stap.details.map((detail) => (
                  <li key={`${stap.stap}-${detail.slice(0, 20)}`} className="flex items-start gap-1.5 text-[10px] text-gray-700 leading-relaxed">
                    <span className="text-green-500 shrink-0 mt-0.5">→</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
              {stap.command && (
                <div className="mt-1.5 inline-flex items-center gap-1">
                  <span className="text-[9px] text-gray-400">{isNL ? "Commando:" : "Commande:"}</span>
                  <span className="font-mono bg-orange-50 text-orange-700 border border-orange-200 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                    {stap.command}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Compact collapsible procedure for the IMS sidebar panel
function CompactProcedure({ procedure }: { procedure: { number: number; title: string; steps: StepItem[] } }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-2 py-1.5 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-[9px] font-bold shrink-0">
          {procedure.number}
        </span>
        <span className="flex-1 text-xs font-medium text-gray-800 leading-tight">{procedure.title}</span>
        <ChevronRight
          className={`w-3 h-3 text-gray-400 shrink-0 transition-transform duration-150 ${open ? "rotate-90" : ""}`}
        />
      </button>
      {open && (
        <div className="px-2 pb-2 pt-0.5 border-t border-gray-50">
          <ol className="space-y-1">
            {procedure.steps.map((step, i) => (
              <li key={step.id} className="flex items-start gap-1.5 text-[10px] text-gray-700 leading-relaxed">
                <span className="flex items-center justify-center w-4 h-4 rounded-full bg-gray-100 text-gray-400 text-[8px] font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="flex-1">{step.content}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

// ─── Police Tab ───────────────────────────────────────────────────────────────

function PoliceTab({ policyNumber, t }: { policyNumber: string; t: T }) {
  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4 py-4">
        {/* Statut */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-mathias-blue font-semibold text-base mb-4">{t.dekkingsstatus}</h3>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-medium border border-green-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t.actief}
          </span>
          <p className="text-xs text-gray-400 mt-3 uppercase tracking-wide font-medium">{t.vanaf} 11/02/2024</p>
        </div>

        {/* Niveau */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-mathias-blue font-semibold text-base mb-4">{t.dekkingsniveau}</h3>
          <ul className="space-y-2">
            {[t.hospitalisatie, t.ernstigeZiekten, t.ambulanteZorg].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Personnes */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-mathias-blue font-semibold text-base mb-4">{t.gedektePersonen}</h3>
          <div className="flex items-center gap-4">
            <span className="text-4xl font-bold text-gray-800">6</span>
            <div className="text-sm text-gray-600">
              <p><span className="font-semibold">1</span> {t.titularis}</p>
              <p><span className="font-semibold">5</span> {t.rechthebbenden}</p>
            </div>
          </div>
        </div>

        {/* Hospitalisation */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-mathias-blue font-semibold text-base mb-4">{t.hospitalisatie}</h3>
          <p className="text-sm text-gray-700">{t.eenpersoonskamer}</p>
          <p className="text-sm text-gray-700">{t.franchise} 100 €</p>
        </div>
      </div>

      {/* Police detail card */}
      <div className="mx-4 mb-4 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-mathias-blue font-bold text-lg mb-5">{t.polis}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left */}
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">{t.polisnummer}</p>
              <p className="text-sm font-semibold text-gray-800">POL-{policyNumber}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">{t.polistype}</p>
              <p className="text-sm font-semibold text-gray-800">Collective (B2B)</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">{t.gezin}</p>
              <p className="text-sm font-semibold text-gray-800">Gezin 123456-A</p>
            </div>
          </div>

          {/* Center */}
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">{t.status}</p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-medium border border-green-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t.actiefOpSituatiedatum}
              </span>
              <p className="text-xs text-gray-400 mt-2">{t.geenWijzigingen}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">{t.contractdatums}</p>
              <p className="text-sm text-gray-700">{t.ingangsdatum} : 11-02-2024</p>
              <p className="text-sm text-gray-700">{t.einde} : {t.onbepaald}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">{t.referentieformule}</p>
              <p className="text-sm font-semibold text-gray-800">Formule HospiPlus</p>
              <p className="text-xs text-gray-400">{t.vanToepassing}</p>
            </div>
          </div>

          {/* Right */}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">{t.situatiedatumRef}</p>
            <div className="inline-block px-5 py-3 rounded-xl bg-sky-50 border border-sky-200">
              <p className="text-xl font-bold text-mathias-blue">22/02/2026</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Famille Tab ──────────────────────────────────────────────────────────────

type SortField = "age" | "alloc" | "notAlloc";
type SortDir = "asc" | "desc";

function FamilleTab({ members, t }: { members: FamilyMember[]; t: T }) {
  const displayMembers = members.length > 0 ? members : STATIC_FAMILY;
  const [sortField, setSortField] = useState<SortField>("age");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const sortedPricing = [...AGE_PRICING].sort((a, b) => {
    const factor = sortDir === "asc" ? 1 : -1;
    return (a[sortField] - b[sortField]) * factor;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => (
    <span className="inline-flex flex-col ml-1">
      <ChevronUp className={`w-3 h-3 ${sortField === field && sortDir === "asc" ? "text-sky-500" : "text-gray-300"}`} />
      <ChevronDown className={`w-3 h-3 -mt-1 ${sortField === field && sortDir === "desc" ? "text-sky-500" : "text-gray-300"}`} />
    </span>
  );

  return (
    <div className="px-4 py-4 space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-mathias-blue font-bold text-lg mb-4">{t.gezin}</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs text-gray-400 font-medium pb-3 pr-4 min-w-[140px]">{t.begunstigden}</th>
                <th className="text-left text-xs text-gray-400 font-medium pb-3 pr-4">{t.ziekte}</th>
                <th className="text-left text-xs text-gray-400 font-medium pb-3 pr-4">{t.stadium}</th>
                <th className="text-left text-xs text-gray-400 font-medium pb-3 pr-4 min-w-[130px]">{t.geboortedatum}</th>
                <th className="text-left text-xs text-gray-400 font-medium pb-3 pr-4">{t.medVoorgeschiedenis}</th>
                <th className="text-left text-xs text-gray-400 font-medium pb-3">{t.formule}</th>
              </tr>
            </thead>
            <tbody>
              {displayMembers.map((m) => (
                <tr key={m.nom} className="border-b border-gray-50 last:border-0">
                  <td className="py-3 pr-4 text-sm text-gray-700 font-medium">{m.nom}</td>
                  <td className="py-3 pr-4 text-sm font-semibold text-mathias-orange">
                    {m.maladieY ? (
                      <span className="text-mathias-orange">Y</span>
                    ) : (
                      <span className="text-mathias-orange">N</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-sm text-mathias-orange font-semibold">{m.stade}</td>
                  <td className="py-3 pr-4 text-sm text-gray-600">{m.dateNaissance}</td>
                  <td className="py-3 pr-4 text-sm font-semibold">
                    {m.antecedents === "Y" ? (
                      <span className="text-mathias-blue">Y</span>
                    ) : (
                      <span className="text-mathias-orange">N</span>
                    )}
                  </td>
                  <td className="py-3 text-sm font-semibold text-mathias-orange">{m.formule}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Age/Pricing table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 max-w-md">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                 <th className="text-left pb-3 pr-8">
                  <button
                    type="button"
                    onClick={() => handleSort("age")}
                    className="flex items-center text-xs text-gray-400 font-medium hover:text-gray-600"
                  >
                    Age
                    <SortIcon field="age" />
                  </button>
                </th>
                <th className="text-left pb-3 pr-8">
                  <button
                    type="button"
                    onClick={() => handleSort("alloc")}
                    className="flex items-center text-xs text-gray-400 font-medium hover:text-gray-600"
                  >
                    Alloc
                    <SortIcon field="alloc" />
                  </button>
                </th>
                <th className="text-left pb-3">
                  <button
                    type="button"
                    onClick={() => handleSort("notAlloc")}
                    className="flex items-center text-xs text-gray-400 font-medium hover:text-gray-600"
                  >
                    NotAlloc
                    <SortIcon field="notAlloc" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedPricing.map((row) => (
                <tr key={row.age} className="border-b border-gray-50 last:border-0">
                  <td className="py-3 pr-8 text-sm text-gray-700">{row.age}</td>
                  <td className="py-3 pr-8 text-sm text-gray-700">{row.alloc.toFixed(2)}</td>
                  <td className="py-3 text-sm text-mathias-blue">{row.notAlloc.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Garanties Tab ────────────────────────────────────────────────────────────

function GarantiesTab({ guarantees, t }: { guarantees: Guarantee[]; t: T }) {
  const displayGuarantees = guarantees.length > 0 ? guarantees : STATIC_GUARANTEES;

  return (
    <div className="px-4 py-4">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-mathias-blue font-bold text-lg mb-4">{t.garanties}</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs text-gray-400 font-medium pb-3 pr-4 w-16">{t.code}</th>
                <th className="text-left text-xs text-gray-400 font-medium pb-3 pr-4 min-w-[180px]">{t.risico}</th>
                <th className="text-left text-xs text-gray-400 font-medium pb-3 pr-4 min-w-[160px]">{t.dienst}</th>
                <th className="text-left text-xs text-gray-400 font-medium pb-3 pr-4 min-w-[220px]">{t.tussenkomst}</th>
                <th className="text-left text-xs text-gray-400 font-medium pb-3 pr-4 w-20">{t.bedrag}</th>
                <th className="text-left text-xs text-gray-400 font-medium pb-3 w-12">%</th>
              </tr>
            </thead>
            <tbody>
              {displayGuarantees.map((g) => (
                <tr key={`${g.code}-${g.service}`} className="border-b border-gray-50 last:border-0">
                  <td className="py-3 pr-4 text-sm text-mathias-orange font-semibold">{g.code}</td>
                  <td className="py-3 pr-4 text-sm text-gray-600">{g.risque}</td>
                  <td className="py-3 pr-4 text-sm text-mathias-blue">{g.service}</td>
                  <td className="py-3 pr-4 text-sm text-mathias-blue">{g.intervention}</td>
                  <td className="py-3 pr-4 text-sm text-gray-700">
                    {g.montant > 0n ? String(g.montant) : "–"}
                  </td>
                  <td className="py-3 text-sm text-gray-400">–</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Documents Tab ────────────────────────────────────────────────────────────

function DocumentsTab({ t }: { t: T }) {
  return (
    <div className="px-4 py-8">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
        <p className="text-gray-400 text-sm">{t.geenDocumenten}</p>
      </div>
    </div>
  );
}

// ─── Salesforce Tab ───────────────────────────────────────────────────────────

const SF_BASE = "https://ethias.lightning.force.com";

function buildSalesforceUrl(name: string): string {
  const term = name.trim().toLowerCase();
  const payload = {
    componentDef: "forceSearch:searchPageDesktop",
    attributes: {
      term,
      scopeMap: {
        type: "TOP_RESULTS",
        namespace: "",
        label: "Beste resultaten",
        labelPlural: "Beste resultaten",
        resultsCmp: "forceSearch:predictedResults",
      },
      context: {
        FILTERS: {},
        searchSource: "ASSISTANT_DIALOG",
        disableIntentQuery: false,
        disableSpellCorrection: false,
        searchDialogSessionId: "",
        debugInfo: {
          appName: "B2B_Service_Console_Lex",
          appType: "Console",
          appNamespace: "c",
          location: "force:objectHomeDesktop",
          sobjectType: "Case",
        },
      },
      groupId: "DEFAULT",
    },
    state: {},
  };
  const encoded = btoa(JSON.stringify(payload));
  return `${SF_BASE}/one/one.app#${encoded}`;
}

interface SalesforceTabProps {
  prefillName?: string;
  t: T;
}

function SalesforceTab({ prefillName = "", t }: SalesforceTabProps) {
  const [inputValue, setInputValue] = useState(prefillName);
  const [searchedName, setSearchedName] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Sync inputValue when prefillName changes from parent
  useEffect(() => {
    setInputValue(prefillName);
  }, [prefillName]);

  const openSalesforce = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const url = buildSalesforceUrl(trimmed);
    window.open(url, "_blank", "noopener,noreferrer");
    setSearchedName(trimmed);
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
      return [trimmed, ...filtered].slice(0, 5);
    });
  };

  const handleSearch = () => {
    openSalesforce(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Main search card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        {/* Heading */}
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#e6f4fb" }}>
            <Cloud className="w-4.5 h-4.5" style={{ color: "#00A1E0" }} />
          </div>
          <h2 className="text-mathias-blue font-bold text-lg">{t.salesforceZoeken}</h2>
          <span
            className="ml-1 text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "#e6f4fb", color: "#00A1E0" }}
          >
            SF
          </span>
        </div>

        {/* Search input row */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.vbPlaceholder}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-1 focus:ring-sky-400 focus:border-sky-400 transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            disabled={!inputValue.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors shadow-sm"
          >
            <Search className="w-4 h-4" />
            {t.zoekInSalesforce}
          </button>
        </div>

        {/* Info note */}
        <p className="mt-4 text-xs text-gray-400 flex items-center gap-1.5">
          <span className="inline-block w-1 h-1 rounded-full bg-gray-300 shrink-0" />
          {t.sfAangemeld}
        </p>
      </div>

      {/* Recent searches */}
      {recentSearches.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-gray-400" />
            <h3 className="text-mathias-blue font-semibold text-sm">{t.recenteZoekopdrachten}</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => openSalesforce(name)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-sky-200 text-sky-700 bg-sky-50 hover:bg-sky-100 hover:border-sky-300 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state when no recent searches yet */}
      {recentSearches.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center">
          <div
            className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
            style={{ backgroundColor: "#e6f4fb" }}
          >
            <Cloud className="w-6 h-6" style={{ color: "#00A1E0" }} />
          </div>
          <p className="text-sm font-medium text-gray-700 mb-1">{t.zoekEenPersoon}</p>
          <p className="text-xs text-gray-400">
            {t.typeEenNaam}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── IMS Tab ──────────────────────────────────────────────────────────────────

const IMS_BASE_URL = "https://mydesk.ethias.be/terminal?actionKey=S1ASI&actionType=100";


interface IMSTabProps {
  prefillName?: string;
  t: T;
  language: Lang;
}

function IMSTab({ prefillName = "", t, language }: IMSTabProps) {
  // Split "Voornaam Achternaam" → voornaam = first word, achternaam = remaining words
  const splitName = (name: string) => {
    const p = name.trim().split(/\s+/);
    if (p.length >= 2) {
      return { voornaam: p[0], achternaam: p.slice(1).join(" ") };
    }
    return { voornaam: "", achternaam: p[0] || "" };
  };

  const initial = splitName(prefillName);
  const [achternaam, setAchternaam] = useState(initial.achternaam);
  const [voornaam, setVoornaam] = useState(initial.voornaam);
  const [copiedAchternaam, setCopiedAchternaam] = useState(false);
  const [copiedVoornaam, setCopiedVoornaam] = useState(false);
  // Tracks which step we're at after IMS was opened: null = not started, 1 = paste last name, 2 = paste first name, 3 = done
  const [imsStep, setImsStep] = useState<null | 1 | 2 | 3>(null);

  // Sync when prefillName changes
  useEffect(() => {
    const p = prefillName.trim().split(/\s+/);
    if (p.length >= 2) {
      setVoornaam(p[0]);
      setAchternaam(p.slice(1).join(" "));
    } else {
      setVoornaam("");
      setAchternaam(p[0] || "");
    }
    setImsStep(null);
  }, [prefillName]);

  const copyToClipboard = (text: string): Promise<boolean> => {
    if (!text.trim()) return Promise.resolve(false);
    return navigator.clipboard.writeText(text.trim().toUpperCase()).then(() => true).catch(() => false);
  };

  // Step 1: open IMS and auto-copy last name
  const openIMSAndStart = async () => {
    window.open(IMS_BASE_URL, "_blank", "noopener,noreferrer");
    // Auto-copy achternaam immediately
    if (achternaam.trim()) {
      await copyToClipboard(achternaam);
      setCopiedAchternaam(true);
      setTimeout(() => setCopiedAchternaam(false), 4000);
    }
    setImsStep(1);
  };

  // Step 2: copy voornaam (user clicked "Volgende stap")
  const copyVoornaamStep = async () => {
    if (voornaam.trim()) {
      await copyToClipboard(voornaam);
      setCopiedVoornaam(true);
      setTimeout(() => setCopiedVoornaam(false), 4000);
    }
    setImsStep(2);
  };

  // Step 3: done
  const finishSteps = () => {
    setImsStep(3);
  };

  // Manual copy helpers for the input row buttons
  const manualCopyAchternaam = async () => {
    await copyToClipboard(achternaam);
    setCopiedAchternaam(true);
    setTimeout(() => setCopiedAchternaam(false), 2500);
  };

  const manualCopyVoornaam = async () => {
    await copyToClipboard(voornaam);
    setCopiedVoornaam(true);
    setTimeout(() => setCopiedVoornaam(false), 2500);
  };

  const hasName = achternaam.trim().length > 0 || voornaam.trim().length > 0;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      openIMSAndStart();
    }
  };

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        {/* Heading */}
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-50">
            <span className="text-xs font-bold text-green-700">IMS</span>
          </div>
          <h2 className="text-mathias-blue font-bold text-lg">{t.imsTitle}</h2>
          <span className="ml-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700">
            mydesk.ethias.be
          </span>
        </div>

        {/* Name input fields */}
        <div className="mb-5 space-y-3">
          {/* NAAM (Achternaam) */}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label htmlFor="ims-achternaam" className="block text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">
                {t.naamLabel}
              </label>
              <input
                id="ims-achternaam"
                type="text"
                value={achternaam}
                onChange={(e) => { setAchternaam(e.target.value); setImsStep(null); }}
                onKeyDown={handleKeyDown}
                placeholder="Achternaam"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400 transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={manualCopyAchternaam}
              disabled={!achternaam.trim()}
              title={t.kopieer}
              className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors shadow-sm ${
                copiedAchternaam
                  ? "bg-green-50 border-green-300 text-green-700"
                  : "bg-white border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
              }`}
            >
              {copiedAchternaam ? (
                <><CheckCircle2 className="w-4 h-4" /> {t.gekopieerd}</>
              ) : (
                <><span className="text-base leading-none">📋</span> {t.kopieer}</>
              )}
            </button>
          </div>

          {/* VOORNAAM */}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label htmlFor="ims-voornaam" className="block text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">
                {t.voornaamLabel}
              </label>
              <input
                id="ims-voornaam"
                type="text"
                value={voornaam}
                onChange={(e) => { setVoornaam(e.target.value); setImsStep(null); }}
                onKeyDown={handleKeyDown}
                placeholder="Voornaam"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400 transition-colors"
              />
            </div>
            <button
              type="button"
              onClick={manualCopyVoornaam}
              disabled={!voornaam.trim()}
              title={t.kopieer}
              className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors shadow-sm ${
                copiedVoornaam
                  ? "bg-green-50 border-green-300 text-green-700"
                  : "bg-white border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
              }`}
            >
              {copiedVoornaam ? (
                <><CheckCircle2 className="w-4 h-4" /> {t.gekopieerd}</>
              ) : (
                <><span className="text-base leading-none">📋</span> {t.kopieer}</>
              )}
            </button>
          </div>
        </div>

        {/* Open IMS button */}
        <button
          type="button"
          onClick={openIMSAndStart}
          disabled={!hasName}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors shadow-sm"
        >
          <ExternalLink className="w-4 h-4" />
          {t.openInIMS}
          {hasName && (
            <span className="ml-1 text-green-200 font-normal text-xs">
              — {achternaam.trim().toUpperCase()} {voornaam.trim().toUpperCase()}
            </span>
          )}
        </button>

        {/* ── Interactive step guide (shown after IMS opened) ── */}
        {imsStep !== null && (
          <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 space-y-3">
            <p className="text-xs font-bold text-green-800 uppercase tracking-wide mb-2">
              {language === "NL" ? "Stap-voor-stap gids" : "Guide étape par étape"}
            </p>

            {/* Step 1 */}
            <div className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${imsStep === 1 ? "border-green-400 bg-white shadow-sm" : "border-transparent"}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${imsStep > 1 ? "bg-green-500 text-white" : "bg-green-200 text-green-800"}`}>
                {imsStep > 1 ? <CheckCircle2 className="w-4 h-4" /> : "1"}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  {language === "NL"
                    ? <>Ga naar IMS → rij 4 → klik op <strong>NAAM</strong> veld</>
                    : <>Allez dans IMS → ligne 4 → cliquez sur le champ <strong>NOM</strong></>}
                </p>
                <p className="text-xs text-green-700 mt-1 font-medium">
                  {copiedAchternaam
                    ? (language === "NL" ? `✓ Klembord klaar: "${achternaam.trim().toUpperCase()}" — druk Ctrl+V` : `✓ Presse-papiers prêt: "${achternaam.trim().toUpperCase()}" — appuyez Ctrl+V`)
                    : (language === "NL" ? `Klik "📋 Kopieer" naast Achternaam, dan Ctrl+V in IMS` : `Cliquez "📋 Copier" à côté du Nom, puis Ctrl+V dans IMS`)}
                </p>
                {imsStep === 1 && (
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={manualCopyAchternaam}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-medium transition-colors"
                    >
                      <span>📋</span>
                      {language === "NL" ? `Kopieer "${achternaam.trim().toUpperCase()}"` : `Copier "${achternaam.trim().toUpperCase()}"`}
                    </button>
                    <button
                      type="button"
                      onClick={copyVoornaamStep}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-400 text-green-700 text-xs font-medium hover:bg-green-100 transition-colors"
                    >
                      {language === "NL" ? "Geplakt → Volgende stap" : "Collé → Étape suivante"}
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2 */}
            <div className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${imsStep === 2 ? "border-green-400 bg-white shadow-sm" : "border-transparent opacity-60"}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${imsStep > 2 ? "bg-green-500 text-white" : imsStep === 2 ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-500"}`}>
                {imsStep > 2 ? <CheckCircle2 className="w-4 h-4" /> : "2"}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  {language === "NL"
                    ? <>Druk <strong>TAB</strong> → ga naar <strong>VOORNAAM</strong> veld</>
                    : <>Appuyez <strong>TAB</strong> → allez au champ <strong>PRÉNOM</strong></>}
                </p>
                <p className="text-xs text-green-700 mt-1 font-medium">
                  {copiedVoornaam && imsStep === 2
                    ? (language === "NL" ? `✓ Klembord klaar: "${voornaam.trim().toUpperCase()}" — druk Ctrl+V` : `✓ Presse-papiers prêt: "${voornaam.trim().toUpperCase()}" — appuyez Ctrl+V`)
                    : (language === "NL" ? `Kopieer voornaam en plak met Ctrl+V` : `Copiez le prénom et collez avec Ctrl+V`)}
                </p>
                {imsStep === 2 && (
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={manualCopyVoornaam}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-medium transition-colors"
                    >
                      <span>📋</span>
                      {language === "NL" ? `Kopieer "${voornaam.trim().toUpperCase()}"` : `Copier "${voornaam.trim().toUpperCase()}"`}
                    </button>
                    <button
                      type="button"
                      onClick={finishSteps}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-400 text-green-700 text-xs font-medium hover:bg-green-100 transition-colors"
                    >
                      {language === "NL" ? "Geplakt → Druk Enter in IMS" : "Collé → Appuyez Enter dans IMS"}
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Step 3 */}
            <div className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${imsStep === 3 ? "border-green-400 bg-white shadow-sm" : "border-transparent opacity-60"}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${imsStep === 3 ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                {imsStep === 3 ? <CheckCircle2 className="w-4 h-4" /> : "3"}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  {language === "NL" ? "Druk Enter in IMS om op te zoeken" : "Appuyez Enter dans IMS pour rechercher"}
                </p>
                {imsStep === 3 && (
                  <p className="text-xs text-green-700 mt-1 font-semibold">
                    {language === "NL" ? `✓ Klaar! Zoeken naar ${achternaam.trim().toUpperCase()} ${voornaam.trim().toUpperCase()}` : `✓ Terminé ! Recherche de ${achternaam.trim().toUpperCase()} ${voornaam.trim().toUpperCase()}`}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <p className="mt-4 text-xs text-gray-400 flex items-start gap-1.5">
          <span className="inline-block w-1 h-1 rounded-full bg-gray-300 shrink-0 mt-1.5" />
          {t.imsNieuwTabblad}
        </p>
      </div>

      {/* ── Other IMS screens ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50">
            <span className="text-xs font-bold text-blue-700">IMS</span>
          </div>
          <h2 className="text-mathias-blue font-bold text-base">{t.imsAndereSchermen}</h2>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {([
            { code: "S1ISI", label: language === "NL" ? "Klant aanmaken" : "Créer un client", url: "https://mydesk.ethias.be/terminal?actionKey=S1ISI&actionType=100" },
            { code: "MSIFA", label: language === "NL" ? "Klant aan Polis koppelen" : "Lier client à une police", url: "https://mydesk.ethias.be/terminal?actionKey=MSIFA&actionType=100" },
            { code: "S1GSI", label: language === "NL" ? "Klant beheren" : "Gérer le client", url: "https://mydesk.ethias.be/terminal?actionKey=S1GSI&actionType=100" },
            { code: "MSGFA", label: language === "NL" ? "Familie beheren" : "Gérer la famille", url: "https://mydesk.ethias.be/terminal?actionKey=MSGFA&actionType=100" },
            { code: "MSGPO", label: language === "NL" ? "Policy bekijken" : "Consulter la police", url: "https://mydesk.ethias.be/terminal?actionKey=MSGPO&actionType=100" },
            { code: "COCAI", label: language === "NL" ? "Boekhouding bekijken" : "Consulter la comptabilité", url: "https://mydesk.ethias.be/terminal?actionKey=COCAI&actionType=100" },
            { code: "SMJOB", label: language === "NL" ? "Overzichtslijsten" : "Listes récapitulatives", url: "https://mydesk.ethias.be/terminal?actionKey=SMJOB&actionType=100" },
          ] as { code: string; label: string; url: string }[]).map((screen) => (
            <button
              key={screen.code}
              type="button"
              onClick={() => window.open(screen.url, "_blank", "noopener,noreferrer")}
              className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors text-left group"
            >
              <span className="shrink-0 inline-flex items-center justify-center w-16 h-7 rounded-md bg-blue-100 text-blue-700 text-xs font-bold tracking-wide group-hover:bg-blue-200 transition-colors">
                {screen.code}
              </span>
              <span className="flex-1 text-sm text-gray-700 font-medium group-hover:text-blue-800 transition-colors">
                {screen.label}
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 shrink-0 transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Calendar Picker Component ───────────────────────────────────────────────

const MONTHS_NL = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];
const MONTHS_FR = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const WEEKDAYS_NL = ["zo", "ma", "di", "wo", "do", "vr", "za"];
const WEEKDAYS_FR = ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"];

interface CalendarPickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  language: Lang;
}

function CalendarPicker({ value, onChange, language }: CalendarPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current value
  const parsedDate = value ? new Date(value + "T00:00:00") : new Date();
  const [viewYear, setViewYear] = useState(parsedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsedDate.getMonth()); // 0-indexed

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const months = language === "NL" ? MONTHS_NL : MONTHS_FR;
  const weekdays = language === "NL" ? WEEKDAYS_NL : WEEKDAYS_FR;

  // Format display value
  const formattedDate = (() => {
    if (!value) return "--/--/----";
    const d = new Date(value + "T00:00:00");
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  })();

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Sync view to value when opening
  const handleOpen = () => {
    if (value) {
      const d = new Date(value + "T00:00:00");
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
    setIsOpen((prev) => !prev);
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  };

  // Build calendar grid (weeks starting Sunday)
  const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  type DayCell = { day: number; month: "prev" | "current" | "next"; date: Date };
  const cells: DayCell[] = [];

  // Trailing days from prev month
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
    cells.push({ day: d, month: "prev", date: new Date(prevY, prevM, d) });
  }

  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, month: "current", date: new Date(viewYear, viewMonth, d) });
  }

  // Leading days from next month to fill grid (always 6 rows = 42 cells)
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
    cells.push({ day: d, month: "next", date: new Date(nextY, nextM, d) });
  }

  const handleSelectDay = (cell: DayCell) => {
    const yyyy = cell.date.getFullYear();
    const mm = String(cell.date.getMonth() + 1).padStart(2, "0");
    const dd = String(cell.date.getDate()).padStart(2, "0");
    onChange(`${yyyy}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const selectedDate = value ? new Date(value + "T00:00:00") : null;
  const isSelected = (cell: DayCell) =>
    selectedDate !== null &&
    cell.date.getFullYear() === selectedDate.getFullYear() &&
    cell.date.getMonth() === selectedDate.getMonth() &&
    cell.date.getDate() === selectedDate.getDate();

  const isToday = (cell: DayCell) =>
    cell.date.getFullYear() === today.getFullYear() &&
    cell.date.getMonth() === today.getMonth() &&
    cell.date.getDate() === today.getDate();

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={handleOpen}
        className="flex items-center gap-1.5 pl-3 pr-2.5 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-700 bg-white hover:border-sky-400 hover:bg-sky-50 focus:outline-none focus:ring-1 focus:ring-sky-400 focus:border-sky-400 transition-colors"
      >
        <Calendar className="w-3.5 h-3.5 text-gray-400" />
        <span className="font-medium tabular-nums">{formattedDate}</span>
      </button>

      {/* Dropdown calendar */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-1.5 z-50 bg-white rounded-xl shadow-lg border border-gray-100 p-3 w-[272px]">
          {/* Month/Year navigation */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-mathias-blue">{viewYear}</span>
              <span className="text-sm font-medium text-gray-700 capitalize">{months[viewMonth]}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                title="Vorige maand"
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={nextMonth}
                title="Volgende maand"
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-1">
            {weekdays.map((wd) => (
              <div key={wd} className="text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wide py-1">
                {wd}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {cells.map((cell) => {
              const sel = isSelected(cell);
              const tod = isToday(cell);
              const isCurrent = cell.month === "current";
              const cellKey = `${cell.month}-${cell.date.getFullYear()}-${cell.date.getMonth()}-${cell.day}`;
              return (
                <button
                  key={cellKey}
                  type="button"
                  onClick={() => handleSelectDay(cell)}
                  className={`
                    relative mx-auto flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-colors
                    ${sel
                      ? "bg-mathias-blue text-white shadow-sm"
                      : tod
                        ? "border-2 border-mathias-blue text-mathias-blue hover:bg-sky-50"
                        : isCurrent
                          ? "text-gray-800 hover:bg-sky-50 hover:text-mathias-blue"
                          : "text-gray-300 hover:bg-gray-50 hover:text-gray-500"
                    }
                  `}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Commands Tab ─────────────────────────────────────────────────────────────

// Helper badge components
function ScreenBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center font-mono bg-orange-50 text-orange-700 border border-orange-200 px-1.5 py-0.5 rounded text-xs font-semibold leading-none">
      {children}
    </span>
  );
}

function KeyBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center font-mono bg-gray-100 text-gray-600 border border-gray-200 px-1.5 py-0.5 rounded text-xs leading-none">
      {children}
    </span>
  );
}

function CodeBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 my-2 whitespace-pre-wrap">
      {children}
    </div>
  );
}

interface StepItem {
  id: string;
  content: React.ReactNode;
}

interface ProcedureProps {
  number: number;
  title: string;
  steps: StepItem[];
  note?: React.ReactNode;
  defaultOpen?: boolean;
}

function Procedure({ number, title, steps, note, defaultOpen = false }: ProcedureProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-600 text-xs font-bold shrink-0">
          {number}
        </span>
        <span className="flex-1 text-sm font-semibold text-gray-800">{title}</span>
        <ChevronRight
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-4 pt-1 border-t border-gray-50">
          <ol className="space-y-1.5">
            {steps.map((step, i) => (
              <li key={step.id} className="flex items-start gap-2.5 text-sm text-gray-700 leading-relaxed">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="flex-1">{step.content}</span>
              </li>
            ))}
          </ol>
          {note && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              {note}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Helper to build steps with auto-generated IDs
function S(id: string, content: React.ReactNode): StepItem {
  return { id, content };
}

interface SectionHeaderProps {
  color: "blue" | "green" | "orange" | "purple" | "teal" | "indigo" | "rose";
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}

const SECTION_COLORS: Record<string, string> = {
  blue: "bg-blue-600 border-blue-700",
  green: "bg-green-600 border-green-700",
  orange: "bg-orange-500 border-orange-600",
  purple: "bg-purple-600 border-purple-700",
  teal: "bg-teal-600 border-teal-700",
  indigo: "bg-indigo-600 border-indigo-700",
  rose: "bg-rose-700 border-rose-800",
};

function SectionHeader({ color, icon, title, subtitle }: SectionHeaderProps) {
  return (
    <div className={`flex items-center gap-3 px-5 py-3 rounded-xl text-white ${SECTION_COLORS[color]}`}>
      <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <div className="font-bold text-sm tracking-wide">{title}</div>
        {subtitle && <div className="text-xs text-white/80">{subtitle}</div>}
      </div>
    </div>
  );
}

// ── Documenten Opmaken data ───────────────────────────────────────────────────

interface DocCommand {
  cmd: string;
  code: string;
  omschrijving: string;
  omschrijvingFR: string;
}

const DOC_ECOMMANDS: DocCommand[] = [
  { cmd: "E I CEF", code: "CEF", omschrijving: "Kosten en lasten", omschrijvingFR: "Frais et charges" },
  { cmd: "E I DOC", code: "DOC", omschrijving: "Verzending documenten", omschrijvingFR: "Envoi de documents" },
  { cmd: "E I MT2", code: "MT2", omschrijving: "Mandaat zonder wijziging van spreiding", omschrijvingFR: "Mandat sans modification d'étalement" },
  { cmd: "E I MT5", code: "MT5", omschrijving: "Gewijzigd rekeningnummer > Mandaat", omschrijvingFR: "Numéro de compte modifié > Mandat" },
  { cmd: "E I CPE", code: "CPE", omschrijving: "Aanbod continuïteit gepensioneerden", omschrijvingFR: "Offre continuité pensionnés" },
  { cmd: "E I CIN", code: "CIN", omschrijving: "Aanbod continuïteit arbeidsongeschiktheid", omschrijvingFR: "Offre continuité incapacité de travail" },
  { cmd: "E I CTX", code: "CTX", omschrijving: "Afrekening na betwisting", omschrijvingFR: "Décompte après contestation" },
  { cmd: "E I FRA", code: "FRA", omschrijving: "Afrekening na spreiding", omschrijvingFR: "Décompte après étalement" },
  { cmd: "E I FOR", code: "FOR", omschrijving: "Afrekening bij formuleverandering", omschrijvingFR: "Décompte lors de changement de formule" },
  { cmd: "E I DCD", code: "DCD", omschrijving: "Afrekening na overlijden", omschrijvingFR: "Décompte après décès" },
  { cmd: "E I MOD", code: "MOD", omschrijving: "Afrekening na wijziging", omschrijvingFR: "Décompte après modification" },
  { cmd: "E I M22", code: "M22", omschrijving: "Afrekening factuur min creditnota", omschrijvingFR: "Décompte facture moins note de crédit" },
];

const DOC_FCOMMANDS: DocCommand[] = [
  { cmd: "F I ATT", code: "ATT", omschrijving: "Attest aansluiting", omschrijvingFR: "Attestation d'affiliation" },
  { cmd: "F I LAS", code: "LAS", omschrijving: "Brief Assurcard", omschrijvingFR: "Lettre Assurcard" },
  { cmd: "F I ATW", code: "ATW", omschrijving: "Welkomstbrief", omschrijvingFR: "Lettre de bienvenue" },
];

const DOC_CGCOMMANDS: DocCommand[] = [
  { cmd: "G A BAR FAM", code: "BAR", omschrijving: "Brief Assurpharma", omschrijvingFR: "Lettre Assurpharma" },
  { cmd: "C I MDT", code: "MDT", omschrijving: "Inschrijving mandaat", omschrijvingFR: "Inscription mandat" },
  { cmd: "C R MDT", code: "MDT", omschrijving: "Rechtzetting mandaat", omschrijvingFR: "Rectification mandat" },
  { cmd: "F I MOD", code: "MOD", omschrijving: "Activatie mandaat", omschrijvingFR: "Activation mandat" },
];

function DocCommandTable({ commands, language }: { commands: DocCommand[]; language: Lang }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left text-gray-400 font-semibold pb-2 pr-4 uppercase tracking-wide w-36">
              {language === "NL" ? "Commando" : "Commande"}
            </th>
            <th className="text-left text-gray-400 font-semibold pb-2 pr-4 uppercase tracking-wide w-14">
              Code
            </th>
            <th className="text-left text-gray-400 font-semibold pb-2 uppercase tracking-wide">
              {language === "NL" ? "Omschrijving" : "Description"}
            </th>
          </tr>
        </thead>
        <tbody>
          {commands.map((row) => (
            <tr key={`${row.cmd}-${row.omschrijving}`} className="border-b border-gray-50 last:border-0 hover:bg-rose-50/30 transition-colors">
              <td className="py-2 pr-4">
                <span className="inline-flex items-center font-mono bg-orange-50 text-orange-700 border border-orange-200 px-2 py-1 rounded text-xs font-semibold whitespace-nowrap">
                  {row.cmd}
                </span>
              </td>
              <td className="py-2 pr-4">
                <span className="inline-flex items-center font-mono bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide">
                  {row.code}
                </span>
              </td>
              <td className="py-2 text-gray-700 font-medium">
                {language === "NL" ? row.omschrijving : row.omschrijvingFR}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DocumentenOpmaakSection({ language, search }: { language: Lang; search: string }) {
  // Determine visibility based on search
  const allRows = [...DOC_ECOMMANDS, ...DOC_FCOMMANDS, ...DOC_CGCOMMANDS];
  const matchesSearch = !search || allRows.some(
    (r) =>
      r.cmd.toLowerCase().includes(search) ||
      r.code.toLowerCase().includes(search) ||
      r.omschrijving.toLowerCase().includes(search) ||
      r.omschrijvingFR.toLowerCase().includes(search) ||
      "documenten opmaken".includes(search) ||
      "documents".includes(search)
  );

  if (!matchesSearch) return null;

  const filterRows = (rows: DocCommand[]) =>
    !search
      ? rows
      : rows.filter(
          (r) =>
            r.cmd.toLowerCase().includes(search) ||
            r.code.toLowerCase().includes(search) ||
            r.omschrijving.toLowerCase().includes(search) ||
            r.omschrijvingFR.toLowerCase().includes(search)
        );

  const eRows = filterRows(DOC_ECOMMANDS);
  const fRows = filterRows(DOC_FCOMMANDS);
  const cgRows = filterRows(DOC_CGCOMMANDS);

  const totalVisible = eRows.length + fRows.length + cgRows.length;
  if (totalVisible === 0) return null;

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center gap-3 px-5 py-3 rounded-xl text-white bg-rose-700 border-rose-800">
        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
          <BookMarked className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="font-bold text-sm tracking-wide">
            {language === "NL" ? "Documenten opmaken" : "Création de documents"}
          </div>
          <div className="text-xs text-white/80">
            {totalVisible} {language === "NL" ? "commando's" : "commandes"}
          </div>
        </div>
      </div>

      {/* Subgroups */}
      <div className="pl-2 space-y-3">
        {/* E-commando's */}
        {eRows.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 border-b border-gray-100">
              <span className="inline-flex items-center font-mono bg-orange-100 text-orange-700 border border-orange-200 px-2 py-0.5 rounded text-xs font-bold">E I …</span>
              <span className="text-xs font-semibold text-gray-600">
                {language === "NL" ? "Afrekeningsdocumenten" : "Documents de décompte"}
              </span>
              <span className="ml-auto text-xs text-gray-400">{eRows.length}</span>
            </div>
            <div className="px-5 py-3">
              <DocCommandTable commands={eRows} language={language} />
            </div>
          </div>
        )}

        {/* F-commando's */}
        {fRows.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 border-b border-gray-100">
              <span className="inline-flex items-center font-mono bg-orange-100 text-orange-700 border border-orange-200 px-2 py-0.5 rounded text-xs font-bold">F I …</span>
              <span className="text-xs font-semibold text-gray-600">
                {language === "NL" ? "Attesten & Brieven" : "Attestations & Lettres"}
              </span>
              <span className="ml-auto text-xs text-gray-400">{fRows.length}</span>
            </div>
            <div className="px-5 py-3">
              <DocCommandTable commands={fRows} language={language} />
            </div>
          </div>
        )}

        {/* C/G-commando's */}
        {cgRows.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 border-b border-gray-100">
              <span className="inline-flex items-center font-mono bg-orange-100 text-orange-700 border border-orange-200 px-2 py-0.5 rounded text-xs font-bold">C/G …</span>
              <span className="text-xs font-semibold text-gray-600">
                {language === "NL" ? "Mandaten & Assurpharma" : "Mandats & Assurpharma"}
              </span>
              <span className="ml-auto text-xs text-gray-400">{cgRows.length}</span>
            </div>
            <div className="px-5 py-3">
              <DocCommandTable commands={cgRows} language={language} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface CommandsTabProps {
  t: T;
  language: Lang;
}

function CommandsTab({ t: _t, language }: CommandsTabProps) {
  const [search, setSearch] = useState("");

  // All procedures data
  const allProcedures: {
    section: string;
    sectionColor: "blue" | "green" | "orange" | "purple" | "teal" | "indigo";
    procedures: ProcedureProps[];
  }[] = [
    {
      section: language === "NL" ? "Deel I — Aansluitingen" : "Partie I — Affiliations",
      sectionColor: "blue",
      procedures: [
        {
          number: 1,
          title: language === "NL" ? "Aansluitingsnummer aanmaken" : "Créer un numéro d'affiliation",
          steps: [
            S("p1s1", <span>Klant opzoeken via <ScreenBadge>S1ASI</ScreenBadge></span>),
            S("p1s2", <span>Als aansluitingsnummer bestaat: nummer noteren</span>),
            S("p1s3", <span>Indien geen aansluitingsnummer: aanmaken in <ScreenBadge>S1ISI</ScreenBadge></span>),
            S("p1s4", <span>Velden invullen: AANSPR. (dhr/mev), TAAL: N, NAAM, VOORNAAM, Straat, Nr, Bus, Postcode, Gemeente, Land, Geboortedatum, Geboorteplaats</span>),
            S("p1s5", <span>Ber.: <KeyBadge>99</KeyBadge></span>),
          ],
        },
        {
          number: 2,
          title: language === "NL" ? "Aanpassing bij bestaand aansluitingsnummer" : "Modification d'un numéro d'affiliation existant",
          steps: [
            S("p2s1", <span>Klant opzoeken via <ScreenBadge>S1GSI</ScreenBadge> → <KeyBadge>Enter</KeyBadge></span>),
            S("p2s2", <span>Mod: <KeyBadge>S R SIG</KeyBadge></span>),
            S("p2s3", <span>Aanpassing doorvoeren → <KeyBadge>Enter</KeyBadge></span>),
            S("p2s4", <span>Reden aanpassing: <KeyBadge>02</KeyBadge></span>),
            S("p2s5", <span>Of mail naar <span className="font-mono text-blue-600 text-xs">info.persoongegevens@ethias.be</span> (ook voor adreswijziging)</span>),
          ],
        },
        {
          number: 3,
          title: language === "NL" ? "Aansluiten nieuwe polis" : "Affilier une nouvelle police",
          steps: [
            S("p3s1", <span>Naar scherm <ScreenBadge>MSIFA</ScreenBadge></span>),
            S("p3s2", <span>POLIS NR: <KeyBadge>4485100</KeyBadge>, TYPE invullen → <KeyBadge>Enter</KeyBadge></span>),
            S("p3s3", <span>ONDERTEK: <KeyBadge>174735</KeyBadge> VLAAMSE OVERHEID – DOV</span>),
            S("p3s4", <span>Casenummer invullen</span>),
            S("p3s5", <span>
              <strong>Velduitleg:</strong>
              <div className="mt-2 overflow-x-auto">
                <table className="text-xs border-collapse w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-2 py-1 text-left font-semibold text-gray-600">Veld</th>
                      <th className="border border-gray-200 px-2 py-1 text-left font-semibold text-gray-600">Betekenis</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Aansluit", "zie punt 1 & 2"],
                      ["Aanvdat", "eerstvolgende 1ste van de maand (datum brief); bij baby/attest vroeger mogelijk"],
                      ["BS", "1=jaarlijks, 2=semestrieel, 3=trimestrieel, 4=maandelijks"],
                      ["BW", "Briefwisseling: 1"],
                      ["Overdracht", "N N N"],
                      ["Begunstigde", "naam en voornaam met 2 spaties"],
                      ["H (hoedanigheid)", "1=hoofdverzekerde, 2=kind, 3=partner"],
                      ["GEB", "xx/xx/xxxx"],
                      ["G (geslacht)", "1=man, 2=vrouw"],
                      ["Aanv", "01/xx/xx (of xx/xx/xx bij pasgeborene/overname)"],
                      ["W (waarborg)", "1=uitgebreid, 2=basis"],
                      ["I (wachttijd)", "Y of N (N indien attest of pasgeborene)"],
                      ["Z (bev. wachttijd)", "9 of 0 (0 indien pasgeborene/attest)"],
                      ["E (uitsluiting)", "N of Y indien pasgeborene"],
                      ["T", "2 indien basis, anders leeg"],
                      ["K en X", "altijd N"],
                    ].map(([veld, betekenis]) => (
                      <tr key={veld} className="hover:bg-gray-50">
                        <td className="border border-gray-200 px-2 py-1 font-mono font-semibold text-orange-700 whitespace-nowrap">{veld}</td>
                        <td className="border border-gray-200 px-2 py-1 text-gray-600">{betekenis}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </span>),
          ],
        },
        {
          number: 4,
          title: language === "NL" ? "Voorbeelden veldcombinaties (W/I/Z/E/T/K/X)" : "Exemples de combinaisons de champs",
          steps: [
            S("p4s1", <span><strong>Basis (W=2):</strong><CodeBox>W=2  I=Y  Z=9  E=N  T=2  K=N  X=N</CodeBox></span>),
            S("p4s2", <span><strong>Uitgebreid (W=1):</strong><CodeBox>W=1  I=Y  Z=9  E=N  T=–  K=N  X=N</CodeBox></span>),
            S("p4s3", <span><strong>Met geldig attest (einddatum):</strong><CodeBox>W=2  I=N  Z=0  E=N  T=2  K=N  X=N</CodeBox></span>),
            S("p4s4", <span><strong>Pasgeborene:</strong><CodeBox>W=2  I=N  Z=0  E=Y  T=2  K=N  X=N</CodeBox></span>),
            S("p4s5", <span><strong>Aanvangsdatums:</strong><CodeBox>{`Aanvraag 03/04  →  aansluiting 01/05  (AANDAT 1/5)\nGeboorte 03/04  →  aansluiting 03/04  (AANDAT 1/4)\nAttest 30/04    →  aansluiting 01/05  (AANDAT 1/5)\nAttest ok 12/04 →  aansluiting 01/04  (AANDAT 1/4)`}</CodeBox></span>),
          ],
        },
      ],
    },
    {
      section: language === "NL" ? "Deel II — Facturatie" : "Partie II — Facturation",
      sectionColor: "green",
      procedures: [
        {
          number: 5,
          title: language === "NL" ? "Domiciliering toevoegen" : "Ajouter une domiciliation",
          steps: [
            S("p5s1", <span>Klant opzoeken via <ScreenBadge>MSGFA</ScreenBadge> → <KeyBadge>Enter</KeyBadge></span>),
            S("p5s2", <span>Mod: <KeyBadge>C I MDT</KeyBadge></span>),
            S("p5s3", <span>A01 bij naam intypen → 2× <KeyBadge>Enter</KeyBadge> → <KeyBadge>F2</KeyBadge></span>),
            S("p5s4", <span>Rekeningnummer toevoegen</span>),
            S("p5s5", <span>Datum van vandaag</span>),
            S("p5s6", <span><KeyBadge>P</KeyBadge> (naar M aanpassen indien klant vraag stelt via tel/mail)</span>),
            S("p5s7", <span><KeyBadge>F I MOD</KeyBadge> → <KeyBadge>F1</KeyBadge></span>),
          ],
        },
        {
          number: 6,
          title: language === "NL" ? "Domiciliering wijzigen" : "Modifier une domiciliation",
          steps: [
            S("p6s1", <span>Klant opzoeken via <ScreenBadge>MSGFA</ScreenBadge> → <KeyBadge>Enter</KeyBadge></span>),
            S("p6s2", <span>Mod: <KeyBadge>C R MDT</KeyBadge></span>),
            S("p6s3", <span>A01 bij naam → 2× <KeyBadge>Enter</KeyBadge> → <KeyBadge>F2</KeyBadge></span>),
            S("p6s4", <span>Rekeningnummer toevoegen</span>),
            S("p6s5", <span>Datum van ondertekening</span>),
            S("p6s6", <span><KeyBadge>P</KeyBadge> (of M indien klant via tel/mail)</span>),
            S("p6s7", <span><KeyBadge>F I MOD</KeyBadge> → <KeyBadge>F1</KeyBadge></span>),
            S("p6s8", <span>Mod: <KeyBadge>C R MDT</KeyBadge> → 2 voor de lijn in <ScreenBadge>S1RMD</ScreenBadge></span>),
          ],
        },
        {
          number: 7,
          title: language === "NL" ? "Klant belt/mailt voor domiciliering" : "Client appelle/écrit pour domiciliation",
          steps: [
            S("p7s1", <span>Klant opzoeken via <ScreenBadge>MSGFA</ScreenBadge></span>),
            S("p7s2", <span><KeyBadge>C I MDT</KeyBadge> → A01 M: mailadres of <KeyBadge>P</KeyBadge> (=document 1)</span>),
            S("p7s3", <span>Document 2 via post: Aktivit. s.: <KeyBadge>M2</KeyBadge> ipv TR</span>),
            S("p7s4", <span>Mod: <KeyBadge>E M ENU</KeyBadge> → <KeyBadge>Enter</KeyBadge></span>),
            S("p7s5", <span>Op Briefwisseling: <KeyBadge>Enter</KeyBadge></span>),
            S("p7s6", <span>Op Verzending document: <KeyBadge>F1</KeyBadge></span>),
            S("p7s7", <span>Onder bemiddelaar: A01 → <KeyBadge>F1</KeyBadge></span>),
          ],
        },
        {
          number: 8,
          title: language === "NL" ? "Factuur opzoeken na wijziging" : "Rechercher une facture après modification",
          steps: [
            S("p8s1", <span>Klant opzoeken via <ScreenBadge>MSGFA</ScreenBadge></span>),
            S("p8s2", <span><KeyBadge>Enter</KeyBadge> op →factuur←</span>),
          ],
        },
        {
          number: 9,
          title: language === "NL" ? "Financiële opzoekingen" : "Recherches financières",
          steps: [
            S("p9s1", <span>Klant opzoeken via <ScreenBadge>COCAI</ScreenBadge> → <KeyBadge>Shift+F6</KeyBadge></span>),
            S("p9s2", <span><KeyBadge>F7</KeyBadge> en <KeyBadge>F8</KeyBadge> om te navigeren</span>),
            S("p9s3", <span><KeyBadge>R</KeyBadge> voor de lijn typen = rappel nakijken</span>),
            S("p9s4", <span><KeyBadge>P</KeyBadge> voor de lijn typen = periode dekking factuur zien</span>),
          ],
        },
        {
          number: 10,
          title: language === "NL" ? "Klant wil elektronische facturatie" : "Client veut une facturation électronique",
          steps: [
            S("p10s1", <span>Klant opzoeken via <ScreenBadge>S1GSI</ScreenBadge></span>),
            S("p10s2", <span><KeyBadge>S R DIV</KeyBadge> → <KeyBadge>Enter</KeyBadge> → <KeyBadge>F8</KeyBadge></span>),
            S("p10s3", <span>Mail sturen naar <span className="font-mono text-blue-600 text-xs">info.persoonsgegevens@ethias.be</span></span>),
          ],
        },
        {
          number: 11,
          title: language === "NL" ? "Klant wil gespreide betaling" : "Client veut un paiement échelonné",
          steps: [
            S("p11s1", <span>Klant opzoeken via <ScreenBadge>MSGFA</ScreenBadge></span>),
            S("p11s2", <span><KeyBadge>F M FAM bs1</KeyBadge> → bsx → <KeyBadge>Enter</KeyBadge></span>),
            S("p11s3", <span>BS aanpassen + aanvangsdatum aanpassen naar eerstvolgende hoofdvervaldag</span>),
          ],
        },
        {
          number: 12,
          title: language === "NL" ? "Klant wil terugbetaling creditnota" : "Client veut remboursement note de crédit",
          steps: [
            S("p12s1", <span>Nakijken of rekeningnummer aanwezig in <ScreenBadge>COCAI</ScreenBadge></span>),
            S("p12s2", <span>Geen rekeningnummer: mail door klant naar <span className="font-mono text-blue-600 text-xs">boekhouding@ethias.be</span></span>),
            S("p12s3", <span>Wel rekeningnummer: mail door ons naar <span className="font-mono text-blue-600 text-xs">boekhouding@ethias.be</span></span>),
          ],
        },
        {
          number: 13,
          title: language === "NL" ? "VVD opzoeken" : "Rechercher VVD",
          steps: [
            S("p13s1", <span>Klant opzoeken via <ScreenBadge>MSGPO</ScreenBadge></span>),
            S("p13s2", <span>Of <KeyBadge>Shift+F11</KeyBadge> vanuit <ScreenBadge>MSIFA</ScreenBadge>, <ScreenBadge>MSGOP</ScreenBadge>, <ScreenBadge>MSGFA</ScreenBadge></span>),
          ],
        },
        {
          number: 14,
          title: language === "NL" ? "Nakijken of klant factuur krijgt via mail" : "Vérifier si client reçoit la facture par mail",
          steps: [
            S("p14s1", <span>Klant opzoeken via <ScreenBadge>S1GSI</ScreenBadge></span>),
            S("p14s2", <span><KeyBadge>S R DIV</KeyBadge> → <KeyBadge>Enter</KeyBadge> → <KeyBadge>F8</KeyBadge></span>),
            S("p14s3", <span>Kijken of actief of niet</span>),
            S("p14s4", <span>Indien niet actief: aanvragen via <span className="font-mono text-blue-600 text-xs">info.persoonsgegevens@ethias.be</span></span>),
            S("p14s5", <span>Let op: gedrukte facturen niet meer terug in <ScreenBadge>MSGFA</ScreenBadge> → gebruik <ScreenBadge>COCAI</ScreenBadge></span>),
          ],
        },
      ],
    },
    {
      section: language === "NL" ? "Deel III — Wijzigingen" : "Partie III — Modifications",
      sectionColor: "orange",
      procedures: [
        {
          number: 15,
          title: language === "NL" ? "Toevoegen of schrappen familielid" : "Ajouter ou supprimer un membre de la famille",
          steps: [
            S("p15s1", <span>Klant opzoeken via <ScreenBadge>MSGFA</ScreenBadge></span>),
            S("p15s2", <span><KeyBadge>F R FAM</KeyBadge> (reden 02) bij: overlijden, attest einddatum, factuur geprint, uitbreiding waarborg</span>),
            S("p15s3", <span><KeyBadge>F M FAM</KeyBadge> (reden 04) bij: verhuizing vóór factuur geprint, naamsverandering, adresaanpassing</span>),
            S("p15s4", <span><strong>Voorbeeld attest 01/05:</strong><CodeBox>010521    2 N 9 N 2 N    010521    N</CodeBox></span>),
          ],
          note: <span>Door het jaar enkel bij: recente aansluiting annuleren (begindatum contract), of attest wg niet op eigen naam.</span>,
        },
        {
          number: 16,
          title: language === "NL" ? "Overlijden registreren" : "Enregistrer un décès",
          steps: [
            S("p16s1", <span>Klant opzoeken via <ScreenBadge>MSGFA</ScreenBadge></span>),
            S("p16s2", <span><KeyBadge>F R FAM</KeyBadge> → commentaar: <code className="bg-gray-100 px-1 rounded text-xs">"b0x overleden op xx/xx/xx"</code></span>),
            S("p16s3", <span>Aanvangsdatum + einddatum overledene aanpassen naar <strong>1ste van de maand</strong> volgend op overlijden</span>),
            S("p16s4", <span>Indien b01 overledene: aansluitingsnummer partner overtypen (briefwisseling op naam overledene voorkomen)</span>),
          ],
        },
        {
          number: 17,
          title: language === "NL" ? "Klant verhuist" : "Client déménage",
          steps: [
            S("p17s1", <span>Adres aanpassen in <ScreenBadge>S1ASI</ScreenBadge></span>),
          ],
        },
        {
          number: 18,
          title: language === "NL" ? "Klant komt achteraf met attest (einddatum)" : "Client apporte ultérieurement une attestation (date de fin)",
          steps: [
            S("p18s1", <span>Lijn toevoegen met periode aansluiting</span>),
            S("p18s2", <span><strong>Voorbeeld: attest vanaf 12/02:</strong><CodeBox>{`Lijn 1: AANV 01/06  W=2 I=N Z=9 E=N T=2 K=N  (geen einde)  X=N\nLijn 2: AANV 01/02  W=2 I=N Z=9 E=N T=2 K=N  EINDD 31/05   X=N`}</CodeBox></span>),
          ],
        },
        {
          number: 19,
          title: language === "NL" ? "Klant wil vroeger aansluiten (achteraf attest)" : "Client veut s'affilier plus tôt (attestation ultérieure)",
          steps: [
            S("p19s1", <span>Lijn toevoegen met periode</span>),
            S("p19s2", <span>Nieuwe kaart schrappen</span>),
            S("p19s3", <span><strong>Voorbeeld:</strong><CodeBox>{`Lijn 1: AANV 01/06  W=2 I=Y Z=9 E=N T=2 K=N  (geen einde)  X=N\nLijn 2: AANV 01/05  W=2 I=N Z=9 E=N T=2 K=N  EINDD 31/05   X=N`}</CodeBox></span>),
          ],
        },
        {
          number: 20,
          title: language === "NL" ? "Polis wijzigen van Basis naar Uitgebreid" : "Modifier police de Base à Étendue",
          steps: [
            S("p20s1", <span>W, I en T aanpassen</span>),
            S("p20s2", <span>Begindatum aanpassen naar komende hoofdvervaldag</span>),
            S("p20s3", <span><strong>Voorbeeld:</strong><CodeBox>AANV 01/09  W=1 I=Y Z=9 E=N T=– K=N  X=N</CodeBox></span>),
          ],
        },
        {
          number: 21,
          title: language === "NL" ? "Overname van bestaande polis Ethias" : "Reprise d'une police Ethias existante",
          steps: [
            S("p21s1", <span><ScreenBadge>MSIFA</ScreenBadge> → #gezinsnummer/startdatum → <KeyBadge>Enter</KeyBadge></span>),
            S("p21s2", <span><KeyBadge>R</KeyBadge> ipv 0 bij degene die weggaat → <KeyBadge>F1</KeyBadge></span>),
            S("p21s3", <span>Aansluitingsnummer aanpassen en aanvullen</span>),
          ],
        },
      ],
    },
    {
      section: language === "NL" ? "Deel IV — Varia" : "Partie IV — Divers",
      sectionColor: "purple",
      procedures: [
        {
          number: 22,
          title: language === "NL" ? "Meldingen toevoegen en verwijderen" : "Ajouter et supprimer des notifications",
          steps: [
            S("p22s1", <span>Klant opzoeken via <ScreenBadge>MSGFA</ScreenBadge></span>),
            S("p22s2", <span>Toevoegen: <KeyBadge>G I 04</KeyBadge></span>),
            S("p22s3", <span>Verwijderen: <KeyBadge>G –</KeyBadge> (2× Tab) <KeyBadge>A</KeyBadge></span>),
          ],
        },
        {
          number: 23,
          title: language === "NL" ? "Attest aansluiting afdrukken" : "Imprimer attestation d'affiliation",
          steps: [
            S("p23s1", <span>Klant opzoeken via <ScreenBadge>MSGFA</ScreenBadge></span>),
            S("p23s2", <span><KeyBadge>F I ATT 30082021</KeyBadge> of <KeyBadge>F I ATT 30082021/m:adres@provider.be</KeyBadge></span>),
          ],
        },
        {
          number: 24,
          title: language === "NL" ? "Kaartnummer opzoeken" : "Rechercher le numéro de carte",
          steps: [
            S("p24s1", <span>Klant opzoeken via <ScreenBadge>MSGFA</ScreenBadge> → <KeyBadge>F10</KeyBadge></span>),
            S("p24s2", <span>Let op: altijd <KeyBadge>004</KeyBadge> vooraan toevoegen aan het nummer</span>),
          ],
        },
        {
          number: 25,
          title: language === "NL" ? "Klant wil nieuwe Assurcard" : "Client veut une nouvelle Assurcard",
          steps: [
            S("p25s1", <span>Klant opzoeken via <ScreenBadge>MSGFA</ScreenBadge></span>),
            S("p25s2", <span><strong>Optie 1:</strong> <KeyBadge>F I LAS</KeyBadge> of <KeyBadge>F I LAS m:adres@provider.be</KeyBadge></span>),
            S("p25s3", <span><strong>Optie 2:</strong> <KeyBadge>F10</KeyBadge> in memoscherm → oude Assurcard selecteren + kopiëren</span>),
            S("p25s4", <span><KeyBadge>G S CAR B0x/oud Assurcardnummer</KeyBadge> → <KeyBadge>G I CAR B0x</KeyBadge></span>),
          ],
        },
        {
          number: 26,
          title: language === "NL" ? "Nakijken meldingen andere diensten" : "Vérifier notifications d'autres services",
          steps: [
            S("p26s1", <span>Klant opzoeken via <ScreenBadge>S1ASI</ScreenBadge></span>),
            S("p26s2", <span>Overlijden met datum aanwezig: niks doen</span>),
            S("p26s3", <span>Boekhouding: <span className="font-mono text-blue-600 text-xs">boekhouding@ethias.be</span> | tel. <KeyBadge>2365</KeyBadge></span>),
            S("p26s4", <span>Geen datum: mail naar <span className="font-mono text-blue-600 text-xs">info.persoonsgegevens@ethias.be</span></span>),
            S("p26s5", <span>Met kosten: mail naar <span className="font-mono text-blue-600 text-xs">schade.gezondheidszorg@ethias.be</span></span>),
            S("p26s6", <span>Particulieren: <span className="font-mono text-blue-600 text-xs">contract.hospiparticulier@ethias.be</span></span>),
            S("p26s7", <span>Individueel verderzetten: <KeyBadge>G I 20 P 22524/info medinext b02 010921</KeyBadge></span>),
            S("p26s8", <span>Via groep verderzetten: <KeyBadge>G I 20 P 22524/naar polis …. 010921</KeyBadge></span>),
          ],
        },
        {
          number: 27,
          title: language === "NL" ? "Alles verwijderen / rechtzetting" : "Tout supprimer / correction",
          steps: [
            S("p27s1", <span><KeyBadge>F S FAM</KeyBadge> opnieuw uitvoeren</span>),
            S("p27s2", <span>Onder hoedanigheid bij iedere persoon: <KeyBadge>*</KeyBadge></span>),
          ],
        },
        {
          number: 28,
          title: language === "NL" ? "Salesforce afsluiten (case)" : "Clôturer Salesforce (case)",
          steps: [
            S("p28s1", <span>Status: Gekwalificeerd → Sluiten</span>),
            S("p28s2", <span>Subtype: Wijziging</span>),
          ],
        },
        {
          number: 29,
          title: language === "NL" ? "Polisvoorwaarden opzoeken" : "Rechercher conditions de police",
          steps: [
            S("p29s1", <span>Polis opzoeken via <ScreenBadge>MSGPO</ScreenBadge> (polisnummer bedrijf + type 2) → <KeyBadge>F11</KeyBadge></span>),
            S("p29s2", <span>Op Waarborg klikken → <KeyBadge>Enter</KeyBadge></span>),
          ],
        },
        {
          number: 30,
          title: language === "NL" ? "Klant opzoeken zonder individueel polisnummer" : "Rechercher client sans numéro de police individuel",
          steps: [
            S("p30s1", <span>Polis opzoeken via <ScreenBadge>MSGFA</ScreenBadge></span>),
            S("p30s2", <span>Type <KeyBadge>2</KeyBadge> + naam</span>),
          ],
        },
        {
          number: 31,
          title: language === "NL" ? "Standaardbrief: vroeger stoppen zonder attest" : "Lettre standard: arrêt anticipé sans attestation",
          steps: [
            S("p31s1", <span>
              Stuur onderstaande standaardbrief:
              <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 leading-relaxed italic">
                "Stopzetting is enkel mogelijk op de hoofdvervaldag. Uitzondering: overstap naar hospitalisatieverzekering via werkgever. Attest van nieuwe verzekeraar met aanvangsdatum vereist. Voorlopige opzeg op eerstkomende hoofdvervaldag."
              </div>
            </span>),
          ],
        },
        {
          number: 32,
          title: language === "NL" ? "Rekeningnummers" : "Numéros de compte",
          steps: [
            S("p32s1", <span>
              <div className="space-y-2 mt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-36">Gewone facturatie:</span>
                  <span className="font-mono font-semibold text-gray-800 text-sm">BE89 0963 6391 1685</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-36">Rappel:</span>
                  <span className="font-mono font-semibold text-gray-800 text-sm">BE72 0910 0078 4416</span>
                </div>
              </div>
            </span>),
          ],
        },
      ],
    },
    {
      section: language === "NL" ? "Mailbox SMMSG" : "Boîte mail SMMSG",
      sectionColor: "indigo",
      procedures: [
        {
          number: 1,
          title: language === "NL" ? "Mailbox openen en klant opzoeken" : "Ouvrir mailbox et rechercher client",
          steps: [
            S("mb1s1", <span><KeyBadge>P21521</KeyBadge> ipv P12340</span>),
            S("mb1s2", <span>Klantnummer kopiëren in <ScreenBadge>S1GSI</ScreenBadge> → mail openen via <KeyBadge>@</KeyBadge></span>),
            S("mb1s3", <span>Gezinsnummer kopiëren in <ScreenBadge>MSGFA</ScreenBadge> → mail openen via <KeyBadge>@</KeyBadge></span>),
          ],
        },
        {
          number: 2,
          title: language === "NL" ? "Mail behandelen" : "Traiter un mail",
          steps: [
            S("mb2s1", <span>Aanvaarding: <KeyBadge>Y</KeyBadge></span>),
            S("mb2s2", <span>Uitleg typen → <KeyBadge>Enter</KeyBadge> → <KeyBadge>F1</KeyBadge></span>),
            S("mb2s3", <span>Mail sturen met BCC: <span className="font-mono text-blue-600 text-xs">gedi</span></span>),
            S("mb2s4", <span>Aan: mail opzoeken in <ScreenBadge>S1GSI</ScreenBadge></span>),
            S("mb2s5", <span>Onderwerp: <KeyBadge>&gt;aklantnrt888&lt;</KeyBadge> (indien GSI) of <KeyBadge>&gt;fmsgezinsnrt888&lt;</KeyBadge> (indien MSGFA)</span>),
          ],
        },
        {
          number: 3,
          title: language === "NL" ? "Mail doorsturen naar schade (met schadenr.)" : "Transférer mail à sinistres (avec nr sinistre)",
          steps: [
            S("mb3s1", <span>Schadenr. kopiëren achter de <KeyBadge>/</KeyBadge></span>),
            S("mb3s2", <span>Bestemming: sms schadenr. <KeyBadge>21</KeyBadge> (aan elkaar)</span>),
          ],
        },
        {
          number: 4,
          title: language === "NL" ? "Mail doorsturen naar schade (zonder schadenr.)" : "Transférer mail à sinistres (sans nr sinistre)",
          steps: [
            S("mb4s1", <span>Beheer: <KeyBadge>P21721</KeyBadge> → <KeyBadge>Enter</KeyBadge> → <KeyBadge>F1</KeyBadge></span>),
          ],
        },
        {
          number: 5,
          title: language === "NL" ? "Mail doorsturen naar schade (onze mailbox)" : "Transférer mail à sinistres (notre mailbox)",
          steps: [
            S("mb5s1", <span>Beheer: <KeyBadge>P22524</KeyBadge> → <KeyBadge>Enter</KeyBadge> → <KeyBadge>F1</KeyBadge></span>),
          ],
        },
      ],
    },
  ];

  // Filter procedures by search
  const normalizedSearch = search.toLowerCase().trim();
  const filteredSections = allProcedures
    .map((section) => ({
      ...section,
      procedures: section.procedures.filter((p) => {
        if (!normalizedSearch) return true;
        // Match on title
        if (p.title.toLowerCase().includes(normalizedSearch)) return true;
        // Match on section name
        if (section.section.toLowerCase().includes(normalizedSearch)) return true;
        return false;
      }),
    }))
    .filter((section) => section.procedures.length > 0);

  return (
    <div className="px-4 py-4 space-y-6">
      {/* Header + search */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <BookMarked className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-mathias-blue font-bold text-lg leading-tight">
              {language === "NL" ? "IMS Command Guide" : "Guide Commandes IMS"}
            </h2>
            <p className="text-xs text-gray-400">
              {language === "NL"
                ? `${allProcedures.reduce((acc, s) => acc + s.procedures.length, 0)} procedures + 19 documentcommando's in 7 secties`
                : `${allProcedures.reduce((acc, s) => acc + s.procedures.length, 0)} procédures + 19 commandes de documents en 7 sections`}
            </p>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === "NL" ? "Zoek een procedure (bv. domiciliering, overlijden, attest…)" : "Rechercher une procédure (ex. domiciliation, décès, attestation…)"}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-1 focus:ring-sky-400 focus:border-sky-400 transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <ScreenBadge>MSGFA</ScreenBadge>
            <span>{language === "NL" ? "IMS scherm" : "Écran IMS"}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <KeyBadge>F1</KeyBadge>
            <span>{language === "NL" ? "Toetsenbordactie" : "Action clavier"}</span>
          </div>
        </div>
      </div>

      {/* Sections */}
      {filteredSections.length === 0 ? null : (
        filteredSections.map((section) => (
          <div key={section.section} className="space-y-3">
            <SectionHeader
              color={section.sectionColor}
              icon={
                section.sectionColor === "blue" ? <CheckCircle2 className="w-4 h-4 text-white" /> :
                section.sectionColor === "green" ? <span className="text-white text-xs font-bold">€</span> :
                section.sectionColor === "orange" ? <ArrowRight className="w-4 h-4 text-white" /> :
                section.sectionColor === "purple" ? <BookMarked className="w-4 h-4 text-white" /> :
                section.sectionColor === "teal" ? <ExternalLink className="w-4 h-4 text-white" /> :
                <Mail className="w-4 h-4 text-white" />
              }
              title={section.section}
              subtitle={`${section.procedures.length} ${language === "NL" ? "procedure" : "procédure"}${section.procedures.length !== 1 ? "s" : ""}`}
            />
            <div className="space-y-2 pl-2">
              {section.procedures.map((proc) => (
                <Procedure
                  key={`${section.section}-${proc.number}`}
                  {...proc}
                />
              ))}
            </div>
          </div>
        ))
      )}

      {/* ── Documenten Opmaken section (compact table, always shown unless search hides it) ── */}
      <DocumentenOpmaakSection language={language} search={normalizedSearch} />

      {/* Contact info card */}
      {!normalizedSearch && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-mathias-blue font-bold text-sm mb-3 flex items-center gap-2">
            <Phone className="w-4 h-4" />
            {language === "NL" ? "Nuttige contacten" : "Contacts utiles"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { label: "Boekhouding", email: "boekhouding@ethias.be", tel: "2365" },
              { label: "Persoonsgegevens", email: "info.persoonsgegevens@ethias.be" },
              { label: "Schade gezondheidszorg", email: "schade.gezondheidszorg@ethias.be" },
              { label: "Particulieren hospi", email: "contract.hospiparticulier@ethias.be" },
            ].map(({ label, email, tel }) => (
              <div key={label} className="flex flex-col gap-0.5 p-3 bg-gray-50 rounded-lg">
                <span className="text-xs font-semibold text-gray-600">{label}</span>
                <span className="font-mono text-xs text-blue-600">{email}</span>
                {tel && <span className="text-xs text-gray-500">Tel: <span className="font-mono font-semibold">{tel}</span></span>}
              </div>
            ))}
          </div>
          {/* Rekeningnummers */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-600 mb-2">{language === "NL" ? "Rekeningnummers" : "Numéros de compte"}</p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">{language === "NL" ? "Gewone facturatie" : "Facturation ordinaire"}</span>
                <span className="font-mono font-semibold text-gray-800">BE89 0963 6391 1685</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Rappel</span>
                <span className="font-mono font-semibold text-gray-800">BE72 0910 0078 4416</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

const CUSTOM_WIDTH_KEY = "mathias_custom_chatbot_width";
const DEFAULT_CHATBOT_WIDTH = 365;
const MIN_CHATBOT_WIDTH = 280;
const MAX_CHATBOT_WIDTH = 650;

type UIMode = "default" | "custom";

export default function App() {
  const [activePolicy, setActivePolicy] = useState(POLICIES[0]);
  const [activeTab, setActiveTab] = useState<TabKey>("Polis");
  const [situationDate, setSituationDate] = useState("2026-02-22");
  const [aangesloteneNaam, setAangesloteneNaam] = useState("Janne Appleseed");
  const [chatbotVisible, setChatbotVisible] = useState(true);
  const [chatbotMode, setChatbotMode] = useState<"assistent" | "ims">("assistent");
  const [language, setLanguage] = useState<Lang>("NL");
  const [uiMode, setUiMode] = useState<UIMode>("default");
  const [chatbotWidth, setChatbotWidth] = useState(DEFAULT_CHATBOT_WIDTH);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartWidthRef = useRef(DEFAULT_CHATBOT_WIDTH);
  const { actor, isFetching } = useActor();

  // Load custom width from localStorage on mount / when switching to custom mode
  useEffect(() => {
    if (uiMode === "custom") {
      const stored = localStorage.getItem(CUSTOM_WIDTH_KEY);
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed >= MIN_CHATBOT_WIDTH && parsed <= MAX_CHATBOT_WIDTH) {
          setChatbotWidth(parsed);
        }
      }
    } else {
      setChatbotWidth(DEFAULT_CHATBOT_WIDTH);
    }
  }, [uiMode]);

  // Drag resize handlers
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (uiMode !== "custom") return;
    e.preventDefault();
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartWidthRef.current = chatbotWidth;
    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const delta = dragStartXRef.current - moveEvent.clientX;
      const newWidth = Math.min(MAX_CHATBOT_WIDTH, Math.max(MIN_CHATBOT_WIDTH, dragStartWidthRef.current + delta));
      setChatbotWidth(newWidth);
      localStorage.setItem(CUSTOM_WIDTH_KEY, String(newWidth));
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [uiMode, chatbotWidth]);

  const handleReset = () => {
    localStorage.removeItem(CUSTOM_WIDTH_KEY);
    setChatbotWidth(DEFAULT_CHATBOT_WIDTH);
    // Stay in custom mode
  };

  const effectiveChatbotWidth = uiMode === "custom" ? chatbotWidth : DEFAULT_CHATBOT_WIDTH;

  const t = TRANSLATIONS[language];

  const handleAangesloteneEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const name = aangesloteneNaam.trim();
      if (name) {
        window.open(buildSalesforceUrl(name), "_blank", "noopener,noreferrer");
      }
      setActiveTab("Salesforce");
    }
  };

  // Local brochure-based chat state
  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([]);
  const [isChatSending, setIsChatSending] = useState(false);

  // Conversation context ref: tracks last recognised org + topic
  const lastContextRef = useRef<{ lastOrg?: string; lastTopic?: string }>({});

  // Initialize policy on mount
  useEffect(() => {
    if (!actor || isFetching) return;
    actor.initializePolicy(POLICIES[0]).catch(console.error);
  }, [actor, isFetching]);

  // Handle local brochure-based message sending
  const handleSendMessage = (content: string) => {
    const userMsg: LocalMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
    };
    setLocalMessages((prev) => [...prev, userMsg]);
    setIsChatSending(true);

    // Small delay for UX
    setTimeout(() => {
      const result = zoekInBrochures(content, lastContextRef.current, t);
      let antwoord: string;
      let bron: string | undefined;

      if (result && result.bron) {
        antwoord = result.antwoord;
        bron = `${t.bronLabel}: ${result.bron}`;

        // Update conversation context for follow-up questions
        const detectedOrg = detectOrgInQuery(content) ?? lastContextRef.current.lastOrg;
        const detectedTopic = detectVraagType(content);
        lastContextRef.current = {
          lastOrg: detectedOrg ?? result.bron.split(" + ")[0],
          lastTopic: detectedTopic,
        };
      } else if (result) {
        // Fallback result (no bron = no match)
        antwoord = result.antwoord;
        bron = undefined;
      } else {
        // Should not happen — zoekInBrochures always returns something
        const orgNamen = BROCHURE_KENNISBANK.slice(0, 3).map((b) => b.naam).join(", ");
        antwoord = t.noMatchTekst(orgNamen, BROCHURE_KENNISBANK.length);
      }

      const botMsg: LocalMessage = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: antwoord,
        bron,
      };
      setLocalMessages((prev) => [...prev, botMsg]);
      setIsChatSending(false);
    }, 400);
  };

  // Policy data
  const { data: familyMembers = [] } = useQuery<FamilyMember[]>({
    queryKey: ["family", activePolicy],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFamilyMembers(activePolicy);
    },
    enabled: !!actor && !isFetching,
  });

  const { data: guarantees = [] } = useQuery<Guarantee[]>({
    queryKey: ["guarantees", activePolicy],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getGuarantees(activePolicy);
    },
    enabled: !!actor && !isFetching,
  });

  return (
    <div className="flex">
    {/* ── Main content (offset by sidebar width when visible) ── */}
    <div
      className="flex-1 min-w-0 transition-all duration-300"
      style={{ marginRight: chatbotVisible ? `${effectiveChatbotWidth}px` : "0px" }}
    >
    <div className="min-h-screen bg-mathias-blue-separator font-sans">

      {/* ── Custom UI mode banner ── */}
      {uiMode === "custom" && (
        <div className="bg-sky-600 text-white text-xs font-medium px-4 py-1.5 flex items-center justify-center gap-2 select-none">
          <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
          <span>{t.uiModeBanner}</span>
        </div>
      )}

      {/* ── White header section ── */}
      <div className="bg-white shadow-sm">
        {/* Top bar */}
        <div className="max-w-7xl mx-auto px-4 pt-3 pb-2">
          <div className="flex items-center justify-between">
            {/* Left: Logo + NL/FR toggle + UI mode toggle */}
            <div className="flex items-center gap-3">
              {/* Logo */}
              <MathiasAvatar />
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold text-gray-900 tracking-tight">MATHIAS</span>
                  <span className="text-xl font-script text-mathias-blue italic font-bold">Pro</span>
                </div>
                <p className="text-xs text-gray-400 tracking-widest uppercase">{t.subtitle}</p>
              </div>

              {/* NL/FR toggle */}
              <div className="flex rounded-full border border-gray-300 overflow-hidden text-xs font-medium ml-4">
                <button
                  type="button"
                  onClick={() => setLanguage("NL")}
                  className={`px-3 py-1 transition-colors ${language === "NL" ? "bg-mathias-blue text-white" : "text-gray-500 hover:bg-gray-50"}`}
                >
                  NL
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("FR")}
                  className={`px-3 py-1 transition-colors border-l border-gray-300 ${language === "FR" ? "bg-mathias-blue text-white" : "text-gray-500 hover:bg-gray-50"}`}
                >
                  FR
                </button>
              </div>

              {/* UI Mode toggle */}
              <div className="flex items-center gap-1.5">
                <div className="flex rounded-full border border-gray-300 overflow-hidden text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setUiMode("default")}
                    title={t.uiModeDefault}
                    className={`flex items-center gap-1.5 px-3 py-1 transition-colors ${
                      uiMode === "default"
                        ? "bg-gray-700 text-white"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <Lock className="w-3 h-3" />
                    {t.uiModeDefault}
                  </button>
                  <button
                    type="button"
                    onClick={() => setUiMode("custom")}
                    title={t.uiModeCustom}
                    className={`flex items-center gap-1.5 px-3 py-1 transition-colors border-l border-gray-300 ${
                      uiMode === "custom"
                        ? "bg-sky-600 text-white"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <SlidersHorizontal className="w-3 h-3" />
                    {t.uiModeCustom}
                  </button>
                </div>

                {/* Reset button — only visible in custom mode */}
                {uiMode === "custom" && (
                  <button
                    type="button"
                    onClick={handleReset}
                    title={t.uiModeReset}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    {t.uiModeReset}
                  </button>
                )}
              </div>
            </div>

            {/* Right: Policy buttons */}
            <div className="flex gap-2">
              {POLICIES.map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setActivePolicy(p)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    activePolicy === p
                      ? "bg-mathias-blue text-white border-mathias-blue shadow-sm"
                      : "border-mathias-blue text-mathias-blue hover:bg-sky-50"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Info row */}
          <div
            className="flex items-center justify-between mt-2 pb-2 border-t border-gray-50 pt-2 rounded transition-all"
            style={uiMode === "custom" ? { outline: "2px dashed #7dd3fc", outlineOffset: "2px", paddingLeft: "0.5rem", paddingRight: "0.5rem" } : undefined}
          >
            <div className="flex items-center gap-6 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="text-gray-400 uppercase tracking-wide">{t.aangeslotene} : </span>
                <input
                  type="text"
                  value={aangesloteneNaam}
                  onChange={(e) => setAangesloteneNaam(e.target.value)}
                  onKeyDown={handleAangesloteneEnter}
                  title="Druk Enter om te zoeken in Salesforce"
                  className="font-medium text-gray-700 text-xs bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-sky-400 focus:outline-none focus:ring-0 transition-colors px-0.5 py-0 min-w-[120px] max-w-[200px] cursor-text"
                />
              </span>
              <span><span className="text-gray-400 uppercase tracking-wide">{t.taal} : </span><span className="font-medium text-gray-700">{language}</span></span>
            </div>
            <div className="flex items-center gap-6 text-xs text-gray-500">
              <span><span className="text-gray-400 uppercase tracking-wide">{t.nrExternAanhangsel} : </span><span className="font-medium text-gray-700">123456</span></span>
              <span><span className="text-gray-400 uppercase tracking-wide">{t.onderwerp} : </span><span className="font-medium text-gray-700">Adreswijziging</span></span>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-1">
            <nav className="flex items-center gap-1">
              {TAB_KEYS.map((key) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                    activeTab === key
                      ? "text-mathias-blue"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {String(t[TAB_LABEL_KEYS[key]])}
                  {activeTab === key && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-mathias-blue rounded-full" />
                  )}
                </button>
              ))}
            </nav>

            {/* Date picker */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-xs text-gray-500">{t.situatieDatum}</span>
              <CalendarPicker
                value={situationDate}
                onChange={setSituationDate}
                language={language}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Blue separator ── */}
      <div className="h-5 bg-mathias-blue-separator" />

      {/* ── Tab content ── */}
      <div
        className="max-w-7xl mx-auto transition-all"
        style={uiMode === "custom" ? { outline: "2px dashed #bae6fd", outlineOffset: "1px", borderRadius: "0.5rem" } : undefined}
      >
        {activeTab === "Polis" && <PoliceTab policyNumber={activePolicy} t={t} />}
        {activeTab === "Gezin" && <FamilleTab members={familyMembers} t={t} />}
        {activeTab === "Garanties" && <GarantiesTab guarantees={guarantees} t={t} />}
        {activeTab === "Documenten" && <DocumentsTab t={t} />}
        {activeTab === "Salesforce" && <SalesforceTab prefillName={aangesloteneNaam} t={t} />}
        {activeTab === "Opzoeken" && <IMSTab prefillName={aangesloteneNaam} t={t} language={language} />}
        {activeTab === "Commands" && <CommandsTab t={t} language={language} />}
      </div>


    </div>
    </div>

    {/* ── Toggle button (always visible) ── */}
    <button
      type="button"
      onClick={() => setChatbotVisible((v) => !v)}
      title={chatbotVisible ? t.chatbotHide : t.chatbotShow}
      className="fixed top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-6 h-16 bg-mathias-blue hover:bg-sky-700 text-white rounded-l-lg shadow-md transition-colors"
      style={{ right: chatbotVisible ? `${effectiveChatbotWidth}px` : "0px", transition: "right 0.3s" }}
    >
      {chatbotVisible ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      )}
    </button>

    {/* ── Fixed Right Sidebar: Mathias Chatbot ── */}
    <div
      className={`fixed right-0 top-0 bottom-0 bg-white border-l border-gray-200 shadow-lg flex flex-col z-10 transition-transform duration-300 ${chatbotVisible ? "translate-x-0" : "translate-x-full"}`}
      style={{ width: `${effectiveChatbotWidth}px` }}
    >
      {/* Drag resize handle — only in custom mode */}
      {uiMode === "custom" && (
        <button
          type="button"
          onMouseDown={handleDragStart}
          aria-label="Sleep om breedte aan te passen"
          title="Sleep om te resizen"
          className="absolute top-0 bottom-0 w-2.5 cursor-ew-resize z-30 group flex items-center justify-center bg-transparent border-0 p-0 focus:outline-none"
          style={{ left: "-4px" }}
        >
          {/* Visible strip */}
          <div className="w-1 h-full bg-sky-300 group-hover:bg-sky-500 group-active:bg-sky-600 transition-colors opacity-60 group-hover:opacity-100 rounded-l" />
        </button>
      )}

      {/* Sidebar header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 bg-white shrink-0">
        <div className="w-7 h-7 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-sky-600">M</span>
        </div>
        <span className="font-semibold text-gray-800 text-sm shrink-0">Mathias</span>

        {/* Mode toggle: Assistent | IMS */}
        <div className="flex items-center rounded-full border border-gray-200 overflow-hidden text-[10px] font-semibold ml-1">
          <button
            type="button"
            onClick={() => setChatbotMode("assistent")}
            className={`px-2.5 py-1 transition-colors ${
              chatbotMode === "assistent"
                ? "bg-sky-500 text-white"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            {t.chatbotModeAssistent}
          </button>
          <button
            type="button"
            onClick={() => setChatbotMode("ims")}
            className={`px-2.5 py-1 transition-colors border-l border-gray-200 ${
              chatbotMode === "ims"
                ? "bg-green-600 text-white"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            {t.chatbotModeIMS}
          </button>
        </div>

        {uiMode === "custom" && (
          <span className="text-[9px] font-medium text-sky-500 bg-sky-50 border border-sky-200 rounded-full px-1 py-0.5 leading-none shrink-0">
            {chatbotWidth}px
          </span>
        )}
        <button
          type="button"
          onClick={() => setChatbotVisible(false)}
          title={t.chatbotHide}
          className="ml-auto p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      {/* Chatbot fills remaining space */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {chatbotMode === "assistent" ? (
          <Chatbot
            messages={localMessages}
            onSend={handleSendMessage}
            isSending={isChatSending}
            sidebar
            t={t}
            language={language}
          />
        ) : (
          <IMSChatPanel
            language={language}
            t={t}
            lastUserMessage={localMessages.filter(m => m.role === "user").at(-1)?.content ?? ""}
          />
        )}
      </div>
    </div>

    </div>
  );
}
