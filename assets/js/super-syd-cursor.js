(() => {
  const section = document.querySelector(".coming-soon-section");
  const cursor = document.querySelector(".super-syd-cursor");
  const trail = document.querySelector(".super-syd-trail");
  const supportsCustomCursor = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (!section || !cursor || !trail || !supportsCustomCursor) {
    if (cursor) cursor.remove();
    if (trail) trail.remove();
    return;
  }

  section.classList.add("has-custom-cursor");

  const ACTIVATION_PAD_X = 220;
  const ACTIVATION_PAD_TOP = 180;
  const ACTIVATION_PAD_BOTTOM = 24;
  const CURSOR_SIZE = 74;
  const FOLLOW_EASE = 0.14;
  const EMIT_INTERVAL_MS = 28;

  let active = false;
  let rafId = 0;
  let lastEmit = 0;
  let targetX = 0;
  let targetY = 0;
  let x = 0;
  let y = 0;
  let velX = 0;
  let velY = 0;

  function inActivationZone(clientX, clientY) {
    const rect = section.getBoundingClientRect();
    return (
      clientX >= rect.left - ACTIVATION_PAD_X &&
      clientX <= rect.right + ACTIVATION_PAD_X &&
      clientY >= rect.top - ACTIVATION_PAD_TOP &&
      clientY <= rect.bottom + ACTIVATION_PAD_BOTTOM
    );
  }

  function emitSparkles(now) {
    if (now - lastEmit < EMIT_INTERVAL_MS) return;
    lastEmit = now;

    const speed = Math.hypot(velX, velY);
    if (speed < 1.8) return;

    const norm = speed || 1;
    const dirX = velX / norm;
    const dirY = velY / norm;
    const count = speed > 12 ? 2 : 1;

    for (let i = 0; i < count; i += 1) {
      const sparkle = document.createElement("span");
      sparkle.className = "super-syd-sparkle";

      const size = 6 + Math.random() * 7;
      const life = 520 + Math.random() * 360;
      const backDist = 16 + Math.random() * 26;
      const scatterX = (Math.random() - 0.5) * 28;
      const scatterY = (Math.random() - 0.5) * 24;

      const startX = x - dirX * 20 + (Math.random() - 0.5) * 10;
      const startY = y - dirY * 20 + (Math.random() - 0.5) * 10;
      const dx = -dirX * backDist + scatterX;
      const dy = -dirY * backDist + scatterY;

      sparkle.style.setProperty("--x", `${startX}px`);
      sparkle.style.setProperty("--y", `${startY}px`);
      sparkle.style.setProperty("--dx", `${dx}px`);
      sparkle.style.setProperty("--dy", `${dy}px`);
      sparkle.style.setProperty("--s", `${size}px`);
      sparkle.style.setProperty("--d", `${life}ms`);

      trail.appendChild(sparkle);
      window.setTimeout(() => sparkle.remove(), life + 80);
    }
  }

  function render(now) {
    x += (targetX - x) * FOLLOW_EASE;
    y += (targetY - y) * FOLLOW_EASE;
    velX = targetX - x;
    velY = targetY - y;

    const angle = Math.atan2(velY, velX) * (180 / Math.PI);
    const speed = Math.min(Math.hypot(velX, velY), 24);
    const stretchX = 1 + speed / 130;
    const stretchY = 1 - speed / 260;
    const wobble = Math.sin(now * 0.012) * 5;
    const floatX = Math.cos(now * 0.004) * 2.8;
    const floatY = Math.sin(now * 0.006) * 2.2;

    cursor.style.transform = `translate3d(${x - CURSOR_SIZE / 2 + floatX}px, ${y - CURSOR_SIZE / 2 + floatY}px, 0) rotate(${angle + wobble}deg) scale(${stretchX}, ${stretchY})`;
    emitSparkles(now);

    if (active) {
      rafId = window.requestAnimationFrame(render);
    }
  }

  function updateTarget(event) {
    const rect = section.getBoundingClientRect();
    targetX = event.clientX - rect.left;
    targetY = event.clientY - rect.top;
  }

  function setActive(nextActive, event) {
    if (active === nextActive) return;

    active = nextActive;
    document.body.classList.toggle("cursor-flight-active", active);

    if (active) {
      updateTarget(event);
      x = targetX;
      y = targetY;
      cursor.style.opacity = "1";
      if (!rafId) rafId = window.requestAnimationFrame(render);
      return;
    }

    cursor.style.opacity = "0";
    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    }
  }

  function onPointerMove(event) {
    const shouldActivate = inActivationZone(event.clientX, event.clientY);
    setActive(shouldActivate, event);
    if (!active) return;
    updateTarget(event);
  }

  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerdown", onPointerMove);
  window.addEventListener("blur", () => setActive(false, { clientX: 0, clientY: 0 }));
})();
