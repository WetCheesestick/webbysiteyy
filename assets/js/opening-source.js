(() => {
  const OPENING_USE_YOUTUBE = "ON"; // ON = use YouTube, OFF = use local MP4 files.
  const YT_EMBED_HOST = "https://www.youtube.com"; // More reliable on strict browsers than nocookie for autoplay intro.
  const DEFAULT_QUALITY = "hd1080"; // Best effort only; YouTube may still choose based on bandwidth/device.
  const QUALITY_LEVELS = [
    "auto",
    "tiny",
    "small",
    "medium",
    "large",
    "hd720",
    "hd1080",
    "hd1440",
    "hd2160",
    "hd2880",
    "highres"
  ];
  const QUALITY_ALIAS_MAP = {
    auto: "auto",
    tiny: "tiny",
    "144p": "tiny",
    small: "small",
    "240p": "small",
    medium: "medium",
    "360p": "medium",
    large: "large",
    "480p": "large",
    hd720: "hd720",
    "720p": "hd720",
    hd1080: "hd1080",
    "1080p": "hd1080",
    hd1440: "hd1440",
    "1440p": "hd1440",
    "2k": "hd1440",
    hd2160: "hd2160",
    "2160p": "hd2160",
    "4k": "hd2160",
    hd2880: "hd2880",
    "2880p": "hd2880",
    "5k": "hd2880",
    highres: "highres"
  };

  const hero = document.querySelector(".main-item");
  const introMode = String(hero?.getAttribute("data-intro-mode") || "original").toLowerCase();
  const normalizeQualityTarget = (value) => {
    const clean = String(value || "").trim().toLowerCase();
    if (QUALITY_ALIAS_MAP[clean]) return QUALITY_ALIAS_MAP[clean];
    if (QUALITY_LEVELS.includes(clean)) return clean;
    const fallback = String(DEFAULT_QUALITY).toLowerCase();
    return QUALITY_ALIAS_MAP[fallback] || DEFAULT_QUALITY;
  };
  const configuredQuality = normalizeQualityTarget(
    hero?.getAttribute("data-video-quality-target") || window.__OPENING_VIDEO_QUALITY_TARGET__ || DEFAULT_QUALITY
  );

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

  function buildYoutubeSrc(videoId, qualityTarget) {
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
      enablejsapi: "1"
    });
    if (qualityTarget !== "auto") {
      params.set("vq", qualityTarget);
    }

    if (hasOrigin) {
      params.set("origin", window.location.origin);
      params.set("widget_referrer", `${window.location.origin}/`);
    }

    return `${YT_EMBED_HOST}/embed/${videoId}?${params.toString()}`;
  }

  function hintPlaybackQuality(embed, qualityTarget) {
    if (!embed || qualityTarget === "auto") return;
    const post = () => {
      if (!embed.contentWindow) return;
      const payload = JSON.stringify({
        event: "command",
        func: "setPlaybackQuality",
        args: [qualityTarget]
      });
      embed.contentWindow.postMessage(payload, YT_EMBED_HOST);
      embed.contentWindow.postMessage(payload, "https://www.youtube-nocookie.com");
    };

    post();
    window.setTimeout(post, 400);
    window.setTimeout(post, 1200);
  }

  embeds.forEach((embed, index) => {
    const videoId = embed.getAttribute("data-yt-id");
    const localSrc = embed.getAttribute("data-local-src");
    const qualityTarget = normalizeQualityTarget(
      embed.getAttribute("data-video-quality-target") || configuredQuality
    );
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
        embed.addEventListener(
          "load",
          () => {
            hintPlaybackQuality(embed, qualityTarget);
          },
          { once: true }
        );
        embed.src = buildYoutubeSrc(videoId, qualityTarget);
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
