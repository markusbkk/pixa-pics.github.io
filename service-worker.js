var REQUIRED_CACHE = "network-or-cache-v12-required";
var USEFUL_CACHE = "network-or-cache-v12-useful";
var STATIC_CACHE = "network-or-cache-v12-static";

// On install, cache some resource.
self.addEventListener("install", function(evt) {

  // Open a cache and use `addAll()` with an array of assets to add all of them
  // to the cache. Ask the service worker to keep installing until the
  // returning promise resolves.
  evt.waitUntil(Promise.allSettled([
      caches.open(REQUIRED_CACHE).then(function (cache) {
            return cache.addAll([
                "/",
                "/index.html",
                "/404.html",
                "/client.min.js",
                "/src/fonts/NotoSans-Regular.woff2",
                "/src/fonts/SpecialElite-Regular.woff2",
                "/src/fonts/NotoSansMono-Regular.woff2",
                "/src/fonts/ShareTechMono-Regular.woff2",
                "/src/fonts/Saira-Regular.woff2",
            ]);
      }),
      caches.open(USEFUL_CACHE).then(function (cache) {
          return cache.addAll([]);
      }),
      caches.open(STATIC_CACHE).then(function (cache) {
          return cache.addAll([]);
      })
  ]));
});

self.addEventListener("fetch", function(event) {

    console.log(event);
  const url = event.request.url;

  if((url.includes(".png") || url.includes(".jpg") || url.includes(".jpeg") || url.includes(".gif")) && event.request.mode !== "same-origin") {

    // Serve cached image if doesn't fail
    event.respondWith(
        caches.open(STATIC_CACHE).then(function (cache) {
          return cache.match(event.request).then(function (response) {
            return (
                response ||
                fetch(event.request).then(function (response) { // Fetch, clone, and serve
                  cache.put(event.request, response.clone());
                  return response;
                })
            );
          });
        }),
    );


  }else if(url.includes("client.min.js") && event.request.mode === "same-origin") {

    event.respondWith(
        caches.open(REQUIRED_CACHE).then(function (cache) {
          return cache.match("/client.min.js").then(function (response) {
            return (
                response ||
                fetch(event.request).then(function (response) { // Fetch, clone, and serve
                  cache.put("/client.min.js", response.clone());
                  return response;
                })
            );
          });
        })
    );

  }else if(event.request.mode === "navigate") {

      // Return the same index.html page for all navigation query
      event.respondWith( caches.match("/").then(function (response) {
          return (
              response || fetch(event.request).then(function (response) {return response})
          );
      }));

  }else {
      Promise.race([
          caches.open(REQUIRED_CACHE).then(function (cache) {
              return cache.match(event.request).then(function (response) {
                  if(response) { return response }
              });
          }),
          caches.open(USEFUL_CACHE).then(function (cache) {
              return cache.match(event.request).then(function (response) {
                  if(response) { return response }
              });
          }),
          caches.open(STATIC_CACHE).then(function (cache) {
              return cache.match(event.request).then(function (response) {

                  return (
                      response ||
                      fetch(event.request).then(function (response) { // Fetch and serve
                          return response;
                      })
                  );

              })
          })
      ]).then(function(response){return response})
  }
});

self.addEventListener("activate", function(event) {

  event.waitUntil(Promise.allSettled([
          caches.open(USEFUL_CACHE).then(function (cache) {
            return cache.addAll([
                "/src/images/404-dark-2.svg",
                "/src/images/404-dark.svg",
                "/src/images/segment.svg",
                "/src/images/share.svg",
                "/src/images/logo-transparent.png",
                "/src/images/favicon.ico"
            ]);
          }),
          caches.open(STATIC_CACHE).then(function (cache) {
            return cache.addAll([
              "/src/sounds/sfx/md/alert_error-01.mp3",
              "/src/sounds/sfx/md/navigation_transition-left.mp3",
              "/src/sounds/sfx/md/alert_high-intensity.mp3",
              "/src/sounds/sfx/md/FullHorizonThrow.mp3",
              "/src/sounds/sfx/md/navigation_transition-right.mp3",
              "/src/sounds/sfx/md/PrometheusVertical2.mp3",
              "/src/sounds/sfx/md/hero_decorative-celebration-01.mp3",
              "/src/sounds/sfx/md/state-change_confirm-down.mp3",
              "/src/sounds/sfx/md/hero_decorative-celebration-02.mp3",
              "/src/sounds/sfx/md/state-change_confirm-up.mp3",
              "/src/sounds/sfx/md/hero_decorative-celebration-03.mp3",
              "/src/sounds/sfx/md/ETesla.mp3",
              "/src/sounds/sfx/md/ui_camera-shutter.mp3",
              "/src/sounds/sfx/md/navigation_backward-selection-minimal.mp3",
              "/src/sounds/sfx/md/ui_loading.mp3",
              "/src/sounds/sfx/md/navigation_backward-selection.mp3",
              "/src/sounds/sfx/md/ui_lock.mp3",
              "/src/sounds/sfx/md/navigation_forward-selection.mp3",
              "/src/sounds/sfx/md/ui_tap-variant-01.mp3",
              "/src/sounds/sfx/md/navigation_selection-complete-celebration.mp3",
              "/src/sounds/sfx/md/ui_unlock.mp3",
            ]);
          }),
          caches.keys().then(keys => Promise.allSettled(
              keys.map(key => {
                  if (key !== REQUIRED_CACHE && key !== STATIC_CACHE && key !== USEFUL_CACHE) {
                      return caches.delete(key);
                  }
              })
          ))
        ])
    ).then(function(response){return response});
});