self.addEventListener("install", (e) => {
    self.skipWaiting();
  });
  
  self.addEventListener("fetch", (e) => {
    e.respondWith(
      fetch(e.request).catch(() => new Response("Attempting to fetch data...", {
        headers: { "Content-Type": "text/html" }
      }))
    );
  });  