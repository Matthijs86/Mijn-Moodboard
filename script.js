
/* ======================================
   MIJN MOODBOARD
   SCRIPT.JS - VERSIE 2
   Permanente opslag met IndexedDB
   ====================================== */


/* ======================================
   1. ELEMENTEN OPHALEN
   ====================================== */

const categorieContainer =
    document.getElementById("categorieContainer");

const categorieToevoegen =
    document.getElementById("categorieToevoegen");

const startpagina =
    document.getElementById("startpagina");

const moodboardPagina =
    document.getElementById("moodboardPagina");

const moodboardTitel =
    document.getElementById("moodboardTitel");

const terugNaarStart =
    document.getElementById("terugNaarStart");

const moodboardWerkvlak =
    document.getElementById("moodboardWerkvlak");

const afbeeldingToevoegen =
    document.getElementById("afbeeldingToevoegen");

const afbeeldingUpload =
    document.getElementById("afbeeldingUpload");

const notitieToevoegen =
    document.getElementById("notitieToevoegen");

const linkToevoegen =
    document.getElementById("linkToevoegen");

const afbeeldingBijsnijden =
    document.getElementById("afbeeldingBijsnijden");

const bijsnijdenCanvas =
    document.getElementById("bijsnijdenCanvas");

const bijsnijdenWerkvlak =
    document.getElementById("bijsnijdenWerkvlak");

const bijsnijdenAnnuleren =
    document.getElementById("bijsnijdenAnnuleren");

const bijsnijdenBevestigen =
    document.getElementById("bijsnijdenBevestigen");



/* ======================================
   2. CATEGORIEËN
   ====================================== */

const standaardCategorieen = [
    { naam: "Tuin", icoon: "🌿" },
    { naam: "Woonkamer", icoon: "🛋️" },
    { naam: "Gang", icoon: "🚪" },
    { naam: "Keuken", icoon: "🍽️" },
    { naam: "Slaapkamer", icoon: "🛏️" },
    { naam: "Badkamer", icoon: "🛁" }
];

let categorieen = [];

let actieveCategorie = null;

let database = null;

let actieveAfbeeldingUrls = [];


/* ======================================
   3. INDEXEDDB INSTELLEN
   ====================================== */

const DATABASE_NAAM = "MijnMoodboardDatabase";

const DATABASE_VERSIE = 1;

function databaseOpenen() {

    return new Promise((resolve, reject) => {

        const aanvraag = indexedDB.open(
            DATABASE_NAAM,
            DATABASE_VERSIE
        );

        aanvraag.onupgradeneeded = (event) => {

            const db = event.target.result;

            if (!db.objectStoreNames.contains("onderdelen")) {

                const opslag = db.createObjectStore(
                    "onderdelen",
                    { keyPath: "id" }
                );

                opslag.createIndex(
                    "categorie",
                    "categorie",
                    { unique: false }
                );

            }

        };

        aanvraag.onsuccess = (event) => {

            database = event.target.result;

            database.onversionchange = () => {
                database.close();
            };

            resolve(database);

        };

        aanvraag.onerror = () => {

            reject(aanvraag.error);

        };

    });

}


/* ======================================
   4. GEGEVENS OPSLAAN
   ====================================== */

function onderdeelOpslaan(onderdeel) {

    return new Promise((resolve, reject) => {

        const transactie = database.transaction(
            "onderdelen",
            "readwrite"
        );

        const opslag = transactie.objectStore("onderdelen");

        opslag.put(onderdeel);

        transactie.oncomplete = () => resolve();

        transactie.onerror = () => reject(transactie.error);

        transactie.onabort = () => reject(transactie.error);

    });

}


/* ======================================
   5. GEGEVENS OPHALEN
   ====================================== */

function onderdelenOphalen(categorie) {

    return new Promise((resolve, reject) => {

        const transactie = database.transaction(
            "onderdelen",
            "readonly"
        );

        const opslag = transactie.objectStore("onderdelen");

        const index = opslag.index("categorie");

        const aanvraag = index.getAll(categorie);

        aanvraag.onsuccess = () => {

            resolve(aanvraag.result);

        };

        aanvraag.onerror = () => {

            reject(aanvraag.error);

        };

    });

}


/* ======================================
   6. GEGEVENS VERWIJDEREN
   ====================================== */

function onderdeelVerwijderen(id) {

    return new Promise((resolve, reject) => {

        const transactie = database.transaction(
            "onderdelen",
            "readwrite"
        );

        const opslag = transactie.objectStore("onderdelen");

        opslag.delete(id);

        transactie.oncomplete = () => resolve();

        transactie.onerror = () => reject(transactie.error);

        transactie.onabort = () => reject(transactie.error);

    });

}


/* ======================================
   7. UNIEKE ID MAKEN
   ====================================== */

function nieuwID() {

    if (crypto.randomUUID) {
        return crypto.randomUUID();
    }

    return (
        Date.now().toString(36) +
        Math.random().toString(36).slice(2)
    );

}


/* ======================================
   8. CATEGORIEËN OPSLAAN
   ====================================== */

function categorieenOpslaan() {

    localStorage.setItem(
        "moodboardCategorieen",
        JSON.stringify(categorieen)
    );

}


/* ======================================
   9. CATEGORIEËN LADEN
   ====================================== */

function categorieenLaden() {

    const opgeslagen = localStorage.getItem(
        "moodboardCategorieen"
    );

    if (opgeslagen) {

        try {

            const gegevens = JSON.parse(opgeslagen);

            categorieen = Array.isArray(gegevens)
                ? gegevens.filter(
                    item =>
                        item &&
                        typeof item.naam === "string" &&
                        item.naam.trim()
                )
                : [...standaardCategorieen];

        } catch (fout) {

            console.error(
                "Categorieën konden niet worden geladen:",
                fout
            );

            categorieen = [...standaardCategorieen];

        }

    } else {

        categorieen = [...standaardCategorieen];

        categorieenOpslaan();

    }

    categorieenWeergeven();

}


/* ======================================
   10. CATEGORIEËN WEERGEVEN
   ====================================== */

