import { useState, useEffect, useRef, useCallback } from "react";

// ── Thèmes ─────────────────────────────────────────────────────────────────
const DARK = {
  bg: "#0f0f13",
  surface: "#1a1a22",
  hover: "#22222e",
  border: "#2e2e3e",
  accent: "#6c63ff",
  accentL: "#8b85ff",
  green: "#22c55e",
  red: "#ef4444",
  amber: "#f59e0b",
  blue: "#3b82f6",
  pink: "#ec4899",
  teal: "#14b8a6",
  text: "#e8e8f0",
  muted: "#8888a0",
  faint: "#4a4a60",
};
const LIGHT = {
  bg: "#f4f4f8",
  surface: "#ffffff",
  hover: "#f0f0f6",
  border: "#dddde8",
  accent: "#5b52e8",
  accentL: "#6c63ff",
  green: "#16a34a",
  red: "#dc2626",
  amber: "#d97706",
  blue: "#2563eb",
  pink: "#db2777",
  teal: "#0d9488",
  text: "#1a1a2e",
  muted: "#6b6b80",
  faint: "#b0b0c0",
};

// T = alias utilisé par les composants exercices (toujours dark pour cohérence)
const T = DARK;

// ── Composants partagés ────────────────────────────────────────────────────
const Badge = ({ c = T.accent, children }) => (
  <span
    style={{
      background: c + "22",
      color: c,
      border: `1px solid ${c}44`,
      borderRadius: 6,
      padding: "2px 8px",
      fontSize: 11,
      fontWeight: 600,
      display: "inline-block",
      marginRight: 4,
    }}
  >
    {children}
  </span>
);
const Card = ({ children, style = {} }) => (
  <div
    style={{
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: 12,
      padding: "1.2rem 1.4rem",
      marginBottom: "1rem",
      ...style,
    }}
  >
    {children}
  </div>
);
const Formula = ({ children }) => (
  <div
    style={{
      background: "#0a0a12",
      border: `1px solid ${T.border}`,
      borderRadius: 8,
      padding: ".6rem 1rem",
      fontSize: 13,
      color: T.accentL,
      margin: ".6rem 0",
      fontFamily: "'JetBrains Mono',monospace",
      lineHeight: 1.8,
      whiteSpace: "pre-wrap",
    }}
  >
    {children}
  </div>
);
const STitle = ({ children }) => (
  <h3
    style={{
      fontSize: 13,
      fontWeight: 600,
      color: T.muted,
      textTransform: "uppercase",
      letterSpacing: ".1em",
      marginBottom: ".9rem",
      paddingBottom: ".6rem",
      borderBottom: `1px solid ${T.border}`,
    }}
  >
    {children}
  </h3>
);
const TTable = ({ headers, rows }) => (
  <div style={{ overflowX: "auto", margin: ".6rem 0" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr>
          {headers.map((h) => (
            <th
              key={h}
              style={{
                background: "#0a0a12",
                color: T.accentL,
                padding: "6px 14px",
                textAlign: "center",
                border: `1px solid ${T.border}`,
                fontFamily: "'JetBrains Mono',monospace",
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} style={{ background: i % 2 === 0 ? T.surface : T.hover }}>
            {row.map((cell, j) => (
              <td
                key={j}
                style={{
                  padding: "5px 14px",
                  textAlign: "center",
                  border: `1px solid ${T.border}`,
                  color:
                    cell === "1" ? T.green : cell === "0" ? T.muted : T.text,
                  fontFamily: "'JetBrains Mono',monospace",
                }}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ── Utilitaire shuffle ─────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Données flashcards ─────────────────────────────────────────────────────
const FLASHCARDS = {
  binaire: [
    {
      q: "Qu'est-ce qu'un bit ?",
      a: "L'unité minimale d'information — 0 ou 1 (binary digit).",
      cat: "Définition",
    },
    {
      q: "Combien de valeurs représente 1 octet ?",
      a: "2⁸ = 256 valeurs (de 0 à 255). 1 octet = 8 bits.",
      cat: "Définition",
    },
    {
      q: "Convertis 10110₍₂₎ en décimal.",
      a: "1×16 + 0×8 + 1×4 + 1×2 + 0×1 = 22₍₁₀₎",
      cat: "Conversion",
    },
    {
      q: "Convertis 42₍₁₀₎ en binaire.",
      a: "32+8+2=42 → 00101010₍₂₎",
      cat: "Conversion",
    },
    {
      q: "Que vaut 11111111₍₂₎ en décimal ?",
      a: "128+64+32+16+8+4+2+1 = 255",
      cat: "Conversion",
    },
    {
      q: "Comment reconnaître un nombre binaire pair ?",
      a: "Il se termine par 0. Impair → se termine par 1.",
      cat: "Astuce",
    },
    {
      q: "Différence signal analogique vs numérique ?",
      a: "Analogique = continu. Numérique = discret (0 ou 1 seulement).",
      cat: "Définition",
    },
    {
      q: "Pourquoi les ordinateurs utilisent le binaire ?",
      a: "L'électricité a deux états : courant (1) ou pas de courant (0).",
      cat: "Concept",
    },
    {
      q: "Que vaut 2⁷ ?",
      a: "128. C'est le bit de poids fort dans un octet.",
      cat: "Formule",
    },
    {
      q: "Convertis 97₍₁₀₎ en binaire.",
      a: "64+32+1=97 → 01100001₍₂₎",
      cat: "Conversion",
    },
  ],
  texte: [
    {
      q: "Que signifie ASCII ?",
      a: "American Standard Code for Information Interchange.",
      cat: "Définition",
    },
    {
      q: "Code ASCII de 'A' majuscule ?",
      a: "65. Majuscules : A=65 à Z=90.",
      cat: "Mémo",
    },
    {
      q: "Code ASCII de 'a' minuscule ?",
      a: "97. Différence majuscule/minuscule = 32.",
      cat: "Mémo",
    },
    {
      q: "Combien de caractères dans ASCII ?",
      a: "128 caractères (0 à 127), uniquement en anglais.",
      cat: "Définition",
    },
    {
      q: "Taille max d'un caractère en UTF-8 ?",
      a: "4 octets (de 1 à 4 selon le caractère).",
      cat: "Définition",
    },
    {
      q: "UTF-8 est-il compatible avec ASCII ?",
      a: "Oui, les 128 premiers caractères UTF-8 sont identiques à ASCII.",
      cat: "Concept",
    },
    { q: "Code ASCII de l'espace ?", a: "32.", cat: "Mémo" },
    {
      q: "Comment trouver le code ASCII d'une minuscule ?",
      a: "Ajouter 32 au code de la majuscule. Ex: A=65 → a=97",
      cat: "Astuce",
    },
  ],
  images: [
    {
      q: "Profondeur de couleur d'une image RVB ?",
      a: "24 bpp = 3 canaux (R,V,B) × 8 bits chacun.",
      cat: "Définition",
    },
    {
      q: "Formule taille mémoire d'une image ?",
      a: "Taille (bits) = largeur × hauteur × profondeur",
      cat: "Formule",
    },
    {
      q: "Différence définition vs résolution ?",
      a: "Définition = total pixels. Résolution = densité DPI. Faux ami !",
      cat: "Concept",
    },
    {
      q: "Qu'est-ce que le filtre de Bayer ?",
      a: "Grille sur le capteur : 50% vert, 25% rouge, 25% bleu.",
      cat: "Définition",
    },
    {
      q: "Valeur d'un pixel blanc en niveaux de gris ?",
      a: "255 (intensité maximale). 0 = noir.",
      cat: "Mémo",
    },
    {
      q: "Profondeur d'une image en niveaux de gris ?",
      a: "8 bpp → 2⁸ = 256 niveaux.",
      cat: "Définition",
    },
    {
      q: "Image matricielle vs vectorielle ?",
      a: "Matricielle = pixels (perd qualité si agrandie). Vectorielle = équations (sans perte).",
      cat: "Concept",
    },
    {
      q: "Taille d'une image 640×480 en 24 bpp ?",
      a: "640×480×24÷8 = 921 600 octets = 900 Ko",
      cat: "Calcul",
    },
    {
      q: "Taux de compression = ?",
      a: "1 - (taille finale / taille initiale)",
      cat: "Formule",
    },
    {
      q: "Photosite vs Pixel ?",
      a: "Photosite = capteur physique. Pixel = reconstitution numérique.",
      cat: "Concept",
    },
  ],
  son: [
    {
      q: "Différence fréquence et amplitude ?",
      a: "Fréquence = vitesse → aigu/grave. Amplitude = hauteur → volume.",
      cat: "Définition",
    },
    {
      q: "Les 3 étapes de numérisation du son ?",
      a: "1. Échantillonnage → 2. Quantification → 3. Encodage",
      cat: "Mémo",
    },
    {
      q: "Qu'est-ce que l'échantillonnage ?",
      a: "Découper le signal en tranches régulières. Fréquence = nb mesures/s.",
      cat: "Définition",
    },
    {
      q: "Qu'est-ce que la quantification ?",
      a: "Attribuer une valeur binaire à l'amplitude de chaque échantillon.",
      cat: "Définition",
    },
    {
      q: "Théorème de Shannon ?",
      a: "Fréquence d'échantillonnage > 40 kHz pour l'oreille humaine (20–20 000 Hz).",
      cat: "Formule",
    },
    {
      q: "Le son se propage-t-il dans le vide ?",
      a: "Non. Il nécessite un milieu matériel (air, eau…).",
      cat: "Concept",
    },
    {
      q: "Son aigu = quelle fréquence ?",
      a: "Fréquence élevée (vibrations rapides).",
      cat: "Concept",
    },
    {
      q: "Signal analogique = ?",
      a: "Signal qui varie de façon continue (courbe sinusoïdale).",
      cat: "Définition",
    },
  ],
  redondance: [
    {
      q: "Principe de redondance ?",
      a: "Dupliquer les fonctions critiques pour augmenter la fiabilité.",
      cat: "Définition",
    },
    {
      q: "Système résilient = ?",
      a: "Continue de fonctionner malgré une panne d'un composant.",
      cat: "Définition",
    },
    {
      q: "Comment fonctionne le bit de parité ?",
      a: "Bit = 0 si somme paire, 1 si impaire. Somme totale toujours paire.",
      cat: "Définition",
    },
    {
      q: "Combien d'erreurs détecte le bit de parité ?",
      a: "1 seule. 2 erreurs simultanées s'annulent → non détectées.",
      cat: "Limite",
    },
    {
      q: "Bit de parité pour 1110001 ?",
      a: "Somme=4 (paire) → parité=0. Transmis : 11100010.",
      cat: "Calcul",
    },
    {
      q: "Qu'est-ce qu'un checksum ?",
      a: "Empreinte numérique compacte transmise avec les données.",
      cat: "Définition",
    },
    {
      q: "Fonction de hachage ?",
      a: "1 bit modifié → hash totalement différent. Utilisé dans la blockchain.",
      cat: "Définition",
    },
  ],
  portes: [
    {
      q: "Règle porte ET (AND) ?",
      a: "Sortie = 1 seulement si A=1 ET B=1. Sinon = 0.",
      cat: "Règle",
    },
    {
      q: "Règle porte OU (OR) ?",
      a: "Sortie = 1 si au moins une entrée = 1.",
      cat: "Règle",
    },
    {
      q: "Règle porte NON (NOT) ?",
      a: "Inverse l'entrée : 0→1 et 1→0.",
      cat: "Règle",
    },
    {
      q: "Règle porte XOR ?",
      a: "Sortie = 1 si A≠B. Sortie = 0 si A=B (même si les deux sont à 1).",
      cat: "Règle",
    },
    {
      q: "Règle porte NAND ?",
      a: "Inverse de ET : sortie = 0 seulement si A=1 ET B=1.",
      cat: "Règle",
    },
    { q: "XOR si A=1 et B=0 ?", a: "1. Car A≠B.", cat: "Calcul" },
    {
      q: "NAND si A=0 et B=1 ?",
      a: "1. ET(0,1)=0 → NAND inverse → 1.",
      cat: "Calcul",
    },
  ],
  additionneurs: [
    {
      q: "1+1 en binaire ?",
      a: "10₍₂₎ = retenue de 1 et somme de 0.",
      cat: "Calcul",
    },
    {
      q: "Demi-additionneur ?",
      a: "2 entrées (A,B) → 2 sorties : S₀=XOR(A,B), S₁=ET(A,B).",
      cat: "Définition",
    },
    {
      q: "Limite du demi-additionneur ?",
      a: "Ne prend pas en compte une retenue entrante (Cᵢₙ).",
      cat: "Limite",
    },
    {
      q: "Additionneur complet ?",
      a: "3 entrées (A, B, Cᵢₙ) et 2 sorties (S, Cₒᵤₜ). Chainable.",
      cat: "Définition",
    },
    {
      q: "Comment chaîner des additionneurs ?",
      a: "Connecter Cₒᵤₜ du premier au Cᵢₙ du suivant.",
      cat: "Concept",
    },
    {
      q: "S₀ dans un demi-additionneur = ?",
      a: "XOR(A,B). C'est le bit de somme.",
      cat: "Formule",
    },
    {
      q: "S₁ dans un demi-additionneur = ?",
      a: "ET(A,B). C'est le bit de retenue.",
      cat: "Formule",
    },
    {
      q: "Additionneur complet : S si A=1,B=1,Cᵢₙ=1 ?",
      a: "S=1, Cₒᵤₜ=1. Car 1+1+1=3=11₍₂₎.",
      cat: "Calcul",
    },
  ],
};

// ── Métadonnées sections ───────────────────────────────────────────────────
const SECTIONS_META = {
  binaire: [
    { id: "ana_num", label: "Analogique vs Numérique", type: "concept" },
    { id: "sys_bin", label: "Système binaire", type: "formule" },
    { id: "b2d", label: "Binaire → Décimal", type: "exemple" },
    { id: "d2b", label: "Décimal → Binaire", type: "exemple" },
  ],
  texte: [
    { id: "ascii", label: "ASCII", type: "définition" },
    { id: "utf8", label: "UTF-8", type: "définition" },
  ],
  images: [
    { id: "depth", label: "Profondeur de couleur", type: "définition" },
    { id: "defres", label: "Définition vs Résolution", type: "concept" },
    { id: "taille", label: "Calcul taille mémoire", type: "formule" },
    { id: "bayer", label: "Filtre de Bayer", type: "définition" },
    { id: "compression", label: "Compression & Vectoriel", type: "concept" },
  ],
  son: [
    { id: "freq_amp", label: "Fréquence & Amplitude", type: "définition" },
    { id: "num3", label: "3 étapes de numérisation", type: "concept" },
    { id: "compromis", label: "Compromis qualité/taille", type: "concept" },
  ],
  redondance: [
    { id: "principe", label: "Principe", type: "définition" },
    { id: "parite", label: "Bit de parité", type: "formule" },
    { id: "checksum", label: "Checksum & Hachage", type: "définition" },
  ],
  portes: [
    { id: "tables", label: "Tables de vérité", type: "formule" },
    { id: "not", label: "Porte NON", type: "formule" },
    { id: "memo", label: "Mémo rapide", type: "concept" },
  ],
  additionneurs: [
    { id: "base", label: "Addition binaire de base", type: "formule" },
    { id: "demi", label: "Demi-additionneur", type: "définition" },
    { id: "complet", label: "Additionneur complet", type: "définition" },
  ],
};

// ── Données exercices ──────────────────────────────────────────────────────
const QCM_DATA = [
  {
    cat: "Binaire",
    q: "Que vaut 10110₍₂₎ en décimal ?",
    opts: ["22", "18", "24", "20"],
    ans: 0,
    expl: "1×16+0×8+1×4+1×2+0×1=22",
  },
  {
    cat: "Binaire",
    q: "97₍₁₀₎ en binaire 8 bits ?",
    opts: ["01100001", "01100010", "01010001", "01100000"],
    ans: 0,
    expl: "64+32+1=97 → 01100001",
  },
  {
    cat: "Binaire",
    q: "8 bits représentent combien de valeurs ?",
    opts: ["128", "255", "256", "512"],
    ans: 2,
    expl: "2⁸=256 valeurs (0 à 255)",
  },
  {
    cat: "Binaire",
    q: "11111111₍₂₎ en décimal ?",
    opts: ["127", "128", "255", "256"],
    ans: 2,
    expl: "128+64+32+16+8+4+2+1=255",
  },
  {
    cat: "Binaire",
    q: "Un nombre binaire pair se termine par...",
    opts: ["0", "1", "10", "11"],
    ans: 0,
    expl: "Le bit 2⁰=1 est absent → se termine par 0",
  },
  {
    cat: "Texte",
    q: "Code ASCII de 'A' majuscule ?",
    opts: ["64", "65", "97", "66"],
    ans: 1,
    expl: "A=65, B=66… a=97 (différence de 32)",
  },
  {
    cat: "Texte",
    q: "Taille max d'un caractère UTF-8 ?",
    opts: ["1 octet", "2 octets", "3 octets", "4 octets"],
    ans: 3,
    expl: "UTF-8 : de 1 à 4 octets selon le caractère",
  },
  {
    cat: "Images",
    q: "Profondeur d'une image RVB ?",
    opts: ["8 bpp", "16 bpp", "24 bpp", "32 bpp"],
    ans: 2,
    expl: "3 canaux × 8 bits = 24 bpp",
  },
  {
    cat: "Images",
    q: "Taille d'une image 640×480 en niveaux de gris ?",
    opts: ["150 Ko", "300 Ko", "600 Ko", "75 Ko"],
    ans: 1,
    expl: "640×480×8÷8=307 200 o ÷1024≈300 Ko",
  },
  {
    cat: "Images",
    q: "Filtre de Bayer : proportion de vert ?",
    opts: ["25%", "33%", "50%", "75%"],
    ans: 2,
    expl: "50% vert, 25% rouge, 25% bleu",
  },
  {
    cat: "Images",
    q: "1024×1024 N&B compression 50% → poids ?",
    opts: ["128 Ko", "64 Ko", "512 Ko", "32 Ko"],
    ans: 1,
    expl: "1024×1024÷8=131072 o ÷2=64 Ko",
  },
  {
    cat: "Images",
    q: "Valeur d'un pixel blanc en niveaux de gris ?",
    opts: ["0", "128", "255", "256"],
    ans: 2,
    expl: "0=noir, 255=blanc (8 bits → 0 à 255)",
  },
  {
    cat: "Son",
    q: "1ère étape de numérisation du son ?",
    opts: ["Encodage", "Quantification", "Échantillonnage", "Compression"],
    ans: 2,
    expl: "Ordre : Échantillonnage → Quantification → Encodage",
  },
  {
    cat: "Son",
    q: "L'amplitude correspond à...",
    opts: ["Hauteur (aigu/grave)", "Volume", "Fréquence", "Durée"],
    ans: 1,
    expl: "Amplitude = hauteur de l'oscillation = volume",
  },
  {
    cat: "Son",
    q: "Fréquence d'échantillonnage minimale ?",
    opts: ["> 20 kHz", "> 40 kHz", "> 100 kHz", "> 10 kHz"],
    ans: 1,
    expl: "Oreille : 20–20 000 Hz → > 40 kHz (Shannon)",
  },
  {
    cat: "Redondance",
    q: "Bit de parité détecte combien d'erreurs ?",
    opts: ["Toutes", "1 seule", "2", "Aucune"],
    ans: 1,
    expl: "1 erreur → somme impaire → détectée. 2 erreurs → s'annulent",
  },
  {
    cat: "Redondance",
    q: "On transmet 1011010. Bit de parité ?",
    opts: ["0", "1", "Impossible", "2"],
    ans: 0,
    expl: "Somme=1+0+1+1+0+1+0=4 (paire) → parité=0",
  },
  {
    cat: "Portes",
    q: "XOR si A=1 et B=1 ?",
    opts: ["0", "1", "Indéfini", "2"],
    ans: 0,
    expl: "XOR = OU exclusif. A=B=1 → sortie=0",
  },
  {
    cat: "Portes",
    q: "NAND si A=1 et B=1 ?",
    opts: ["0", "1", "Toujours 1", "Toujours 0"],
    ans: 0,
    expl: "NAND = inverse de ET. ET(1,1)=1 → NAND=0",
  },
  {
    cat: "Portes",
    q: "Quelle porte donne 0 seulement si A=B=1 ?",
    opts: ["ET", "OU", "NAND", "XOR"],
    ans: 2,
    expl: "NAND = 0 uniquement quand A=1 ET B=1",
  },
  {
    cat: "Additionneurs",
    q: "1+1 en binaire ?",
    opts: ["2", "11", "10", "0"],
    ans: 2,
    expl: "1+1=2₍₁₀₎=10₍₂₎",
  },
  {
    cat: "Additionneurs",
    q: "Entrées d'un additionneur complet ?",
    opts: ["1", "2", "3", "4"],
    ans: 2,
    expl: "3 entrées : A, B, Cᵢₙ",
  },
  {
    cat: "Additionneurs",
    q: "S si A=1,B=1,Cᵢₙ=1 (additionneur complet) ?",
    opts: ["0", "1", "2", "3"],
    ans: 1,
    expl: "1+1+1=3=11₍₂₎ → Cₒᵤₜ=1, S=1",
  },
  {
    cat: "Additionneurs",
    q: "S₀ dans un demi-additionneur = ?",
    opts: ["ET(A,B)", "OU(A,B)", "XOR(A,B)", "NAND(A,B)"],
    ans: 2,
    expl: "S₀=XOR(A,B), S₁=ET(A,B)",
  },
];

const VF_DATA = [
  {
    s: "Un signal analogique varie de façon discontinue.",
    ans: false,
    expl: "FAUX. Un signal analogique varie de façon CONTINUE. Le numérique varie par paliers.",
  },
  {
    s: "1 octet = 8 bits.",
    ans: true,
    expl: "VRAI. Par définition, 1 octet = 8 bits.",
  },
  {
    s: "11111111₍₂₎ = 255₍₁₀₎.",
    ans: true,
    expl: "VRAI. 128+64+32+16+8+4+2+1=255",
  },
  {
    s: "En ASCII, 'A' majuscule a le code 97.",
    ans: false,
    expl: "FAUX. A=65, a=97. La différence est de 32.",
  },
  {
    s: "UTF-8 peut encoder des caractères sur 4 octets.",
    ans: true,
    expl: "VRAI. UTF-8 utilise de 1 à 4 octets.",
  },
  {
    s: "La définition d'une image = le nombre de pixels par pouce.",
    ans: false,
    expl: "FAUX. Définition = nombre TOTAL de pixels. DPI = résolution.",
  },
  {
    s: "Une image RVB utilise 24 bits par pixel.",
    ans: true,
    expl: "VRAI. 3 canaux × 8 bits = 24 bpp.",
  },
  {
    s: "Le filtre de Bayer contient 25% de filtres verts.",
    ans: false,
    expl: "FAUX. 50% vert, 25% rouge, 25% bleu.",
  },
  {
    s: "Une image vectorielle perd en qualité si agrandie.",
    ans: false,
    expl: "FAUX. Vectorielle = équations math → pas de perte.",
  },
  {
    s: "L'amplitude d'un son correspond à sa hauteur (aigu/grave).",
    ans: false,
    expl: "FAUX. Amplitude = volume. Fréquence = aigu/grave.",
  },
  {
    s: "Fréquence d'échantillonnage > 40 kHz suffit pour l'oreille.",
    ans: true,
    expl: "VRAI. Oreille : 20–20 000 Hz → > 40 kHz.",
  },
  {
    s: "Le bit de parité détecte 2 erreurs simultanées.",
    ans: false,
    expl: "FAUX. 2 erreurs s'annulent → somme reste paire → non détectées.",
  },
  {
    s: "La porte XOR donne 1 si A=1 et B=1.",
    ans: false,
    expl: "FAUX. XOR = OU exclusif. A=B=1 → sortie = 0.",
  },
  {
    s: "Un demi-additionneur prend en compte une retenue entrante.",
    ans: false,
    expl: "FAUX. C'est l'additionneur COMPLET qui a Cᵢₙ.",
  },
  {
    s: "S₀ dans un demi-additionneur = XOR(A, B).",
    ans: true,
    expl: "VRAI. S₀=XOR(A,B), S₁=ET(A,B).",
  },
  {
    s: "Le son peut se propager dans le vide.",
    ans: false,
    expl: "FAUX. Le son nécessite un milieu matériel.",
  },
];

const BLANKS_DATA = [
  {
    pre: "Un octet contient",
    blank: "8",
    post: "bits.",
    hint: "Nombre de bits dans un octet",
  },
  {
    pre: "10101₍₂₎ en décimal vaut",
    blank: "21",
    post: ".",
    hint: "1×16+0×8+1×4+0×2+1×1",
  },
  {
    pre: "La valeur max d'un pixel en niveaux de gris est",
    blank: "255",
    post: ".",
    hint: "2⁸ - 1",
  },
  {
    pre: "La 1ère étape de numérisation du son est l'",
    blank: "échantillonnage",
    post: ".",
    hint: "Découper en tranches...",
  },
  {
    pre: "Une image RVB utilise",
    blank: "24",
    post: "bits par pixel.",
    hint: "3 canaux × 8 bits",
  },
  {
    pre: "Le code ASCII de 'a' minuscule est",
    blank: "97",
    post: ".",
    hint: "A=65, +32",
  },
  {
    pre: "La porte NAND est l'inverse de la porte",
    blank: "ET",
    post: ".",
    hint: "Non-ET = ?",
  },
  {
    pre: "S₁ dans un demi-additionneur = _____(A, B).",
    blank: "ET",
    post: "",
    hint: "Quelle porte donne 1 seulement si A=B=1 ?",
  },
  {
    pre: "Le filtre de Bayer contient",
    blank: "50",
    post: "% de filtres verts.",
    hint: "Plus que rouge et bleu combinés",
  },
  {
    pre: "L'additionneur complet a",
    blank: "3",
    post: "entrées : A, B et Cᵢₙ.",
    hint: "Demi-additionneur en a 2...",
  },
  {
    pre: "En UTF-8, un caractère prend de 1 à",
    blank: "4",
    post: "octets.",
    hint: "Taille maximale UTF-8",
  },
  {
    pre: "La fréquence d'échantillonnage doit être >",
    blank: "40",
    post: "kHz pour l'oreille humaine.",
    hint: "2 × 20 000 Hz",
  },
];

const ASSOC_SETS = [
  {
    title: "Portes logiques",
    pairs: [
      { left: "ET (AND)", right: "Sortie = 1 seulement si A=1 ET B=1" },
      { left: "OU (OR)", right: "Sortie = 1 si au moins une entrée = 1" },
      { left: "XOR", right: "Sortie = 1 si A≠B, jamais si A=B=1" },
      { left: "NAND", right: "Inverse de ET — 0 seulement si A=B=1" },
      { left: "NON (NOT)", right: "Inverse l'unique entrée" },
    ],
  },
  {
    title: "Concepts images",
    pairs: [
      { left: "Définition", right: "Nombre total de pixels de l'image" },
      { left: "Résolution", right: "Nombre de pixels par pouce (DPI)" },
      {
        left: "Profondeur de couleur",
        right: "Nombre de bits utilisés par pixel",
      },
      {
        left: "Filtre de Bayer",
        right: "Grille 50%V+25%R+25%B sur le capteur",
      },
      {
        left: "Vectorielle",
        right: "Image basée sur des équations mathématiques",
      },
    ],
  },
  {
    title: "Numérisation du son",
    pairs: [
      {
        left: "Échantillonnage",
        right: "Découpage du signal en tranches temporelles",
      },
      {
        left: "Quantification",
        right: "Attribution d'une valeur binaire à chaque échantillon",
      },
      {
        left: "Encodage",
        right: "Stockage dans un format fichier (MP3, WAV…)",
      },
      { left: "Fréquence", right: "Vitesse de vibration → aigu ou grave" },
      { left: "Amplitude", right: "Hauteur de l'oscillation → volume sonore" },
    ],
  },
];

const TV_DATA = [
  {
    title: "ET (AND)",
    headers: ["A", "B", "A ET B"],
    rows: [
      ["0", "0", "?"],
      ["0", "1", "?"],
      ["1", "0", "?"],
      ["1", "1", "?"],
    ],
    answers: ["0", "0", "0", "1"],
  },
  {
    title: "XOR",
    headers: ["A", "B", "A XOR B"],
    rows: [
      ["0", "0", "?"],
      ["0", "1", "?"],
      ["1", "0", "?"],
      ["1", "1", "?"],
    ],
    answers: ["0", "1", "1", "0"],
  },
  {
    title: "Demi-additionneur",
    headers: ["A", "B", "S₁ retenue", "S₀ somme"],
    rows: [
      ["0", "0", "?", "?"],
      ["0", "1", "?", "?"],
      ["1", "0", "?", "?"],
      ["1", "1", "?", "?"],
    ],
    answers: ["0", "0", "0", "1", "0", "1", "1", "0"],
  },
  {
    title: "Additionneur complet",
    headers: ["A", "B", "Cᵢₙ", "Cₒᵤₜ", "S"],
    rows: [
      ["0", "0", "0", "?", "?"],
      ["0", "1", "0", "?", "?"],
      ["1", "1", "0", "?", "?"],
      ["1", "1", "1", "?", "?"],
    ],
    answers: ["0", "0", "0", "1", "1", "0", "1", "1"],
  },
];

const ORDER_DATA = [
  {
    title: "Numérisation du son",
    items: [
      "Encodage dans un format fichier (MP3, WAV…)",
      "Échantillonnage du signal analogique",
      "Quantification (valeur binaire à chaque échantillon)",
    ],
    correct: [1, 2, 0],
  },
  {
    title: "Conversion décimal → binaire",
    items: [
      "Identifier la plus grande puissance de 2 ≤ au nombre",
      "Soustraire cette puissance du nombre restant",
      "Répéter jusqu'à arriver à 0",
      "Écrire le résultat binaire final",
    ],
    correct: [0, 1, 2, 3],
  },
  {
    title: "Addition binaire 1+1",
    items: [
      "Résultat : 10₍₂₎ (retenue=1, somme=0)",
      "Poser l'opération : A=1, B=1",
      "Appliquer la table de vérité du demi-additionneur",
      "S₀=XOR(1,1)=0 | S₁=ET(1,1)=1",
    ],
    correct: [1, 2, 3, 0],
  },
];

const CALC_DATA = [
  {
    title: "Taille mémoire 1920×1080 RVB",
    steps: [
      { q: "Largeur × Hauteur = ? pixels", a: "2073600", hint: "1920 × 1080" },
      {
        q: "Profondeur de couleur RVB en bpp ?",
        a: "24",
        hint: "3 canaux × 8 bits",
      },
      {
        q: "Taille en bits = pixels × bpp = ?",
        a: "49766400",
        hint: "2 073 600 × 24",
      },
      {
        q: "Taille en octets = bits ÷ 8 = ?",
        a: "6220800",
        hint: "49 766 400 ÷ 8",
      },
      {
        q: "Taille en Ko = octets ÷ 1024 ≈ ?",
        a: "6075",
        hint: "6 220 800 ÷ 1024",
      },
    ],
  },
  {
    title: "Conversion 42₍₁₀₎ → binaire",
    steps: [
      {
        q: "Plus grande puissance de 2 ≤ 42 ?",
        a: "32",
        hint: "2⁵=32, 2⁶=64 trop grand",
      },
      { q: "42 - 32 = ? (reste)", a: "10", hint: "42 - 32" },
      { q: "Plus grande puissance de 2 ≤ 10 ?", a: "8", hint: "2³=8" },
      { q: "10 - 8 = ? (reste)", a: "2", hint: "10 - 8" },
      {
        q: "Résultat en binaire 8 bits ?",
        a: "00101010",
        hint: "32+8+2 → bits à 1 aux positions 5,3,1",
      },
    ],
  },
  {
    title: "Bit de parité de 1011001",
    steps: [
      { q: "Combien de bits à 1 dans 1011001 ?", a: "4", hint: "Compte les 1" },
      { q: "4 est pair ou impair ?", a: "pair", hint: "Divisible par 2 ?" },
      {
        q: "Si somme paire, bit de parité = ?",
        a: "0",
        hint: "Bit parité = 0 si paire, 1 si impaire",
      },
      {
        q: "Octet transmis (7 bits + parité) ?",
        a: "10110010",
        hint: "1011001 + 0 à la fin",
      },
    ],
  },
];

// ── Composant Flashcard ────────────────────────────────────────────────────
function FlashcardMode({ topic, C, fs, favorites, toggleFav }) {
  const cards = FLASHCARDS[topic] || [];
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [seen, setSeen] = useState(new Set());
  const [known, setKnown] = useState(new Set());
  const [order, setOrder] = useState(() => cards.map((_, i) => i));
  const [filter, setFilter] = useState("all");

  const filtered = order.filter((i) => {
    if (filter === "unknown") return !known.has(i);
    if (filter === "favorites") return favorites.has(topic + "_" + i);
    return true;
  });
  const cur = filtered[idx] !== undefined ? cards[filtered[idx]] : null;
  const curOrigIdx = filtered[idx];
  const progress =
    cards.length > 0 ? Math.round((seen.size / cards.length) * 100) : 0;

  const goTo = (dir) => {
    const ni = idx + dir;
    if (ni < 0 || ni >= filtered.length) return;
    if (dir > 0 && curOrigIdx !== undefined)
      setSeen((s) => new Set([...s, curOrigIdx]));
    setIdx(ni);
    setFlipped(false);
  };
  const markKnown = () => {
    if (curOrigIdx === undefined) return;
    setKnown((s) => {
      const n = new Set(s);
      if (n.has(curOrigIdx)) n.delete(curOrigIdx);
      else n.add(curOrigIdx);
      return n;
    });
  };
  const doShuffle = () => {
    setOrder(shuffle(cards.map((_, i) => i)));
    setIdx(0);
    setFlipped(false);
  };
  const reset = () => {
    setOrder(cards.map((_, i) => i));
    setIdx(0);
    setFlipped(false);
    setSeen(new Set());
    setKnown(new Set());
  };

  if (!cur)
    return (
      <div style={{ textAlign: "center", padding: "3rem", color: C.muted }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
        <p style={{ fontSize: fs, fontWeight: 600, color: C.text }}>
          Toutes les cartes vues !
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: 16,
            padding: "8px 20px",
            borderRadius: 9,
            border: `1px solid ${C.green}`,
            background: C.green + "22",
            color: C.green,
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "'Outfit',sans-serif",
          }}
        >
          Recommencer
        </button>
      </div>
    );

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          marginBottom: 12,
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[
            ["all", "Toutes"],
            ["unknown", "À revoir"],
            ["favorites", "⭐ Favoris"],
          ].map(([f, lbl]) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f);
                setIdx(0);
                setFlipped(false);
              }}
              style={{
                padding: "4px 10px",
                borderRadius: 7,
                border: `1px solid ${filter === f ? C.accent : C.border}`,
                background: filter === f ? C.accent + "22" : "transparent",
                color: filter === f ? C.accent : C.muted,
                fontSize: 11,
                cursor: "pointer",
                fontFamily: "'Outfit',sans-serif",
              }}
            >
              {lbl}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={doShuffle}
            style={{
              padding: "4px 10px",
              borderRadius: 7,
              border: `1px solid ${C.border}`,
              background: "transparent",
              color: C.muted,
              fontSize: 11,
              cursor: "pointer",
              fontFamily: "'Outfit',sans-serif",
            }}
          >
            🔀 Mélanger
          </button>
          <button
            onClick={reset}
            style={{
              padding: "4px 10px",
              borderRadius: 7,
              border: `1px solid ${C.border}`,
              background: "transparent",
              color: C.muted,
              fontSize: 11,
              cursor: "pointer",
              fontFamily: "'Outfit',sans-serif",
            }}
          >
            ↺ Reset
          </button>
        </div>
      </div>
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          padding: "10px 14px",
          marginBottom: 14,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 12,
            color: C.muted,
            marginBottom: 6,
          }}
        >
          <span>
            {idx + 1}/{filtered.length} cartes
          </span>
          <span>
            {known.size} connues · {seen.size} vues
          </span>
        </div>
        <div style={{ height: 4, background: C.border, borderRadius: 2 }}>
          <div
            style={{
              height: "100%",
              background: C.accent,
              width: progress + "%",
              borderRadius: 2,
              transition: "width .3s",
            }}
          />
        </div>
      </div>
      <div
        onClick={() => setFlipped((f) => !f)}
        style={{ cursor: "pointer", perspective: "1000px", marginBottom: 12 }}
      >
        <div
          style={{
            position: "relative",
            minHeight: 200,
            transformStyle: "preserve-3d",
            transition: "transform .5s",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              background: C.surface,
              border: `2px solid ${C.accent}44`,
              borderRadius: 16,
              padding: "2rem",
              minHeight: 200,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <Badge c={C.accent}>{cur.cat}</Badge>
              <span style={{ fontSize: 12, color: C.faint }}>
                Touche pour révéler ↓
              </span>
            </div>
            <p
              style={{
                fontSize: fs + 2,
                fontWeight: 600,
                color: C.text,
                lineHeight: 1.6,
                flex: 1,
                display: "flex",
                alignItems: "center",
              }}
            >
              {cur.q}
            </p>
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: C.accent + "15",
              border: `2px solid ${C.accent}`,
              borderRadius: 16,
              padding: "2rem",
              minHeight: 200,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <Badge c={C.green}>Réponse</Badge>
              <span style={{ fontSize: 12, color: C.faint }}>
                Touche pour masquer ↑
              </span>
            </div>
            <p
              style={{
                fontSize: fs + 1,
                color: C.text,
                lineHeight: 1.7,
                flex: 1,
                display: "flex",
                alignItems: "center",
                fontFamily: "'JetBrains Mono',monospace",
              }}
            >
              {cur.a}
            </p>
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          gap: 8,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => goTo(-1)}
          disabled={idx === 0}
          style={{
            padding: "8px 18px",
            borderRadius: 9,
            border: `1px solid ${C.border}`,
            background: "transparent",
            color: idx === 0 ? C.faint : C.muted,
            fontSize: 14,
            cursor: idx === 0 ? "default" : "pointer",
            fontFamily: "'Outfit',sans-serif",
          }}
        >
          ← Précédent
        </button>
        <button
          onClick={markKnown}
          style={{
            padding: "8px 18px",
            borderRadius: 9,
            border: `1px solid ${known.has(curOrigIdx) ? C.green : C.border}`,
            background: known.has(curOrigIdx) ? C.green + "22" : "transparent",
            color: known.has(curOrigIdx) ? C.green : C.muted,
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "'Outfit',sans-serif",
          }}
        >
          {known.has(curOrigIdx) ? "✓ Connue" : "Je connais"}
        </button>
        <button
          onClick={() => toggleFav(topic + "_" + curOrigIdx)}
          style={{
            padding: "8px 18px",
            borderRadius: 9,
            border: `1px solid ${
              favorites.has(topic + "_" + curOrigIdx) ? C.amber : C.border
            }`,
            background: favorites.has(topic + "_" + curOrigIdx)
              ? C.amber + "22"
              : "transparent",
            color: favorites.has(topic + "_" + curOrigIdx) ? C.amber : C.muted,
            fontSize: 14,
            cursor: "pointer",
            fontFamily: "'Outfit',sans-serif",
          }}
        >
          {favorites.has(topic + "_" + curOrigIdx) ? "⭐" : "☆"} Favori
        </button>
        <button
          onClick={() => goTo(1)}
          disabled={idx >= filtered.length - 1}
          style={{
            padding: "8px 18px",
            borderRadius: 9,
            border: `1px solid ${C.accent}`,
            background: C.accent + "22",
            color: C.accent,
            fontSize: 14,
            cursor: idx >= filtered.length - 1 ? "default" : "pointer",
            fontFamily: "'Outfit',sans-serif",
          }}
        >
          Suivant →
        </button>
      </div>
    </div>
  );
}

// ── Contenu des fiches ────────────────────────────────────────────────────
function FicheContent({ topic, C, fs, collapsed, toggleSection }) {
  const fsize = fs;
  const fsmall = Math.max(11, fs - 2);
  const fmid = Math.max(11, fs - 1);

  const F = ({ children }) => (
    <div
      style={{
        background: C.bg,
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        padding: ".6rem 1rem",
        fontSize: fsmall,
        color: C.accentL,
        margin: ".6rem 0",
        fontFamily: "'JetBrains Mono',monospace",
        lineHeight: 1.8,
        whiteSpace: "pre-wrap",
      }}
    >
      {children}
    </div>
  );
  const P = ({ children, style = {} }) => (
    <p style={{ fontSize: fsize, color: C.muted, lineHeight: 1.8, ...style }}>
      {children}
    </p>
  );
  const TT = ({ headers, rows }) => (
    <div style={{ overflowX: "auto", margin: ".6rem 0" }}>
      <table
        style={{ width: "100%", borderCollapse: "collapse", fontSize: fsmall }}
      >
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                style={{
                  background: C.bg,
                  color: C.accentL,
                  padding: "6px 14px",
                  textAlign: "center",
                  border: `1px solid ${C.border}`,
                  fontFamily: "'JetBrains Mono',monospace",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              style={{ background: i % 2 === 0 ? C.surface : C.hover }}
            >
              {row.map((cell, j) => (
                <td
                  key={j}
                  style={{
                    padding: "5px 14px",
                    textAlign: "center",
                    border: `1px solid ${C.border}`,
                    color:
                      cell === "1" ? C.green : cell === "0" ? C.muted : C.text,
                    fontFamily: "'JetBrains Mono',monospace",
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  const Sec = ({ id, children }) => {
    const meta = (SECTIONS_META[topic] || []).find((s) => s.id === id);
    const isC = collapsed.has(id);
    const tc =
      {
        concept: C.blue,
        formule: C.accent,
        exemple: C.green,
        définition: C.teal,
      }[meta?.type] || C.muted;
    return (
      <div style={{ marginBottom: ".9rem" }}>
        <button
          onClick={() => toggleSection(id)}
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: isC ? "10px" : "10px 10px 0 0",
            padding: "10px 14px",
            cursor: "pointer",
            fontFamily: "'Outfit',sans-serif",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Badge c={tc}>{meta?.type}</Badge>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
              {meta?.label}
            </span>
          </div>
          <span style={{ fontSize: 12, color: C.faint }}>
            {isC ? "▼ Afficher" : "▲ Masquer"}
          </span>
        </button>
        {!isC && (
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderTop: "none",
              borderRadius: "0 0 10px 10px",
              padding: "1rem 1.2rem",
            }}
          >
            {children}
          </div>
        )}
      </div>
    );
  };

  if (topic === "binaire")
    return (
      <div>
        <Sec id="ana_num">
          <P>
            <Badge c={C.blue}>Analogique</Badge> Signal continu (son,
            température…)
          </P>
          <P style={{ marginTop: 8 }}>
            <Badge c={C.green}>Numérique</Badge> Signal discret, seulement 0 et
            1. Deux états électriques : courant / pas de courant.
          </P>
        </Sec>
        <Sec id="sys_bin">
          <P style={{ marginBottom: 8 }}>
            Base 2. <strong style={{ color: C.text }}>Bit</strong> = unité
            minimale. <strong style={{ color: C.text }}>Octet</strong> = 8 bits
            = 2⁸ = 256 valeurs (0–255).
          </P>
          <F>{"2⁰=1 | 2¹=2 | 2²=4 | 2³=8 | 2⁴=16 | 2⁵=32 | 2⁶=64 | 2⁷=128"}</F>
          <p style={{ fontSize: fsmall, color: C.faint }}>
            💡 Pair → se termine par 0. Impair → 1.
          </p>
        </Sec>
        <Sec id="b2d">
          <F>{"10110₍₂₎ = 1×16 + 0×8 + 1×4 + 1×2 + 0×1 = 22₍₁₀₎"}</F>
        </Sec>
        <Sec id="d2b">
          <P style={{ marginBottom: 6 }}>
            Soustraire les plus grandes puissances de 2 :
          </P>
          <F>{"666 = 512+128+16+8+2 → 1010011010₍₂₎"}</F>
        </Sec>
      </div>
    );
  if (topic === "texte")
    return (
      <div>
        <Sec id="ascii">
          <P style={{ marginBottom: 8 }}>
            128 caractères anglais (années 60), 7 bits/caractère.
          </P>
          <F>
            {
              "A=65 | a=97 | Z=90 | z=122 | Espace=32 | 0=48\nMajuscule → Minuscule : +32"
            }
          </F>
        </Sec>
        <Sec id="utf8">
          <P>
            Extension internationale. 1 à 4 octets/caractère. Rétrocompatible
            avec ASCII. Standard des navigateurs web.
          </P>
          <F>{'<meta charset="UTF-8" />'}</F>
        </Sec>
      </div>
    );
  if (topic === "images")
    return (
      <div>
        <Sec id="depth">
          <TT
            headers={["Type", "Profondeur", "Détail"]}
            rows={[
              ["Noir & blanc", "1 bpp", "0=noir, 1=blanc"],
              ["Niveaux de gris", "8 bpp", "0=noir, 255=blanc"],
              ["Couleur RVB", "24 bpp", "3×8 bits = 16,7M couleurs"],
            ]}
          />
        </Sec>
        <Sec id="defres">
          <P style={{ marginBottom: 8 }}>
            <Badge c={C.blue}>Définition</Badge> Nombre total de pixels (ex:
            1920×1080).
          </P>
          <P>
            <Badge c={C.green}>Résolution</Badge> Densité de pixels par pouce
            (DPI/PPP).
          </P>
          <div
            style={{
              background: C.amber + "15",
              border: `1px solid ${C.amber}44`,
              borderRadius: 8,
              padding: "8px 12px",
              marginTop: 10,
              fontSize: fsmall,
              color: C.amber,
            }}
          >
            ⚠️ "resolution" anglais = "définition" français (faux ami !)
          </div>
        </Sec>
        <Sec id="taille">
          <F>
            {
              "Taille (bits) = largeur × hauteur × profondeur\nTaille (octets) = bits ÷ 8\n\nEx: 800×600 en 24 bpp ≈ 1.4 Mo\n1 Ko=1024 o | 1 Mo=1024 Ko | 1 Go=1024 Mo"
            }
          </F>
        </Sec>
        <Sec id="bayer">
          <P>
            Grille sur le capteur :{" "}
            <strong style={{ color: C.green }}>50% vert</strong>,{" "}
            <strong style={{ color: C.red }}>25% rouge</strong>,{" "}
            <strong style={{ color: C.blue }}>25% bleu</strong>. Imite l'œil
            humain.
          </P>
          <p style={{ fontSize: fsmall, color: C.faint, marginTop: 6 }}>
            💡 Photosite ≠ pixel.
          </p>
        </Sec>
        <Sec id="compression">
          <F>{"Taux = 1 - (taille finale / taille initiale)"}</F>
          <P>
            <Badge c={C.green}>Sans perte</Badge> Identique à l'original (PNG).{" "}
            <Badge c={C.red}>Avec perte</Badge> Fichier léger (JPG).
          </P>
          <P style={{ marginTop: 6 }}>
            <Badge c={C.blue}>Vectorielle</Badge> Équations math, sans perte.{" "}
            <Badge c={C.pink}>Matricielle</Badge> Pixels, perte si agrandie.
          </P>
        </Sec>
      </div>
    );
  if (topic === "son")
    return (
      <div>
        <Sec id="freq_amp">
          <P>
            <Badge c={C.blue}>Fréquence</Badge> Vitesse de vibration → aigu
            (haute) / grave (basse). Hz.
          </P>
          <P style={{ marginTop: 8 }}>
            <Badge c={C.green}>Amplitude</Badge> Hauteur de l'oscillation →
            volume.
          </P>
          <P style={{ marginTop: 8 }}>
            Onde sinusoïdale.{" "}
            <strong style={{ color: C.red }}>
              Ne se propage pas dans le vide !
            </strong>
          </P>
        </Sec>
        <Sec id="num3">
          {[
            {
              n: "1",
              name: "Échantillonnage",
              c: C.blue,
              d: "Découper le signal. Fréquence > 40 kHz pour l'oreille (théorème de Shannon).",
            },
            {
              n: "2",
              name: "Quantification",
              c: C.accent,
              d: "Valeur binaire à l'amplitude de chaque échantillon.",
            },
            {
              n: "3",
              name: "Encodage",
              c: C.green,
              d: "Stocker en format fichier (MP3, WAV…). Souvent avec perte.",
            },
          ].map((s) => (
            <div
              key={s.n}
              style={{ display: "flex", gap: 12, marginBottom: 12 }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: s.c + "22",
                  border: `1px solid ${s.c}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  color: s.c,
                  flexShrink: 0,
                }}
              >
                {s.n}
              </div>
              <div>
                <div
                  style={{
                    fontSize: fsize,
                    fontWeight: 600,
                    color: s.c,
                    marginBottom: 3,
                  }}
                >
                  {s.name}
                </div>
                <p style={{ fontSize: fmid, color: C.muted, lineHeight: 1.7 }}>
                  {s.d}
                </p>
              </div>
            </div>
          ))}
        </Sec>
        <Sec id="compromis">
          <P>Grande fréquence → meilleure qualité → fichier plus lourd.</P>
          <F>{"Oreille : 20–20 000 Hz → fréquence > 40 kHz nécessaire"}</F>
        </Sec>
      </div>
    );
  if (topic === "redondance")
    return (
      <div>
        <Sec id="principe">
          <P>
            Dupliquer les fonctions critiques. Système{" "}
            <strong style={{ color: C.text }}>résilient</strong> = continue
            malgré une panne partielle.
          </P>
        </Sec>
        <Sec id="parite">
          <P style={{ marginBottom: 8 }}>
            1 bit ajouté à 7 bits. Bit = 0 si somme paire, 1 si impaire. Somme
            totale toujours paire.
          </P>
          <F>
            {
              "Ex: 1110001 → somme=4 (paire) → parité=0 → 11100010\n✅ 1 erreur → somme impaire → détectée\n❌ 2 erreurs → somme paire → non détectée"
            }
          </F>
        </Sec>
        <Sec id="checksum">
          <P>
            <Badge c={C.blue}>Checksum</Badge> Empreinte compacte transmise avec
            les données.
          </P>
          <P style={{ marginTop: 6 }}>
            <Badge c={C.accent}>Hachage</Badge> 1 bit modifié → hash totalement
            différent. Blockchain.
          </P>
        </Sec>
      </div>
    );
  if (topic === "portes")
    return (
      <div>
        <Sec id="tables">
          <TT
            headers={["A", "B", "ET", "OU", "XOR", "NAND"]}
            rows={[
              ["0", "0", "0", "0", "0", "1"],
              ["0", "1", "0", "1", "1", "1"],
              ["1", "0", "0", "1", "1", "1"],
              ["1", "1", "1", "1", "0", "0"],
            ]}
          />
        </Sec>
        <Sec id="not">
          <TT
            headers={["A", "NON A"]}
            rows={[
              ["0", "1"],
              ["1", "0"],
            ]}
          />
          <P style={{ marginTop: 8 }}>Inverse simplement l'entrée.</P>
        </Sec>
        <Sec id="memo">
          {[
            ["ET", C.blue, "1 seulement si A=1 ET B=1"],
            ["OU", C.green, "1 si A=1 OU B=1 (ou les deux)"],
            ["NON", C.red, "Inverse l'entrée"],
            ["XOR", C.amber, "1 si A≠B, jamais si A=B=1"],
            ["NAND", C.accent, "Inverse de ET → 0 seulement si A=B=1"],
          ].map((p) => (
            <div
              key={p[0]}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "7px 0",
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              <Badge c={p[1]}>{p[0]}</Badge>
              <span style={{ fontSize: fmid, color: C.muted }}>{p[2]}</span>
            </div>
          ))}
        </Sec>
      </div>
    );
  if (topic === "additionneurs")
    return (
      <div>
        <Sec id="base">
          <F>{"0+0=00₍₂₎ | 0+1=01₍₂₎ | 1+0=01₍₂₎ | 1+1=10₍₂₎ (retenue !)"}</F>
        </Sec>
        <Sec id="demi">
          <P style={{ marginBottom: 8 }}>
            2 entrées (A,B) → 2 sorties. Pas de retenue entrante.
          </P>
          <TT
            headers={["A", "B", "S₁ retenue", "S₀ somme"]}
            rows={[
              ["0", "0", "0", "0"],
              ["0", "1", "0", "1"],
              ["1", "0", "0", "1"],
              ["1", "1", "1", "0"],
            ]}
          />
          <F>{"S₀ = XOR(A,B)   |   S₁ = ET(A,B)"}</F>
        </Sec>
        <Sec id="complet">
          <P style={{ marginBottom: 8 }}>
            3 entrées (A,B,Cᵢₙ) → 2 sorties. Chainable.
          </P>
          <TT
            headers={["A", "B", "Cᵢₙ", "Cₒᵤₜ", "S"]}
            rows={[
              ["0", "0", "0", "0", "0"],
              ["0", "0", "1", "0", "1"],
              ["0", "1", "0", "0", "1"],
              ["0", "1", "1", "1", "0"],
              ["1", "0", "0", "0", "1"],
              ["1", "0", "1", "1", "0"],
              ["1", "1", "0", "1", "0"],
              ["1", "1", "1", "1", "1"],
            ]}
          />
          <F>{"Chaînage : Cₒᵤₜ du 1er → Cᵢₙ du 2ème"}</F>
        </Sec>
      </div>
    );
  return null;
}

// ── Exercice 1 : QCM ──────────────────────────────────────────────────────
function QCM() {
  const cats = [
    "Tous",
    "Binaire",
    "Texte",
    "Images",
    "Son",
    "Redondance",
    "Portes",
    "Additionneurs",
  ];
  const [filter, setFilter] = useState("Tous");
  const [answers, setAnswers] = useState({});
  const filtered =
    filter === "Tous" ? QCM_DATA : QCM_DATA.filter((q) => q.cat === filter);
  const answeredCount = filtered.filter(
    (_, i) => answers[filter + "_" + i] !== undefined
  ).length;
  const correctCount = filtered.filter(
    (q, i) => answers[filter + "_" + i] === q.ans
  ).length;
  return (
    <div>
      <div
        style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}
      >
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            style={{
              padding: "4px 10px",
              borderRadius: 7,
              border: `1px solid ${filter === c ? T.accent : T.border}`,
              background: filter === c ? T.accent + "22" : "transparent",
              color: filter === c ? T.accent : T.muted,
              fontSize: 11,
              cursor: "pointer",
              fontFamily: "'Outfit',sans-serif",
            }}
          >
            {c}
          </button>
        ))}
      </div>
      <div
        style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 12,
          padding: "1rem 1.4rem",
          marginBottom: 14,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 26, fontWeight: 700, color: T.accent }}>
          {correctCount}
          <span style={{ fontSize: 15, color: T.muted, fontWeight: 400 }}>
            /{answeredCount}
          </span>
        </span>
        <span style={{ fontSize: 13, color: T.muted }}>
          {filtered.length} questions
        </span>
        <button
          onClick={() => setAnswers({})}
          style={{
            padding: "6px 14px",
            borderRadius: 8,
            border: `1px solid ${T.border}`,
            background: "transparent",
            color: T.muted,
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "'Outfit',sans-serif",
          }}
        >
          Recommencer
        </button>
      </div>
      {filtered.map((q, i) => {
        const key = filter + "_" + i;
        const chosen = answers[key];
        const done = chosen !== undefined;
        return (
          <div
            key={key}
            style={{
              background: T.surface,
              border: `1px solid ${
                done
                  ? chosen === q.ans
                    ? T.green + "44"
                    : T.red + "44"
                  : T.border
              }`,
              borderRadius: 12,
              padding: "1.1rem 1.3rem",
              marginBottom: 10,
            }}
          >
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <Badge c={T.accent}>{q.cat}</Badge>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: T.text,
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {i + 1}. {q.q}
              </p>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 6,
              }}
            >
              {q.opts.map((opt, j) => {
                let bg = T.hover,
                  border = T.border,
                  color = T.muted;
                if (done) {
                  if (j === q.ans) {
                    bg = T.green + "22";
                    border = T.green;
                    color = T.green;
                  } else if (j === chosen) {
                    bg = T.red + "22";
                    border = T.red;
                    color = T.red;
                  }
                }
                return (
                  <button
                    key={j}
                    onClick={() => {
                      if (!done) setAnswers((p) => ({ ...p, [key]: j }));
                    }}
                    disabled={done}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: `1px solid ${border}`,
                      background: bg,
                      color,
                      fontSize: 13,
                      cursor: done ? "default" : "pointer",
                      textAlign: "left",
                      fontFamily: "'Outfit',sans-serif",
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {done && (
              <div
                style={{
                  marginTop: 8,
                  padding: "8px 12px",
                  background: "#0a0a12",
                  borderRadius: 8,
                  fontSize: 13,
                  color: T.muted,
                  borderLeft: `3px solid ${chosen === q.ans ? T.green : T.red}`,
                }}
              >
                💡 {q.expl}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Exercice 2 : Vrai/Faux ────────────────────────────────────────────────
function VraiFaux() {
  const [answers, setAnswers] = useState({});
  const answeredCount = Object.keys(answers).length;
  const correctCount = VF_DATA.filter((q, i) => answers[i] === q.ans).length;
  return (
    <div>
      <div
        style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 12,
          padding: "1rem 1.4rem",
          marginBottom: 14,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 26, fontWeight: 700, color: T.teal }}>
          {correctCount}
          <span style={{ fontSize: 15, color: T.muted, fontWeight: 400 }}>
            /{answeredCount}
          </span>
        </span>
        <span style={{ fontSize: 13, color: T.muted }}>
          {VF_DATA.length} affirmations
        </span>
        <button
          onClick={() => setAnswers({})}
          style={{
            padding: "6px 14px",
            borderRadius: 8,
            border: `1px solid ${T.border}`,
            background: "transparent",
            color: T.muted,
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "'Outfit',sans-serif",
          }}
        >
          Recommencer
        </button>
      </div>
      {VF_DATA.map((q, i) => {
        const chosen = answers[i];
        const done = chosen !== undefined;
        const isOk = done && chosen === q.ans;
        return (
          <div
            key={i}
            style={{
              background: T.surface,
              border: `1px solid ${
                done ? (isOk ? T.green + "44" : T.red + "44") : T.border
              }`,
              borderRadius: 12,
              padding: "1rem 1.3rem",
              marginBottom: 10,
            }}
          >
            <p
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: T.text,
                lineHeight: 1.6,
                marginBottom: 12,
              }}
            >
              {i + 1}. {q.s}
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              {[true, false].map((val) => {
                let bg = T.hover,
                  border = T.border,
                  color = T.muted;
                if (done) {
                  if (val === q.ans) {
                    bg = T.green + "22";
                    border = T.green;
                    color = T.green;
                  } else if (val === chosen) {
                    bg = T.red + "22";
                    border = T.red;
                    color = T.red;
                  }
                }
                return (
                  <button
                    key={String(val)}
                    onClick={() => {
                      if (!done) setAnswers((p) => ({ ...p, [i]: val }));
                    }}
                    disabled={done}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: 9,
                      border: `1px solid ${border}`,
                      background: bg,
                      color,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: done ? "default" : "pointer",
                      fontFamily: "'Outfit',sans-serif",
                    }}
                  >
                    {val ? "✓ Vrai" : "✗ Faux"}
                  </button>
                );
              })}
            </div>
            {done && (
              <div
                style={{
                  marginTop: 8,
                  padding: "8px 12px",
                  background: "#0a0a12",
                  borderRadius: 8,
                  fontSize: 13,
                  color: T.muted,
                  borderLeft: `3px solid ${isOk ? T.green : T.red}`,
                }}
              >
                💡 {q.expl}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Exercice 3 : Compléter les blancs ────────────────────────────────────
function Blanks() {
  const [vals, setVals] = useState({});
  const [checked, setChecked] = useState({});
  const check = (i) => {
    const v = (vals[i] || "").trim().toLowerCase();
    setChecked((p) => ({
      ...p,
      [i]: v === BLANKS_DATA[i].blank.toLowerCase(),
    }));
  };
  const correctCount = Object.values(checked).filter(Boolean).length;
  return (
    <div>
      <div
        style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 12,
          padding: "1rem 1.4rem",
          marginBottom: 14,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 26, fontWeight: 700, color: T.blue }}>
          {correctCount}
          <span style={{ fontSize: 15, color: T.muted, fontWeight: 400 }}>
            /{Object.keys(checked).length}
          </span>
        </span>
        <span style={{ fontSize: 13, color: T.muted }}>
          Complète les phrases
        </span>
        <button
          onClick={() => {
            setVals({});
            setChecked({});
          }}
          style={{
            padding: "6px 14px",
            borderRadius: 8,
            border: `1px solid ${T.border}`,
            background: "transparent",
            color: T.muted,
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "'Outfit',sans-serif",
          }}
        >
          Réinitialiser
        </button>
      </div>
      {BLANKS_DATA.map((q, i) => {
        const done = checked[i] !== undefined;
        const ok = checked[i];
        return (
          <div
            key={i}
            style={{
              background: T.surface,
              border: `1px solid ${
                done ? (ok ? T.green + "44" : T.red + "44") : T.border
              }`,
              borderRadius: 12,
              padding: "1rem 1.3rem",
              marginBottom: 10,
            }}
          >
            <div
              style={{
                fontSize: 14,
                color: T.text,
                lineHeight: 2,
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <span>
                {i + 1}. {q.pre}
              </span>
              <input
                type="text"
                value={vals[i] || ""}
                disabled={done}
                onChange={(e) =>
                  setVals((p) => ({ ...p, [i]: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !done) check(i);
                }}
                placeholder="____"
                style={{
                  width: 140,
                  background: done
                    ? ok
                      ? T.green + "22"
                      : T.red + "22"
                    : T.hover,
                  border: `1px solid ${
                    done ? (ok ? T.green : T.red) : T.border
                  }`,
                  borderRadius: 8,
                  padding: "4px 10px",
                  color: T.text,
                  fontFamily: "'Outfit',sans-serif",
                  fontSize: 14,
                  outline: "none",
                }}
              />
              <span>{q.post}</span>
            </div>
            <div style={{ fontSize: 12, color: T.faint, marginBottom: 8 }}>
              💡 Indice : {q.hint}
            </div>
            {!done && (
              <button
                onClick={() => check(i)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  border: `1px solid ${T.accent}`,
                  background: T.accent + "22",
                  color: T.accent,
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "'Outfit',sans-serif",
                }}
              >
                Vérifier
              </button>
            )}
            {done && !ok && (
              <div
                style={{
                  padding: "6px 10px",
                  background: T.red + "22",
                  borderRadius: 8,
                  fontSize: 13,
                  color: T.red,
                }}
              >
                Bonne réponse : <strong>{q.blank}</strong>
              </div>
            )}
            {done && ok && (
              <div
                style={{
                  padding: "6px 10px",
                  background: T.green + "22",
                  borderRadius: 8,
                  fontSize: 13,
                  color: T.green,
                }}
              >
                ✓ Correct !
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Exercice 4 : Associations ────────────────────────────────────────────
function Associations() {
  const [setIdx, setSetIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [matched, setMatched] = useState({});
  const [wrong, setWrong] = useState(null);
  const [rights] = useState(() =>
    ASSOC_SETS.map((s) => shuffle(s.pairs.map((p) => p.right)))
  );
  const dataset = ASSOC_SETS[setIdx];
  const score = Object.keys(matched).filter((k) => k.startsWith("l")).length;

  const handleLeft = (i) => {
    if (matched["l" + i]) return;
    setSelected({ side: "left", idx: i });
  };
  const handleRight = (j) => {
    if (matched["r" + j]) return;
    if (!selected || selected.side !== "left") {
      setSelected({ side: "right", idx: j });
      return;
    }
    const isCorrect = dataset.pairs[selected.idx].right === rights[setIdx][j];
    if (isCorrect) {
      setMatched((p) => ({
        ...p,
        ["l" + selected.idx]: true,
        ["r" + j]: true,
      }));
      setSelected(null);
    } else {
      setWrong({ l: selected.idx, r: j });
      setTimeout(() => {
        setWrong(null);
        setSelected(null);
      }, 800);
    }
  };
  const reset = () => {
    setMatched({});
    setSelected(null);
    setWrong(null);
  };

  return (
    <div>
      <div
        style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}
      >
        {ASSOC_SETS.map((s, i) => (
          <button
            key={i}
            onClick={() => {
              setSetIdx(i);
              reset();
            }}
            style={{
              padding: "5px 12px",
              borderRadius: 8,
              border: `1px solid ${setIdx === i ? T.teal : T.border}`,
              background: setIdx === i ? T.teal + "22" : "transparent",
              color: setIdx === i ? T.teal : T.muted,
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "'Outfit',sans-serif",
            }}
          >
            {s.title}
          </button>
        ))}
      </div>
      <div
        style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 12,
          padding: ".9rem 1.3rem",
          marginBottom: 14,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 24, fontWeight: 700, color: T.teal }}>
          {score}
          <span style={{ fontSize: 14, color: T.muted, fontWeight: 400 }}>
            /{dataset.pairs.length} paires
          </span>
        </span>
        <button
          onClick={reset}
          style={{
            padding: "6px 14px",
            borderRadius: 8,
            border: `1px solid ${T.border}`,
            background: "transparent",
            color: T.muted,
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "'Outfit',sans-serif",
          }}
        >
          Mélanger
        </button>
      </div>
      <p style={{ fontSize: 13, color: T.muted, marginBottom: 12 }}>
        Clique sur un élément à gauche puis son correspondant à droite.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {dataset.pairs.map((p, i) => {
            const isM = matched["l" + i],
              isSel =
                selected && selected.side === "left" && selected.idx === i,
              isW = wrong && wrong.l === i;
            return (
              <div
                key={i}
                onClick={() => handleLeft(i)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: `1px solid ${
                    isM
                      ? T.teal + "66"
                      : isSel
                      ? T.accent
                      : isW
                      ? T.red
                      : T.border
                  }`,
                  background: isM
                    ? T.teal + "15"
                    : isSel
                    ? T.accent + "22"
                    : isW
                    ? T.red + "22"
                    : T.hover,
                  color: isM ? T.teal : isSel ? T.accent : T.text,
                  fontSize: 13,
                  cursor: isM ? "default" : "pointer",
                  transition: "all 0.15s",
                }}
              >
                {p.left}
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rights[setIdx].map((r, j) => {
            const isM = matched["r" + j],
              isSel =
                selected && selected.side === "right" && selected.idx === j,
              isW = wrong && wrong.r === j;
            return (
              <div
                key={j}
                onClick={() => handleRight(j)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: `1px solid ${
                    isM
                      ? T.teal + "66"
                      : isSel
                      ? T.accent
                      : isW
                      ? T.red
                      : T.border
                  }`,
                  background: isM
                    ? T.teal + "15"
                    : isSel
                    ? T.accent + "22"
                    : isW
                    ? T.red + "22"
                    : T.hover,
                  color: isM ? T.teal : isSel ? T.accent : T.text,
                  fontSize: 13,
                  cursor: isM ? "default" : "pointer",
                  transition: "all 0.15s",
                }}
              >
                {r}
              </div>
            );
          })}
        </div>
      </div>
      {score === dataset.pairs.length && (
        <div
          style={{
            marginTop: 14,
            padding: "1rem",
            background: T.teal + "22",
            border: `1px solid ${T.teal}44`,
            borderRadius: 10,
            fontSize: 14,
            color: T.teal,
            textAlign: "center",
            fontWeight: 600,
          }}
        >
          🎉 Toutes les paires trouvées !
        </div>
      )}
    </div>
  );
}

// ── Exercice 5 : Convertisseur ────────────────────────────────────────────
function ConvQuiz() {
  const gen = () => {
    const n = Math.floor(Math.random() * 256);
    return Math.random() > 0.5
      ? { q: n.toString(2).padStart(8, "0") + "₍₂₎ = ?₍₁₀₎", a: String(n) }
      : { q: n + "₍₁₀₎ = ?₍₂₎", a: n.toString(2).padStart(8, "0") };
  };
  const [q, setQ] = useState(gen);
  const [val, setVal] = useState("");
  const [res, setRes] = useState(null);
  const check = () => setRes(val.trim() === q.a);
  const next = () => {
    setQ(gen());
    setVal("");
    setRes(null);
  };
  return (
    <div>
      <p
        style={{
          fontSize: 14,
          fontWeight: 500,
          color: T.text,
          marginBottom: 10,
          fontFamily: "'JetBrains Mono',monospace",
        }}
      >
        {q.q}
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="text"
          value={val}
          disabled={res !== null}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && res === null) check();
          }}
          placeholder="Ta réponse..."
          style={{
            flex: 1,
            background: T.hover,
            border: `1px solid ${T.border}`,
            borderRadius: 8,
            padding: "6px 12px",
            color: T.text,
            fontFamily: "'Outfit',sans-serif",
            fontSize: 14,
            outline: "none",
          }}
        />
        {res === null ? (
          <button
            onClick={check}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              border: `1px solid ${T.accent}`,
              background: T.accent + "22",
              color: T.accent,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "'Outfit',sans-serif",
            }}
          >
            OK
          </button>
        ) : (
          <button
            onClick={next}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              border: `1px solid ${T.green}`,
              background: T.green + "22",
              color: T.green,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "'Outfit',sans-serif",
            }}
          >
            Suivant →
          </button>
        )}
      </div>
      {res !== null && (
        <div
          style={{
            marginTop: 8,
            padding: "8px 12px",
            background: res ? T.green + "22" : T.red + "22",
            borderRadius: 8,
            fontSize: 13,
            color: res ? T.green : T.red,
          }}
        >
          {res ? "✓ Correct !" : "✗ Réponse : " + q.a}
        </div>
      )}
    </div>
  );
}

function Convertisseur() {
  const [dec, setDec] = useState("");
  const [bin, setBin] = useState("");
  const [mode, setMode] = useState("d2b");
  const BITS = [128, 64, 32, 16, 8, 4, 2, 1];
  const bp = (bin || "").padStart(8, "0");
  const handleDec = (v) => {
    setDec(v);
    const n = parseInt(v);
    setBin(
      !isNaN(n) && n >= 0 && n <= 255 ? n.toString(2).padStart(8, "0") : ""
    );
  };
  const toggleBit = (i) => {
    const b = bp.split("");
    b[i] = b[i] === "1" ? "0" : "1";
    const nb = b.join("");
    setBin(nb);
    setDec(String(parseInt(nb, 2)));
  };
  const inpStyle = {
    background: T.hover,
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    padding: "6px 12px",
    color: T.text,
    fontFamily: "'Outfit',sans-serif",
    fontSize: 14,
    outline: "none",
  };
  return (
    <div>
      <Card>
        <STitle>Convertisseur binaire ↔ décimal</STitle>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {["d2b", "b2d"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: 8,
                border: `1px solid ${mode === m ? T.accent : T.border}`,
                background: mode === m ? T.accent + "22" : "transparent",
                color: mode === m ? T.accent : T.muted,
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "'Outfit',sans-serif",
                fontWeight: 500,
              }}
            >
              {m === "d2b" ? "Décimal → Binaire" : "Binaire → Décimal"}
            </button>
          ))}
        </div>
        {mode === "d2b" ? (
          <>
            <label
              style={{
                fontSize: 13,
                color: T.muted,
                display: "block",
                marginBottom: 6,
              }}
            >
              Entrez un nombre décimal (0–255) :
            </label>
            <input
              type="text"
              value={dec}
              onChange={(e) => handleDec(e.target.value)}
              placeholder="ex: 42"
              style={{ ...inpStyle, width: "100%", marginBottom: 12 }}
            />
            {bin && (
              <div>
                <div
                  style={{
                    display: "flex",
                    gap: 4,
                    justifyContent: "center",
                    marginBottom: 8,
                    flexWrap: "wrap",
                  }}
                >
                  {BITS.map((b, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <span style={{ fontSize: 10, color: T.faint }}>{b}</span>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          background: bp[i] === "1" ? T.accent + "33" : T.hover,
                          border: `1px solid ${
                            bp[i] === "1" ? T.accent : T.border
                          }`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "'JetBrains Mono',monospace",
                          fontWeight: 700,
                          fontSize: 16,
                          color: bp[i] === "1" ? T.accent : T.faint,
                        }}
                      >
                        {bp[i]}
                      </div>
                    </div>
                  ))}
                </div>
                <Formula>
                  {dec}₍₁₀₎ = {bp}₍₂₎
                </Formula>
              </div>
            )}
          </>
        ) : (
          <>
            <label
              style={{
                fontSize: 13,
                color: T.muted,
                display: "block",
                marginBottom: 6,
              }}
            >
              Clique sur les bits pour les activer :
            </label>
            <div
              style={{
                display: "flex",
                gap: 4,
                justifyContent: "center",
                marginBottom: 12,
                flexWrap: "wrap",
              }}
            >
              {BITS.map((b, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span style={{ fontSize: 10, color: T.faint }}>{b}</span>
                  <button
                    onClick={() => toggleBit(i)}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      background: bp[i] === "1" ? T.accent + "33" : T.hover,
                      border: `1px solid ${
                        bp[i] === "1" ? T.accent : T.border
                      }`,
                      fontFamily: "'JetBrains Mono',monospace",
                      fontWeight: 700,
                      fontSize: 18,
                      color: bp[i] === "1" ? T.accent : T.faint,
                      cursor: "pointer",
                    }}
                  >
                    {bp[i]}
                  </button>
                </div>
              ))}
            </div>
            <Formula>
              {bp}₍₂₎ = {parseInt(bp, 2)}₍₁₀₎
            </Formula>
          </>
        )}
      </Card>
      <Card>
        <STitle>Quiz conversion rapide</STitle>
        <ConvQuiz />
      </Card>
    </div>
  );
}

// ── Exercice 6 : Table de vérité ─────────────────────────────────────────
function TableVerite() {
  const [setIdx, setSetIdx] = useState(0);
  const [vals, setVals] = useState({});
  const [checked, setChecked] = useState(false);
  const dataset = TV_DATA[setIdx];

  const ansIdx = {};
  let ai = 0;
  dataset.rows.forEach((row, ri) =>
    row.forEach((cell, ci) => {
      if (cell === "?") {
        ansIdx[ri + "_" + ci] = ai++;
      }
    })
  );
  const total = Object.keys(ansIdx).length;
  const correctCount = checked
    ? Object.entries(ansIdx).filter(
        ([k, i]) => (vals[k] || "") === dataset.answers[i]
      ).length
    : 0;
  const reset = () => {
    setVals({});
    setChecked(false);
  };

  return (
    <div>
      <div
        style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 12 }}
      >
        {TV_DATA.map((s, i) => (
          <button
            key={i}
            onClick={() => {
              setSetIdx(i);
              reset();
            }}
            style={{
              padding: "5px 12px",
              borderRadius: 8,
              border: `1px solid ${setIdx === i ? T.blue : T.border}`,
              background: setIdx === i ? T.blue + "22" : "transparent",
              color: setIdx === i ? T.blue : T.muted,
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "'Outfit',sans-serif",
            }}
          >
            {s.title}
          </button>
        ))}
      </div>
      <p style={{ fontSize: 13, color: T.muted, marginBottom: 12 }}>
        Remplis les cases "?" avec 0 ou 1 :
      </p>
      <div style={{ overflowX: "auto", marginBottom: 14 }}>
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
        >
          <thead>
            <tr>
              {dataset.headers.map((h) => (
                <th
                  key={h}
                  style={{
                    background: "#0a0a12",
                    color: T.accentL,
                    padding: "8px 14px",
                    textAlign: "center",
                    border: `1px solid ${T.border}`,
                    fontFamily: "'JetBrains Mono',monospace",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataset.rows.map((row, ri) => (
              <tr
                key={ri}
                style={{ background: ri % 2 === 0 ? T.surface : T.hover }}
              >
                {row.map((cell, ci) => {
                  if (cell !== "?")
                    return (
                      <td
                        key={ci}
                        style={{
                          padding: "6px 14px",
                          textAlign: "center",
                          border: `1px solid ${T.border}`,
                          color: cell === "1" ? T.green : T.muted,
                          fontFamily: "'JetBrains Mono',monospace",
                        }}
                      >
                        {cell}
                      </td>
                    );
                  const k = ri + "_" + ci;
                  const idx2 = ansIdx[k];
                  const ok2 = checked
                    ? (vals[k] || "") === dataset.answers[idx2]
                    : null;
                  return (
                    <td
                      key={ci}
                      style={{
                        padding: "4px 8px",
                        textAlign: "center",
                        border: `1px solid ${T.border}`,
                      }}
                    >
                      <select
                        value={vals[k] || ""}
                        disabled={checked}
                        onChange={(e) =>
                          setVals((p) => ({ ...p, [k]: e.target.value }))
                        }
                        style={{
                          width: 60,
                          textAlign: "center",
                          borderRadius: 6,
                          border: `1px solid ${
                            ok2 === null ? T.border : ok2 ? T.green : T.red
                          }`,
                          background:
                            ok2 === null
                              ? T.hover
                              : ok2
                              ? T.green + "22"
                              : T.red + "22",
                          color: ok2 === null ? T.text : ok2 ? T.green : T.red,
                          padding: "4px",
                          fontFamily: "'JetBrains Mono',monospace",
                          fontSize: 13,
                          cursor: "pointer",
                        }}
                      >
                        <option value="">?</option>
                        <option value="0">0</option>
                        <option value="1">1</option>
                      </select>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {checked && (
        <div
          style={{
            marginBottom: 12,
            padding: "10px 14px",
            background: correctCount === total ? T.green + "22" : T.red + "22",
            borderRadius: 10,
            fontSize: 14,
            color: correctCount === total ? T.green : T.red,
            fontWeight: 600,
          }}
        >
          {correctCount}/{total} bonnes réponses{" "}
          {correctCount === total ? "🎉" : ""}
        </div>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        {!checked && (
          <button
            onClick={() => setChecked(true)}
            style={{
              padding: "8px 20px",
              borderRadius: 9,
              border: `1px solid ${T.blue}`,
              background: T.blue + "22",
              color: T.blue,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "'Outfit',sans-serif",
              fontWeight: 500,
            }}
          >
            Vérifier
          </button>
        )}
        <button
          onClick={reset}
          style={{
            padding: "8px 16px",
            borderRadius: 9,
            border: `1px solid ${T.border}`,
            background: "transparent",
            color: T.muted,
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "'Outfit',sans-serif",
          }}
        >
          Réinitialiser
        </button>
      </div>
    </div>
  );
}

// ── Exercice 7 : Ordonner ─────────────────────────────────────────────────
function Ordonner() {
  const [setIdx, setSetIdx] = useState(0);
  const [order, setOrder] = useState(() =>
    shuffle(ORDER_DATA[0].items.map((_, i) => i))
  );
  const [checked, setChecked] = useState(false);
  const dataset = ORDER_DATA[setIdx];
  const isCorrect = checked && order.every((v, i) => dataset.correct[i] === v);

  const move = (from, dir) => {
    const to = from + dir;
    if (to < 0 || to >= order.length) return;
    const a = [...order];
    [a[from], a[to]] = [a[to], a[from]];
    setOrder(a);
  };
  const switchSet = (i) => {
    setSetIdx(i);
    setOrder(shuffle(ORDER_DATA[i].items.map((_, j) => j)));
    setChecked(false);
  };
  const reset = () => {
    setOrder(shuffle(dataset.items.map((_, i) => i)));
    setChecked(false);
  };

  return (
    <div>
      <div
        style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}
      >
        {ORDER_DATA.map((s, i) => (
          <button
            key={i}
            onClick={() => switchSet(i)}
            style={{
              padding: "5px 12px",
              borderRadius: 8,
              border: `1px solid ${setIdx === i ? T.pink : T.border}`,
              background: setIdx === i ? T.pink + "22" : "transparent",
              color: setIdx === i ? T.pink : T.muted,
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "'Outfit',sans-serif",
            }}
          >
            {s.title}
          </button>
        ))}
      </div>
      <p style={{ fontSize: 13, color: T.muted, marginBottom: 12 }}>
        Remets les étapes dans le bon ordre avec les flèches ↑↓ :
      </p>
      {order.map((itemIdx, pos) => {
        const ok = checked ? dataset.correct[pos] === itemIdx : null;
        return (
          <div
            key={itemIdx}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: T.accent + "22",
                border: `1px solid ${T.accent}44`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                color: T.accent,
                flexShrink: 0,
              }}
            >
              {pos + 1}
            </div>
            <div
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: 10,
                border: `1px solid ${
                  ok === null ? T.border : ok ? T.green : T.red
                }`,
                background:
                  ok === null ? T.surface : ok ? T.green + "15" : T.red + "15",
                fontSize: 13,
                color: ok === null ? T.text : ok ? T.green : T.red,
              }}
            >
              {dataset.items[itemIdx]}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <button
                onClick={() => move(pos, -1)}
                disabled={pos === 0}
                style={{
                  width: 28,
                  height: 24,
                  borderRadius: 5,
                  border: `1px solid ${T.border}`,
                  background: "transparent",
                  color: T.muted,
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                ↑
              </button>
              <button
                onClick={() => move(pos, 1)}
                disabled={pos === order.length - 1}
                style={{
                  width: 28,
                  height: 24,
                  borderRadius: 5,
                  border: `1px solid ${T.border}`,
                  background: "transparent",
                  color: T.muted,
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                ↓
              </button>
            </div>
          </div>
        );
      })}
      {isCorrect && (
        <div
          style={{
            marginTop: 8,
            padding: "10px",
            background: T.green + "22",
            borderRadius: 10,
            fontSize: 14,
            color: T.green,
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          🎉 Parfait ! Ordre correct !
        </div>
      )}
      {checked && !isCorrect && (
        <div
          style={{
            marginTop: 8,
            padding: "10px",
            background: T.amber + "22",
            borderRadius: 10,
            fontSize: 14,
            color: T.amber,
          }}
        >
          Des étapes sont mal placées (en rouge). Continue à ajuster !
        </div>
      )}
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button
          onClick={() => setChecked(true)}
          style={{
            padding: "8px 20px",
            borderRadius: 9,
            border: `1px solid ${T.pink}`,
            background: T.pink + "22",
            color: T.pink,
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "'Outfit',sans-serif",
            fontWeight: 500,
          }}
        >
          Vérifier l'ordre
        </button>
        <button
          onClick={reset}
          style={{
            padding: "8px 16px",
            borderRadius: 9,
            border: `1px solid ${T.border}`,
            background: "transparent",
            color: T.muted,
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "'Outfit',sans-serif",
          }}
        >
          Mélanger
        </button>
      </div>
    </div>
  );
}

// ── Exercice 8 : Calcul guidé ─────────────────────────────────────────────
function CalcGuide() {
  const [setIdx, setSetIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [val, setVal] = useState("");
  const [res, setRes] = useState(null);
  const [done, setDone] = useState(false);
  const dataset = CALC_DATA[setIdx];
  const step = dataset.steps[stepIdx];
  const check = () => {
    const ok = val.trim().toLowerCase() === step.a.toLowerCase();
    setRes(ok);
    if (ok && stepIdx === dataset.steps.length - 1) setDone(true);
  };
  const next = () => {
    setStepIdx((i) => i + 1);
    setVal("");
    setRes(null);
  };
  const reset = () => {
    setStepIdx(0);
    setVal("");
    setRes(null);
    setDone(false);
  };
  const switchSet = (i) => {
    setSetIdx(i);
    reset();
  };

  return (
    <div>
      <div
        style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}
      >
        {CALC_DATA.map((s, i) => (
          <button
            key={i}
            onClick={() => switchSet(i)}
            style={{
              padding: "5px 12px",
              borderRadius: 8,
              border: `1px solid ${setIdx === i ? T.green : T.border}`,
              background: setIdx === i ? T.green + "22" : "transparent",
              color: setIdx === i ? T.green : T.muted,
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "'Outfit',sans-serif",
            }}
          >
            {s.title}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {dataset.steps.map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              background:
                i < stepIdx ? T.green : i === stepIdx ? T.accent : T.border,
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>
      {done ? (
        <div
          style={{
            background: T.green + "22",
            border: `1px solid ${T.green}44`,
            borderRadius: 12,
            padding: "1.5rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: T.green,
              marginBottom: 8,
            }}
          >
            🎉 Calcul complété !
          </div>
          <button
            onClick={reset}
            style={{
              padding: "8px 20px",
              borderRadius: 9,
              border: `1px solid ${T.green}`,
              background: T.green + "22",
              color: T.green,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "'Outfit',sans-serif",
            }}
          >
            Recommencer
          </button>
        </div>
      ) : (
        <Card>
          <div style={{ fontSize: 12, color: T.muted, marginBottom: 6 }}>
            Étape {stepIdx + 1}/{dataset.steps.length}
          </div>
          <p
            style={{
              fontSize: 15,
              fontWeight: 500,
              color: T.text,
              lineHeight: 1.6,
              marginBottom: 14,
            }}
          >
            {step.q}
          </p>
          <div style={{ fontSize: 12, color: T.faint, marginBottom: 10 }}>
            💡 {step.hint}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              value={val}
              disabled={res === true}
              onChange={(e) => setVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && res !== true) check();
              }}
              placeholder="Ta réponse..."
              style={{
                flex: 1,
                background: T.hover,
                border: `1px solid ${T.border}`,
                borderRadius: 8,
                padding: "6px 12px",
                color: T.text,
                fontFamily: "'Outfit',sans-serif",
                fontSize: 14,
                outline: "none",
              }}
            />
            {res !== true ? (
              <button
                onClick={check}
                style={{
                  padding: "6px 16px",
                  borderRadius: 8,
                  border: `1px solid ${T.accent}`,
                  background: T.accent + "22",
                  color: T.accent,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "'Outfit',sans-serif",
                }}
              >
                OK
              </button>
            ) : (
              stepIdx < dataset.steps.length - 1 && (
                <button
                  onClick={next}
                  style={{
                    padding: "6px 16px",
                    borderRadius: 8,
                    border: `1px solid ${T.green}`,
                    background: T.green + "22",
                    color: T.green,
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: "'Outfit',sans-serif",
                  }}
                >
                  Suivant →
                </button>
              )
            )}
          </div>
          {res === true && (
            <div
              style={{
                marginTop: 8,
                padding: "8px",
                background: T.green + "22",
                borderRadius: 8,
                fontSize: 13,
                color: T.green,
              }}
            >
              ✓ Correct !
            </div>
          )}
          {res === false && (
            <div
              style={{
                marginTop: 8,
                padding: "8px",
                background: T.red + "22",
                borderRadius: 8,
                fontSize: 13,
                color: T.red,
              }}
            >
              ✗ Réponse attendue : {step.a}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

// ── Minuteur ──────────────────────────────────────────────────────────────
function Timer({ C }) {
  const [duration, setDuration] = useState(25 * 60);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else clearInterval(intervalRef.current);
    return () => clearInterval(intervalRef.current);
  }, [running]);
  const fmt = (t) =>
    `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(
      2,
      "0"
    )}`;
  const pct = (timeLeft / duration) * 100;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        padding: "6px 12px",
      }}
    >
      <svg width="28" height="28" viewBox="0 0 28 28">
        <circle
          cx="14"
          cy="14"
          r="12"
          fill="none"
          stroke={C.border}
          strokeWidth="2"
        />
        <circle
          cx="14"
          cy="14"
          r="12"
          fill="none"
          stroke={C.accent}
          strokeWidth="2"
          strokeDasharray={String(Math.round(2 * Math.PI * 12))}
          strokeDashoffset={String(
            Math.round(2 * Math.PI * 12 * (1 - pct / 100))
          )}
          strokeLinecap="round"
          transform="rotate(-90 14 14)"
          style={{ transition: "stroke-dashoffset .5s" }}
        />
      </svg>
      <span
        style={{
          fontFamily: "'JetBrains Mono',monospace",
          fontSize: 14,
          color: timeLeft === 0 ? C.red : C.text,
          fontWeight: 600,
        }}
      >
        {fmt(timeLeft)}
      </span>
      <button
        onClick={() => setRunning((r) => !r)}
        style={{
          padding: "3px 8px",
          borderRadius: 6,
          border: `1px solid ${C.border}`,
          background: "transparent",
          color: C.muted,
          fontSize: 11,
          cursor: "pointer",
          fontFamily: "'Outfit',sans-serif",
        }}
      >
        {running ? "⏸" : "▶"}
      </button>
      <button
        onClick={() => {
          setRunning(false);
          setTimeLeft(duration);
        }}
        style={{
          padding: "3px 8px",
          borderRadius: 6,
          border: `1px solid ${C.border}`,
          background: "transparent",
          color: C.muted,
          fontSize: 11,
          cursor: "pointer",
          fontFamily: "'Outfit',sans-serif",
        }}
      >
        ↺
      </button>
      <select
        value={duration}
        onChange={(e) => {
          const v = +e.target.value;
          setDuration(v);
          setTimeLeft(v);
          setRunning(false);
        }}
        style={{
          background: "transparent",
          border: "none",
          color: C.muted,
          fontSize: 11,
          cursor: "pointer",
          fontFamily: "'Outfit',sans-serif",
          outline: "none",
        }}
      >
        <option value={5 * 60}>5 min</option>
        <option value={10 * 60}>10 min</option>
        <option value={15 * 60}>15 min</option>
        <option value={25 * 60}>25 min</option>
        <option value={45 * 60}>45 min</option>
      </select>
    </div>
  );
}

// ── Navigation ─────────────────────────────────────────────────────────────
const TOPICS = [
  { key: "binaire", label: "🔢 Binaire", color: "#6c63ff" },
  { key: "texte", label: "📝 Texte", color: "#3b82f6" },
  { key: "images", label: "🖼️ Images", color: "#ec4899" },
  { key: "son", label: "🎵 Son", color: "#22c55e" },
  { key: "redondance", label: "🔒 Redondance", color: "#f59e0b" },
  { key: "portes", label: "⚡ Portes logiques", color: "#3b82f6" },
  { key: "additionneurs", label: "➕ Additionneurs", color: "#ef4444" },
];
const EXOS = [
  { key: "qcm", label: "🎯 QCM", color: "#6c63ff" },
  { key: "vf", label: "✓✗ Vrai/Faux", color: "#14b8a6" },
  { key: "blanks", label: "📝 Compléter", color: "#3b82f6" },
  { key: "assoc", label: "🔗 Associations", color: "#14b8a6" },
  { key: "conv", label: "🔄 Convertisseur", color: "#f59e0b" },
  { key: "tv", label: "⊞ Table de vérité", color: "#3b82f6" },
  { key: "order", label: "🔢 Ordonner", color: "#ec4899" },
  { key: "calc", label: "🧮 Calcul guidé", color: "#22c55e" },
];

// ── App principal ──────────────────────────────────────────────────────────
export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [fontSize, setFontSize] = useState(14);
  const [active, setActive] = useState("binaire");
  const [flashMode, setFlashMode] = useState({});
  const [collapsed, setCollapsed] = useState(new Set());
  const [favorites, setFavorites] = useState(new Set());

  const C = darkMode ? DARK : LIGHT;
  const isExo = EXOS.some((e) => e.key === active);
  const topicColor = TOPICS.find((t) => t.key === active)?.color || C.accent;
  const isFlash = !isExo && !!flashMode[active];

  const toggleSection = useCallback((id) => {
    setCollapsed((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }, []);
  const toggleFav = useCallback((id) => {
    setFavorites((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }, []);

  const renderContent = () => {
    if (active === "qcm") return <QCM />;
    if (active === "vf") return <VraiFaux />;
    if (active === "blanks") return <Blanks />;
    if (active === "assoc") return <Associations />;
    if (active === "conv") return <Convertisseur />;
    if (active === "tv") return <TableVerite />;
    if (active === "order") return <Ordonner />;
    if (active === "calc") return <CalcGuide />;
    if (isFlash)
      return (
        <FlashcardMode
          topic={active}
          C={C}
          fs={fontSize}
          favorites={favorites}
          toggleFav={toggleFav}
        />
      );
    return (
      <FicheContent
        topic={active}
        C={C}
        fs={fontSize}
        collapsed={collapsed}
        toggleSection={toggleSection}
      />
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Outfit:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Outfit',sans-serif}
        ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:${C.bg}}::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .fade-in{animation:fadeIn 0.25s ease}
        select option{background:${C.surface};color:${C.text}}
      `}</style>
      <div
        style={{
          background: C.bg,
          color: C.text,
          fontFamily: "'Outfit',sans-serif",
          minHeight: "100vh",
          transition: "background .3s,color .3s",
        }}
      >
        <div
          style={{ maxWidth: 860, margin: "0 auto", padding: "1rem 1rem 5rem" }}
        >
          {/* Header */}
          <div
            style={{
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: ".15em",
                  color: C.accent,
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                Révision 1M
              </div>
              <h1
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: C.text,
                  lineHeight: 1.2,
                  marginBottom: 2,
                }}
              >
                Test d'informatique
              </h1>
              <p style={{ fontSize: 13, color: C.muted }}>
                Représentation de l'information & Systèmes logiques
              </p>
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <Timer C={C} />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 10,
                  padding: "4px 8px",
                }}
              >
                <span style={{ fontSize: 11, color: C.muted }}>Aa</span>
                <button
                  onClick={() => setFontSize((f) => Math.max(11, f - 1))}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    border: `1px solid ${C.border}`,
                    background: "transparent",
                    color: C.muted,
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                >
                  −
                </button>
                <span
                  style={{
                    fontSize: 12,
                    color: C.text,
                    minWidth: 20,
                    textAlign: "center",
                  }}
                >
                  {fontSize}
                </span>
                <button
                  onClick={() => setFontSize((f) => Math.min(20, f + 1))}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    border: `1px solid ${C.border}`,
                    background: "transparent",
                    color: C.muted,
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                >
                  +
                </button>
              </div>
              <button
                onClick={() => setDarkMode((d) => !d)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 9,
                  border: `1px solid ${C.border}`,
                  background: C.surface,
                  color: C.text,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "'Outfit',sans-serif",
                }}
              >
                {darkMode ? "☀️ Clair" : "🌙 Sombre"}
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: 11,
                color: C.faint,
                textTransform: "uppercase",
                letterSpacing: ".08em",
                marginBottom: 6,
              }}
            >
              Fiches
            </div>
            <div
              style={{
                display: "flex",
                gap: 5,
                flexWrap: "wrap",
                marginBottom: 10,
              }}
            >
              {TOPICS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActive(t.key)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 8,
                    border: `1px solid ${
                      active === t.key ? t.color : C.border
                    }`,
                    background:
                      active === t.key ? t.color + "22" : "transparent",
                    color: active === t.key ? t.color : C.muted,
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: "'Outfit',sans-serif",
                    fontWeight: active === t.key ? 600 : 400,
                    transition: "all .15s",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div
              style={{
                fontSize: 11,
                color: C.faint,
                textTransform: "uppercase",
                letterSpacing: ".08em",
                marginBottom: 6,
              }}
            >
              Exercices
            </div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {EXOS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActive(t.key)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 8,
                    border: `1px solid ${
                      active === t.key ? t.color : C.border
                    }`,
                    background:
                      active === t.key ? t.color + "22" : "transparent",
                    color: active === t.key ? t.color : C.muted,
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: "'Outfit',sans-serif",
                    fontWeight: active === t.key ? 600 : 400,
                    transition: "all .15s",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Barre options fiches (cachée pour exercices) */}
          {!isExo && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 14,
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: "10px 14px",
              }}
            >
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() =>
                    setFlashMode((f) => ({ ...f, [active]: false }))
                  }
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    border: `1px solid ${!isFlash ? topicColor : C.border}`,
                    background: !isFlash ? topicColor + "22" : "transparent",
                    color: !isFlash ? topicColor : C.muted,
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: "'Outfit',sans-serif",
                    fontWeight: !isFlash ? 600 : 400,
                  }}
                >
                  📖 Lecture
                </button>
                <button
                  onClick={() =>
                    setFlashMode((f) => ({ ...f, [active]: true }))
                  }
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    border: `1px solid ${isFlash ? topicColor : C.border}`,
                    background: isFlash ? topicColor + "22" : "transparent",
                    color: isFlash ? topicColor : C.muted,
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: "'Outfit',sans-serif",
                    fontWeight: isFlash ? 600 : 400,
                  }}
                >
                  🃏 Flashcards
                </button>
              </div>
              {!isFlash && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button
                    onClick={() => setCollapsed(new Set())}
                    style={{
                      padding: "5px 10px",
                      borderRadius: 7,
                      border: `1px solid ${C.border}`,
                      background: "transparent",
                      color: C.muted,
                      fontSize: 11,
                      cursor: "pointer",
                      fontFamily: "'Outfit',sans-serif",
                    }}
                  >
                    ▼ Tout afficher
                  </button>
                  <button
                    onClick={() => {
                      const m = SECTIONS_META[active] || [];
                      setCollapsed(new Set(m.map((s) => s.id)));
                    }}
                    style={{
                      padding: "5px 10px",
                      borderRadius: 7,
                      border: `1px solid ${C.border}`,
                      background: "transparent",
                      color: C.muted,
                      fontSize: 11,
                      cursor: "pointer",
                      fontFamily: "'Outfit',sans-serif",
                    }}
                  >
                    ▲ Tout masquer
                  </button>
                  {["concept", "formule", "exemple", "définition"].map(
                    (type) => {
                      const meta = SECTIONS_META[active] || [];
                      const ids = meta
                        .filter((s) => s.type === type)
                        .map((s) => s.id);
                      if (!ids.length) return null;
                      const tc = {
                        concept: C.blue,
                        formule: C.accent,
                        exemple: C.green,
                        définition: C.teal,
                      }[type];
                      const allC = ids.every((id) => collapsed.has(id));
                      return (
                        <button
                          key={type}
                          onClick={() =>
                            setCollapsed((s) => {
                              const n = new Set(s);
                              if (allC) ids.forEach((id) => n.delete(id));
                              else ids.forEach((id) => n.add(id));
                              return n;
                            })
                          }
                          style={{
                            padding: "3px 8px",
                            borderRadius: 6,
                            border: `1px solid ${tc}44`,
                            background: tc + "15",
                            color: tc,
                            fontSize: 11,
                            cursor: "pointer",
                            fontFamily: "'Outfit',sans-serif",
                          }}
                        >
                          {allC ? "▼" : "▲"} {type}s
                        </button>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          )}

          {/* Contenu principal */}
          <div
            key={active + (isFlash ? "_flash" : "")}
            style={{ animation: "fadeIn 0.25s ease" }}
          >
            {renderContent()}
          </div>

          {/* Favoris */}
          {favorites.size > 0 && !isExo && (
            <div
              style={{
                marginTop: 24,
                background: C.surface,
                border: `1px solid ${C.amber}44`,
                borderRadius: 12,
                padding: "1rem 1.4rem",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.amber,
                  marginBottom: 8,
                }}
              >
                ⭐ Flashcards favorites ({favorites.size})
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {[...favorites].map((fk) => {
                  const [ftopic, idxStr] = fk.split("_");
                  const card = FLASHCARDS[ftopic]?.[+idxStr];
                  if (!card) return null;
                  return (
                    <span
                      key={fk}
                      style={{
                        background: C.amber + "15",
                        border: `1px solid ${C.amber}44`,
                        color: C.amber,
                        fontSize: 12,
                        padding: "3px 10px",
                        borderRadius: 20,
                      }}
                    >
                      {card.q.slice(0, 40)}
                      {card.q.length > 40 ? "…" : ""}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
