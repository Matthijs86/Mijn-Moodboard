
/* ======================================
   MIJN MOODBOARD
   SERVICE WORKER - VERSIE 13
   ====================================== */

const CACHE_NAME = "moodboard-v13";

/* BESTANDEN DIE OFFLINE BESCHIKBAAR MOETEN ZIJN */

const APP_BESTANDEN = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json",
    "./moodboard-icon-192.png",
    "./moodboard-icon-512.png"
];


/* ======================================
   1. INSTALLEREN
   ====================================== */

self.addEventListener("install", (event) => {

    event.waitUntil(

        caches.open(CACHE_NAME).then((cache) => {

            return cache.addAll(APP_BESTANDEN);

        })

    );

    self.skipWaiting();

});


/* ======================================
   2. ACTIVEREN
   ====================================== */

self.addEventListener("activate", (event) => {

    event.waitUntil(

        caches.keys().then((cacheNamen) => {

            return Promise.all(

                cacheNamen
                    .filter((naam) => naam !== CACHE_NAME)
                    .map((naam) => caches.delete(naam))

            );

        })

    );

    self.clients.claim();

});


/* ======================================
   3. BESTANDEN LADEN
   ====================================== */

self.addEventListener("fetch", (event) => {

    if (event.request.method !== "GET") {
        return;
    }

    const url = new URL(event.request.url);

    if (url.origin !== self.location.origin) {
        return;
    }

    event.respondWith(

        caches.match(event.request).then((opgeslagenBestand) => {

            if (opgeslagenBestand) {
                return opgeslagenBestand;
            }

            return fetch(event.request);

        })

    );

});
