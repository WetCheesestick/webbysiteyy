(() => {
  const cards = Array.from(document.querySelectorAll(".works-3d-card"));
  if (cards.length === 0) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const MAX_TILT = 15;
  const SENSITIVITY = 1.35;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function setTilt(card, rotateX, rotateY) {
    card.style.setProperty("--tilt-x", `${rotateX.toFixed(2)}deg`);
    card.style.setProperty("--tilt-y", `${rotateY.toFixed(2)}deg`);
  }

  function resetTilt(card) {
    card.style.setProperty("--tilt-x", "0deg");
    card.style.setProperty("--tilt-y", "0deg");
  }

  function closeOtherCards(activeCard) {
    cards.forEach((card) => {
      if (card === activeCard) return;
      card.classList.remove("is-flipped");
      card.setAttribute("aria-pressed", "false");
      resetTilt(card);
    });
  }

  cards.forEach((card) => {
    const title = card.getAttribute("data-project-title") || "Project";
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `${title}: show details`);
    card.setAttribute("aria-pressed", "false");
    resetTilt(card);

    card.addEventListener("pointermove", (event) => {
      if (reducedMotion || card.classList.contains("is-flipped")) return;

      const rect = card.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      // Center-based control point: movement is measured from poster center.
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const normalizedX = (event.clientX - centerX) / (rect.width / 2);
      const normalizedY = (event.clientY - centerY) / (rect.height / 2);
      const rotateY = clamp(normalizedX * SENSITIVITY, -1, 1) * MAX_TILT;
      const rotateX = -clamp(normalizedY * SENSITIVITY, -1, 1) * MAX_TILT;
      setTilt(card, rotateX, rotateY);
    });

    const handleLeave = () => {
      if (!card.classList.contains("is-flipped")) resetTilt(card);
    };

    card.addEventListener("pointerleave", handleLeave);
    card.addEventListener("blur", handleLeave);

    card.addEventListener("click", (event) => {
      if (event.target.closest(".works-3d-more")) return;
      const nextState = !card.classList.contains("is-flipped");
      closeOtherCards(card);
      card.classList.toggle("is-flipped", nextState);
      card.setAttribute("aria-pressed", String(nextState));
      if (!nextState) resetTilt(card);
    });

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        card.click();
      }

      if (event.key === "Escape") {
        card.classList.remove("is-flipped");
        card.setAttribute("aria-pressed", "false");
        resetTilt(card);
      }
    });
  });

  document.addEventListener("click", (event) => {
    if (event.target.closest(".works-3d-card")) return;
    closeOtherCards(null);
  });
})();