function categorieenWeergeven() {

    categorieContainer.innerHTML = "";

    categorieen.forEach((categorie) => {

        const kaart = document.createElement("button");

        kaart.type = "button";

        kaart.className = "categorie-kaart";

        const icoon = document.createElement("span");

        icoon.className = "categorie-icoon";

        icoon.textContent = categorie.icoon || "📌";

        const naam = document.createElement("span");

        naam.textContent = categorie.naam;

        kaart.appendChild(icoon);

        kaart.appendChild(naam);

        kaart.addEventListener("click", () => {

            moodboardOpenen(categorie);

        });

        categorieContainer.appendChild(kaart);

    });

}


/* ======================================
   11. NIEUWE CATEGORIE TOEVOEGEN
   ====================================== */

categorieToevoegen.addEventListener("click", () => {

    const naam = prompt(
        "Hoe wil je de nieuwe categorie noemen?"
    );

    if (!naam || !naam.trim()) {
        return;
    }

    const nieuweNaam = naam.trim();

    const bestaatAl = categorieen.some(
        categorie =>
            categorie.naam.toLowerCase() ===
            nieuweNaam.toLowerCase()
    );

    if (bestaatAl) {

        alert("Deze categorie bestaat al.");

        return;

    }

    categorieen.push({

        naam: nieuweNaam,

        icoon: "📌"

    });

    categorieenOpslaan();

    categorieenWeergeven();

});


/* ======================================
   12. OUDE AFBEELDING-URLS OPRUIMEN
   ====================================== */

function afbeeldingUrlsOpruimen() {

    actieveAfbeeldingUrls.forEach(url => {

        URL.revokeObjectURL(url);

    });

    actieveAfbeeldingUrls = [];

}


/* ======================================
   13. MOODBOARD OPENEN
   ====================================== */

async function moodboardOpenen(categorie) {

    actieveCategorie = categorie.naam;

    moodboardTitel.textContent = categorie.naam;

    startpagina.classList.add("verborgen");

    moodboardPagina.classList.remove("verborgen");

    await moodboardWeergeven();

}


/* ======================================
   14. MOODBOARD TERUG LADEN
   ====================================== */

async function moodboardWeergeven() {

    afbeeldingUrlsOpruimen();

    moodboardWerkvlak.innerHTML = "";
    moodboardWerkvlak.style.minHeight = "";

    try {

        const onderdelen = await onderdelenOphalen(
            actieveCategorie
        );

        if (onderdelen.length === 0) {

            const legeTekst = document.createElement("p");

            legeTekst.className = "lege-moodboard-tekst";

            legeTekst.textContent =
                "Jouw ideeën beginnen hier. ❤️";

            moodboardWerkvlak.appendChild(legeTekst);

            return;

        }

        onderdelen.sort(
            (a, b) => a.aangemaakt - b.aangemaakt
        );

        onderdelen.forEach(onderdeel => {

            onderdeelWeergeven(onderdeel);

        });

    } catch (fout) {

        console.error(
            "Moodboard kon niet worden geladen:",
            fout
        );

        alert(
            "Het moodboard kon niet worden geladen."
        );

    }

}


/* ======================================
   15. TERUG NAAR STARTPAGINA
   ====================================== */

terugNaarStart.addEventListener("click", () => {

    afbeeldingUrlsOpruimen();

    moodboardPagina.classList.add("verborgen");

    startpagina.classList.remove("verborgen");

    actieveCategorie = null;

});


/* ======================================
   16. LEGE TEKST VERWIJDEREN
   ====================================== */

function legeTekstControleren() {

    const legeTekst = moodboardWerkvlak.querySelector(
        ".lege-moodboard-tekst"
    );

    if (legeTekst) {

        legeTekst.remove();

    }

}

/* ======================================
   ONDERDELEN VRIJ VERPLAATSEN
   ====================================== */

function verslepenInstellen(kaart, onderdeel) {

    let actief = false;
    let pointerId = null;

    let offsetX = 0;
    let offsetY = 0;

    kaart.addEventListener("pointerdown", (event) => {

        // Knoppen en weblinks blijven gewoon aanklikbaar.
        if (event.target.closest("button, a")) {
            return;
        }

        if (event.pointerType === "mouse" && event.button !== 0) {
            return;
        }

        event.preventDefault();

        const kaartRect = kaart.getBoundingClientRect();

        offsetX = event.clientX - kaartRect.left;
        offsetY = event.clientY - kaartRect.top;

        actief = true;
        pointerId = event.pointerId;

        kaart.setPointerCapture(event.pointerId);

    });

    kaart.addEventListener("pointermove", (event) => {

        if (!actief || event.pointerId !== pointerId) {
            return;
        }

        event.preventDefault();

        const werkvlakRect =
            moodboardWerkvlak.getBoundingClientRect();

        const maximaleLinks =
            Math.max(
                0,
                moodboardWerkvlak.clientWidth - kaart.offsetWidth
            );

        const links = Math.min(
            maximaleLinks,
            Math.max(
                0,
                event.clientX - werkvlakRect.left - offsetX
            )
        );

        const boven = Math.max(
            0,
            event.clientY - werkvlakRect.top - offsetY
        );

        kaart.style.left = `${links}px`;
        kaart.style.top = `${boven}px`;

        werkvlakHoogteBijwerken();

    });

    async function verplaatsingOpslaan(event) {

        if (!actief || event.pointerId !== pointerId) {
            return;
        }

        actief = false;
        pointerId = null;

        onderdeel.x = Math.round(
            parseFloat(kaart.style.left) || 0
        );

        onderdeel.y = Math.round(
            parseFloat(kaart.style.top) || 0
        );

        try {

            await onderdeelOpslaan(onderdeel);

        } catch (fout) {

            console.error(
                "Nieuwe positie opslaan mislukt:",
                fout
            );

            alert(
                "De nieuwe positie kon niet worden opgeslagen."
            );

        }

        werkvlakHoogteBijwerken();

    }

    kaart.addEventListener(
        "pointerup",
        verplaatsingOpslaan
    );

    kaart.addEventListener(
        "pointercancel",
        verplaatsingOpslaan
    );

}


/* ======================================
   HOOGTE MOODBOARD WERKVLAK BIJWERKEN
   ====================================== */

function werkvlakHoogteBijwerken() {

    const kaarten = Array.from(
        moodboardWerkvlak.querySelectorAll(
            ".moodboard-onderdeel"
        )
    );

    const laagstePunt = kaarten.reduce(
        (hoogste, kaart) => {

            return Math.max(
                hoogste,
                kaart.offsetTop + kaart.offsetHeight
            );

        },
        0
    );

    const minimaleHoogte = window.innerHeight * 0.65;

    moodboardWerkvlak.style.minHeight =
        `${Math.max(minimaleHoogte, laagstePunt + 20)}px`;

}


