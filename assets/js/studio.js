(() => {
  const api = window.SiteSettings;
  if (!api) return;

  const AUTH_KEY = "julian_studio_auth_hash_v2";
  const AUTH_SALT = "julian-studio-auth-v2";
  const SESSION_KEY = "julian_studio_session_v2";
  const UI_LAYOUT_KEY = "julian_studio_ui_layout_v1";
  const DRAFT_MIGRATION_KEY = "julian_studio_draft_migration_v1";
  const SESSION_TIMEOUT_MS = 1000 * 60 * 45;
  const MAX_HISTORY = 120;
  const OVERLAY_SNAP_PX = 8;
  const OVERLAY_MIN_WIDTH = 80;
  const OVERLAY_MIN_HEIGHT = 60;
  const HOME_BASE_SECTION_KEYS = ["super_syd", "works_intro", "works_classic", "works_3d"];

  const clone = (value) => JSON.parse(JSON.stringify(value));
  const byId = (id) => document.getElementById(id);
  const now = () => Date.now();
  const slug = (value) =>
    String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const SECTION_LIBRARY = [
    {
      id: "hero-cinematic",
      name: "Cinematic Hero Banner",
      category: "hero",
      type: "media_split",
      description: "Film-forward hero with a left media pane and right copy.",
      content: {
        kicker: "Featured Film",
        heading: "Visual storytelling in motion",
        body: "Introduce your reel or flagship project with a cinematic split hero.",
        imageSrc: "assets/images/AstrayPoster.png",
        imageAlt: "Featured poster",
        buttonLabel: "Watch Reel",
        buttonHref: "project-super-syd.html"
      },
      style: {
        maxWidth: 1180,
        padTop: 28,
        padBottom: 28,
        background: "linear-gradient(135deg, rgba(17,29,50,.82), rgba(9,12,20,.92))",
        textColor: "#f2f7ff",
        radius: 22,
        align: "left"
      }
    },
    {
      id: "hero-minimal",
      name: "Minimal Hero Statement",
      category: "hero",
      type: "text_banner",
      description: "Clean, type-first hero for editorial portfolios.",
      content: {
        kicker: "Cinematography",
        heading: "Frames with intent",
        body: "A concise positioning statement at the top of your homepage.",
        buttonLabel: "View Projects",
        buttonHref: "projects.html"
      },
      style: {
        maxWidth: 1020,
        padTop: 26,
        padBottom: 22,
        background: "rgba(255,255,255,.03)",
        textColor: "",
        radius: 16,
        align: "left"
      }
    },
    {
      id: "story-highlight",
      name: "Story Highlight",
      category: "content",
      type: "text_banner",
      description: "Longer narrative paragraph with a soft panel background.",
      content: {
        kicker: "Behind The Lens",
        heading: "How each frame supports the story",
        body: "Break down your visual approach, references, and collaboration process in one section.",
        buttonLabel: "Read More",
        buttonHref: "about.html"
      },
      style: {
        maxWidth: 1060,
        padTop: 22,
        padBottom: 22,
        background: "rgba(10,10,10,.45)",
        textColor: "",
        radius: 20,
        align: "left"
      }
    },
    {
      id: "film-quote",
      name: "Director Quote",
      category: "social",
      type: "quote",
      description: "Single quote block for client testimonials or pull quotes.",
      content: {
        quote: "Every frame felt intentional and emotionally honest.",
        attribution: "- Director testimonial"
      },
      style: {
        maxWidth: 980,
        padTop: 28,
        padBottom: 28,
        background: "rgba(255,255,255,.02)",
        textColor: "",
        radius: 20,
        align: "center"
      }
    },
    {
      id: "contact-cta",
      name: "Contact Callout",
      category: "utility",
      type: "cta",
      description: "Simple close-out CTA for the end of the page.",
      content: {
        heading: "Ready to collaborate?",
        body: "Let’s shape a visual language that serves your story.",
        buttonLabel: "Get in touch",
        buttonHref: "about.html"
      },
      style: {
        maxWidth: 900,
        padTop: 20,
        padBottom: 20,
        background: "linear-gradient(120deg, rgba(54,84,133,.28), rgba(17,20,33,.6))",
        textColor: "#f4f8ff",
        radius: 22,
        align: "center"
      }
    },
    {
      id: "newsletter-signup",
      name: "Newsletter Teaser",
      category: "utility",
      type: "cta",
      description: "Build an audience section with one action button.",
      content: {
        heading: "Get updates on new projects",
        body: "Add your newsletter signup link or form page.",
        buttonLabel: "Subscribe",
        buttonHref: "about.html"
      },
      style: {
        maxWidth: 920,
        padTop: 16,
        padBottom: 16,
        background: "rgba(255,255,255,.04)",
        textColor: "",
        radius: 18,
        align: "center"
      }
    },
    {
      id: "feature-split-alt",
      name: "Feature Split Alt",
      category: "content",
      type: "media_split",
      description: "Use this for a case study preview with media + details.",
      content: {
        kicker: "Case Study",
        heading: "Lighting approach and camera language",
        body: "Summarize the technical and artistic strategy for a project.",
        imageSrc: "assets/images/super_syd_canva.png",
        imageAlt: "Case study still",
        buttonLabel: "Open Case Study",
        buttonHref: "project-aastry.html"
      },
      style: {
        maxWidth: 1140,
        padTop: 24,
        padBottom: 24,
        background: "rgba(20,27,38,.82)",
        textColor: "#f0f6ff",
        radius: 20,
        align: "left"
      }
    },
    {
      id: "logo-wall-title",
      name: "Logo Wall Header",
      category: "social",
      type: "text_banner",
      description: "Intro copy that pairs well with a logo-strip widget.",
      content: {
        kicker: "Clients & Collaborators",
        heading: "Trusted by productions and creative teams",
        body: "Display collaborators, studios, or brands you’ve worked with.",
        buttonLabel: "View collaborations",
        buttonHref: "projects.html"
      },
      style: {
        maxWidth: 1080,
        padTop: 20,
        padBottom: 10,
        background: "",
        textColor: "",
        radius: 0,
        align: "left"
      }
    },
    {
      id: "pricing-card",
      name: "Rate Card Intro",
      category: "commerce",
      type: "text_banner",
      description: "Service package teaser and lead-in to inquiry flow.",
      content: {
        kicker: "Services",
        heading: "Production + cinematography support",
        body: "Introduce service tiers, availability, and booking process.",
        buttonLabel: "Request rates",
        buttonHref: "about.html"
      },
      style: {
        maxWidth: 980,
        padTop: 20,
        padBottom: 20,
        background: "rgba(255,255,255,.03)",
        textColor: "",
        radius: 18,
        align: "left"
      }
    },
    {
      id: "faq-intro",
      name: "FAQ Intro",
      category: "utility",
      type: "text_banner",
      description: "FAQ headline section for pre-sales questions.",
      content: {
        kicker: "FAQ",
        heading: "Frequently asked production questions",
        body: "Answer delivery timelines, availability, and production workflow.",
        buttonLabel: "Contact for details",
        buttonHref: "about.html"
      },
      style: {
        maxWidth: 980,
        padTop: 16,
        padBottom: 16,
        background: "rgba(255,255,255,.02)",
        textColor: "",
        radius: 16,
        align: "left"
      }
    }
  ];

  const WIDGET_LIBRARY = [
    {
      id: "widget-logo-cloud",
      name: "Logo Cloud",
      category: "social",
      type: "media_split",
      description: "Five-logo strip style block with optional heading.",
      content: {
        kicker: "Our Clients",
        heading: "Studio partners and productions",
        body: "Swap in your own logos or stills to create social trust quickly.",
        imageSrc: "assets/images/super_syd_canva.png",
        imageAlt: "Client logos placeholder",
        buttonLabel: "See projects",
        buttonHref: "projects.html"
      },
      style: {
        maxWidth: 1180,
        padTop: 14,
        padBottom: 14,
        background: "rgba(8,11,18,.75)",
        textColor: "#e7efff",
        radius: 16,
        align: "left"
      }
    },
    {
      id: "widget-faq",
      name: "FAQ Module",
      category: "utility",
      type: "text_banner",
      description: "Drop-in FAQ section shell with CTA.",
      content: {
        kicker: "FAQ",
        heading: "Frequently asked questions",
        body: "Use multiple copies of this widget for each Q/A pair or route to a full FAQ page.",
        buttonLabel: "Ask a question",
        buttonHref: "about.html"
      },
      style: {
        maxWidth: 980,
        padTop: 18,
        padBottom: 18,
        background: "rgba(255,255,255,.03)",
        textColor: "",
        radius: 18,
        align: "left"
      }
    },
    {
      id: "widget-testimonial",
      name: "Testimonial Widget",
      category: "social",
      type: "quote",
      description: "High-impact testimonial card.",
      content: {
        quote: "Julian built a visual world that elevated the script immediately.",
        attribution: "- Producer testimonial"
      },
      style: {
        maxWidth: 960,
        padTop: 24,
        padBottom: 24,
        background: "rgba(255,255,255,.02)",
        textColor: "",
        radius: 22,
        align: "center"
      }
    },
    {
      id: "widget-contact",
      name: "Contact Widget",
      category: "utility",
      type: "cta",
      description: "Simple contact panel with CTA button.",
      content: {
        heading: "Let’s plan your shoot",
        body: "Share your timeline, budget range, and creative direction.",
        buttonLabel: "Start conversation",
        buttonHref: "about.html"
      },
      style: {
        maxWidth: 920,
        padTop: 18,
        padBottom: 18,
        background: "rgba(32, 44, 66, .52)",
        textColor: "#f0f6ff",
        radius: 20,
        align: "center"
      }
    },
    {
      id: "widget-pricing",
      name: "Pricing Widget",
      category: "commerce",
      type: "text_banner",
      description: "Rate-card teaser with call to action.",
      content: {
        kicker: "Rates",
        heading: "Flexible production packages",
        body: "Communicate package tiers and invite project inquiries.",
        buttonLabel: "Request a quote",
        buttonHref: "about.html"
      },
      style: {
        maxWidth: 980,
        padTop: 18,
        padBottom: 18,
        background: "rgba(255,255,255,.04)",
        textColor: "",
        radius: 18,
        align: "left"
      }
    },
    {
      id: "widget-timeline",
      name: "Timeline Widget",
      category: "content",
      type: "text_banner",
      description: "Production timeline summary section.",
      content: {
        kicker: "Process",
        heading: "From prep to final color",
        body: "Outline major production milestones and delivery checkpoints.",
        buttonLabel: "Book a call",
        buttonHref: "about.html"
      },
      style: {
        maxWidth: 1040,
        padTop: 16,
        padBottom: 16,
        background: "rgba(255,255,255,.02)",
        textColor: "",
        radius: 16,
        align: "left"
      }
    },
    {
      id: "widget-gallery",
      name: "Gallery Widget",
      category: "content",
      type: "media_split",
      description: "Media-first section for still frames and key art.",
      content: {
        kicker: "Gallery",
        heading: "Selected stills",
        body: "Show visual style references, still frames, or lookbook assets.",
        imageSrc: "assets/images/AstrayPoster.png",
        imageAlt: "Gallery still",
        buttonLabel: "Open full gallery",
        buttonHref: "projects.html"
      },
      style: {
        maxWidth: 1120,
        padTop: 22,
        padBottom: 22,
        background: "rgba(10,14,22,.85)",
        textColor: "#e8f1ff",
        radius: 20,
        align: "left"
      }
    }
  ];

  const STYLE_ASSET_LIBRARY = [
    {
      id: "asset-glass-night",
      name: "Glass Night Panel",
      category: "hero",
      description: "Deep navy glass style for premium hero blocks.",
      style: {
        background: "linear-gradient(130deg, rgba(29,42,73,.72), rgba(7,10,18,.92))",
        textColor: "#edf4ff",
        radius: 24,
        padTop: 28,
        padBottom: 28
      }
    },
    {
      id: "asset-soft-editorial",
      name: "Soft Editorial",
      category: "content",
      description: "Subtle light surface for long-form copy.",
      style: {
        background: "rgba(255,255,255,.58)",
        textColor: "#121212",
        radius: 18,
        padTop: 18,
        padBottom: 18
      }
    },
    {
      id: "asset-electric-neon",
      name: "Electric Neon",
      category: "hero",
      description: "High-contrast neon gradient for promo banners.",
      style: {
        background: "linear-gradient(120deg, rgba(23,30,84,.92), rgba(74,23,84,.74), rgba(12,87,124,.82))",
        textColor: "#f4f7ff",
        radius: 22,
        padTop: 24,
        padBottom: 24
      }
    },
    {
      id: "asset-charcoal-card",
      name: "Charcoal Card",
      category: "utility",
      description: "Neutral card style for utility sections.",
      style: {
        background: "rgba(18,18,18,.66)",
        textColor: "#f2f2f2",
        radius: 16,
        padTop: 16,
        padBottom: 16
      }
    },
    {
      id: "asset-copper-glow",
      name: "Copper Glow",
      category: "commerce",
      description: "Warm premium accent style for pricing or CTA blocks.",
      style: {
        background: "linear-gradient(130deg, rgba(84,48,30,.56), rgba(28,20,16,.82))",
        textColor: "#fff1e8",
        radius: 20,
        padTop: 20,
        padBottom: 20
      }
    },
    {
      id: "asset-emerald-line",
      name: "Emerald Frame",
      category: "social",
      description: "Cool green accent for quote/testimonial modules.",
      style: {
        background: "linear-gradient(120deg, rgba(14,58,55,.7), rgba(7,21,20,.9))",
        textColor: "#e7fffb",
        radius: 20,
        padTop: 18,
        padBottom: 18
      }
    }
  ];

  const PRO_MEDIA_PACK = [
    { id: "pro-open-01", type: "video", label: "Opening 01 (YouTube)", url: "https://youtu.be/JaXuggpCLs8" },
    { id: "pro-open-02", type: "video", label: "Opening 02 (YouTube)", url: "https://youtu.be/fsxOK0UAhko" },
    { id: "pro-open-03", type: "video", label: "Opening 03 (YouTube)", url: "https://youtu.be/_HPmOGqlu_0" },
    { id: "pro-background", type: "video", label: "Background (YouTube)", url: "https://youtu.be/zDLFZ_0GTLg" },
    { id: "pro-poster-aastry", type: "image", label: "Aastry Poster", url: "assets/images/AstrayPoster.png" },
    { id: "pro-poster-super-syd", type: "image", label: "Super Syd Poster", url: "assets/images/super_syd_canva.png" },
    { id: "pro-poster-crimson", type: "image", label: "Crimson Ring Poster", url: "assets/images/project_02.svg" },
    { id: "pro-story-board", type: "image", label: "Story Board", url: "assets/images/super-syd-story/themes.png" },
    { id: "pro-visual-style", type: "image", label: "Visual Style Board", url: "assets/images/super-syd-story/visual-style.png" },
    { id: "pro-character-board", type: "image", label: "Character Board", url: "assets/images/super-syd-story/character-sydney.png" },
    { id: "pro-funding-graphic", type: "image", label: "Funding Graphic", url: "assets/images/super-syd-story/funds-breakdown.png" },
    { id: "pro-thanks-graphic", type: "image", label: "Thanks Graphic", url: "assets/images/super-syd-story/thanks.png" },
    { id: "pro-stock-frame-01", type: "image", label: "Stock Frame 01", url: "https://picsum.photos/seed/cinema01/1600/900" },
    { id: "pro-stock-frame-02", type: "image", label: "Stock Frame 02", url: "https://picsum.photos/seed/cinema02/1600/900" },
    { id: "pro-stock-frame-03", type: "image", label: "Stock Frame 03", url: "https://picsum.photos/seed/cinema03/1600/900" },
    { id: "pro-stock-frame-04", type: "image", label: "Stock Frame 04", url: "https://picsum.photos/seed/cinema04/1600/900" },
    { id: "pro-stock-frame-05", type: "image", label: "Stock Frame 05", url: "https://picsum.photos/seed/cinema05/1600/900" }
  ];

  const DESIGN_KITS = {
    cinematic: {
      name: "Cinematic Dark",
      theme: "DARK",
      design: {
        heroFramePad: 18,
        heroHeaderHeight: 40,
        heroTileWidth: 480,
        heroTileHeight: 188,
        cardRadius: 20,
        contentMaxWidth: 1140
      },
      style: {
        background: "rgba(12,15,24,.86)",
        textColor: "#edf4ff",
        radius: 20
      }
    },
    editorial: {
      name: "Editorial Light",
      theme: "LIGHT",
      design: {
        heroFramePad: 24,
        heroHeaderHeight: 44,
        heroTileWidth: 470,
        heroTileHeight: 184,
        cardRadius: 14,
        contentMaxWidth: 1080
      },
      style: {
        background: "rgba(255,255,255,.6)",
        textColor: "#131313",
        radius: 14
      }
    },
    electric: {
      name: "Electric Neon",
      theme: "DARK",
      design: {
        heroFramePad: 20,
        heroHeaderHeight: 42,
        heroTileWidth: 500,
        heroTileHeight: 194,
        cardRadius: 24,
        contentMaxWidth: 1180
      },
      style: {
        background: "linear-gradient(120deg, rgba(26,30,88,.72), rgba(93,31,112,.62), rgba(16,92,127,.72))",
        textColor: "#f3f7ff",
        radius: 24
      }
    }
  };

  const EXTRA_SECTION_NAMES = [
    "Parallax Story Intro",
    "Split Spotlight",
    "Motion Teaser Banner",
    "Crew Feature Panel",
    "Scene Breakdown",
    "LUT Showcase",
    "BTS Feature Strip",
    "Awards Highlight",
    "Festival Timeline",
    "Moodboard Intro",
    "Animated Gradient Banner",
    "Noise Texture Hero",
    "Glassmorphism Promo",
    "Retro Film Strip",
    "Cinematic Statement",
    "Project Grid Intro",
    "Narrative Thesis",
    "Client Trust Panel"
  ];

  const EXTRA_WIDGET_NAMES = [
    "Accordion FAQ",
    "Testimonial Carousel Shell",
    "Sticky CTA Bar",
    "Countdown Promo",
    "Booking Prompt",
    "Newsletter Compact",
    "Social Strip",
    "Partner Logos Row",
    "Stats Counter Block",
    "Feature Bullets",
    "Project Highlight Tile",
    "Mini Bio Widget",
    "Press Quote Widget",
    "Release Card Widget"
  ];

  const EXTRA_STYLE_ASSET_NAMES = [
    "Aurora Gradient",
    "Noir Matte",
    "Ice Glass",
    "Sunset Copper",
    "Midnight Blue",
    "Studio Slate",
    "Emerald Velvet",
    "Pearl Editorial",
    "Infrared Pop",
    "Paper Light",
    "Graphite Pro",
    "Soft Neon"
  ];

  EXTRA_SECTION_NAMES.forEach((name, index) => {
    SECTION_LIBRARY.push({
      id: `extra-section-${index + 1}`,
      name,
      category: index % 4 === 0 ? "hero" : index % 4 === 1 ? "content" : index % 4 === 2 ? "social" : "utility",
      type: index % 3 === 0 ? "media_split" : index % 3 === 1 ? "text_banner" : "cta",
      description: "Expanded library preset for rapid composition and experimentation.",
      content: {
        kicker: "Preset",
        heading: name,
        body: "Use this prebuilt block as a starting point and customize copy/media in the inspector.",
        imageSrc: "assets/images/super_syd_canva.png",
        imageAlt: name,
        buttonLabel: "Customize",
        buttonHref: "about.html"
      },
      style: {
        maxWidth: 960 + ((index % 4) * 60),
        padTop: 16 + ((index % 3) * 4),
        padBottom: 16 + ((index % 3) * 4),
        background: index % 2 ? "rgba(255,255,255,.03)" : "rgba(16,20,30,.7)",
        textColor: index % 2 ? "" : "#eef4ff",
        radius: 14 + (index % 4) * 2,
        align: index % 5 === 0 ? "center" : "left"
      }
    });
  });

  EXTRA_WIDGET_NAMES.forEach((name, index) => {
    WIDGET_LIBRARY.push({
      id: `extra-widget-${index + 1}`,
      name,
      category: index % 3 === 0 ? "utility" : index % 3 === 1 ? "social" : "content",
      type: index % 2 === 0 ? "text_banner" : "cta",
      description: "Drop-in widget module for dense editor libraries.",
      content: {
        kicker: "Widget",
        heading: name,
        body: "Prebuilt widget shell ready for your custom data and branding.",
        buttonLabel: "Edit widget",
        buttonHref: "about.html"
      },
      style: {
        maxWidth: 880 + ((index % 5) * 40),
        padTop: 14 + (index % 4) * 2,
        padBottom: 14 + (index % 4) * 2,
        background: index % 2 ? "rgba(255,255,255,.02)" : "rgba(10,14,22,.75)",
        textColor: index % 2 ? "" : "#ebf3ff",
        radius: 14 + (index % 3) * 2,
        align: index % 4 === 0 ? "center" : "left"
      }
    });
  });

  EXTRA_STYLE_ASSET_NAMES.forEach((name, index) => {
    STYLE_ASSET_LIBRARY.push({
      id: `extra-style-${index + 1}`,
      name,
      category: index % 4 === 0 ? "hero" : index % 4 === 1 ? "content" : index % 4 === 2 ? "social" : "utility",
      description: "Additional style token pack.",
      style: {
        background: index % 2
          ? `linear-gradient(120deg, rgba(${20 + index * 6},${30 + index * 4},${70 + index * 3},.72), rgba(12,14,24,.82))`
          : `rgba(${20 + index * 5}, ${20 + index * 3}, ${26 + index * 4}, .72)`,
        textColor: index % 2 ? "#eef4ff" : "#f7f7f7",
        radius: 14 + (index % 5) * 2,
        padTop: 14 + (index % 4) * 2,
        padBottom: 14 + (index % 4) * 2
      }
    });
  });

  const MASS_LIBRARY_PREFIXES = [
    "Cinematic",
    "Editorial",
    "Noir",
    "Studio",
    "Festival",
    "Modern",
    "Classic",
    "Neon",
    "Documentary",
    "Narrative",
    "Premium",
    "Minimal"
  ];

  const MASS_LIBRARY_SUFFIXES = [
    "Spotlight",
    "Showcase",
    "Banner",
    "Panel",
    "Frame",
    "Module",
    "Layout",
    "Feature",
    "Section",
    "Story",
    "Teaser",
    "Block"
  ];

  const MASS_LIBRARY_CATEGORIES = ["hero", "content", "social", "commerce", "utility"];

  let generatedIndex = 0;
  for (let i = 0; i < MASS_LIBRARY_PREFIXES.length; i += 1) {
    for (let j = 0; j < MASS_LIBRARY_SUFFIXES.length; j += 1) {
      generatedIndex += 1;
      const name = `${MASS_LIBRARY_PREFIXES[i]} ${MASS_LIBRARY_SUFFIXES[j]}`;
      const category = MASS_LIBRARY_CATEGORIES[(i + j) % MASS_LIBRARY_CATEGORIES.length];
      const heading = `${MASS_LIBRARY_PREFIXES[i]} ${MASS_LIBRARY_SUFFIXES[j]} Layout`;
      const hue = (i * 21 + j * 17) % 360;

      SECTION_LIBRARY.push({
        id: `mass-section-${generatedIndex}`,
        name,
        category,
        type: generatedIndex % 3 === 0 ? "media_split" : generatedIndex % 3 === 1 ? "text_banner" : "cta",
        description: "Expanded premium section preset for high-speed visual ideation.",
        content: {
          kicker: "Pro Preset",
          heading,
          body: "Drag this preset onto your page and customize media, copy, and style in the inspector.",
          imageSrc: generatedIndex % 2 ? "assets/images/super_syd_canva.png" : "assets/images/AstrayPoster.png",
          imageAlt: heading,
          buttonLabel: "Customize",
          buttonHref: "about.html"
        },
        style: {
          maxWidth: 900 + ((generatedIndex % 7) * 40),
          padTop: 14 + ((generatedIndex % 5) * 3),
          padBottom: 14 + ((generatedIndex % 5) * 3),
          background:
            generatedIndex % 2 === 0
              ? `linear-gradient(125deg, hsla(${hue}, 42%, 22%, .78), hsla(${(hue + 35) % 360}, 45%, 10%, .9))`
              : `hsla(${hue}, 26%, 12%, .78)`,
          textColor: "#eef4ff",
          radius: 12 + ((generatedIndex % 6) * 2),
          align: generatedIndex % 5 === 0 ? "center" : "left"
        }
      });

      WIDGET_LIBRARY.push({
        id: `mass-widget-${generatedIndex}`,
        name: `${name} Widget`,
        category: MASS_LIBRARY_CATEGORIES[(generatedIndex + 2) % MASS_LIBRARY_CATEGORIES.length],
        type: generatedIndex % 2 === 0 ? "text_banner" : "cta",
        description: "Dense widget preset collection for editor-first workflows.",
        content: {
          kicker: "Widget Pack",
          heading: `${heading} Widget`,
          body: "Use as-is or swap in your own data and links.",
          buttonLabel: "Edit",
          buttonHref: "about.html"
        },
        style: {
          maxWidth: 860 + ((generatedIndex % 8) * 35),
          padTop: 12 + ((generatedIndex % 4) * 3),
          padBottom: 12 + ((generatedIndex % 4) * 3),
          background:
            generatedIndex % 2 === 0
              ? `hsla(${(hue + 18) % 360}, 26%, 14%, .74)`
              : `linear-gradient(120deg, hsla(${hue}, 35%, 18%, .76), hsla(${(hue + 60) % 360}, 38%, 12%, .88))`,
          textColor: "#ebf3ff",
          radius: 12 + ((generatedIndex % 5) * 2),
          align: generatedIndex % 4 === 0 ? "center" : "left"
        }
      });

      STYLE_ASSET_LIBRARY.push({
        id: `mass-style-${generatedIndex}`,
        name: `${name} Style`,
        category: MASS_LIBRARY_CATEGORIES[(generatedIndex + 1) % MASS_LIBRARY_CATEGORIES.length],
        description: "Large-scale style token preset.",
        style: {
          background:
            generatedIndex % 2 === 0
              ? `linear-gradient(135deg, hsla(${hue}, 58%, 26%, .72), hsla(${(hue + 32) % 360}, 48%, 14%, .86))`
              : `hsla(${hue}, 33%, 15%, .76)`,
          textColor: generatedIndex % 3 === 0 ? "#f8f9ff" : "#edf5ff",
          radius: 12 + ((generatedIndex % 7) * 2),
          padTop: 12 + ((generatedIndex % 6) * 2),
          padBottom: 12 + ((generatedIndex % 6) * 2)
        }
      });
    }
  }

  const refs = {
    setupPanel: byId("setup-panel"),
    loginPanel: byId("login-panel"),
    editorPanel: byId("editor-panel"),

    setupForm: byId("setup-form"),
    loginForm: byId("login-form"),

    setupPassphrase: byId("setup-passphrase"),
    setupPassphraseConfirm: byId("setup-passphrase-confirm"),
    loginPassphrase: byId("login-passphrase"),

    statusPill: byId("status-pill"),
    draftPill: byId("draft-pill"),
    autosavePill: byId("autosave-pill"),

    pageList: byId("page-list"),
    layerList: byId("layer-list"),
    canvasBoard: byId("canvas-board"),
    canvasPanel: byId("canvas-panel"),
    preview: byId("studio-preview"),
    previewShell: byId("preview-shell"),
    previewOverlay: byId("preview-overlay"),
    previewDropIndicator: byId("preview-drop-indicator"),

    globalControls: byId("global-controls"),
    inspectorEmpty: byId("inspector-empty"),
    inspectorContent: byId("inspector-content"),
    layerControls: byId("layer-controls"),
    projectsEditor: byId("projects-editor"),

    templateModal: byId("template-modal"),
    templateList: byId("template-list"),
    libraryStats: byId("library-stats"),
    libraryPreviewTitle: byId("library-preview-title"),
    libraryPreviewSubtitle: byId("library-preview-subtitle"),
    libraryPreviewCanvas: byId("library-preview-canvas"),
    libraryPreviewDetails: byId("library-preview-details"),
    librarySearchInput: byId("library-search-input"),
    libraryCategoryFilter: byId("library-category-filter"),
    libraryModeSections: byId("library-mode-sections"),
    libraryModeWidgets: byId("library-mode-widgets"),
    libraryModeAssets: byId("library-mode-assets"),
    mediaModal: byId("media-modal"),
    mediaList: byId("media-list"),

    mediaLabelInput: byId("media-label-input"),
    mediaUrlInput: byId("media-url-input"),
    mediaTypeInput: byId("media-type-input"),

    importInput: byId("import-settings-file"),
    toggleLeftPanel: byId("toggle-left-panel"),
    toggleCanvasSidebar: byId("toggle-canvas-sidebar"),
    toggleRightPanel: byId("toggle-right-panel"),
    toggleFocusMode: byId("toggle-focus-mode")
  };

  const state = {
    selectedPage: "home",
    selectedLayerKey: null,
    view: "desktop",

    draft: api.loadDraftSettings(),
    published: api.loadPublishedSettings(),

    historyPast: [],
    historyFuture: [],

    autosaveTimer: null,
    pendingAutosave: false,
    autosaveAt: null,

    mediaTarget: null,
    sessionMonitor: null,

    libraryMode: "sections",
    libraryCategory: "all",
    librarySearch: "",

    previewRects: {},
    previewMetrics: null,
    overlayInteraction: null,
    overlayRaf: null,
    libraryPreviewId: null,
    draggingLibraryItem: null,
    previewDropCandidate: null,

    uiLayout: {
      leftPanel: true,
      canvasSidebar: true,
      rightPanel: true
    },
    uiLayoutBeforeFocus: null
  };

  function normalizeUILayout(layout) {
    const source = layout && typeof layout === "object" ? layout : {};
    return {
      leftPanel: Boolean(source.leftPanel),
      canvasSidebar: Boolean(source.canvasSidebar),
      rightPanel: Boolean(source.rightPanel)
    };
  }

  function loadUILayout() {
    try {
      const raw = window.localStorage.getItem(UI_LAYOUT_KEY);
      if (!raw) {
        return {
          leftPanel: false,
          canvasSidebar: false,
          rightPanel: false
        };
      }
      return normalizeUILayout(JSON.parse(raw));
    } catch (_err) {
      return {
        leftPanel: false,
        canvasSidebar: false,
        rightPanel: false
      };
    }
  }

  function saveUILayout() {
    try {
      window.localStorage.setItem(UI_LAYOUT_KEY, JSON.stringify(state.uiLayout));
    } catch (_err) {
      // Ignore storage failures.
    }
  }

  function isFocusMode() {
    return !state.uiLayout.leftPanel && !state.uiLayout.canvasSidebar && !state.uiLayout.rightPanel;
  }

  function applyUILayout() {
    refs.editorPanel.classList.toggle("panel-left-collapsed", !state.uiLayout.leftPanel);
    refs.editorPanel.classList.toggle("panel-right-collapsed", !state.uiLayout.rightPanel);
    refs.canvasPanel.classList.toggle("canvas-sidebar-collapsed", !state.uiLayout.canvasSidebar);
    const focus = isFocusMode();
    document.body.classList.toggle("studio-focus-mode", focus);

    const setButtonState = (button, label, enabled) => {
      if (!button) return;
      button.textContent = `${label}: ${enabled ? "On" : "Off"}`;
      button.classList.toggle("is-off", !enabled);
      button.setAttribute("aria-pressed", enabled ? "true" : "false");
    };

    setButtonState(refs.toggleLeftPanel, "Left Panel", state.uiLayout.leftPanel);
    setButtonState(refs.toggleCanvasSidebar, "Layer Cards", state.uiLayout.canvasSidebar);
    setButtonState(refs.toggleRightPanel, "Inspector", state.uiLayout.rightPanel);

    if (refs.toggleFocusMode) {
      refs.toggleFocusMode.textContent = focus ? "Exit Focus Mode" : "Focus Mode";
      refs.toggleFocusMode.classList.toggle("is-off", !focus);
      refs.toggleFocusMode.setAttribute("aria-pressed", focus ? "true" : "false");
    }

    if (focus) {
      const previewWrap = refs.previewShell && refs.previewShell.parentElement;
      if (previewWrap) previewWrap.scrollTop = 0;
      try {
        const win = refs.preview.contentWindow;
        if (win && typeof win.scrollTo === "function") win.scrollTo(0, 0);
      } catch (_err) {
        // Ignore cross-document scroll failures.
      }
    }

    queueOverlayRender();
  }

  function setUILayout(nextLayout, options = {}) {
    state.uiLayout = normalizeUILayout(nextLayout);
    applyUILayout();
    if (options.persist !== false) {
      saveUILayout();
    }
  }

  function showPanel(panel) {
    refs.setupPanel.classList.toggle("hidden", panel !== "setup");
    refs.loginPanel.classList.toggle("hidden", panel !== "login");
    refs.editorPanel.classList.toggle("hidden", panel !== "editor");
    refs.setupPanel.hidden = panel !== "setup";
    refs.loginPanel.hidden = panel !== "login";
    refs.editorPanel.hidden = panel !== "editor";
  }

  function setStatus(message, type = "ok") {
    refs.statusPill.textContent = message;
    refs.statusPill.dataset.type = type;
  }

  function setDraftPill() {
    const hasDiff = api.hasDraftChanges(state.draft, state.published);
    refs.draftPill.textContent = hasDiff ? "Draft differs from published." : "Draft matches published.";
    refs.draftPill.dataset.type = hasDiff ? "warn" : "ok";
  }

  function formatTime(ts) {
    if (!ts) return "-";
    try {
      return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch (_err) {
      return String(ts);
    }
  }

  function setAutosavePill() {
    if (state.pendingAutosave) {
      refs.autosavePill.textContent = "Autosave pending...";
      refs.autosavePill.dataset.type = "warn";
      return;
    }
    refs.autosavePill.textContent = `Draft autosaved: ${formatTime(state.autosaveAt)}`;
    refs.autosavePill.dataset.type = "ok";
  }

  function pushHistorySnapshot() {
    state.historyPast.push(clone(state.draft));
    if (state.historyPast.length > MAX_HISTORY) state.historyPast.shift();
  }

  function setUndoRedoState() {
    byId("undo-btn").disabled = state.historyPast.length === 0;
    byId("redo-btn").disabled = state.historyFuture.length === 0;
  }

  function syncPublishedSettings() {
    state.published = api.loadPublishedSettings();
  }

  function syncDraftSettings() {
    state.draft = api.loadDraftSettings();
    runDraftMigrationIfNeeded();
  }

  function readMigrationVersion() {
    try {
      return Number(window.localStorage.getItem(DRAFT_MIGRATION_KEY) || 0);
    } catch (_err) {
      return 0;
    }
  }

  function writeMigrationVersion(version) {
    try {
      window.localStorage.setItem(DRAFT_MIGRATION_KEY, String(version));
    } catch (_err) {
      // Ignore migration marker failures.
    }
  }

  function normalizeLegacyHomeBaseStyles(draft) {
    let changed = false;
    if (!draft || !draft.layout || !draft.layout.sectionStyles) return false;

    HOME_BASE_SECTION_KEYS.forEach((key) => {
      const style = draft.layout.sectionStyles[key];
      if (!style) return;
      if (String(style.layoutMode || "").toLowerCase() !== "free") return;

      const freeX = Number(style.freeX || 0);
      const freeY = Number(style.freeY || 0);
      const freeW = Number(style.freeW || 0);
      const freeH = Number(style.freeH || 0);

      const hasExtremeGeometry =
        Math.abs(freeX) > 420 ||
        freeY > 320 ||
        freeY < -220 ||
        freeW > 1500 ||
        freeH > 760 ||
        (key !== "super_syd" && freeY > 220);

      if (!hasExtremeGeometry) return;

      draft.layout.sectionStyles[key] = {
        ...style,
        layoutMode: "flow",
        freeX: 0,
        freeY: 0,
        freeW: 0,
        freeH: 0
      };
      changed = true;
    });

    return changed;
  }

  function runDraftMigrationIfNeeded() {
    const migrationVersion = 1;
    if (readMigrationVersion() >= migrationVersion) return;

    const draft = clone(state.draft);
    const changed = normalizeLegacyHomeBaseStyles(draft);
    if (changed) {
      state.draft = api.normalizeSettings(draft);
      api.saveDraftSettings(state.draft);
      setStatus("Draft layout normalized to remove legacy spacing bugs.", "ok");
    }
    writeMigrationVersion(migrationVersion);
  }

  function ensureSelectedLayer() {
    const catalog = api.getSectionCatalog(state.draft);
    if (!catalog.length) {
      state.selectedLayerKey = null;
      return;
    }

    const exists = catalog.some((layer) => layer.key === state.selectedLayerKey);
    if (!exists) state.selectedLayerKey = catalog[0].key;
  }

  function touchSession() {
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.hash) return;
      window.localStorage.setItem(SESSION_KEY, JSON.stringify({ ...parsed, touchedAt: now() }));
    } catch (_err) {
      // Ignore session touch failures.
    }
  }

  function setSession(hash) {
    try {
      window.localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          hash,
          touchedAt: now()
        })
      );
    } catch (_err) {
      // Ignore session storage failures.
    }
  }

  function clearSession() {
    try {
      window.localStorage.removeItem(SESSION_KEY);
    } catch (_err) {
      // Ignore clear failures.
    }
  }

  function getStoredAuthHash() {
    try {
      return window.localStorage.getItem(AUTH_KEY) || "";
    } catch (_err) {
      return "";
    }
  }

  function setStoredAuthHash(hash) {
    try {
      window.localStorage.setItem(AUTH_KEY, hash);
    } catch (_err) {
      // Ignore storage write failures.
    }
  }

  function clearStoredAuthHash() {
    try {
      window.localStorage.removeItem(AUTH_KEY);
    } catch (_err) {
      // Ignore clear failures.
    }
  }

  function hasActiveSession() {
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return false;
      const hash = getStoredAuthHash();
      if (!hash || parsed.hash !== hash) return false;
      const age = now() - Number(parsed.touchedAt || 0);
      return age >= 0 && age < SESSION_TIMEOUT_MS;
    } catch (_err) {
      return false;
    }
  }

  async function hashPassphrase(passphrase) {
    const clean = String(passphrase || "").trim();
    if (!clean) return "";

    if (!window.crypto || !window.crypto.subtle) {
      return `${AUTH_SALT}:${btoa(clean)}`;
    }

    const bytes = new TextEncoder().encode(`${AUTH_SALT}|${clean}`);
    const digest = await window.crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  function collectLayerOrderFromDom(container) {
    return [...container.querySelectorAll("[data-layer-key]")].map((el) => el.getAttribute("data-layer-key"));
  }

  function getDragAfterElement(container, y) {
    const list = [...container.querySelectorAll("[data-layer-key]:not(.dragging)")];
    return list.reduce(
      (closest, el) => {
        const box = el.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return { offset, element: el };
        }
        return closest;
      },
      { offset: Number.NEGATIVE_INFINITY, element: null }
    ).element;
  }

  function scheduleAutosave() {
    state.pendingAutosave = true;
    setAutosavePill();

    if (state.autosaveTimer) window.clearTimeout(state.autosaveTimer);
    state.autosaveTimer = window.setTimeout(() => {
      api.saveDraftSettings(state.draft);
      state.autosaveAt = now();
      state.pendingAutosave = false;
      setAutosavePill();
      setDraftPill();
      refreshPreview();
    }, 420);
  }

  function saveDraftImmediately(statusMessage = "Draft saved.") {
    if (state.autosaveTimer) window.clearTimeout(state.autosaveTimer);
    api.saveDraftSettings(state.draft);
    state.pendingAutosave = false;
    state.autosaveAt = now();
    setAutosavePill();
    setDraftPill();
    setStatus(statusMessage, "ok");
    refreshPreview();
  }

  function applyDraft(nextDraft, statusMessage, options = {}) {
    const trackHistory = options.trackHistory !== false;
    const autosave = options.autosave !== false;

    if (trackHistory) pushHistorySnapshot();

    state.draft = api.normalizeSettings(nextDraft);
    state.historyFuture = [];

    if (autosave) scheduleAutosave();

    ensureSelectedLayer();
    renderAll();
    setStatus(statusMessage || "Updated.", "ok");
  }

  function undo() {
    if (!state.historyPast.length) return;
    state.historyFuture.push(clone(state.draft));
    state.draft = api.normalizeSettings(state.historyPast.pop());
    saveDraftImmediately("Undo applied.");
    renderAll();
  }

  function redo() {
    if (!state.historyFuture.length) return;
    state.historyPast.push(clone(state.draft));
    state.draft = api.normalizeSettings(state.historyFuture.pop());
    saveDraftImmediately("Redo applied.");
    renderAll();
  }

  function parseInputValue(target) {
    if (target.type === "checkbox") return Boolean(target.checked);
    if (target.dataset.kind === "number") return Number(target.value);
    return target.value;
  }

  function setPathValue(obj, path, value) {
    const parts = String(path || "").split(".");
    if (!parts.length) return;
    let cursor = obj;
    for (let i = 0; i < parts.length - 1; i += 1) {
      const key = parts[i];
      if (!cursor[key] || typeof cursor[key] !== "object") cursor[key] = {};
      cursor = cursor[key];
    }
    cursor[parts[parts.length - 1]] = value;
  }

  function getPathValue(obj, path) {
    return String(path || "")
      .split(".")
      .reduce((acc, key) => (acc && Object.prototype.hasOwnProperty.call(acc, key) ? acc[key] : undefined), obj);
  }

  function getLayers() {
    return api.getSectionCatalog(state.draft);
  }

  function getSelectedLayer() {
    return getLayers().find((layer) => layer.key === state.selectedLayerKey) || null;
  }

  function getSelectedCustomBlock() {
    const layer = getSelectedLayer();
    if (!layer || !layer.isCustom) return null;
    return state.draft.layout.customBlocks.find((block) => block.id === layer.id) || null;
  }

  function getLibraryPool(mode = state.libraryMode) {
    if (mode === "widgets") return WIDGET_LIBRARY;
    if (mode === "assets") return STYLE_ASSET_LIBRARY;
    return SECTION_LIBRARY;
  }

  function getLibraryEntryById(id, mode = state.libraryMode) {
    if (!id) return null;
    return getLibraryPool(mode).find((entry) => entry.id === id) || null;
  }

  function isDraggableLibraryMode(mode = state.libraryMode) {
    return mode === "sections" || mode === "widgets";
  }

  function defaultBlockSizeForEntry(entry) {
    const width = clamp(Number(entry?.style?.maxWidth || 900), 300, 1800);
    let height = 210;
    if (entry?.type === "media_split") height = 260;
    if (entry?.type === "quote") height = 180;
    if (entry?.type === "cta") height = 190;
    return { width, height };
  }

  function getLibraryModeLabel(mode = state.libraryMode) {
    if (mode === "widgets") return "widgets";
    if (mode === "assets") return "style assets";
    return "sections";
  }

  function getLibraryCategories(mode = state.libraryMode) {
    const pool = getLibraryPool(mode);
    return Array.from(
      new Set(
        pool
          .map((entry) => String(entry.category || "").trim().toLowerCase())
          .filter(Boolean)
      )
    ).sort();
  }

  function syncLibraryCategoryOptions(mode = state.libraryMode) {
    if (!refs.libraryCategoryFilter) return;
    const categories = getLibraryCategories(mode);
    const current = state.libraryCategory;
    const previous = new Set(
      Array.from(refs.libraryCategoryFilter.options).map((option) => option.value)
    );

    const mustRefresh =
      previous.size !== categories.length + 1 ||
      !previous.has("all") ||
      categories.some((category) => !previous.has(category));

    if (mustRefresh) {
      refs.libraryCategoryFilter.innerHTML = "";
      const allOption = document.createElement("option");
      allOption.value = "all";
      allOption.textContent = "All Categories";
      refs.libraryCategoryFilter.appendChild(allOption);

      categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        refs.libraryCategoryFilter.appendChild(option);
      });
    }

    if (current !== "all" && !categories.includes(current)) {
      state.libraryCategory = "all";
    }
  }

  function getLibraryEntries() {
    const pool = getLibraryPool();
    const search = state.librarySearch.trim().toLowerCase();
    const category = state.libraryCategory;

    return pool.filter((entry) => {
      const categoryMatch = category === "all" || entry.category === category;
      if (!categoryMatch) return false;
      if (!search) return true;

      const haystack = [
        entry.name,
        entry.description,
        entry.category,
        entry.type,
        entry.content?.heading,
        entry.content?.body,
        entry.content?.kicker
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(search);
    });
  }

  function setLibraryMode(mode) {
    state.libraryMode = mode;
    refs.libraryModeSections.classList.toggle("active", mode === "sections");
    refs.libraryModeWidgets.classList.toggle("active", mode === "widgets");
    refs.libraryModeAssets.classList.toggle("active", mode === "assets");
    syncLibraryCategoryOptions(mode);

    const pool = getLibraryPool(mode);
    if (!pool.some((entry) => entry.id === state.libraryPreviewId)) {
      state.libraryPreviewId = pool[0] ? pool[0].id : null;
    }

    renderLibraryControls();
    renderTemplateList();
  }

  function insertLibraryBlockIntoDraft(draft, entry, insertAfterKey = state.selectedLayerKey) {
    const beforeKeys = new Set(api.getSectionCatalog(draft).map((layer) => layer.key));
    let next = api.insertCustomBlock(draft, entry.type || "text_banner", insertAfterKey);
    const afterLayers = api.getSectionCatalog(next);
    const insertedLayer = afterLayers.find((layer) => layer.isCustom && !beforeKeys.has(layer.key));

    if (!insertedLayer) {
      return { next, insertedLayerKey: null };
    }

    next = api.updateCustomBlock(next, insertedLayer.id, {
      label: entry.name,
      type: entry.type || "text_banner",
      description: entry.description || "",
      content: entry.content || {},
      style: entry.style || {}
    });

    return { next, insertedLayerKey: insertedLayer.key };
  }

  function addLibraryEntry(entry, modeOverride = state.libraryMode, options = {}) {
    if (!entry) return;

    if (modeOverride === "assets") {
      const selectedLayer = getSelectedLayer();
      if (!selectedLayer) {
        setStatus("Select a layer first to apply a style asset.", "warn");
        return;
      }
      const next = api.setSectionStyle(state.draft, selectedLayer.key, entry.style || {});
      applyDraft(next, `${entry.name} style applied.`);
      return;
    }

    const insertAfterKey = options.insertAfterKey !== undefined ? options.insertAfterKey : state.selectedLayerKey;
    const { next, insertedLayerKey } = insertLibraryBlockIntoDraft(state.draft, entry, insertAfterKey);
    let finalized = next;
    if (insertedLayerKey && options.dropPosition) {
      const size = defaultBlockSizeForEntry(entry);
      finalized = api.setSectionStyle(finalized, insertedLayerKey, {
        layoutMode: "free",
        freeX: options.dropPosition.x,
        freeY: options.dropPosition.y,
        freeW: size.width,
        freeH: size.height,
        zIndex: 12
      });
    }
    if (insertedLayerKey) state.selectedLayerKey = insertedLayerKey;
    const message = options.dropPosition ? `${entry.name} dropped into preview.` : `${entry.name} added.`;
    applyDraft(finalized, message);
  }

  function addLibraryEntryById(id) {
    if (!id) return;
    const entry =
      SECTION_LIBRARY.find((item) => item.id === id) ||
      WIDGET_LIBRARY.find((item) => item.id === id) ||
      STYLE_ASSET_LIBRARY.find((item) => item.id === id);
    if (!entry) return;

    if (STYLE_ASSET_LIBRARY.some((item) => item.id === id)) {
      addLibraryEntry(entry, "assets");
      return;
    }

    addLibraryEntry(entry, WIDGET_LIBRARY.some((item) => item.id === id) ? "widgets" : "sections");
  }

  function setLibraryPreview(id) {
    if (!id) return;
    if (!getLibraryEntryById(id, state.libraryMode)) return;
    if (state.libraryPreviewId === id) return;
    state.libraryPreviewId = id;
    renderLibraryPreview();
    refs.templateList.querySelectorAll("[data-library-id]").forEach((item) => {
      item.classList.toggle("is-selected", item.getAttribute("data-library-id") === id);
    });
  }

  function renderLibraryPreview() {
    const entry = getLibraryEntryById(state.libraryPreviewId, state.libraryMode);
    if (!entry) {
      refs.libraryPreviewTitle.textContent = "Library Preview";
      refs.libraryPreviewSubtitle.textContent = "Select or hover an item to preview.";
      refs.libraryPreviewCanvas.innerHTML = "<p class=\"muted\">No preview available.</p>";
      refs.libraryPreviewDetails.innerHTML = "";
      return;
    }

    refs.libraryPreviewTitle.textContent = entry.name;
    const modeLabel = state.libraryMode === "assets" ? "Style Asset" : state.libraryMode === "widgets" ? "Widget" : "Section";
    refs.libraryPreviewSubtitle.textContent = `${modeLabel} · ${entry.category}`;

    if (state.libraryMode === "assets") {
      const style = entry.style || {};
      refs.libraryPreviewCanvas.innerHTML = `
        <div class="library-preview-swatch" style="background:${style.background || "rgba(19,19,24,.72)"};color:${style.textColor || "#f4f7ff"}">
          <strong>${entry.name}</strong>
          <span>Sample style swatch</span>
        </div>
      `;
      refs.libraryPreviewDetails.innerHTML = `
        <li>Background: ${style.background || "(none)"}</li>
        <li>Text: ${style.textColor || "(default)"}</li>
        <li>Radius: ${style.radius ?? 0}px</li>
        <li>Padding: ${style.padTop ?? 0}px / ${style.padBottom ?? 0}px</li>
      `;
      return;
    }

    const c = entry.content || {};
    const s = entry.style || {};
    const media = entry.type === "media_split" ? `<div class="library-preview-media">Media Slot</div>` : "";
    const cta = c.buttonLabel ? `<span class="lib-cta">${c.buttonLabel}</span>` : "";
    refs.libraryPreviewCanvas.innerHTML = `
      <div class="library-preview-block" style="background:${s.background || "rgba(15,18,27,.76)"};color:${s.textColor || "#f4f7ff"};border-radius:${Number(s.radius || 12)}px;">
        ${media}
        <p class="lib-kicker">${c.kicker || "Preview"}</p>
        <h5>${c.heading || entry.name}</h5>
        <p>${c.body || entry.description || ""}</p>
        ${cta}
      </div>
    `;

    refs.libraryPreviewDetails.innerHTML = `
      <li>Template: ${api.CUSTOM_BLOCK_TYPE_LABELS[entry.type] || entry.type}</li>
      <li>Target width: ${Number(s.maxWidth || 900)}px</li>
      <li>Padding: ${Number(s.padTop || 0)}px / ${Number(s.padBottom || 0)}px</li>
      <li>Drop into preview: drag this tile onto the canvas.</li>
    `;
  }

  function importProAssetPack() {
    let next = clone(state.draft);
    let added = 0;
    const existingUrls = new Set((next.mediaLibrary || []).map((item) => item.url));

    PRO_MEDIA_PACK.forEach((item, index) => {
      if (existingUrls.has(item.url)) return;
      existingUrls.add(item.url);
      added += 1;
      next = api.upsertMediaItem(next, {
        id: item.id || `pro-${slug(item.label)}-${index + 1}`,
        type: item.type,
        label: item.label,
        url: item.url
      });
    });

    if (!added) {
      setStatus("Pro asset pack already installed.", "ok");
      return;
    }

    applyDraft(next, `Imported ${added} pro assets into Media Manager.`);
  }

  function applyDesignKit(key) {
    const kit = DESIGN_KITS[key];
    if (!kit) return;

    let next = clone(state.draft);
    next.theme = kit.theme;
    next.design = { ...next.design, ...kit.design };

    const layers = api.getSectionCatalog(next);
    layers.forEach((layer) => {
      next = api.setSectionStyle(next, layer.key, kit.style);
    });

    applyDraft(next, `${kit.name} design kit applied.`);
  }

  function seedDemoLayout() {
    const confirmed = window.confirm(
      "Insert a full demo layout with multiple prebuilt sections and widgets?"
    );
    if (!confirmed) return;

    const sequence = [
      "hero-cinematic",
      "logo-wall-title",
      "widget-logo-cloud",
      "story-highlight",
      "widget-testimonial",
      "faq-intro",
      "widget-faq",
      "pricing-card",
      "widget-pricing",
      "widget-gallery",
      "contact-cta",
      "widget-contact",
      "newsletter-signup"
    ];

    let next = clone(state.draft);
    let anchor = state.selectedLayerKey;

    sequence.forEach((id) => {
      const entry =
        SECTION_LIBRARY.find((item) => item.id === id) || WIDGET_LIBRARY.find((item) => item.id === id);
      if (!entry) return;
      const result = insertLibraryBlockIntoDraft(next, entry, anchor);
      next = result.next;
      if (result.insertedLayerKey) anchor = result.insertedLayerKey;
    });

    state.selectedLayerKey = anchor;
    applyDraft(next, "Demo layout inserted.");
  }

  function getLayerSummary(layer) {
    if (!layer) return "";
    if (layer.key === "super_syd") return state.draft.content.superSyd.comingSoonCopy;
    if (layer.key === "works_intro") return state.draft.content.works.lede;

    if (layer.isCustom && layer.block) {
      const block = layer.block;
      if (block.type === "quote") return block.content.quote;
      return block.content.heading || block.content.body || block.description || "Custom block";
    }

    return "Section";
  }

  function createLayerRow(layer) {
    const li = document.createElement("li");
    li.className = "layer-item";
    li.setAttribute("data-layer-key", layer.key);
    li.draggable = layer.locked !== "ON";

    li.innerHTML = `
      <span class="drag-handle" aria-hidden="true">⋮⋮</span>
      <div class="layer-main" data-action="select">
        <strong>${layer.label}</strong>
        <span>${layer.isCustom ? api.CUSTOM_BLOCK_TYPE_LABELS[layer.templateType] || "Custom" : "Base section"}</span>
      </div>
      <div class="layer-actions">
        <button class="icon-btn" type="button" data-action="toggle-visible" title="Show / hide">${layer.visible === "ON" ? "👁" : "🚫"}</button>
        <button class="icon-btn" type="button" data-action="toggle-lock" title="Lock / unlock">${layer.locked === "ON" ? "🔒" : "🔓"}</button>
        ${
          layer.isCustom
            ? `<button class="icon-btn" type="button" data-action="duplicate" title="Duplicate">⧉</button>
               <button class="icon-btn" type="button" data-action="delete" title="Delete">🗑</button>`
            : ""
        }
      </div>
    `;

    if (layer.key === state.selectedLayerKey) {
      li.style.borderColor = "rgba(125, 211, 252, 0.7)";
      li.style.background = "rgba(125, 211, 252, 0.12)";
    }

    li.addEventListener("dragstart", () => {
      li.classList.add("dragging");
    });

    li.addEventListener("dragend", () => {
      li.classList.remove("dragging");
      const nextOrder = collectLayerOrderFromDom(refs.layerList);
      const next = api.reorderSections(state.draft, nextOrder);
      applyDraft(next, "Layer order updated.");
    });

    return li;
  }

  function renderPageList() {
    const pages = [
      { key: "home", label: "Home / Landing" },
      { key: "projects", label: "Projects Page" },
      { key: "about", label: "About Page" },
      { key: "privacy", label: "Privacy Page" }
    ];

    refs.pageList.innerHTML = "";
    pages.forEach((page) => {
      const li = document.createElement("li");
      li.className = `page-item${state.selectedPage === page.key ? " active" : ""}`;
      li.innerHTML = `<button type="button" data-page-key="${page.key}">${page.label}</button>`;
      refs.pageList.appendChild(li);
    });
  }

  function renderLayerList() {
    refs.layerList.innerHTML = "";

    if (state.selectedPage !== "home") {
      const placeholder = document.createElement("li");
      placeholder.className = "layer-item";
      placeholder.innerHTML = `<div class="layer-main"><strong>Page controls are available in Global Site toggles</strong><span>Per-page layer editing is still focused on Home.</span></div>`;
      refs.layerList.appendChild(placeholder);
      return;
    }

    const layers = getLayers();
    layers.forEach((layer) => {
      refs.layerList.appendChild(createLayerRow(layer));
    });
  }

  function renderCanvas() {
    refs.canvasBoard.innerHTML = "";

    if (state.selectedPage !== "home") {
      const li = document.createElement("li");
      li.className = "canvas-card";
      li.innerHTML = `
        <h3>${state.selectedPage.toUpperCase()} page</h3>
        <p>Use page toggles in Global Site settings. Home has full visual layer controls.</p>
      `;
      refs.canvasBoard.appendChild(li);
      return;
    }

    getLayers().forEach((layer) => {
      const card = document.createElement("li");
      card.className = `canvas-card${layer.key === state.selectedLayerKey ? " selected" : ""}`;
      card.setAttribute("data-layer-key", layer.key);

      const quickWidth = layer.style?.maxWidth || 1080;
      const layoutMode = layer.style?.layoutMode === "free" ? "Free" : "Flow";

      card.innerHTML = `
        <div class="canvas-meta">
          <span class="chip">${layer.isCustom ? "Custom" : "Base"}</span>
          <span class="chip">${layer.visible === "ON" ? "Visible" : "Hidden"}</span>
          <span class="chip">${layer.locked === "ON" ? "Locked" : "Editable"}</span>
          <span class="chip">${layoutMode}</span>
        </div>
        <h3>${layer.label}</h3>
        <p>${getLayerSummary(layer)}</p>
        <div class="canvas-actions" style="margin-top:8px">
          <button type="button" data-action="select">Edit</button>
          <button type="button" data-action="toggle-visible">${layer.visible === "ON" ? "Hide" : "Show"}</button>
          <button type="button" data-action="toggle-lock">${layer.locked === "ON" ? "Unlock" : "Lock"}</button>
          ${layer.isCustom ? '<button type="button" data-action="duplicate">Duplicate</button><button type="button" data-action="delete">Delete</button>' : ""}
        </div>
        <div class="quick-resize">
          <label class="label" style="margin-top:8px">Quick Width (${quickWidth}px)</label>
          <input type="range" min="300" max="1800" value="${quickWidth}" data-action="quick-width" />
        </div>
      `;

      refs.canvasBoard.appendChild(card);
    });
  }

  function renderGlobalControls() {
    refs.globalControls.querySelectorAll("[data-path]").forEach((input) => {
      const path = input.getAttribute("data-path");
      const kind = input.dataset.kind;
      const value = getPathValue(state.draft, path);

      if (kind === "onoff") {
        input.checked = api.isOn(value);
      } else if (input.type === "number") {
        input.value = Number(value ?? 0);
      } else {
        input.value = value ?? "";
      }
    });
  }

  function styleFieldsMarkup(style, disabled) {
    const lockAttr = disabled ? "disabled" : "";
    const mode = style.layoutMode === "free" ? "free" : "flow";
    const freeX = Number(style.freeX || 0);
    const freeY = Number(style.freeY || 0);
    const freeW = Number(style.freeW || 0);
    const freeH = Number(style.freeH || 0);
    const zIndex = Number(style.zIndex || 1);
    return `
      <div>
        <label class="label">Layout Mode</label>
        <select data-layer-field="style.layoutMode" ${lockAttr}>
          <option value="flow" ${mode === "flow" ? "selected" : ""}>Flow (stacked)</option>
          <option value="free" ${mode === "free" ? "selected" : ""}>Free Position</option>
        </select>
      </div>
      <div class="grid-2">
        <div>
          <label class="label">Free X</label>
          <input type="number" data-layer-field="style.freeX" data-kind="number" value="${freeX}" min="-5000" max="12000" step="1" ${lockAttr} />
        </div>
        <div>
          <label class="label">Free Y</label>
          <input type="number" data-layer-field="style.freeY" data-kind="number" value="${freeY}" min="-5000" max="24000" step="1" ${lockAttr} />
        </div>
        <div>
          <label class="label">Free Width</label>
          <input type="number" data-layer-field="style.freeW" data-kind="number" value="${freeW}" min="0" max="6000" step="1" ${lockAttr} />
        </div>
        <div>
          <label class="label">Free Height</label>
          <input type="number" data-layer-field="style.freeH" data-kind="number" value="${freeH}" min="0" max="6000" step="1" ${lockAttr} />
        </div>
        <div>
          <label class="label">Z Index</label>
          <input type="number" data-layer-field="style.zIndex" data-kind="number" value="${zIndex}" min="1" max="200" step="1" ${lockAttr} />
        </div>
      </div>
      <div class="grid-2">
        <div>
          <label class="label">Max Width</label>
          <input type="number" data-layer-field="style.maxWidth" data-kind="number" value="${style.maxWidth}" min="300" max="1800" step="1" ${lockAttr} />
        </div>
        <div>
          <label class="label">Border Radius</label>
          <input type="number" data-layer-field="style.radius" data-kind="number" value="${style.radius}" min="0" max="80" step="1" ${lockAttr} />
        </div>
        <div>
          <label class="label">Padding Top</label>
          <input type="number" data-layer-field="style.padTop" data-kind="number" value="${style.padTop}" min="0" max="320" step="1" ${lockAttr} />
        </div>
        <div>
          <label class="label">Padding Bottom</label>
          <input type="number" data-layer-field="style.padBottom" data-kind="number" value="${style.padBottom}" min="0" max="320" step="1" ${lockAttr} />
        </div>
        <div>
          <label class="label">Background</label>
          <input type="text" data-layer-field="style.background" value="${style.background || ""}" placeholder="#111111 or rgba(...)" ${lockAttr} />
        </div>
        <div>
          <label class="label">Text Color</label>
          <input type="text" data-layer-field="style.textColor" value="${style.textColor || ""}" placeholder="#ffffff" ${lockAttr} />
        </div>
        <div>
          <label class="label">Text Align</label>
          <select data-layer-field="style.align" ${lockAttr}>
            <option value="left" ${style.align === "left" ? "selected" : ""}>Left</option>
            <option value="center" ${style.align === "center" ? "selected" : ""}>Center</option>
            <option value="right" ${style.align === "right" ? "selected" : ""}>Right</option>
          </select>
        </div>
      </div>
    `;
  }

  function customFieldsMarkup(block, disabled) {
    const lockAttr = disabled ? "disabled" : "";
    const templateOptions = Object.keys(api.CUSTOM_BLOCK_TEMPLATES)
      .map((type) => `<option value="${type}" ${block.type === type ? "selected" : ""}>${api.CUSTOM_BLOCK_TYPE_LABELS[type]}</option>`)
      .join("");

    const c = block.content || {};

    if (block.type === "quote") {
      return `
        <div>
          <label class="label">Section Name</label>
          <input type="text" data-layer-field="custom.label" value="${block.label}" ${lockAttr} />
        </div>
        <div>
          <label class="label">Template</label>
          <select data-layer-field="custom.type" ${lockAttr}>${templateOptions}</select>
        </div>
        <div>
          <label class="label">Quote</label>
          <textarea data-layer-field="custom.content.quote" ${lockAttr}>${c.quote || ""}</textarea>
        </div>
        <div>
          <label class="label">Attribution</label>
          <input type="text" data-layer-field="custom.content.attribution" value="${c.attribution || ""}" ${lockAttr} />
        </div>
      `;
    }

    if (block.type === "media_split") {
      return `
        <div>
          <label class="label">Section Name</label>
          <input type="text" data-layer-field="custom.label" value="${block.label}" ${lockAttr} />
        </div>
        <div>
          <label class="label">Template</label>
          <select data-layer-field="custom.type" ${lockAttr}>${templateOptions}</select>
        </div>
        <div>
          <label class="label">Kicker</label>
          <input type="text" data-layer-field="custom.content.kicker" value="${c.kicker || ""}" ${lockAttr} />
        </div>
        <div>
          <label class="label">Heading</label>
          <input type="text" data-layer-field="custom.content.heading" value="${c.heading || ""}" ${lockAttr} />
        </div>
        <div>
          <label class="label">Body</label>
          <textarea data-layer-field="custom.content.body" ${lockAttr}>${c.body || ""}</textarea>
        </div>
        <div>
          <label class="label">Media Source</label>
          <div class="inline-input">
            <input type="text" data-layer-field="custom.content.imageSrc" value="${c.imageSrc || ""}" ${lockAttr} />
            <button type="button" data-action="pick-media" data-target="custom:${block.id}:imageSrc" ${lockAttr}>Library</button>
          </div>
        </div>
        <div>
          <label class="label">Media Alt</label>
          <input type="text" data-layer-field="custom.content.imageAlt" value="${c.imageAlt || ""}" ${lockAttr} />
        </div>
        <div class="grid-2">
          <div>
            <label class="label">Button Label</label>
            <input type="text" data-layer-field="custom.content.buttonLabel" value="${c.buttonLabel || ""}" ${lockAttr} />
          </div>
          <div>
            <label class="label">Button Link</label>
            <input type="text" data-layer-field="custom.content.buttonHref" value="${c.buttonHref || ""}" ${lockAttr} />
          </div>
        </div>
      `;
    }

    if (block.type === "cta") {
      return `
        <div>
          <label class="label">Section Name</label>
          <input type="text" data-layer-field="custom.label" value="${block.label}" ${lockAttr} />
        </div>
        <div>
          <label class="label">Template</label>
          <select data-layer-field="custom.type" ${lockAttr}>${templateOptions}</select>
        </div>
        <div>
          <label class="label">Heading</label>
          <input type="text" data-layer-field="custom.content.heading" value="${c.heading || ""}" ${lockAttr} />
        </div>
        <div>
          <label class="label">Body</label>
          <textarea data-layer-field="custom.content.body" ${lockAttr}>${c.body || ""}</textarea>
        </div>
        <div class="grid-2">
          <div>
            <label class="label">Button Label</label>
            <input type="text" data-layer-field="custom.content.buttonLabel" value="${c.buttonLabel || ""}" ${lockAttr} />
          </div>
          <div>
            <label class="label">Button Link</label>
            <input type="text" data-layer-field="custom.content.buttonHref" value="${c.buttonHref || ""}" ${lockAttr} />
          </div>
        </div>
      `;
    }

    return `
      <div>
        <label class="label">Section Name</label>
        <input type="text" data-layer-field="custom.label" value="${block.label}" ${lockAttr} />
      </div>
      <div>
        <label class="label">Template</label>
        <select data-layer-field="custom.type" ${lockAttr}>${templateOptions}</select>
      </div>
      <div>
        <label class="label">Kicker</label>
        <input type="text" data-layer-field="custom.content.kicker" value="${c.kicker || ""}" ${lockAttr} />
      </div>
      <div>
        <label class="label">Heading</label>
        <input type="text" data-layer-field="custom.content.heading" value="${c.heading || ""}" ${lockAttr} />
      </div>
      <div>
        <label class="label">Body</label>
        <textarea data-layer-field="custom.content.body" ${lockAttr}>${c.body || ""}</textarea>
      </div>
      <div class="grid-2">
        <div>
          <label class="label">Button Label</label>
          <input type="text" data-layer-field="custom.content.buttonLabel" value="${c.buttonLabel || ""}" ${lockAttr} />
        </div>
        <div>
          <label class="label">Button Link</label>
          <input type="text" data-layer-field="custom.content.buttonHref" value="${c.buttonHref || ""}" ${lockAttr} />
        </div>
      </div>
    `;
  }

  function renderLayerControls() {
    const layer = getSelectedLayer();
    if (!layer || state.selectedPage !== "home") {
      refs.inspectorEmpty.classList.remove("hidden");
      refs.inspectorContent.classList.add("hidden");
      refs.layerControls.innerHTML = "";
      return;
    }

    refs.inspectorEmpty.classList.add("hidden");
    refs.inspectorContent.classList.remove("hidden");

    const locked = layer.locked === "ON";
    const lockAttr = locked ? "disabled" : "";
    const styleMarkup = styleFieldsMarkup(layer.style || {}, locked);

    let contentMarkup = "";

    if (layer.key === "works_intro") {
      contentMarkup = `
        <div>
          <label class="label">Works Title</label>
          <input type="text" data-layer-field="works.title" value="${state.draft.content.works.title}" ${lockAttr} />
        </div>
        <div>
          <label class="label">Works Subtitle</label>
          <input type="text" data-layer-field="works.lede" value="${state.draft.content.works.lede}" ${lockAttr} />
        </div>
      `;
    } else if (layer.key === "super_syd") {
      contentMarkup = `
        <div>
          <label class="label">Coming Soon Copy</label>
          <input type="text" data-layer-field="superSyd.comingSoonCopy" value="${state.draft.content.superSyd.comingSoonCopy}" ${lockAttr} />
        </div>
        <div>
          <label class="label">Teaser URL</label>
          <div class="inline-input">
            <input type="text" data-layer-field="superSyd.teaserEmbedUrl" value="${state.draft.content.superSyd.teaserEmbedUrl}" ${lockAttr} />
            <button type="button" data-action="pick-media" data-target="superSyd:teaserEmbedUrl" ${lockAttr}>Library</button>
          </div>
        </div>
        <div>
          <label class="label">Previs URL</label>
          <div class="inline-input">
            <input type="text" data-layer-field="superSyd.previsEmbedUrl" value="${state.draft.content.superSyd.previsEmbedUrl}" ${lockAttr} />
            <button type="button" data-action="pick-media" data-target="superSyd:previsEmbedUrl" ${lockAttr}>Library</button>
          </div>
        </div>
      `;
    } else if (layer.isCustom) {
      const block = getSelectedCustomBlock();
      if (block) {
        contentMarkup = `
          ${customFieldsMarkup(block, locked)}
          <div class="inline-actions" style="margin-top:8px">
            <button type="button" data-action="duplicate">Duplicate Section</button>
            <button type="button" data-action="delete">Delete Section</button>
          </div>
        `;
      }
    } else {
      contentMarkup = `<p class="muted">No extra content fields for this section. Use style and visibility controls.</p>`;
    }

    refs.layerControls.innerHTML = `
      <div class="toggle-row">
        <span>Visible</span>
        <input type="checkbox" data-layer-field="visible" ${layer.visible === "ON" ? "checked" : ""} />
      </div>
      <div class="toggle-row">
        <span>Locked</span>
        <input type="checkbox" data-layer-field="locked" ${layer.locked === "ON" ? "checked" : ""} />
      </div>
      ${styleMarkup}
      ${contentMarkup}
    `;
  }

  function renderProjectsEditor() {
    refs.projectsEditor.innerHTML = "";

    const projects = state.draft.content.projects;
    const order = state.draft.layout.projectOrder;

    order.forEach((projectIndex) => {
      const project = projects[projectIndex];
      if (!project) return;

      const li = document.createElement("li");
      li.className = "project-editor-item";
      li.setAttribute("data-project-index", String(projectIndex));
      li.draggable = true;

      li.innerHTML = `
        <div class="project-editor-header">
          <h4>${project.title}</h4>
          <span class="chip">${project.pageKey}</span>
        </div>
        <div class="grid-2">
          <div>
            <label class="label">Title</label>
            <input type="text" data-project-field="title" value="${project.title}" />
          </div>
          <div>
            <label class="label">Meta</label>
            <input type="text" data-project-field="meta" value="${project.meta}" />
          </div>
          <div>
            <label class="label">Poster</label>
            <div class="inline-input">
              <input type="text" data-project-field="posterSrc" value="${project.posterSrc}" />
              <button type="button" data-action="pick-project-media" data-target="project:${projectIndex}:posterSrc">Library</button>
            </div>
          </div>
          <div>
            <label class="label">Poster Alt</label>
            <input type="text" data-project-field="posterAlt" value="${project.posterAlt}" />
          </div>
          <div>
            <label class="label">Link</label>
            <input type="text" data-project-field="link" value="${project.link}" />
          </div>
        </div>
        <div>
          <label class="label">Back Description</label>
          <textarea data-project-field="detail">${project.detail}</textarea>
        </div>
      `;

      li.addEventListener("dragstart", () => {
        li.classList.add("dragging");
      });

      li.addEventListener("dragend", () => {
        li.classList.remove("dragging");
        const nextOrder = [...refs.projectsEditor.querySelectorAll("[data-project-index]")].map((el) =>
          Number(el.getAttribute("data-project-index"))
        );
        const next = clone(state.draft);
        next.layout.projectOrder = nextOrder;
        applyDraft(next, "Project order updated.");
      });

      refs.projectsEditor.appendChild(li);
    });
  }

  function renderTemplateList() {
    refs.templateList.innerHTML = "";
    const entries = getLibraryEntries();
    const total = getLibraryPool().length;
    if (!entries.some((entry) => entry.id === state.libraryPreviewId)) {
      state.libraryPreviewId = entries[0] ? entries[0].id : null;
    }
    if (refs.libraryStats) {
      refs.libraryStats.textContent = `${entries.length} of ${total} ${getLibraryModeLabel()} shown`;
    }

    if (!entries.length) {
      state.libraryPreviewId = null;
      const li = document.createElement("li");
      li.className = "template-item";
      li.innerHTML = `
        <h4>No results</h4>
        <p>Try a different search phrase or category filter.</p>
      `;
      refs.templateList.appendChild(li);
      renderLibraryPreview();
      return;
    }

    entries.forEach((entry) => {
      const li = document.createElement("li");
      li.className = "template-item";
      li.setAttribute("data-library-id", entry.id);
      const isSelected = entry.id === state.libraryPreviewId;
      const draggable = isDraggableLibraryMode(state.libraryMode);
      li.classList.toggle("is-selected", isSelected);
      li.classList.toggle("is-draggable", draggable);
      li.draggable = draggable;
      li.tabIndex = 0;

      const cta = state.libraryMode === "assets" ? "Apply Style" : "Add To Page";
      const typeLabel =
        state.libraryMode === "assets"
          ? "Style Asset"
          : api.CUSTOM_BLOCK_TYPE_LABELS[entry.type] || "Section";

      li.innerHTML = `
        <h4>${entry.name}</h4>
        <p>${entry.description}</p>
        <div class="template-meta">
          <span class="chip">${entry.category}</span>
          <span class="chip">${typeLabel}</span>
          ${draggable ? '<span class="chip drag-badge">Drag into preview</span>' : ""}
        </div>
        <div class="inline-actions" style="margin-top:8px">
          <button type="button" data-action="library-add" data-library-id="${entry.id}">${cta}</button>
        </div>
      `;
      refs.templateList.appendChild(li);
    });
    renderLibraryPreview();
  }

  function renderLibraryControls() {
    syncLibraryCategoryOptions(state.libraryMode);
    refs.librarySearchInput.value = state.librarySearch;
    refs.libraryCategoryFilter.value = state.libraryCategory;
    refs.libraryModeSections.classList.toggle("active", state.libraryMode === "sections");
    refs.libraryModeWidgets.classList.toggle("active", state.libraryMode === "widgets");
    refs.libraryModeAssets.classList.toggle("active", state.libraryMode === "assets");
    const title = byId("template-modal-title");
    if (title) {
      const modeTitle =
        state.libraryMode === "widgets"
          ? "Add Widget Blocks"
          : state.libraryMode === "assets"
            ? "Apply Style Assets"
            : "Add Section Template";
      title.textContent = `${modeTitle} (${getLibraryPool().length})`;
    }
    renderLibraryPreview();
  }

  function renderMediaList() {
    refs.mediaList.innerHTML = "";

    if (!state.draft.mediaLibrary.length) {
      const li = document.createElement("li");
      li.className = "media-item";
      li.innerHTML = "<p>No media items yet.</p>";
      refs.mediaList.appendChild(li);
      return;
    }

    state.draft.mediaLibrary.forEach((item) => {
      const li = document.createElement("li");
      li.className = "media-item";
      li.setAttribute("data-media-id", item.id);

      li.innerHTML = `
        <h4>${item.label}</h4>
        <p>${item.url}</p>
        <div class="media-meta">
          <span class="chip">${item.type}</span>
          <div class="inline-actions">
            <button type="button" data-action="use-media">Use</button>
            <button type="button" data-action="copy-media">Copy URL</button>
            <button type="button" data-action="delete-media">Delete</button>
          </div>
        </div>
      `;

      refs.mediaList.appendChild(li);
    });
  }

  function renderAll() {
    ensureSelectedLayer();
    renderPageList();
    renderLayerList();
    renderCanvas();
    renderGlobalControls();
    renderLayerControls();
    renderProjectsEditor();
    renderLibraryControls();
    renderTemplateList();
    renderLibraryPreview();
    renderMediaList();
    queueOverlayRender();
    setDraftPill();
    setAutosavePill();
    setUndoRedoState();
  }

  function refreshPreview() {
    const url = `index.html?studioMode=draft&ts=${Date.now()}`;
    refs.preview.src = url;
  }

  function openDraftPreviewInNewTab() {
    const url = `index.html?studioMode=draft&ts=${Date.now()}`;
    window.open(url, "_blank", "noopener");
  }

  function openModal(modal) {
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeModal(modal) {
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    if (modal === refs.templateModal) {
      clearLibraryDragState();
    }
  }

  function setView(view) {
    state.view = view;
    refs.previewShell.classList.remove("view-desktop", "view-tablet", "view-mobile");
    refs.previewShell.classList.add(`view-${view}`);
    document.querySelectorAll(".view-btn").forEach((button) => {
      button.classList.toggle("active", button.getAttribute("data-view") === view);
    });
    queueOverlayRender();
  }

  function getLayerStyle(key) {
    return (state.draft.layout.sectionStyles && state.draft.layout.sectionStyles[key]) || {};
  }

  function capturePreviewLayout() {
    const iframe = refs.preview;
    if (!iframe || !iframe.contentWindow || !iframe.contentDocument) return;

    const win = iframe.contentWindow;
    const doc = iframe.contentDocument;
    const main = doc.querySelector("main.page");
    if (!main) return;

    const mainRect = main.getBoundingClientRect();
    const iframeRect = iframe.getBoundingClientRect();
    const shellRect = refs.previewShell.getBoundingClientRect();
    const viewportW = win.innerWidth || iframe.clientWidth || 0;
    const viewportH = win.innerHeight || iframe.clientHeight || 0;
    const scaleX = viewportW > 0 ? iframeRect.width / viewportW : 1;
    const scaleY = viewportH > 0 ? iframeRect.height / viewportH : 1;

    state.previewMetrics = {
      mainLeft: mainRect.left,
      mainTop: mainRect.top,
      scrollX: win.scrollX || 0,
      scrollY: win.scrollY || 0,
      viewportW,
      viewportH,
      offsetX: iframeRect.left - shellRect.left,
      offsetY: iframeRect.top - shellRect.top,
      scaleX,
      scaleY
    };

    const nextRects = {};
    getLayers().forEach((layer) => {
      const section = doc.querySelector(`[data-studio-section="${layer.key}"]`);
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const layerStyle = getLayerStyle(layer.key);
      const isFreeLayer = layerStyle.layoutMode === "free";
      const sectionStyle = win.getComputedStyle(section);
      const isRenderHidden =
        section.hidden || sectionStyle.display === "none" || sectionStyle.visibility === "hidden";
      const scrollW = Math.max(rect.width, section.scrollWidth || 0);
      const scrollH = Math.max(rect.height, section.scrollHeight || 0);
      let contentW = rect.width;
      let contentH = rect.height;
      let contentOffsetX = 0;
      let contentOffsetY = 0;
      try {
        const contentNodes = isFreeLayer ? Array.from(section.querySelectorAll("*")) : Array.from(section.children);
        const childRects = contentNodes
          .filter((node) => {
            if (!(node instanceof HTMLElement)) return false;
            if (node.hidden) return false;
            const childStyle = win.getComputedStyle(node);
            if (childStyle.display === "none" || childStyle.visibility === "hidden") return false;
            if (childStyle.position === "fixed") return false;
            return true;
          })
          .map((node) => node.getBoundingClientRect())
          .filter((childRect) => childRect.width > 0 && childRect.height > 0);

        if (childRects.length) {
          const minLeft = Math.min(...childRects.map((childRect) => childRect.left - rect.left));
          const minTop = Math.min(...childRects.map((childRect) => childRect.top - rect.top));
          const maxRight = Math.max(...childRects.map((childRect) => childRect.right - rect.left));
          const maxBottom = Math.max(...childRects.map((childRect) => childRect.bottom - rect.top));
          contentOffsetX = minLeft;
          contentOffsetY = minTop;
          contentW = Math.max(1, maxRight - minLeft);
          contentH = Math.max(1, maxBottom - minTop);
        }
      } catch (_err) {
        // Ignore content-bound measurement failures.
      }
      nextRects[layer.key] = {
        x: rect.left,
        y: rect.top,
        w: rect.width,
        h: rect.height,
        scrollW,
        scrollH,
        contentW,
        contentH,
        contentOffsetX,
        contentOffsetY,
        isRenderHidden
      };
    });
    state.previewRects = nextRects;
  }

  function resolveFreeGeometry(style, rect, metrics) {
    const rawX = Math.round(Number(style.freeX || 0));
    const rawY = Math.round(Number(style.freeY || 0));
    const maxOffsetX = Math.max(400, Math.round(Number(rect?.w || 0) * 2));
    const maxOffsetY = Math.max(400, Math.round(Number(rect?.h || 0) * 2));
    const measuredOffsetX = clamp(Math.round(Number(rect?.contentOffsetX || 0)), -maxOffsetX, maxOffsetX);
    const measuredOffsetY = clamp(Math.round(Number(rect?.contentOffsetY || 0)), -maxOffsetY, maxOffsetY);
    const measuredW = Math.max(
      OVERLAY_MIN_WIDTH,
      Math.round(Number(rect?.contentW || rect?.scrollW || rect?.w || OVERLAY_MIN_WIDTH))
    );
    const measuredH = Math.max(
      OVERLAY_MIN_HEIGHT,
      Math.round(Number(rect?.contentH || rect?.scrollH || rect?.h || OVERLAY_MIN_HEIGHT))
    );
    const rawW = Math.max(0, Number(style.freeW || 0));
    const rawH = Math.max(0, Number(style.freeH || 0));
    const useMeasuredW = rawW <= 0 || rawW / measuredW > 1.6;
    const useMeasuredH = rawH <= 0 || rawH / measuredH > 1.6;
    const freeW = useMeasuredW ? measuredW : Math.max(rawW, measuredW);
    const freeH = useMeasuredH ? measuredH : Math.max(rawH, measuredH);
    const measuredX =
      rect && metrics
        ? Math.round(rect.x - metrics.mainLeft + metrics.scrollX + measuredOffsetX)
        : rawX + measuredOffsetX;
    const measuredY =
      rect && metrics
        ? Math.round(rect.y - metrics.mainTop + metrics.scrollY + measuredOffsetY)
        : rawY + measuredOffsetY;

    return {
      freeX: measuredX,
      freeY: measuredY,
      freeW,
      freeH
    };
  }

  function toOverlayRect(layer) {
    const style = getLayerStyle(layer.key);
    const metrics = state.previewMetrics;
    const rect = state.previewRects[layer.key];
    if (!metrics || !rect) return null;
    if (rect.isRenderHidden) return null;
    const scaleX = Number(metrics.scaleX || 1);
    const scaleY = Number(metrics.scaleY || 1);
    const offsetX = Number(metrics.offsetX || 0);
    const offsetY = Number(metrics.offsetY || 0);

    const layoutMode = style.layoutMode === "free" ? "free" : "flow";
    if (layoutMode === "free") {
      const resolved = resolveFreeGeometry(style, rect, metrics);
      const x = offsetX + (metrics.mainLeft - metrics.scrollX + resolved.freeX) * scaleX;
      const y = offsetY + (metrics.mainTop - metrics.scrollY + resolved.freeY) * scaleY;
      const w = resolved.freeW * scaleX;
      const h = resolved.freeH * scaleY;
      return { x, y, w, h, mode: "free" };
    }

    return {
      x: offsetX + rect.x * scaleX,
      y: offsetY + rect.y * scaleY,
      w: rect.w * scaleX,
      h: rect.h * scaleY,
      mode: "flow"
    };
  }

  function roundForOverlay(value, event) {
    if (event && event.altKey) return Math.round(value);
    return Math.round(value / OVERLAY_SNAP_PX) * OVERLAY_SNAP_PX;
  }

  function beginOverlayInteraction(event, layerKey, type, handleDir = "") {
    if (state.selectedPage !== "home") return;
    if (!layerKey) return;
    event.preventDefault();

    const layer = getLayers().find((item) => item.key === layerKey);
    if (!layer) return;
    if (layer.locked === "ON") {
      setStatus("Layer is locked. Unlock it to move or resize.", "warn");
      return;
    }

    const style = getLayerStyle(layerKey);
    const rect = state.previewRects[layerKey];
    const metrics = state.previewMetrics;
    const styleIsFree = style.layoutMode === "free";
    const resolvedFree = resolveFreeGeometry(style, rect, metrics);

    const inferredX = rect && metrics ? Math.round(rect.x - metrics.mainLeft + metrics.scrollX) : 0;
    const inferredY = rect && metrics ? Math.round(rect.y - metrics.mainTop + metrics.scrollY) : 0;
    const inferredW = rect
      ? Math.max(OVERLAY_MIN_WIDTH, Math.round(Number(rect.contentW || rect.scrollW || rect.w || OVERLAY_MIN_WIDTH)))
      : OVERLAY_MIN_WIDTH;
    const inferredH = rect
      ? Math.max(
          OVERLAY_MIN_HEIGHT,
          Math.round(Number(rect.contentH || rect.scrollH || rect.h || OVERLAY_MIN_HEIGHT))
        )
      : OVERLAY_MIN_HEIGHT;

    const startX = styleIsFree ? Number(resolvedFree.freeX || 0) : inferredX;
    const startY = styleIsFree ? Number(resolvedFree.freeY || 0) : inferredY;
    const startW = styleIsFree ? Math.max(OVERLAY_MIN_WIDTH, Number(resolvedFree.freeW || 0), inferredW) : inferredW;
    const startH = styleIsFree ? Math.max(OVERLAY_MIN_HEIGHT, Number(resolvedFree.freeH || 0), inferredH) : inferredH;

    pushHistorySnapshot();
    state.historyFuture = [];

    state.selectedLayerKey = layerKey;
    state.overlayInteraction = {
      key: layerKey,
      type,
      dir: handleDir,
      pointerId: typeof event.pointerId === "number" ? event.pointerId : null,
      hasMoved: false,
      pointerStartX: event.clientX,
      pointerStartY: event.clientY,
      startX,
      startY,
      startW,
      startH
    };

    if (event.target && typeof event.target.setPointerCapture === "function" && typeof event.pointerId === "number") {
      try {
        event.target.setPointerCapture(event.pointerId);
      } catch (_err) {
        // Ignore pointer capture failures in Safari/iframe edge-cases.
      }
    }

    renderAll();
    touchSession();
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function updateOverlayInteraction(event) {
    const interaction = state.overlayInteraction;
    if (!interaction) return;
    if (interaction.pointerId !== null && typeof event.pointerId === "number" && interaction.pointerId !== event.pointerId) {
      return;
    }
    event.preventDefault();

    const dx = event.clientX - interaction.pointerStartX;
    const dy = event.clientY - interaction.pointerStartY;
    const metrics = state.previewMetrics;
    const scaleX = metrics && metrics.scaleX ? metrics.scaleX : 1;
    const scaleY = metrics && metrics.scaleY ? metrics.scaleY : 1;
    const localDx = dx / scaleX;
    const localDy = dy / scaleY;

    let nextX = interaction.startX;
    let nextY = interaction.startY;
    let nextW = interaction.startW;
    let nextH = interaction.startH;

    if (interaction.type === "move") {
      if (event.shiftKey) {
        if (Math.abs(localDx) > Math.abs(localDy)) {
          nextX = roundForOverlay(interaction.startX + localDx, event);
          nextY = interaction.startY;
        } else {
          nextX = interaction.startX;
          nextY = roundForOverlay(interaction.startY + localDy, event);
        }
      } else {
        nextX = roundForOverlay(interaction.startX + localDx, event);
        nextY = roundForOverlay(interaction.startY + localDy, event);
      }
    } else {
      const dir = interaction.dir || "se";
      if (dir.includes("e")) nextW = roundForOverlay(interaction.startW + localDx, event);
      if (dir.includes("s")) nextH = roundForOverlay(interaction.startH + localDy, event);
      if (dir.includes("w")) {
        nextW = roundForOverlay(interaction.startW - localDx, event);
        nextX = roundForOverlay(interaction.startX + localDx, event);
      }
      if (dir.includes("n")) {
        nextH = roundForOverlay(interaction.startH - localDy, event);
        nextY = roundForOverlay(interaction.startY + localDy, event);
      }
    }

    nextW = clamp(nextW, OVERLAY_MIN_WIDTH, 6000);
    nextH = clamp(nextH, OVERLAY_MIN_HEIGHT, 6000);
    nextX = clamp(nextX, -5000, 12000);
    nextY = clamp(nextY, -5000, 24000);

    const didChange =
      nextX !== interaction.startX ||
      nextY !== interaction.startY ||
      nextW !== interaction.startW ||
      nextH !== interaction.startH;
    if (!didChange) return;
    interaction.hasMoved = true;

    state.draft = api.setSectionStyle(state.draft, interaction.key, {
      layoutMode: "free",
      freeX: nextX,
      freeY: nextY,
      freeW: nextW,
      freeH: nextH
    });

    queueOverlayRender({ recapture: false });
    setDraftPill();
  }

  function endOverlayInteraction() {
    const interaction = state.overlayInteraction;
    if (!interaction) return;
    state.overlayInteraction = null;
    if (interaction.hasMoved) {
      scheduleAutosave();
      renderAll();
      setStatus("Layer geometry updated.", "ok");
    }
    touchSession();
  }

  function renderPreviewOverlay(options = {}) {
    const overlay = refs.previewOverlay;
    if (!overlay) return;

    if (state.selectedPage !== "home") {
      overlay.innerHTML = "";
      hidePreviewDropIndicator();
      return;
    }

    if (options.recapture !== false) {
      capturePreviewLayout();
    }
    const metrics = state.previewMetrics;
    if (!metrics) {
      overlay.innerHTML = "";
      hidePreviewDropIndicator();
      return;
    }

    overlay.innerHTML = "";
    const layers = getLayers();

    layers.forEach((layer) => {
      const rect = toOverlayRect(layer);
      if (!rect) return;

      const item = document.createElement("div");
      const isSelected = layer.key === state.selectedLayerKey;
      item.className = `overlay-item${isSelected ? " is-selected" : ""}${
        layer.visible === "ON" ? "" : " is-hidden"
      }${rect.mode === "flow" ? " is-flow" : ""}`;
      item.setAttribute("data-layer-key", layer.key);
      item.style.left = `${rect.x}px`;
      item.style.top = `${rect.y}px`;
      item.style.width = `${rect.w}px`;
      item.style.height = `${rect.h}px`;
      item.style.cursor = isSelected ? "move" : "pointer";

      const label = document.createElement("div");
      label.className = "overlay-label";
      label.textContent = `${layer.label} · ${rect.mode}`;
      item.appendChild(label);

      if (isSelected) {
        ["nw", "ne", "sw", "se", "n", "s", "e", "w"].forEach((dir) => {
          const handle = document.createElement("div");
          handle.className = "overlay-handle";
          handle.setAttribute("data-dir", dir);
          handle.addEventListener("pointerdown", (event) => beginOverlayInteraction(event, layer.key, "resize", dir));
          item.appendChild(handle);
        });
      }

      item.addEventListener("pointerdown", (event) => {
        if (event.target.classList.contains("overlay-handle")) return;
        beginOverlayInteraction(event, layer.key, "move");
      });

      item.addEventListener("click", (event) => {
        event.stopPropagation();
        state.selectedLayerKey = layer.key;
        renderAll();
      });

      overlay.appendChild(item);
    });
  }

  function queueOverlayRender(options = {}) {
    if (state.overlayRaf) {
      window.cancelAnimationFrame(state.overlayRaf);
    }
    state.overlayRaf = window.requestAnimationFrame(() => {
      state.overlayRaf = null;
      renderPreviewOverlay(options);
    });
  }

  function hidePreviewDropIndicator() {
    if (!refs.previewDropIndicator) return;
    refs.previewDropIndicator.classList.remove("active");
    refs.previewDropIndicator.style.left = "";
    refs.previewDropIndicator.style.top = "";
    refs.previewDropIndicator.style.width = "";
    refs.previewDropIndicator.style.height = "";
  }

  function renderPreviewDropIndicator(candidate) {
    const indicator = refs.previewDropIndicator;
    if (!indicator || !candidate) {
      hidePreviewDropIndicator();
      return;
    }

    const rect = candidate.overlayRect;
    indicator.style.left = `${rect.x}px`;
    indicator.style.top = `${rect.y}px`;
    indicator.style.width = `${rect.w}px`;
    indicator.style.height = `${rect.h}px`;
    indicator.dataset.label = candidate.label || "Drop to insert";
    indicator.classList.add("active");
  }

  function clearLibraryDragState() {
    state.draggingLibraryItem = null;
    state.previewDropCandidate = null;
    document.body.classList.remove("library-drag-active");
    hidePreviewDropIndicator();
  }

  function getDraggingLibraryEntry() {
    if (!state.draggingLibraryItem) return null;
    return getLibraryEntryById(state.draggingLibraryItem.id, state.draggingLibraryItem.mode);
  }

  function computePreviewDropCandidate(clientX, clientY, entry, event = null) {
    if (!entry) return null;
    if (state.selectedPage !== "home") return null;

    capturePreviewLayout();
    const metrics = state.previewMetrics;
    if (!metrics) return null;

    const shellRect = refs.previewShell.getBoundingClientRect();
    const shellX = clientX - shellRect.left;
    const shellY = clientY - shellRect.top;
    const iframeWidth = metrics.viewportW * metrics.scaleX;
    const iframeHeight = metrics.viewportH * metrics.scaleY;
    if (shellX < metrics.offsetX || shellY < metrics.offsetY) return null;
    if (shellX > metrics.offsetX + iframeWidth || shellY > metrics.offsetY + iframeHeight) return null;

    const frameX = (shellX - metrics.offsetX) / metrics.scaleX;
    const frameY = (shellY - metrics.offsetY) / metrics.scaleY;
    const localX = frameX - (metrics.mainLeft - metrics.scrollX);
    const localY = frameY - (metrics.mainTop - metrics.scrollY);
    const size = defaultBlockSizeForEntry(entry);
    const snap = event && event.altKey ? 1 : OVERLAY_SNAP_PX;
    const snapRound = (value) => Math.round(value / snap) * snap;
    const freeX = clamp(snapRound(localX - size.width / 2), -5000, 12000);
    const freeY = clamp(snapRound(localY - size.height / 2), -5000, 24000);
    const overlayX = metrics.offsetX + (metrics.mainLeft - metrics.scrollX + freeX) * metrics.scaleX;
    const overlayY = metrics.offsetY + (metrics.mainTop - metrics.scrollY + freeY) * metrics.scaleY;
    return {
      insertAfterKey: state.selectedLayerKey,
      dropPosition: { x: freeX, y: freeY },
      overlayRect: {
        x: overlayX,
        y: overlayY,
        w: size.width * metrics.scaleX,
        h: size.height * metrics.scaleY
      },
      label: `Drop to insert ${entry.name}`
    };
  }

  function handleLibraryDragStart(event) {
    const item = event.target.closest("[data-library-id]");
    if (!item || !isDraggableLibraryMode(state.libraryMode)) {
      event.preventDefault();
      return;
    }
    const id = item.getAttribute("data-library-id");
    const entry = getLibraryEntryById(id, state.libraryMode);
    if (!entry) {
      event.preventDefault();
      return;
    }

    state.draggingLibraryItem = { id, mode: state.libraryMode };
    document.body.classList.add("library-drag-active");
    state.libraryPreviewId = id;
    renderLibraryPreview();
    refs.templateList.querySelectorAll("[data-library-id]").forEach((node) => {
      node.classList.toggle("is-selected", node.getAttribute("data-library-id") === id);
    });
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "copy";
      event.dataTransfer.setData("text/plain", id);
    }
    setStatus(`Dragging "${entry.name}" to preview...`, "ok");
  }

  function handlePreviewDragOver(event) {
    const entry = getDraggingLibraryEntry();
    if (!entry) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";

    const candidate = computePreviewDropCandidate(event.clientX, event.clientY, entry, event);
    state.previewDropCandidate = candidate;
    renderPreviewDropIndicator(candidate);
  }

  function handlePreviewDragLeave(event) {
    if (!state.draggingLibraryItem) return;
    const rect = refs.previewShell.getBoundingClientRect();
    const outside =
      event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
    if (outside) {
      state.previewDropCandidate = null;
      hidePreviewDropIndicator();
    }
  }

  function handlePreviewDrop(event) {
    const entry = getDraggingLibraryEntry();
    if (!entry) return;
    const dragMode = state.draggingLibraryItem?.mode || state.libraryMode;
    event.preventDefault();

    const candidate = state.previewDropCandidate || computePreviewDropCandidate(event.clientX, event.clientY, entry, event);
    clearLibraryDragState();
    if (!candidate) {
      setStatus("Drop target must be inside the Home preview frame.", "warn");
      return;
    }

    addLibraryEntry(entry, dragMode, {
      insertAfterKey: candidate.insertAfterKey,
      dropPosition: candidate.dropPosition
    });
    touchSession();
  }

  function handleGlobalControlChange(event) {
    const target = event.target;
    if (!target || !target.getAttribute("data-path")) return;

    const path = target.getAttribute("data-path");
    const kind = target.dataset.kind;
    let value = parseInputValue(target);

    if (kind === "onoff") {
      value = value ? "ON" : "OFF";
    }

    const next = clone(state.draft);
    setPathValue(next, path, value);
    applyDraft(next, "Global settings updated.");
    touchSession();
  }

  function handleLayerAction(action, layerKey, source = "layer") {
    if (!layerKey) return;

    if (action === "select") {
      state.selectedLayerKey = layerKey;
      renderAll();
      return;
    }

    if (action === "toggle-visible") {
      const current = getLayers().find((layer) => layer.key === layerKey);
      if (!current) return;
      const next = api.setSectionVisibility(state.draft, layerKey, current.visible !== "ON");
      applyDraft(next, "Layer visibility updated.");
      return;
    }

    if (action === "toggle-lock") {
      const current = getLayers().find((layer) => layer.key === layerKey);
      if (!current) return;
      const next = api.setSectionLock(state.draft, layerKey, current.locked !== "ON");
      applyDraft(next, "Layer lock state updated.");
      return;
    }

    if (action === "duplicate") {
      if (!String(layerKey).startsWith("custom:")) return;
      const beforeKeys = new Set(getLayers().map((layer) => layer.key));
      const next = api.duplicateCustomBlock(state.draft, layerKey);
      const afterLayers = api.getSectionCatalog(next);
      const newLayer = afterLayers.find((layer) => !beforeKeys.has(layer.key));
      state.selectedLayerKey = newLayer ? newLayer.key : layerKey;
      applyDraft(next, "Section duplicated.");
      return;
    }

    if (action === "delete") {
      if (!String(layerKey).startsWith("custom:")) return;
      const ok = window.confirm("Delete this custom section?");
      if (!ok) return;
      const next = api.deleteCustomBlock(state.draft, layerKey);
      state.selectedLayerKey = null;
      applyDraft(next, "Section deleted.");
      return;
    }

    if (action === "quick-width" && source === "canvas") {
      const slider = refs.canvasBoard.querySelector(`[data-layer-key="${layerKey}"] [data-action="quick-width"]`);
      if (!slider) return;
      const next = api.setSectionStyle(state.draft, layerKey, { maxWidth: Number(slider.value) });
      applyDraft(next, "Section width updated.", { trackHistory: false });
    }
  }

  function handleLayerFieldChange(event) {
    const target = event.target;
    const field = target.getAttribute("data-layer-field");
    if (!field) return;

    const layer = getSelectedLayer();
    if (!layer) return;

    const valueRaw = parseInputValue(target);
    let next = clone(state.draft);

    if (field === "visible") {
      next = api.setSectionVisibility(next, layer.key, valueRaw);
      applyDraft(next, "Layer visibility updated.");
      return;
    }

    if (field === "locked") {
      next = api.setSectionLock(next, layer.key, valueRaw);
      applyDraft(next, "Layer lock updated.");
      return;
    }

    if (field.startsWith("style.")) {
      const styleKey = field.replace("style.", "");
      const styleValue = target.dataset.kind === "number" ? Number(valueRaw) : String(valueRaw || "");
      next = api.setSectionStyle(next, layer.key, { [styleKey]: styleValue });
      applyDraft(next, "Layer style updated.", { trackHistory: false });
      return;
    }

    if (field === "works.title") {
      next.content.works.title = String(valueRaw || "");
      applyDraft(next, "Works title updated.", { trackHistory: false });
      return;
    }

    if (field === "works.lede") {
      next.content.works.lede = String(valueRaw || "");
      applyDraft(next, "Works subtitle updated.", { trackHistory: false });
      return;
    }

    if (field === "superSyd.comingSoonCopy") {
      next.content.superSyd.comingSoonCopy = String(valueRaw || "");
      applyDraft(next, "Coming soon text updated.", { trackHistory: false });
      return;
    }

    if (field === "superSyd.teaserEmbedUrl") {
      next.content.superSyd.teaserEmbedUrl = String(valueRaw || "");
      applyDraft(next, "Teaser URL updated.", { trackHistory: false });
      return;
    }

    if (field === "superSyd.previsEmbedUrl") {
      next.content.superSyd.previsEmbedUrl = String(valueRaw || "");
      applyDraft(next, "Previs URL updated.", { trackHistory: false });
      return;
    }

    if (field.startsWith("custom.")) {
      const block = getSelectedCustomBlock();
      if (!block) return;
      const blockId = block.id;

      if (field === "custom.label") {
        next = api.updateCustomBlock(next, blockId, { label: String(valueRaw || "") });
        applyDraft(next, "Section name updated.", { trackHistory: false });
        return;
      }

      if (field === "custom.type") {
        next = api.updateCustomBlock(next, blockId, { type: String(valueRaw || "text_banner") });
        applyDraft(next, "Section template changed.");
        return;
      }

      if (field.startsWith("custom.content.")) {
        const contentKey = field.replace("custom.content.", "");
        next = api.updateCustomBlock(next, blockId, { content: { [contentKey]: String(valueRaw || "") } });
        applyDraft(next, "Section content updated.", { trackHistory: false });
        return;
      }
    }
  }

  function handleProjectFieldChange(event) {
    const target = event.target;
    const field = target.getAttribute("data-project-field");
    if (!field) return;

    const item = target.closest("[data-project-index]");
    if (!item) return;

    const projectIndex = Number(item.getAttribute("data-project-index"));
    if (!Number.isInteger(projectIndex)) return;

    const next = clone(state.draft);
    if (!next.content.projects[projectIndex]) return;

    next.content.projects[projectIndex][field] = String(parseInputValue(target) || "");
    applyDraft(next, "Project updated.", { trackHistory: false });
  }

  function applyMediaToTarget(target, url) {
    if (!target) {
      setStatus("Select a media target first (click a Library button beside a field).", "warn");
      return;
    }

    let next = clone(state.draft);

    if (target === "superSyd:teaserEmbedUrl") {
      next.content.superSyd.teaserEmbedUrl = url;
      applyDraft(next, "Media assigned to teaser.");
      return;
    }

    if (target === "superSyd:previsEmbedUrl") {
      next.content.superSyd.previsEmbedUrl = url;
      applyDraft(next, "Media assigned to previs.");
      return;
    }

    if (target.startsWith("project:")) {
      const parts = target.split(":");
      const index = Number(parts[1]);
      const key = parts[2];
      if (!Number.isInteger(index) || !key || !next.content.projects[index]) return;
      next.content.projects[index][key] = url;
      applyDraft(next, "Media assigned to project.");
      return;
    }

    if (target.startsWith("custom:")) {
      const parts = target.split(":");
      const blockId = parts[1];
      const key = parts[2];
      if (!blockId || !key) return;
      next = api.updateCustomBlock(next, blockId, { content: { [key]: url } });
      applyDraft(next, "Media assigned to section.");
      return;
    }
  }

  function openMediaManager(target = null) {
    state.mediaTarget = target || state.mediaTarget;
    renderMediaList();
    openModal(refs.mediaModal);
    if (state.mediaTarget) {
      setStatus(`Media target selected: ${state.mediaTarget}`, "ok");
    }
  }

  function addMediaItemFromInputs() {
    const label = String(refs.mediaLabelInput.value || "").trim();
    const url = String(refs.mediaUrlInput.value || "").trim();
    const type = String(refs.mediaTypeInput.value || "image").trim();

    if (!label || !url) {
      setStatus("Media label and URL are required.", "error");
      return;
    }

    const id = `${type}-${Date.now().toString(36)}`;
    const next = api.upsertMediaItem(state.draft, { id, label, url, type });
    applyDraft(next, "Media item added.");

    refs.mediaLabelInput.value = "";
    refs.mediaUrlInput.value = "";
    refs.mediaTypeInput.value = "image";
  }

  function publishDraft() {
    const confirmed = window.confirm("Publish current draft settings to live site now?");
    if (!confirmed) return;

    saveDraftImmediately("Draft saved before publish.");
    const published = api.publishDraft(state.draft);
    state.published = clone(published);
    state.draft = clone(published);
    state.historyPast = [];
    state.historyFuture = [];
    renderAll();
    setStatus("Draft published to live settings.", "ok");
  }

  function discardDraft() {
    const confirmed = window.confirm("Discard draft and revert to currently published settings?");
    if (!confirmed) return;

    const restored = api.discardDraftSettings();
    state.published = clone(restored);
    state.draft = clone(restored);
    state.historyPast = [];
    state.historyFuture = [];
    state.pendingAutosave = false;
    state.autosaveAt = now();
    renderAll();
    refreshPreview();
    setStatus("Draft discarded. Back to published settings.", "ok");
  }

  function exportDraft() {
    const blob = new Blob([JSON.stringify(state.draft, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `studio-draft-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setStatus("Draft exported.", "ok");
  }

  async function importDraftFile(file) {
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const normalized = api.normalizeSettings(parsed);
      applyDraft(normalized, "Draft imported.");
      saveDraftImmediately("Imported draft saved.");
    } catch (_err) {
      setStatus("Import failed. Provide valid JSON.", "error");
    }
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (_err) {
      // Ignore clipboard failures.
    }
    return false;
  }

  async function copyGitCommands() {
    const commands = [
      'cd "/Users/julianschnitt/Desktop/Julianschnitt.com"',
      "git status",
      "git add .",
      'git commit -m "Studio publish update"',
      "git pull --rebase origin main",
      "git push origin main",
      "",
      "# Optional PR flow:",
      "git checkout -b codex/studio-update",
      "git push -u origin codex/studio-update"
    ].join("\n");

    const copied = await copyText(commands);
    if (copied) {
      setStatus("Git commands copied.", "ok");
    } else {
      window.prompt("Copy these Git commands:", commands);
      setStatus("Git commands ready.", "ok");
    }
  }

  function focusSelectedLayer() {
    if (!state.selectedLayerKey) return;

    const layerRow = refs.layerList.querySelector(`[data-layer-key="${state.selectedLayerKey}"]`);
    if (layerRow) layerRow.scrollIntoView({ behavior: "smooth", block: "nearest" });

    const canvasCard = refs.canvasBoard.querySelector(`[data-layer-key="${state.selectedLayerKey}"]`);
    if (canvasCard) canvasCard.scrollIntoView({ behavior: "smooth", block: "nearest" });

    try {
      const doc = refs.preview.contentDocument;
      const section = doc && doc.querySelector(`[data-studio-section="${state.selectedLayerKey}"]`);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      }
    } catch (_err) {
      // Ignore preview focus failures.
    }

    queueOverlayRender();
  }

  function handleSetupSubmit(event) {
    event.preventDefault();

    const passphrase = String(refs.setupPassphrase.value || "").trim();
    const confirm = String(refs.setupPassphraseConfirm.value || "").trim();

    if (!passphrase) {
      setStatus("Passphrase cannot be empty.", "error");
      return;
    }

    if (passphrase !== confirm) {
      setStatus("Passphrases do not match.", "error");
      return;
    }

    hashPassphrase(passphrase)
      .then((hash) => {
        setStoredAuthHash(hash);
        setSession(hash);
        refs.setupPassphrase.value = "";
        refs.setupPassphraseConfirm.value = "";
        startEditor();
        setStatus("Passphrase created. Studio unlocked.", "ok");
      })
      .catch(() => {
        setStatus("Unable to initialize passphrase.", "error");
      });
  }

  function handleLoginSubmit(event) {
    event.preventDefault();

    const passphrase = String(refs.loginPassphrase.value || "").trim();
    if (!passphrase) {
      setStatus("Enter passphrase.", "error");
      return;
    }

    const storedHash = getStoredAuthHash();
    if (!storedHash) {
      showPanel("setup");
      setStatus("Passphrase not configured. Create one first.", "warn");
      return;
    }

    hashPassphrase(passphrase)
      .then((hash) => {
        if (hash !== storedHash) {
          setStatus("Incorrect passphrase.", "error");
          return;
        }

        refs.loginPassphrase.value = "";
        setSession(storedHash);
        startEditor();
        setStatus("Studio unlocked.", "ok");
      })
      .catch(() => {
        setStatus("Unable to verify passphrase.", "error");
      });
  }

  function lockEditor(reason = "Studio locked.") {
    clearSession();
    showPanel("login");
    setStatus(reason, "warn");
  }

  function checkSessionHealth() {
    if (refs.editorPanel.classList.contains("hidden")) return;
    if (!hasActiveSession()) {
      lockEditor("Session expired. Please unlock Studio again.");
    }
  }

  function startEditor() {
    syncPublishedSettings();
    syncDraftSettings();
    ensureSelectedLayer();
    state.uiLayout = loadUILayout();

    showPanel("editor");
    applyUILayout();
    renderAll();
    refreshPreview();
    setView(state.view);

    if (!state.sessionMonitor) {
      state.sessionMonitor = window.setInterval(checkSessionHealth, 15000);
    }
  }

  function initializeAuthFlow() {
    const hasHash = Boolean(getStoredAuthHash());
    if (!hasHash) {
      showPanel("setup");
      setStatus("Create a Studio passphrase.", "warn");
      return;
    }

    if (hasActiveSession()) {
      startEditor();
      setStatus("Session resumed.", "ok");
      return;
    }

    showPanel("login");
    setStatus("Unlock Studio to continue.", "warn");
  }

  function bindEvents() {
    refs.setupForm.addEventListener("submit", handleSetupSubmit);
    refs.loginForm.addEventListener("submit", handleLoginSubmit);

    refs.preview.addEventListener("load", () => {
      queueOverlayRender();
      try {
        const win = refs.preview.contentWindow;
        const doc = refs.preview.contentDocument;
        if (win && !win.__studioOverlayBound) {
          win.addEventListener("scroll", () => {
            queueOverlayRender();
          });
          win.addEventListener("resize", () => {
            queueOverlayRender();
          });
          win.__studioOverlayBound = true;
        }
        if (doc && !win.__studioDropBound) {
          doc.addEventListener("dragover", handlePreviewDragOver);
          doc.addEventListener("drop", handlePreviewDrop);
          doc.addEventListener("dragleave", handlePreviewDragLeave);
          win.__studioDropBound = true;
        }
      } catch (_err) {
        // Ignore cross-document binding errors.
      }
    });

    window.addEventListener("pointermove", (event) => {
      if (!state.overlayInteraction) return;
      updateOverlayInteraction(event);
    });

    window.addEventListener("pointerup", () => {
      endOverlayInteraction();
    });

    window.addEventListener("pointercancel", () => {
      endOverlayInteraction();
    });

    window.addEventListener("resize", () => {
      queueOverlayRender();
    });

    refs.pageList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-page-key]");
      if (!button) return;
      const nextPage = button.getAttribute("data-page-key");
      if (!nextPage) return;
      state.selectedPage = nextPage;
      renderAll();
      touchSession();
    });

    refs.layerList.addEventListener("click", (event) => {
      const item = event.target.closest("[data-layer-key]");
      if (!item) return;
      const layerKey = item.getAttribute("data-layer-key");
      const actionButton = event.target.closest("[data-action]");
      const action = actionButton ? actionButton.getAttribute("data-action") : "select";
      handleLayerAction(action, layerKey, "layer");
      touchSession();
    });

    refs.layerList.addEventListener("dragover", (event) => {
      event.preventDefault();
      const dragging = refs.layerList.querySelector(".dragging");
      if (!dragging) return;
      const after = getDragAfterElement(refs.layerList, event.clientY);
      if (!after) refs.layerList.appendChild(dragging);
      else refs.layerList.insertBefore(dragging, after);
    });

    refs.canvasBoard.addEventListener("click", (event) => {
      const card = event.target.closest("[data-layer-key]");
      if (!card) return;
      const layerKey = card.getAttribute("data-layer-key");
      const actionButton = event.target.closest("[data-action]");
      const action = actionButton ? actionButton.getAttribute("data-action") : "select";
      handleLayerAction(action, layerKey, "canvas");
      touchSession();
    });

    refs.canvasBoard.addEventListener("input", (event) => {
      const slider = event.target.closest('[data-action="quick-width"]');
      if (!slider) return;
      const card = slider.closest("[data-layer-key]");
      if (!card) return;
      handleLayerAction("quick-width", card.getAttribute("data-layer-key"), "canvas");
      touchSession();
    });

    refs.globalControls.addEventListener("change", handleGlobalControlChange);

    refs.layerControls.addEventListener("change", (event) => {
      const actionButton = event.target.closest("[data-action]");
      if (actionButton && actionButton.getAttribute("data-action") === "pick-media") {
        const target = actionButton.getAttribute("data-target");
        openMediaManager(target);
        return;
      }
      handleLayerFieldChange(event);
      touchSession();
    });

    refs.layerControls.addEventListener("click", (event) => {
      const actionButton = event.target.closest("[data-action]");
      if (!actionButton) return;

      const action = actionButton.getAttribute("data-action");
      if (action === "pick-media") {
        openMediaManager(actionButton.getAttribute("data-target"));
        touchSession();
        return;
      }

      if (!state.selectedLayerKey) return;
      handleLayerAction(action, state.selectedLayerKey, "inspector");
      touchSession();
    });

    refs.projectsEditor.addEventListener("change", (event) => {
      const actionButton = event.target.closest("[data-action]");
      if (actionButton && actionButton.getAttribute("data-action") === "pick-project-media") {
        openMediaManager(actionButton.getAttribute("data-target"));
        return;
      }

      handleProjectFieldChange(event);
      touchSession();
    });

    refs.projectsEditor.addEventListener("click", (event) => {
      const button = event.target.closest('[data-action="pick-project-media"]');
      if (!button) return;
      openMediaManager(button.getAttribute("data-target"));
      touchSession();
    });

    refs.projectsEditor.addEventListener("dragover", (event) => {
      event.preventDefault();
      const dragging = refs.projectsEditor.querySelector(".dragging");
      if (!dragging) return;
      const after = getDragAfterElement(refs.projectsEditor, event.clientY);
      if (!after) refs.projectsEditor.appendChild(dragging);
      else refs.projectsEditor.insertBefore(dragging, after);
    });

    refs.templateList.addEventListener("click", (event) => {
      const button = event.target.closest('[data-action="library-add"]');
      if (button) {
        const id = button.getAttribute("data-library-id");
        addLibraryEntryById(id);
        closeModal(refs.templateModal);
        touchSession();
        return;
      }

      const item = event.target.closest("[data-library-id]");
      if (!item) return;
      setLibraryPreview(item.getAttribute("data-library-id"));
      touchSession();
    });

    refs.templateList.addEventListener("mouseover", (event) => {
      const item = event.target.closest("[data-library-id]");
      if (!item) return;
      setLibraryPreview(item.getAttribute("data-library-id"));
    });

    refs.templateList.addEventListener("focusin", (event) => {
      const item = event.target.closest("[data-library-id]");
      if (!item) return;
      setLibraryPreview(item.getAttribute("data-library-id"));
    });

    refs.templateList.addEventListener("dragstart", (event) => {
      handleLibraryDragStart(event);
    });

    refs.templateList.addEventListener("dragend", () => {
      clearLibraryDragState();
    });

    refs.previewShell.addEventListener("dragover", handlePreviewDragOver);
    refs.previewShell.addEventListener("drop", handlePreviewDrop);
    refs.previewShell.addEventListener("dragleave", handlePreviewDragLeave);

    refs.mediaList.addEventListener("click", async (event) => {
      const item = event.target.closest("[data-media-id]");
      if (!item) return;
      const id = item.getAttribute("data-media-id");
      const media = state.draft.mediaLibrary.find((entry) => entry.id === id);
      if (!media) return;

      const button = event.target.closest("[data-action]");
      if (!button) return;

      const action = button.getAttribute("data-action");
      if (action === "use-media") {
        applyMediaToTarget(state.mediaTarget, media.url);
      }

      if (action === "copy-media") {
        const copied = await copyText(media.url);
        if (!copied) window.prompt("Copy media URL:", media.url);
        setStatus("Media URL ready.", "ok");
      }

      if (action === "delete-media") {
        const confirmed = window.confirm(`Delete media item \"${media.label}\"?`);
        if (!confirmed) return;
        const next = api.deleteMediaItem(state.draft, media.id);
        applyDraft(next, "Media item deleted.");
      }

      touchSession();
    });

    byId("add-media-btn").addEventListener("click", () => {
      addMediaItemFromInputs();
      touchSession();
    });

    byId("open-template-modal").addEventListener("click", () => {
      setLibraryMode("sections");
      openModal(refs.templateModal);
      touchSession();
    });

    byId("open-widgets-modal").addEventListener("click", () => {
      setLibraryMode("widgets");
      openModal(refs.templateModal);
      touchSession();
    });

    byId("open-assets-modal").addEventListener("click", () => {
      setLibraryMode("assets");
      openModal(refs.templateModal);
      touchSession();
    });

    byId("close-template-modal").addEventListener("click", () => {
      clearLibraryDragState();
      closeModal(refs.templateModal);
    });

    byId("open-media-manager").addEventListener("click", () => {
      openMediaManager();
      touchSession();
    });

    byId("close-media-modal").addEventListener("click", () => closeModal(refs.mediaModal));

    refs.templateModal.addEventListener("click", (event) => {
      if (event.target === refs.templateModal) {
        clearLibraryDragState();
        closeModal(refs.templateModal);
      }
    });

    refs.mediaModal.addEventListener("click", (event) => {
      if (event.target === refs.mediaModal) closeModal(refs.mediaModal);
    });

    refs.librarySearchInput.addEventListener("input", () => {
      state.librarySearch = refs.librarySearchInput.value || "";
      renderTemplateList();
      touchSession();
    });

    refs.libraryCategoryFilter.addEventListener("change", () => {
      state.libraryCategory = refs.libraryCategoryFilter.value || "all";
      renderTemplateList();
      touchSession();
    });

    refs.libraryModeSections.addEventListener("click", () => {
      setLibraryMode("sections");
      touchSession();
    });

    refs.libraryModeWidgets.addEventListener("click", () => {
      setLibraryMode("widgets");
      touchSession();
    });

    refs.libraryModeAssets.addEventListener("click", () => {
      setLibraryMode("assets");
      touchSession();
    });

    byId("quick-add-hero").addEventListener("click", () => {
      addLibraryEntryById("hero-cinematic");
      touchSession();
    });

    byId("quick-add-logo-wall").addEventListener("click", () => {
      addLibraryEntryById("widget-logo-cloud");
      touchSession();
    });

    byId("quick-add-faq").addEventListener("click", () => {
      addLibraryEntryById("widget-faq");
      touchSession();
    });

    byId("quick-add-contact").addEventListener("click", () => {
      addLibraryEntryById("widget-contact");
      touchSession();
    });

    byId("quick-import-pro-pack").addEventListener("click", () => {
      importProAssetPack();
      touchSession();
    });

    byId("seed-demo-layout").addEventListener("click", () => {
      seedDemoLayout();
      touchSession();
    });

    byId("kit-cinematic").addEventListener("click", () => {
      applyDesignKit("cinematic");
      touchSession();
    });

    byId("kit-editorial").addEventListener("click", () => {
      applyDesignKit("editorial");
      touchSession();
    });

    byId("kit-electric").addEventListener("click", () => {
      applyDesignKit("electric");
      touchSession();
    });

    byId("refresh-preview").addEventListener("click", () => {
      refreshPreview();
      setStatus("Preview refreshed.", "ok");
      touchSession();
    });

    byId("open-home").addEventListener("click", () => {
      window.open("index.html", "_blank", "noopener");
      touchSession();
    });

    byId("open-preview-url").addEventListener("click", () => {
      openDraftPreviewInNewTab();
      touchSession();
    });

    byId("focus-selected-layer").addEventListener("click", () => {
      focusSelectedLayer();
      touchSession();
    });

    refs.toggleLeftPanel.addEventListener("click", () => {
      setUILayout({
        ...state.uiLayout,
        leftPanel: !state.uiLayout.leftPanel
      });
      touchSession();
    });

    refs.toggleCanvasSidebar.addEventListener("click", () => {
      setUILayout({
        ...state.uiLayout,
        canvasSidebar: !state.uiLayout.canvasSidebar
      });
      touchSession();
    });

    refs.toggleRightPanel.addEventListener("click", () => {
      setUILayout({
        ...state.uiLayout,
        rightPanel: !state.uiLayout.rightPanel
      });
      touchSession();
    });

    refs.toggleFocusMode.addEventListener("click", () => {
      if (isFocusMode()) {
        const restore = state.uiLayoutBeforeFocus || {
          leftPanel: true,
          canvasSidebar: true,
          rightPanel: true
        };
        setUILayout(restore);
      } else {
        state.uiLayoutBeforeFocus = { ...state.uiLayout };
        setUILayout({
          leftPanel: false,
          canvasSidebar: false,
          rightPanel: false
        });
      }
      touchSession();
    });

    document.querySelectorAll(".view-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const view = button.getAttribute("data-view") || "desktop";
        setView(view);
        touchSession();
      });
    });

    byId("undo-btn").addEventListener("click", () => {
      undo();
      touchSession();
    });

    byId("redo-btn").addEventListener("click", () => {
      redo();
      touchSession();
    });

    byId("save-draft").addEventListener("click", () => {
      saveDraftImmediately("Draft saved.");
      touchSession();
    });

    byId("publish-draft").addEventListener("click", () => {
      publishDraft();
      touchSession();
    });

    byId("discard-draft").addEventListener("click", () => {
      discardDraft();
      touchSession();
    });

    byId("export-draft").addEventListener("click", () => {
      exportDraft();
      touchSession();
    });

    byId("import-draft").addEventListener("click", () => {
      refs.importInput.click();
      touchSession();
    });

    refs.importInput.addEventListener("change", (event) => {
      const file = event.target.files && event.target.files[0];
      importDraftFile(file);
      event.target.value = "";
      touchSession();
    });

    byId("copy-pr-commands").addEventListener("click", () => {
      copyGitCommands();
      touchSession();
    });

    byId("lock-editor").addEventListener("click", () => {
      lockEditor("Studio locked.");
    });

    byId("clear-passphrase").addEventListener("click", () => {
      const confirmed = window.confirm("Clear stored passphrase for this browser?");
      if (!confirmed) return;
      clearStoredAuthHash();
      clearSession();
      showPanel("setup");
      setStatus("Passphrase cleared. Create a new one.", "warn");
    });

    document.addEventListener("keydown", (event) => {
      const meta = event.metaKey || event.ctrlKey;
      if (!meta) return;

      const key = event.key.toLowerCase();

      if (key === "s") {
        event.preventDefault();
        saveDraftImmediately("Draft saved.");
        touchSession();
      }

      if (key === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
        touchSession();
      }

      if ((key === "z" && event.shiftKey) || key === "y") {
        event.preventDefault();
        redo();
        touchSession();
      }

      if (key === "b") {
        event.preventDefault();
        refs.toggleFocusMode.click();
      }
    });

    document.addEventListener("pointerdown", () => {
      touchSession();
    });
  }

  function initialize() {
    bindEvents();
    initializeAuthFlow();
    setStatus("Studio initialized.", "ok");
  }

  initialize();
})();
