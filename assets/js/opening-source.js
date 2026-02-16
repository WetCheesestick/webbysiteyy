(() => {
  const OPENING_USE_YOUTUBE = "OFF"; // ON = use YouTube, OFF = use local MP4 files.

  const embeds = Array.from(document.querySelectorAll(".opening-yt[data-yt-id]"));
  if (embeds.length === 0) return;

  const isHttp = window.location.protocol === "http:" || window.location.protocol === "https:";
  const hasOrigin = isHttp && window.location.origin && window.location.origin !== "null";
  const wantsYoutube = String(OPENING_USE_YOUTUBE || "").toUpperCase() === "ON";
  const canUseYoutubeHere = isHttp && hasOrigin;
  const useYoutube = wantsYoutube && canUseYoutubeHere;

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
      vq: "hd1080"
    });

    if (hasOrigin) {
      params.set("origin", window.location.origin);
      params.set("widget_referrer", `${window.location.origin}/`);
    }

    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  }

  embeds.forEach((embed) => {
    const videoId = embed.getAttribute("data-yt-id");
    const localSrc = embed.getAttribute("data-local-src");

    // Local file previews often trigger YouTube Error 153 (missing referrer).
    // Also used when OPENING_USE_YOUTUBE is set to OFF.
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
      embed.referrerPolicy = "strict-origin-when-cross-origin";
      embed.src = buildYoutubeSrc(videoId);
    }
  });
})();