/* ======================================
   17. NIEUW ONDERDEEL WEERGEVEN
   ====================================== */

function onderdeelWeergeven(onderdeel) {

    legeTekstControleren();

   
const kaart = document.createElement("div");

kaart.className = "moodboard-onderdeel";

// Bepalen of dit onderdeel al een opgeslagen positie heeft.
const heeftPositie =
    Number.isFinite(onderdeel.x) &&
    Number.isFinite(onderdeel.y);

// Oude onderdelen krijgen automatisch een nieuwe positie.
if (!heeftPositie) {

    const bestaandeKaarten = Array.from(
        moodboardWerkvlak.querySelectorAll(
            ".moodboard-onderdeel"
        )
    );

    const laagstePunt = bestaandeKaarten.reduce(
        (hoogste, bestaandeKaart) => {

            return Math.max(
                hoogste,
                bestaandeKaart.offsetTop +
                bestaandeKaart.offsetHeight
            );

        },
        0
    );

    onderdeel.x = 12;
    onderdeel.y = laagstePunt + 12;

}

kaart.style.left = `${onderdeel.x}px`;
kaart.style.top = `${onderdeel.y}px`;

kaart.style.display = "block";

kaart.style.width = "fit-content";

kaart.style.maxWidth = "calc(100% - 20px)";

kaart.style.margin = "0";


    kaart.style.borderRadius = "12px";

    kaart.style.boxShadow =
        "0 3px 10px rgba(0,0,0,0.08)";

    kaart.style.overflowWrap = "anywhere";

    kaart.style.background = "#ffffff";


    /* AFBEELDING */

    
    if (onderdeel.type === "afbeelding") {

        const afbeelding = document.createElement("img");

        const url = URL.createObjectURL(onderdeel.bestand);

        actieveAfbeeldingUrls.push(url);

        afbeelding.src = url;

        afbeelding.alt = "Mijn inspiratieafbeelding";

        afbeelding.style.display = "block";

        afbeelding.style.width =
            `${onderdeel.breedte || 280}px`;

        afbeelding.style.maxWidth = "none";

        afbeelding.style.height = "auto";

        afbeelding.style.borderRadius = "8px";

        afbeelding.style.pointerEvents = "none";

        kaart.appendChild(afbeelding);

        // Vergroot- en verkleinknop
        const formaatKnop = document.createElement("div");

        formaatKnop.textContent = "↘";

        formaatKnop.title = "Afbeelding groter of kleiner maken";

        formaatKnop.style.position = "absolute";
        formaatKnop.style.right = "4px";
        formaatKnop.style.bottom = "4px";
        formaatKnop.style.width = "30px";
        formaatKnop.style.height = "30px";
        formaatKnop.style.display = "flex";
        formaatKnop.style.alignItems = "center";
        formaatKnop.style.justifyContent = "center";
        formaatKnop.style.background = "#ffffff";
        formaatKnop.style.color = "#8062ca";
        formaatKnop.style.borderRadius = "50%";
        formaatKnop.style.fontSize = "20px";
        formaatKnop.style.fontWeight = "bold";
        formaatKnop.style.cursor = "nwse-resize";
        formaatKnop.style.touchAction = "none";
        formaatKnop.style.userSelect = "none";
        formaatKnop.style.zIndex = "5";

        kaart.appendChild(formaatKnop);

        let formaatActief = false;
        let beginX = 0;
        let beginBreedte = 0;
        let pointerId = null;

        formaatKnop.addEventListener("pointerdown", (event) => {

            event.preventDefault();
            event.stopPropagation();

            formaatActief = true;
            pointerId = event.pointerId;

            beginX = event.clientX;
            beginBreedte = afbeelding.offsetWidth;

            formaatKnop.setPointerCapture(event.pointerId);

        });

        formaatKnop.addEventListener("pointermove", (event) => {

            if (!formaatActief || event.pointerId !== pointerId) {
                return;
            }

            event.preventDefault();

            const verschil = event.clientX - beginX;

            const nieuweBreedte = Math.min(
                800,
                Math.max(80, beginBreedte + verschil)
            );

            afbeelding.style.width = `${nieuweBreedte}px`;

        });

        async function formaatOpslaan(event) {

            if (!formaatActief || event.pointerId !== pointerId) {
                return;
            }

            formaatActief = false;
            pointerId = null;

            onderdeel.breedte = Math.round(
                afbeelding.offsetWidth
            );

            try {

                await onderdeelOpslaan(onderdeel);

            } catch (fout) {

                console.error(
                    "Afbeeldingsformaat opslaan mislukt:",
                    fout
                );

                alert(
                    "Het nieuwe formaat kon niet worden opgeslagen."
                );

            }

            werkvlakHoogteBijwerken();

        }

        formaatKnop.addEventListener(
            "pointerup",
            formaatOpslaan
        );

        formaatKnop.addEventListener(
            "pointercancel",
            formaatOpslaan
        );

    }



    /* NOTITIE */

    
    if (onderdeel.type === "notitie") {

        kaart.style.background = "#e5f4fc";
        kaart.style.border = "2px solid #8bc9e9";
        kaart.style.borderRadius = "14px";
        kaart.style.boxShadow = "0 3px 12px rgba(53, 143, 190, 0.18)";
        kaart.style.minWidth = "150px";
        kaart.style.width = `${onderdeel.breedte || 220}px`;
        kaart.style.maxWidth = "600px";
        kaart.style.boxSizing = "border-box";
        kaart.style.padding = "12px";

        const tekst = document.createElement("p");

        tekst.textContent = onderdeel.tekst;

        tekst.style.margin = "0 0 10px";
        tekst.style.whiteSpace = "pre-wrap";
        tekst.style.color = "#21445b";
        tekst.style.fontFamily = "'Trebuchet MS', sans-serif";
        tekst.style.fontSize = "15px";
        lineHeight = "1.5";

        kaart.appendChild(tekst);

        // Knoppencontainer
        const knoppen = document.createElement("div");

        knoppen.style.display = "flex";
        knoppen.style.gap = "8px";
        knoppen.style.marginTop = "8px";

        // Potloodknop
        const bewerkenKnop = document.createElement("button");

        bewerkenKnop.type = "button";
        bewerkenKnop.textContent = "✏️";
        bewerkenKnop.title = "Notitie bewerken";

        bewerkenKnop.addEventListener("click", (event) => {

            event.stopPropagation();

            const invoer = document.createElement("textarea");

            invoer.value = onderdeel.tekst;


        invoer.style.width = "100%";
        invoer.style.minHeight = "110px";
        invoer.style.boxSizing = "border-box";
        invoer.style.padding = "12px";

        invoer.style.background = "#f1edfc";
        invoer.style.border = "2px solid #b9a5eb";
        invoer.style.borderRadius = "12px";

        invoer.style.color = "#493c70";
        invoer.style.fontFamily = "'Trebuchet MS', sans-serif";
        invoer.style.fontSize = "15px";
        invoer.style.lineHeight = "1.5";

        invoer.style.resize = "vertical";


            tekst.replaceWith(invoer);

            // Formaatknop tijdelijk verbergen
            formaatKnop.style.display = "none";

            knoppen.innerHTML = "";

            
const opslaanKnop = document.createElement("button");

opslaanKnop.type = "button";
opslaanKnop.textContent = "💾 Opslaan";

opslaanKnop.style.padding = "10px 16px";
opslaanKnop.style.background = "#dff3fa";
opslaanKnop.style.border = "2px solid #69bce5";
opslaanKnop.style.borderRadius = "11px";
opslaanKnop.style.color = "#21445b";
opslaanKnop.style.fontFamily = "'Trebuchet MS', sans-serif";
opslaanKnop.style.fontSize = "14px";
opslaanKnop.style.fontWeight = "700";
opslaanKnop.style.boxShadow = "0 2px 8px rgba(53, 143, 190, 0.18)";
opslaanKnop.style.cursor = "pointer";


const annulerenKnop = document.createElement("button");

annulerenKnop.type = "button";
annulerenKnop.textContent = "Annuleren";

annulerenKnop.style.padding = "10px 16px";
annulerenKnop.style.background = "#f1edfc";
annulerenKnop.style.border = "2px solid #b9a5eb";
annulerenKnop.style.borderRadius = "11px";
annulerenKnop.style.color = "#493c70";
annulerenKnop.style.fontFamily = "'Trebuchet MS', sans-serif";
annulerenKnop.style.fontSize = "14px";
annulerenKnop.style.fontWeight = "700";
annulerenKnop.style.boxShadow = "0 2px 8px rgba(152, 114, 232, 0.18)";
annulerenKnop.style.cursor = "pointer";


            opslaanKnop.addEventListener("click", async () => {

                const nieuweTekst = invoer.value.trim();

                if (!nieuweTekst) {
                    alert("Een notitie mag niet leeg zijn.");
                    return;
                }

                onderdeel.tekst = nieuweTekst;

                try {

                    await onderdeelOpslaan(onderdeel);

                    await moodboardWeergeven();

                } catch (fout) {

                    console.error(fout);

                    alert("De notitie kon niet worden opgeslagen.");

                }

            });

            annulerenKnop.addEventListener("click", () => {

                moodboardWeergeven();

            });

            knoppen.appendChild(opslaanKnop);
            knoppen.appendChild(annulerenKnop);

            invoer.focus();

        });

        knoppen.appendChild(bewerkenKnop);

        kaart.appendChild(knoppen);

        // Formaat aanpassen
        const formaatKnop = document.createElement("button");

        formaatKnop.type = "button";
        formaatKnop.textContent = "↘";
        formaatKnop.title = "Notitie groter of kleiner maken";

        formaatKnop.style.position = "absolute";
        formaatKnop.style.right = "4px";
        formaatKnop.style.bottom = "4px";
        formaatKnop.style.width = "30px";
        formaatKnop.style.height = "30px";
        formaatKnop.style.display = "flex";
        formaatKnop.style.alignItems = "center";
        formaatKnop.style.justifyContent = "center";
        formaatKnop.style.background = "#ffffff";
        formaatKnop.style.color = "#8062ca";
        formaatKnop.style.border = "none";
        formaatKnop.style.borderRadius = "50%";
        formaatKnop.style.fontSize = "20px";
        formaatKnop.style.fontWeight = "bold";
        formaatKnop.style.cursor = "nwse-resize";
        formaatKnop.style.touchAction = "none";
        formaatKnop.style.userSelect = "none";
        formaatKnop.style.zIndex = "5";

        kaart.appendChild(formaatKnop);

        let formaatActief = false;
        let beginX = 0;
        let beginBreedte = 0;
        let pointerId = null;

        formaatKnop.addEventListener("pointerdown", (event) => {

            event.preventDefault();
            event.stopPropagation();

            formaatActief = true;
            pointerId = event.pointerId;

            beginX = event.clientX;
            beginBreedte = kaart.offsetWidth;

            formaatKnop.setPointerCapture(event.pointerId);

        });

        formaatKnop.addEventListener("pointermove", (event) => {

            if (!formaatActief || event.pointerId !== pointerId) {
                return;
            }

            event.preventDefault();

            const verschil = event.clientX - beginX;

            const nieuweBreedte = Math.min(
                600,
                Math.max(150, beginBreedte + verschil)
            );

            kaart.style.width = `${nieuweBreedte}px`;

        });

        async function notitieFormaatOpslaan(event) {

            if (!formaatActief || event.pointerId !== pointerId) {
                return;
            }

            formaatActief = false;
            pointerId = null;

            onderdeel.breedte = Math.round(
                kaart.getBoundingClientRect().width
            );

            try {

                await onderdeelOpslaan(onderdeel);

            } catch (fout) {

                console.error(
                    "Notitieformaat opslaan mislukt:",
                    fout
                );

                alert(
                    "Het nieuwe formaat kon niet worden opgeslagen."
                );

            }

            werkvlakHoogteBijwerken();

        }

        formaatKnop.addEventListener(
            "pointerup",
            notitieFormaatOpslaan
        );

        formaatKnop.addEventListener(
            "pointercancel",
            notitieFormaatOpslaan
        );

    }

    


    /* WEBLINK */

   
    if (onderdeel.type === "link") {

        kaart.style.background = "#f1edfc";
        kaart.style.border = "2px solid #b9a5eb";
        kaart.style.borderRadius = "14px";
        kaart.style.boxShadow = "0 3px 12px rgba(152, 114, 232, 0.18)";
        kaart.style.width = `${onderdeel.breedte || 260}px`;
        kaart.style.maxWidth = "calc(100vw - 40px)";
        kaart.style.boxSizing = "border-box";
        kaart.style.padding = "12px";

        // Titel
const titel = document.createElement("p");

titel.textContent =
    onderdeel.titel || "🔗 Interessante website";

titel.style.fontWeight = "bold";
titel.style.margin = "0 0 8px";
titel.style.color = "#493c70";
titel.style.fontFamily = "'Trebuchet MS', sans-serif";
titel.style.fontSize = "15px";

kaart.appendChild(titel);

        // Weblink
        const link = document.createElement("a");

        link.href = onderdeel.url;
        link.textContent = onderdeel.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        link.style.overflowWrap = "anywhere";
        link.style.color = "#358fbe";
link.style.fontFamily = "'Trebuchet MS', sans-serif";
link.style.fontSize = "14px";

        kaart.appendChild(link);

        // Knoppencontainer
        const knoppen = document.createElement("div");

        knoppen.style.display = "flex";
        knoppen.style.gap = "8px";
        knoppen.style.marginTop = "12px";

        // Potloodknop
        const bewerkenKnop = document.createElement("button");

        bewerkenKnop.type = "button";
        bewerkenKnop.textContent = "✏️";
        bewerkenKnop.title = "Weblink bewerken";

        bewerkenKnop.addEventListener("click", (event) => {

            event.stopPropagation();

            const titelInvoer = document.createElement("input");

            titelInvoer.type = "text";
            titelInvoer.value = onderdeel.titel || "";
            titelInvoer.placeholder = "Titel van de website";
            
            titelInvoer.style.width = "100%";
            titelInvoer.style.boxSizing = "border-box";
            titelInvoer.style.marginBottom = "8px";
            titelInvoer.style.padding = "12px";
            titelInvoer.style.background = "#f1edfc";
            titelInvoer.style.border = "2px solid #b9a5eb";
            titelInvoer.style.borderRadius = "10px";
            titelInvoer.style.color = "#493c70";
            titelInvoer.style.fontFamily = "'Trebuchet MS', sans-serif";
            titelInvoer.style.fontSize = "14px";

            const linkInvoer = document.createElement("input");

            linkInvoer.type = "url";
            linkInvoer.value = onderdeel.url;
            linkInvoer.placeholder = "https://...";
           linkInvoer.style.width = "100%";
linkInvoer.style.boxSizing = "border-box";
linkInvoer.style.padding = "12px";
linkInvoer.style.background = "#f1edfc";
linkInvoer.style.border = "2px solid #b9a5eb";
linkInvoer.style.borderRadius = "10px";
linkInvoer.style.color = "#493c70";
linkInvoer.style.fontFamily = "'Trebuchet MS', sans-serif";
linkInvoer.style.fontSize = "14px";

            titel.replaceWith(titelInvoer);
            link.replaceWith(linkInvoer);

            formaatKnop.style.display = "none";

            knoppen.innerHTML = "";

            const opslaanKnop = document.createElement("button");

opslaanKnop.type = "button";
opslaanKnop.textContent = "💾 Opslaan";

opslaanKnop.style.padding = "10px 16px";
opslaanKnop.style.background = "#dff3fa";
opslaanKnop.style.border = "2px solid #69bce5";
opslaanKnop.style.borderRadius = "11px";
opslaanKnop.style.color = "#21445b";
opslaanKnop.style.fontFamily = "'Trebuchet MS', sans-serif";
opslaanKnop.style.fontSize = "14px";
opslaanKnop.style.fontWeight = "700";
opslaanKnop.style.boxShadow = "0 2px 8px rgba(53, 143, 190, 0.18)";
opslaanKnop.style.cursor = "pointer";

const annulerenKnop = document.createElement("button");

annulerenKnop.type = "button";
annulerenKnop.textContent = "Annuleren";

annulerenKnop.style.padding = "10px 16px";
annulerenKnop.style.background = "#f1edfc";
annulerenKnop.style.border = "2px solid #b9a5eb";
annulerenKnop.style.borderRadius = "11px";
annulerenKnop.style.color = "#493c70";
annulerenKnop.style.fontFamily = "'Trebuchet MS', sans-serif";
annulerenKnop.style.fontSize = "14px";
annulerenKnop.style.fontWeight = "700";
annulerenKnop.style.boxShadow = "0 2px 8px rgba(152, 114, 232, 0.18)";
annulerenKnop.style.cursor = "pointer";

            opslaanKnop.addEventListener("click", async () => {

                const nieuweTitel = titelInvoer.value.trim();
                const nieuweUrl = linkInvoer.value.trim();

                let veiligeUrl;

                try {

                    veiligeUrl = new URL(nieuweUrl);

                } catch (fout) {

                    alert("Vul een geldige weblink in.");

                    return;

                }

                if (
                    veiligeUrl.protocol !== "https:" &&
                    veiligeUrl.protocol !== "http:"
                ) {

                    alert("Gebruik een gewone website-link.");

                    return;

                }

                if (!nieuweTitel) {

                    alert("Vul een titel in.");

                    return;

                }

                onderdeel.titel = nieuweTitel;
                onderdeel.url = veiligeUrl.href;

                try {

                    await onderdeelOpslaan(onderdeel);

                    await moodboardWeergeven();

                } catch (fout) {

                    console.error(fout);

                    alert("De weblink kon niet worden opgeslagen.");

                }

            });

            annulerenKnop.addEventListener("click", () => {

                moodboardWeergeven();

            });

            knoppen.appendChild(opslaanKnop);
            knoppen.appendChild(annulerenKnop);

            titelInvoer.focus();

        });

        knoppen.appendChild(bewerkenKnop);

        kaart.appendChild(knoppen);

        // Formaat aanpassen
        const formaatKnop = document.createElement("button");

        formaatKnop.type = "button";
        formaatKnop.textContent = "↘";
        formaatKnop.title = "Weblink groter of kleiner maken";

        formaatKnop.style.position = "absolute";
        formaatKnop.style.right = "4px";
        formaatKnop.style.bottom = "4px";
        formaatKnop.style.width = "30px";
        formaatKnop.style.height = "30px";
        formaatKnop.style.display = "flex";
        formaatKnop.style.alignItems = "center";
        formaatKnop.style.justifyContent = "center";
        formaatKnop.style.background = "#ffffff";
        formaatKnop.style.color = "#8062ca";
        formaatKnop.style.border = "none";
        formaatKnop.style.borderRadius = "50%";
        formaatKnop.style.fontSize = "20px";
        formaatKnop.style.fontWeight = "bold";
        formaatKnop.style.cursor = "nwse-resize";
        formaatKnop.style.touchAction = "none";
        formaatKnop.style.userSelect = "none";
        formaatKnop.style.zIndex = "5";

        kaart.appendChild(formaatKnop);

        let formaatActief = false;
        let beginX = 0;
        let beginBreedte = 0;
        let pointerId = null;

        formaatKnop.addEventListener("pointerdown", (event) => {

            event.preventDefault();
            event.stopPropagation();

            formaatActief = true;
            pointerId = event.pointerId;

            beginX = event.clientX;
            beginBreedte = kaart.offsetWidth;

            formaatKnop.setPointerCapture(event.pointerId);

        });

        formaatKnop.addEventListener("pointermove", (event) => {

            if (!formaatActief || event.pointerId !== pointerId) {
                return;
            }

            event.preventDefault();

            const verschil = event.clientX - beginX;

            const nieuweBreedte = Math.min(
                600,
                Math.max(150, beginBreedte + verschil)
            );

            kaart.style.width = `${nieuweBreedte}px`;

        });

        async function linkFormaatOpslaan(event) {

            if (!formaatActief || event.pointerId !== pointerId) {
                return;
            }

            formaatActief = false;
            pointerId = null;

            onderdeel.breedte = Math.round(
                kaart.getBoundingClientRect().width
            );

            try {

                await onderdeelOpslaan(onderdeel);

            } catch (fout) {

                console.error(
                    "Weblinkformaat opslaan mislukt:",
                    fout
                );

                alert(
                    "Het nieuwe formaat kon niet worden opgeslagen."
                );

            }

            werkvlakHoogteBijwerken();

        }

        formaatKnop.addEventListener(
            "pointerup",
            linkFormaatOpslaan
        );

        formaatKnop.addEventListener(
            "pointercancel",
            linkFormaatOpslaan
        );

    }


    /* VERWIJDERKNOP */

    const verwijderKnop = document.createElement("button");

    verwijderKnop.type = "button";

    verwijderKnop.textContent = "×";

    verwijderKnop.title = "Verwijder dit onderdeel";

    verwijderKnop.setAttribute(
        "aria-label",
        "Verwijder dit onderdeel"
    );

    verwijderKnop.style.position = "absolute";

    verwijderKnop.style.top = "4px";

    verwijderKnop.style.right = "4px";

    verwijderKnop.style.width = "30px";

    verwijderKnop.style.height = "30px";

    verwijderKnop.style.border = "none";

    verwijderKnop.style.borderRadius = "50%";

    verwijderKnop.style.background = "#ffffff";

    verwijderKnop.style.color = "#8062ca";

    verwijderKnop.style.fontSize = "22px";

    verwijderKnop.style.fontWeight = "bold";

    verwijderKnop.style.boxShadow =
        "0 2px 6px rgba(0,0,0,0.12)";

    verwijderKnop.addEventListener("click", async () => {

        if (!confirm("Wil je dit onderdeel verwijderen?")) {
            return;
        }

        try {

            await onderdeelVerwijderen(onderdeel.id);

            await moodboardWeergeven();

        } catch (fout) {

            console.error(fout);

            alert("Verwijderen is niet gelukt.");

        }

    });

    kaart.appendChild(verwijderKnop);

    moodboardWerkvlak.appendChild(kaart);

// Nieuwe onderdelen krijgen hun positie in IndexedDB.
if (!heeftPositie) {

    onderdeelOpslaan(onderdeel).catch((fout) => {

        console.error(
            "Beginpositie opslaan mislukt:",
            fout
        );

    });

}

// Verslepen activeren.
verslepenInstellen(kaart, onderdeel);

// Werkvlak aanpassen aan de inhoud.
werkvlakHoogteBijwerken();

}


