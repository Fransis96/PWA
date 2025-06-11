// Nama cache
const CACHE_NAME = "frans-pwa-v1";

// Daftar file yang akan di-cache saat install
const urlsToCache = [
  "./index.html",
  "./detail.html",
  "./offline.html", // fallback offline page
  "./manifest.json", // manifest agar tidak error saat offline
  "./assets/img/profile.png",
  "./assets/img/offline.gif", // offline image
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css",
];

// Instalasi service worker
self.addEventListener("install", (event) => {
  self.skipWaiting(); // Langsung aktifkan versi baru tanpa tunggu reload
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .catch((err) => {
        console.error("Gagal cache saat install:", err);
      }),
  );
});

// Aktivasi service worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key); // Hapus cache lama
          }
        }),
      );
    }),
  );
  self.clients.claim(); // Ambil kendali tab aktif
});

// Fetch: Intersepsi semua permintaan dan respon dari cache atau jaringan
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        // Jika ada di cache, kembalikan
        if (response) {
          return response;
        }
        // Jika tidak ada di cache, coba ambil dari jaringan
        return fetch(event.request);
      })
      .catch((err) => {
        // Jika fetch gagal (offline), kembalikan fallback sesuai jenis konten
        if (event.request.headers.get("accept")?.includes("text/html")) {
          return caches.match("offline.html");
        }

        // Untuk file lain (seperti CSS/JS/gambar), kembalikan Response kosong agar tidak error
        return new Response("", {
          status: 200,
          statusText: "Offline fallback response",
        });
      }),
  );
});
