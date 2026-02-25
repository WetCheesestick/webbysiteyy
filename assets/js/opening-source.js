(() => {
  const OPENING_USE_YOUTUBE = "ON"; // ON = use YouTube, OFF = use local MP4 files.
  const YT_EMBED_HOST = "https://www.youtube.com"; // More reliable on strict browsers than nocookie for autoplay intro.
  const REQUESTED_QUALITY = "hd1080"; // Best effort only; YouTube may still choose based on bandwidth/device.

  const hero = document.querySelector(".main-item");
  const introMode = String(hero?.getAttribute("data-intro-mode") || "original").toLowerCase();

  const embeds = Array.from(document.querySelectorAll(".opening-yt[data-yt-id]")).filter((embed) => {
    const layer = embed.closest(".opening-item, .main-video");
    return !(layer && layer.hidden);
  });
  if (embeds.length === 0) return;

  const isHttp = window.location.protocol === "http:" || window.location.protocol === "https:";
  const hasOrigin = isHttp && window.location.origin && window.location.origin !== "null";
  const wantsYoutube = String(OPENING_USE_YOUTUBE || "").toUpperCase() === "ON";
  const canUseYoutubeHere = isHttp && hasOrigin;
  const useYoutube = wantsYoutube && canUseYoutubeHere;

  function primeOpeningThumbnail(embed, videoId) {
    const item = embed.closest(".opening-item, .main-video");
    if (!item || !videoId) return;
    item.style.setProperty("--opening-thumb", `url("https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg")`);
    item.classList.add("has-opening-thumb");
    embed.addEventListener(
      "load",
      () => {
        item.classList.add("opening-loaded");
      },
      { once: true }
    );
  }

  function buildYoutubeSrc(videoId) {
    const params = new URLSearchParams({
      autoplay: "1",
      mute: "1",
      controls: "0",
      disablekb: "1",
      fs: "0",
      loop: "1",
      playlist: videoId,
      modestbranding: "1",
      rel: "0",
      playsinline: "1",
      iv_load_policy: "3",
      cc_load_policy: "0",
      enablejsapi: "1",
      vq: REQUESTED_QUALITY
    });

    if (hasOrigin) {
      params.set("origin", window.location.origin);
      params.set("widget_referrer", `${window.location.origin}/`);
    }

    return `${YT_EMBED_HOST}/embed/${videoId}?${params.toString()}`;
  }

  embeds.forEach((embed, index) => {
    const videoId = embed.getAttribute("data-yt-id");
    const localSrc = embed.getAttribute("data-local-src");
    primeOpeningThumbnail(embed, videoId);

    // Local fallback if YouTube is unavailable in this context.
    if ((!useYoutube || !videoId) && localSrc) {
      const video = document.createElement("video");
      video.className = "vid";
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "auto";
      video.src = localSrc;
      embed.replaceWith(video);
      return;
    }

    if (useYoutube && videoId) {
      const isFinal = Boolean(embed.closest(".main-video"));
      const isPriority = index === 0 || isFinal;

      const assignYoutubeSrc = () => {
        embed.referrerPolicy = "strict-origin-when-cross-origin";
        embed.setAttribute("allow", "autoplay; encrypted-media; picture-in-picture; accelerometer; clipboard-write; gyroscope; web-share");
        embed.setAttribute("allowfullscreen", "");
        embed.setAttribute("loading", isPriority ? "eager" : "lazy");
        embed.setAttribute("fetchpriority", isPriority ? "high" : "auto");
        embed.src = buildYoutubeSrc(videoId);
      };

      if (isPriority) {
        assignYoutubeSrc();
      } else {
        // Keep visual sequence smooth while prioritizing first + final clips for presentation.
        const staggerMs = introMode === "single" ? 90 : 180;
        window.setTimeout(assignYoutubeSrc, staggerMs * Math.max(1, index - 1));
      }
    }
  });
})();