/* ======================================
   18. CONTROLEREN ACTIEVE CATEGORIE
   ====================================== */

function controleerActieveCategorie() {

    if (!actieveCategorie) {

        alert("Open eerst een categorie.");

        return false;

    }

    return true;

}


/* ======================================
   19. AFBEELDING TOEVOEGEN
   ====================================== */

afbeeldingToevoegen.addEventListener("click", () => {

    if (!controleerActieveCategorie()) {
        return;
    }

    afbeeldingUpload.click();

});



/* ======================================
   AFBEELDING KLAARZETTEN VOOR BIJSNIJDEN
   ====================================== */

let afbeeldingVoorBijsnijden = null;
let bestandVoorBijsnijden = null;
let bijsnijdenSelectie = null;


afbeeldingUpload.addEventListener("change", (event) => {

    const bestand = event.target.files[0];

    if (!bestand) {
        return;
    }

    if (!controleerActieveCategorie()) {
        afbeeldingUpload.value = "";
        return;
    }

    if (!bestand.type.startsWith("image/")) {
        afbeeldingUpload.value = "";
        return;
    }

    afbeeldingVoorBijsnijden = new Image();

    bestandVoorBijsnijden = bestand;

    afbeeldingVoorBijsnijden.onload = () => {

        bijsnijdenCanvas.width =
            afbeeldingVoorBijsnijden.naturalWidth;

        bijsnijdenCanvas.height =
            afbeeldingVoorBijsnijden.naturalHeight;

        bijsnijdenSelectie = {

            x: afbeeldingVoorBijsnijden.naturalWidth * 0.1,

            y: afbeeldingVoorBijsnijden.naturalHeight * 0.1,

            breedte: afbeeldingVoorBijsnijden.naturalWidth * 0.8,

            hoogte: afbeeldingVoorBijsnijden.naturalHeight * 0.8

        };

        afbeeldingBijsnijden.classList.remove("verborgen");

        bijsnijdenTekenen();

        afbeeldingUpload.value = "";

    };

    afbeeldingVoorBijsnijden.onerror = () => {

        alert("Deze afbeelding kan niet worden geopend.");

        afbeeldingUpload.value = "";

    };

    afbeeldingVoorBijsnijden.src =
        URL.createObjectURL(bestand);

});

