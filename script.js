
/* ======================================
   MIJN MOODBOARD - SCRIPT
   ====================================== */


/* ======================================
   ELEMENTEN OPHALEN
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


/* ======================================
   CATEGORIEËN
   ====================================== */

const standaardCategorieen = [
    {
        naam: "Tuin",
        icoon: "🌿"
    },
    {
        naam: "Woonkamer",
        icoon: "🛋️"
    },
    {
        naam: "Gang",
        icoon: "🚪"
    },
    {
        naam: "Keuken",
        icoon: "🍽️"
    },
    {
        naam: "Slaapkamer",
        icoon: "🛏️"
    },
    {
        naam: "Badkamer",
        icoon: "🛁"
    }
];

let categorieen = [];

let actieveCategorie = null;


/* ======================================
   CATEGORIEËN OPHALEN UIT OPSLAG
   ====================================== */

function categorieenLaden() {

    const opgeslagenCategorieen =
        localStorage.getItem("moodboardCategorieen");

    if (opgeslagenCategorieen) {

        try {

            categorieen = JSON.parse(opgeslagenCategorieen);

            if (!Array.isArray(categorieen)) {
                categorieen = [...standaardCategorieen];
            }

        } catch (fout) {

            categorieen = [...standaardCategorieen];

        }

    } else {

        categorieen = [...standaardCategorieen];

        categorieenOpslaan();

    }

    categorieenWeergeven();

}


/* ======================================
   CATEGORIEËN OPSLAAN
   ====================================== */

function categorieenOpslaan() {

    localStorage.setItem(
        "moodboardCategorieen",
        JSON.stringify(categorieen)
    );

}


/* ======================================
   CATEGORIEËN WEERGEVEN
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
   NIEUWE CATEGORIE TOEVOEGEN
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
   MOODBOARD OPENEN
   ====================================== */

function moodboardOpenen(categorie) {

    actieveCategorie = categorie.naam;

    moodboardTitel.textContent = categorie.naam;

    startpagina.classList.add("verborgen");

    moodboardPagina.classList.remove("verborgen");

    moodboardWerkvlak.innerHTML = "";

    const legeTekst = document.createElement("p");

    legeTekst.className = "lege-moodboard-tekst";

    legeTekst.textContent =
        "Jouw ideeën beginnen hier. ❤️";

    moodboardWerkvlak.appendChild(legeTekst);

}


/* ======================================
   TERUG NAAR STARTPAGINA
   ====================================== */

terugNaarStart.addEventListener("click", () => {

    moodboardPagina.classList.add("verborgen");

    startpagina.classList.remove("verborgen");

    actieveCategorie = null;

});


/* ======================================
   CONTROLEREN OF CATEGORIE GEOPEND IS
   ====================================== */

function controleerActieveCategorie() {

    if (!actieveCategorie) {

        alert("Open eerst een categorie.");

        return false;

    }

    return true;

}


/* ======================================
   AFBEELDING TOEVOEGEN
   ====================================== */

afbeeldingToevoegen.addEventListener("click", () => {

    if (!controleerActieveCategorie()) {
        return;
    }

    afbeeldingUpload.click();

});


afbeeldingUpload.addEventListener("change", (event) => {

    const bestanden = Array.from(event.target.files);

    bestanden.forEach((bestand) => {

        if (!bestand.type.startsWith("image/")) {
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {

            const afbeelding = document.createElement("img");

            afbeelding.src = reader.result;

            afbeelding.alt = "Mijn inspiratieafbeelding";

            afbeelding.style.width = "180px";

            afbeelding.style.maxWidth = "100%";

            afbeelding.style.height = "auto";

            afbeelding.style.borderRadius = "12px";

            afbeelding.style.margin = "10px";

            moodboardWerkvlak.appendChild(afbeelding);

            const legeTekst = moodboardWerkvlak.querySelector(
                ".lege-moodboard-tekst"
            );

            if (legeTekst) {
                legeTekst.remove();
            }

        };

        reader.readAsDataURL(bestand);

    });

    afbeeldingUpload.value = "";

});


/* ======================================
   TEKSTNOTITIE TOEVOEGEN
   ====================================== */

notitieToevoegen.addEventListener("click", () => {

    if (!controleerActieveCategorie()) {
        return;
    }

    const tekst = prompt(
        "Wat wil je op je moodboard noteren?"
    );

    if (!tekst || !tekst.trim()) {
        return;
    }

    const notitie = document.createElement("div");

    notitie.textContent = tekst.trim();

    notitie.style.background = "#fff2c9";

    notitie.style.padding = "16px";

    notitie.style.margin = "10px";

    notitie.style.borderRadius = "12px";

    notitie.style.whiteSpace = "pre-wrap";

    notitie.style.overflowWrap = "anywhere";

    notitie.style.boxShadow =
        "0 3px 10px rgba(0,0,0,0.08)";

    moodboardWerkvlak.appendChild(notitie);

    const legeTekst = moodboardWerkvlak.querySelector(
        ".lege-moodboard-tekst"
    );

    if (legeTekst) {
        legeTekst.remove();
    }

});


/* ======================================
   WEBLINK TOEVOEGEN
   ====================================== */

linkToevoegen.addEventListener("click", () => {

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

    const linkKaart = document.createElement("div");

    linkKaart.style.background = "#e5f2fb";

    linkKaart.style.padding = "16px";

    linkKaart.style.margin = "10px";

    linkKaart.style.borderRadius = "12px";

    linkKaart.style.overflowWrap = "anywhere";

    const linkTitel = document.createElement("p");

    linkTitel.textContent = "🔗 Interessante website";

    linkTitel.style.fontWeight = "bold";

    const link = document.createElement("a");

    link.href = veiligeUrl.href;

    link.textContent = url.trim();

    link.target = "_blank";

    link.rel = "noopener noreferrer";

    linkKaart.appendChild(linkTitel);

    linkKaart.appendChild(link);

    moodboardWerkvlak.appendChild(linkKaart);

    const legeTekst = moodboardWerkvlak.querySelector(
        ".lege-moodboard-tekst"
    );

    if (legeTekst) {
        legeTekst.remove();
    }

});


/* ======================================
   APP STARTEN
   ====================================== */

categorieenLaden();

console.log("Mijn Moodboard is gestart.");