/* ======================================
   AFBEELDING BIJSNIJDEN - TEKENEN
   ====================================== */

function bijsnijdenTekenen() {

    if (!afbeeldingVoorBijsnijden || !bijsnijdenSelectie) {
        return;
    }

    const context = bijsnijdenCanvas.getContext("2d");

    const breedte = bijsnijdenCanvas.width;
    const hoogte = bijsnijdenCanvas.height;

    const selectie = bijsnijdenSelectie;

    // Originele afbeelding tekenen

    context.clearRect(0, 0, breedte, hoogte);

    context.drawImage(
        afbeeldingVoorBijsnijden,
        0,
        0,
        breedte,
        hoogte
    );

    // Donker maken buiten het selectiekader

    context.fillStyle = "rgba(0, 0, 0, 0.55)";

    context.fillRect(0, 0, breedte, hoogte);

    // Geselecteerde gedeelte weer helder tekenen

    context.clearRect(
        selectie.x,
        selectie.y,
        selectie.breedte,
        selectie.hoogte
    );

    context.drawImage(
        afbeeldingVoorBijsnijden,
        selectie.x,
        selectie.y,
        selectie.breedte,
        selectie.hoogte,
        selectie.x,
        selectie.y,
        selectie.breedte,
        selectie.hoogte
    );

    // Rand van het selectiekader

    context.strokeStyle = "#ffffff";
    context.lineWidth = Math.max(2, breedte / 400);

    context.strokeRect(
        selectie.x,
        selectie.y,
        selectie.breedte,
        selectie.hoogte
    );

    // Vier hoekpunten tekenen

    const hoeken = [

        [selectie.x, selectie.y],

        [selectie.x + selectie.breedte, selectie.y],

        [selectie.x, selectie.y + selectie.hoogte],

        [selectie.x + selectie.breedte, selectie.y + selectie.hoogte]

    ];

    context.fillStyle = "#ffffff";

    for (const hoek of hoeken) {

        context.beginPath();

        context.arc(
            hoek[0],
            hoek[1],
            Math.max(8, breedte / 100),
            0,
            Math.PI * 2
        );

        context.fill();

    }

}


/* ======================================
   AFBEELDING BIJSNIJDEN - BEDIENING
   ====================================== */

let bijsnijdenBeweging = null;
let bijsnijdenStart = null;


bijsnijdenCanvas.addEventListener("pointerdown", (event) => {

    if (!bijsnijdenSelectie) {
        return;
    }

    event.preventDefault();

    const rechthoek = bijsnijdenCanvas.getBoundingClientRect();

    const schaalX = bijsnijdenCanvas.width / rechthoek.width;
    const schaalY = bijsnijdenCanvas.height / rechthoek.height;

    const x = (event.clientX - rechthoek.left) * schaalX;
    const y = (event.clientY - rechthoek.top) * schaalY;

    const selectie = bijsnijdenSelectie;

    const marge = Math.max(20, bijsnijdenCanvas.width / 50);

    const hoeken = [

        { naam: "linksboven", x: selectie.x, y: selectie.y },

        { naam: "rechtsboven", x: selectie.x + selectie.breedte, y: selectie.y },

        { naam: "linksonder", x: selectie.x, y: selectie.y + selectie.hoogte },

        {
            naam: "rechtsonder",
            x: selectie.x + selectie.breedte,
            y: selectie.y + selectie.hoogte
        }

    ];

    const hoek = hoeken.find((punt) => {

        return Math.hypot(
            x - punt.x,
            y - punt.y
        ) < marge;

    });

    if (hoek) {

        bijsnijdenBeweging = hoek.naam;

    } else if (

        x >= selectie.x &&
        x <= selectie.x + selectie.breedte &&
        y >= selectie.y &&
        y <= selectie.y + selectie.hoogte

    ) {

        bijsnijdenBeweging = "verplaatsen";

    } else {

        return;

    }

    bijsnijdenStart = {

        x: x,
        y: y,

        selectieX: selectie.x,
        selectieY: selectie.y,

        selectieBreedte: selectie.breedte,
        selectieHoogte: selectie.hoogte

    };

    bijsnijdenCanvas.setPointerCapture(event.pointerId);

});


bijsnijdenCanvas.addEventListener("pointermove", (event) => {

    if (!bijsnijdenBeweging || !bijsnijdenStart) {
        return;
    }

    event.preventDefault();

    const rechthoek = bijsnijdenCanvas.getBoundingClientRect();

    const schaalX = bijsnijdenCanvas.width / rechthoek.width;
    const schaalY = bijsnijdenCanvas.height / rechthoek.height;

    const x = (event.clientX - rechthoek.left) * schaalX;
    const y = (event.clientY - rechthoek.top) * schaalY;

    const verschilX = x - bijsnijdenStart.x;
    const verschilY = y - bijsnijdenStart.y;

    const selectie = bijsnijdenSelectie;

    const minimum = 30;

    if (bijsnijdenBeweging === "verplaatsen") {

        selectie.x = Math.max(
            0,
            Math.min(
                bijsnijdenCanvas.width - selectie.breedte,
                bijsnijdenStart.selectieX + verschilX
            )
        );

        selectie.y = Math.max(
            0,
            Math.min(
                bijsnijdenCanvas.height - selectie.hoogte,
                bijsnijdenStart.selectieY + verschilY
            )
        );

    }

    if (bijsnijdenBeweging === "linksboven") {

        const nieuweX = Math.max(
            0,
            Math.min(
                bijsnijdenStart.selectieX + bijsnijdenStart.selectieBreedte - minimum,
                bijsnijdenStart.selectieX + verschilX
            )
        );

        const nieuweY = Math.max(
            0,
            Math.min(
                bijsnijdenStart.selectieY + bijsnijdenStart.selectieHoogte - minimum,
                bijsnijdenStart.selectieY + verschilY
            )
        );

        selectie.breedte =
            bijsnijdenStart.selectieBreedte +
            bijsnijdenStart.selectieX - nieuweX;

        selectie.hoogte =
            bijsnijdenStart.selectieHoogte +
            bijsnijdenStart.selectieY - nieuweY;

        selectie.x = nieuweX;
        selectie.y = nieuweY;

    }

    if (bijsnijdenBeweging === "rechtsboven") {

        selectie.breedte = Math.max(
            minimum,
            Math.min(
                bijsnijdenCanvas.width - selectie.x,
                bijsnijdenStart.selectieBreedte + verschilX
            )
        );

        const nieuweY = Math.max(
            0,
            Math.min(
                bijsnijdenStart.selectieY + bijsnijdenStart.selectieHoogte - minimum,
                bijsnijdenStart.selectieY + verschilY
            )
        );

        selectie.hoogte =
            bijsnijdenStart.selectieHoogte +
            bijsnijdenStart.selectieY - nieuweY;

        selectie.y = nieuweY;

    }

    if (bijsnijdenBeweging === "linksonder") {

        const nieuweX = Math.max(
            0,
            Math.min(
                bijsnijdenStart.selectieX + bijsnijdenStart.selectieBreedte - minimum,
                bijsnijdenStart.selectieX + verschilX
            )
        );

        selectie.breedte =
            bijsnijdenStart.selectieBreedte +
            bijsnijdenStart.selectieX - nieuweX;

        selectie.x = nieuweX;

        selectie.hoogte = Math.max(
            minimum,
            Math.min(
                bijsnijdenCanvas.height - selectie.y,
                bijsnijdenStart.selectieHoogte + verschilY
            )
        );

    }

    if (bijsnijdenBeweging === "rechtsonder") {

        selectie.breedte = Math.max(
            minimum,
            Math.min(
                bijsnijdenCanvas.width - selectie.x,
                bijsnijdenStart.selectieBreedte + verschilX
            )
        );

        selectie.hoogte = Math.max(
            minimum,
            Math.min(
                bijsnijdenCanvas.height - selectie.y,
                bijsnijdenStart.selectieHoogte + verschilY
            )
        );

    }

    bijsnijdenTekenen();

});


function bijsnijdenStoppen(event) {

    bijsnijdenBeweging = null;
    bijsnijdenStart = null;

}


bijsnijdenCanvas.addEventListener("pointerup", bijsnijdenStoppen);

bijsnijdenCanvas.addEventListener("pointercancel", bijsnijdenStoppen);


/* ======================================
   AFBEELDING BIJSNIJDEN - OPSLAAN
   ====================================== */

// Bijsnijden annuleren

bijsnijdenAnnuleren.addEventListener("click", () => {

    afbeeldingBijsnijden.classList.add("verborgen");

    afbeeldingVoorBijsnijden = null;
    bestandVoorBijsnijden = null;
    bijsnijdenSelectie = null;

});


// Bijsnijden bevestigen en opslaan

bijsnijdenBevestigen.addEventListener("click", async () => {

    if (
        !afbeeldingVoorBijsnijden ||
        !bestandVoorBijsnijden ||
        !bijsnijdenSelectie
    ) {
        return;
    }

    const selectie = bijsnijdenSelectie;

    const resultaatCanvas = document.createElement("canvas");

    resultaatCanvas.width = Math.round(selectie.breedte);
    resultaatCanvas.height = Math.round(selectie.hoogte);

    const context = resultaatCanvas.getContext("2d");

    context.drawImage(
        afbeeldingVoorBijsnijden,
        selectie.x,
        selectie.y,
        selectie.breedte,
        selectie.hoogte,
        0,
        0,
        resultaatCanvas.width,
        resultaatCanvas.height
    );

    try {

        const afbeeldingBlob = await new Promise((resolve, reject) => {

            resultaatCanvas.toBlob((blob) => {

                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error("Afbeelding bijsnijden mislukt."));
                }

            }, "image/png");

        });

        const onderdeel = {

            id: nieuwID(),

            categorie: actieveCategorie,

            type: "afbeelding",

            naam: bestandVoorBijsnijden.name,

            bestand: afbeeldingBlob,

            aangemaakt: Date.now() + Math.random()

        };

        await onderdeelOpslaan(onderdeel);

        afbeeldingBijsnijden.classList.add("verborgen");

        afbeeldingVoorBijsnijden = null;
        bestandVoorBijsnijden = null;
        bijsnijdenSelectie = null;

        await moodboardWeergeven();

    } catch (fout) {

        console.error("Afbeelding opslaan mislukt:", fout);

        alert(
            "De bijgesneden afbeelding kon niet worden opgeslagen."
        );

    }

});



/* ======================================
   20. TEKSTNOTITIE TOEVOEGEN
   ====================================== */

notitieToevoegen.addEventListener("click", async () => {

    if (!controleerActieveCategorie()) {
        return;
    }

    const tekst = prompt(
        "Wat wil je op je moodboard noteren?"
    );

    if (!tekst || !tekst.trim()) {
        return;
    }

    const onderdeel = {

        id: nieuwID(),

        categorie: actieveCategorie,

        type: "notitie",

        tekst: tekst.trim(),

        aangemaakt: Date.now()

    };

    try {

        await onderdeelOpslaan(onderdeel);

        await moodboardWeergeven();

    } catch (fout) {

        console.error(fout);

        alert("De notitie kon niet worden opgeslagen.");

    }

});


/* ======================================
   21. WEBLINK TOEVOEGEN
   ====================================== */

linkToevoegen.addEventListener("click", async () => {

    if (!controleerActieveCategorie()) {
        return;
    }

    const url = prompt(
        "Plak hier de link naar de website of webshop:"
    );

    if (!url || !url.trim()) {
        return;
    }

    let veiligeUrl;

    try {

        veiligeUrl = new URL(url.trim());

    } catch (fout) {

        alert("Dit is geen geldige weblink.");

        return;

    }

    if (
        veiligeUrl.protocol !== "https:" &&
        veiligeUrl.protocol !== "http:"
    ) {

        alert("Gebruik een gewone website-link.");

        return;

    }

    const onderdeel = {

        id: nieuwID(),

        categorie: actieveCategorie,

        type: "link",

        titel: "🔗 Interessante website",

        url: veiligeUrl.href,

        aangemaakt: Date.now()

    };

    try {

        await onderdeelOpslaan(onderdeel);

        await moodboardWeergeven();

    } catch (fout) {

        console.error(fout);

        alert("De weblink kon niet worden opgeslagen.");

    }

});


/* ======================================
   22. APP STARTEN
   ====================================== */

async function appStarten() {

    try {

        if (!("indexedDB" in window)) {

            throw new Error(
                "IndexedDB wordt niet ondersteund."
            );

        }

        await databaseOpenen();

        categorieenLaden();

        console.log(
            "Mijn Moodboard is gestart. IndexedDB is actief."
        );

    } catch (fout) {

        console.error(
            "De app kon niet worden gestart:",
            fout
        );

        alert(
            "De opslag van Mijn Moodboard kon niet worden geopend. Controleer je browser."
        );

    }

}

appStarten();
