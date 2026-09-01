/* Invitation components and interactions. No build step required.
 * Edit wording and family details in content.js; appearance in styles.css.
 * jsx/jsxs create React elements directly, so this file runs in the browser. */
(() => {
  "use strict";

  const {
    React,
    jsx,
    jsxs,
    Fragment,
    createRoot,
    ArrowDown,
    ArrowUpRight,
    Flower2,
    Heart,
    ImageIcon,
    MapPin,
    Phone,
  } = window.InvitationRuntime;
  const settings = window.InvitationContent;
  const { copy, mapUrl, guests, contacts, eventTimes } =
    window.InvitationContent;
  // Scratch coating, pointer gestures and accessible reveal button.
  function ScratchHeart({ ur, onReveal }) {
    const canvasRef = React.useRef(null);
    const isDrawing = React.useRef(false);
    const lastPoint = React.useRef(null);
    const scratchedCells = React.useRef(new Set());
    const [revealed, setRevealed] = React.useState(false);
    const text = ur ? copy.ur : copy.en;
    const didReveal = React.useRef(false);
    function reveal() {
      if (!didReveal.current) {
        didReveal.current = true;
        setRevealed(true);
        onReveal();
      }
    }
    React.useEffect(() => {
      if (didReveal.current) return;
      scratchedCells.current.clear();
      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.globalCompositeOperation = "source-over";
      const gradient = context.createLinearGradient(0, 0, 300, 250);
      gradient.addColorStop(0, "#b78a50");
      gradient.addColorStop(0.4, "#edcf94");
      gradient.addColorStop(0.7, "#bf955d");
      gradient.addColorStop(1, "#e4c38d");
      context.fillStyle = gradient;
      context.fillRect(0, 0, 300, 260);
      for (let speckleIndex = 0; speckleIndex < 1600; speckleIndex++) {
        context.fillStyle = speckleIndex % 2 ? "#fff3d225" : "#60361216";
        context.fillRect(
          (speckleIndex * 47) % 300,
          (speckleIndex * 83) % 260,
          1.5,
          1.5,
        );
      }
      context.fillStyle = "#633e2b";
      context.font = "italic 25px Georgia";
      context.textAlign = "center";
      context.fillText((ur ? copy.ur : copy.en).scratchSurprise, 150, 120);
      context.font = "22px Georgia";
      context.fillText("♡", 150, 155);
    }, [ur]);
    function scratch(event) {
      if (!isDrawing.current || revealed) return;
      const canvas = event.currentTarget;
      const bounds = canvas.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) * 300) / bounds.width;
      const y = ((event.clientY - bounds.top) * 260) / bounds.height;
      const context = canvas.getContext("2d");
      if (context) {
        context.globalCompositeOperation = "destination-out";
        context.lineWidth = 36;
        context.lineCap = "round";
        context.beginPath();
        context.moveTo(lastPoint.current?.x ?? x, lastPoint.current?.y ?? y);
        context.lineTo(x, y);
        context.stroke();
        context.beginPath();
        context.arc(x, y, 18, 0, Math.PI * 2);
        context.fill();
        lastPoint.current = {
          x,
          y,
        };
        if (x > 30 && x < 270 && y > 30 && y < 210) {
          scratchedCells.current.add(
            `${Math.floor(x / 18)},${Math.floor(y / 18)}`,
          );
        }
        if (scratchedCells.current.size > 35) {
          reveal();
        }
      }
    }
    return jsxs(Fragment, {
      children: [
        jsxs("div", {
          className: "scratch-heart " + (revealed ? "revealed" : ""),
          children: [
            jsxs("div", {
              className: "date-under",
              "aria-hidden": !revealed,
              children: [
                jsx("span", {
                  children: text.day,
                }),
                jsx("strong", {
                  children: (ur ? copy.ur : copy.en).dateNumber,
                }),
                jsx("span", {
                  children: text.month,
                }),
              ],
            }),
            jsx("canvas", {
              ref: canvasRef,
              width: 300,
              height: 260,
              "aria-label": text.scratch,
              onPointerDown: (event) => {
                isDrawing.current = true;
                lastPoint.current = null;
                event.currentTarget.setPointerCapture(event.pointerId);
                scratch(event);
              },
              onPointerMove: scratch,
              onPointerUp: () => {
                isDrawing.current = false;
                lastPoint.current = null;
              },
              onPointerCancel: () => {
                isDrawing.current = false;
                lastPoint.current = null;
              },
            }),
          ],
        }),
        jsx("p", {
          className: "sr-only",
          "aria-live": "polite",
          children: revealed ? (ur ? copy.ur : copy.en).fullDate : "",
        }),
        jsxs("button", {
          className: "text-button",
          onClick: reveal,
          disabled: revealed,
          children: [
            revealed ? text.revealed : text.reveal,
            " ",
            !revealed &&
              jsx(ArrowUpRight, {
                size: 14,
              }),
          ],
        }),
      ],
    });
  }
  // 48 petals; motion and color values match the original invitation.
  function PetalConfetti({ origin }) {
    return jsx("div", {
      className: "petal-confetti",
      "aria-hidden": "true",
      style: {
        "--burst-x": `${origin.x}px`,
        "--burst-y": `${origin.y}px`,
      },
      children: Array.from(
        {
          length: 48,
        },
        (unused, particleIndex) =>
          jsx(
            "i",
            {
              style: {
                "--dx": `${Math.sin(particleIndex * 2.4) * (100 + (particleIndex % 9) * 24)}px`,
                "--lift": `${-90 - (particleIndex % 7) * 25}px`,
                "--drift": `${Math.sin(particleIndex * 2.4) * (160 + (particleIndex % 9) * 28)}px`,
                "--twist": `${particleIndex % 2 ? 540 : -480}deg`,
                "--delay": `${(particleIndex % 8) * 35}ms`,
                "--duration": `${2.5 + (particleIndex % 5) * 0.2}s`,
                "--petal-color": ["#8b2945", "#b7687e", "#d9a8ac", "#c6a063"][
                  particleIndex % 4
                ],
              },
            },
            particleIndex,
          ),
      ),
    });
  }
  // Scroll progress is drawn once per animation frame; flowers appear on entry.
  function FloralTimeline({ ur }) {
    const timelineRef = React.useRef(null);
    const text = ur ? copy.ur : copy.en;
    React.useEffect(() => {
      const timeline = timelineRef.current;
      if (!timeline) return;
      let animationFrame = 0;
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const updateProgress = () => {
        const bounds = timeline.getBoundingClientRect();
        timeline.style.setProperty(
          "--progress",
          String(
            reduceMotion
              ? 1
              : Math.max(
                  0,
                  Math.min(
                    1,
                    (window.innerHeight * 0.72 - bounds.top) / bounds.height,
                  ),
                ),
          ),
        );
        animationFrame = 0;
      };
      const requestProgressUpdate = () => {
        if (!animationFrame) {
          animationFrame = requestAnimationFrame(updateProgress);
        }
      };
      updateProgress();
      window.addEventListener("scroll", requestProgressUpdate, {
        passive: true,
      });
      window.addEventListener("resize", requestProgressUpdate);
      const observer = new IntersectionObserver(
        (entries) =>
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("in-view");
            }
          }),
        {
          threshold: 0.15,
        },
      );
      timeline
        .querySelectorAll(".floral-event")
        .forEach((eventElement) => observer.observe(eventElement));
      return () => {
        window.removeEventListener("scroll", requestProgressUpdate);
        window.removeEventListener("resize", requestProgressUpdate);
        cancelAnimationFrame(animationFrame);
        observer.disconnect();
      };
    }, []);
    return jsxs("section", {
      className: "schedule",
      children: [
        jsx("p", {
          className: "eyebrow",
          children: text.schedule,
        }),
        jsx("h2", {
          children: text.evening,
        }),
        jsxs("div", {
          className: "floral-timeline",
          ref: timelineRef,
          children: [
            jsx("span", {
              className: "timeline-track",
              "aria-hidden": "true",
            }),
            text.times.map((eventLabel, eventIndex) =>
              jsxs(
                "article",
                {
                  className: "floral-event",
                  children: [
                    jsx("span", {
                      className: "timeline-flower",
                      "aria-hidden": "true",
                      children: jsx(Flower2, {
                        size: 32,
                        strokeWidth: 1,
                      }),
                    }),
                    jsxs("div", {
                      className: "event-card",
                      children: [
                        jsxs("p", {
                          className: "event-time",
                          dir: "ltr",
                          children: [
                            eventTimes[eventIndex],
                            " ",
                            jsx("small", {
                              children: "PM",
                            }),
                          ],
                        }),
                        jsx("h3", {
                          children: eventLabel,
                        }),
                        jsx("p", {
                          className: "event-note",
                          children: (ur ? copy.ur : copy.en).eventNotes[
                            eventIndex
                          ],
                        }),
                      ],
                    }),
                  ],
                },
                eventIndex,
              ),
            ),
          ],
        }),
      ],
    });
  }
  // Six placeholder portraits in three rows. Two surname translations per couple.
  function Guests({ ur }) {
    return jsxs("section", {
      className: "guests",
      children: [
        jsx("p", {
          className: "eyebrow",
          children: (ur ? copy.ur : copy.en).guestsEyebrow,
        }),
        jsx("h2", {
          children: (ur ? copy.ur : copy.en).guestsTitle,
        }),
        jsx("div", {
          className: "portrait-rows",
          children: [0, 1, 2].map((rowIndex) =>
            jsxs(
              "div",
              {
                className: "portrait-row",
                children: [
                  jsx("svg", {
                    className: "photo-rope",
                    viewBox: "0 0 400 55",
                    preserveAspectRatio: "none",
                    "aria-hidden": "true",
                    children: jsx("path", {
                      d: "M -10 5 Q 200 76 410 5",
                    }),
                  }),
                  guests
                    .slice(rowIndex * 2, rowIndex * 2 + 2)
                    .map((guest, columnIndex) =>
                      jsxs(
                        "figure",
                        {
                          className: "hanging-portrait",
                          style: {
                            "--angle": `${columnIndex % 2 ? 3 : -3}deg`,
                            "--sway-delay": `${-(rowIndex * 2 + columnIndex)}s`,
                          },
                          children: [
                            jsx("span", {
                              className: "photo-clip",
                              "aria-hidden": "true",
                            }),
                            jsxs("div", {
                              className: "photo-placeholder",
                              children: [
                                jsx(ImageIcon, {
                                  size: 30,
                                  strokeWidth: 0.8,
                                  "aria-hidden": "true",
                                }),
                                jsx("span", {
                                  children: (ur ? copy.ur : copy.en)
                                    .photoPlaceholder,
                                }),
                              ],
                            }),
                            jsx("figcaption", {
                              children:
                                (ur ? copy.ur : copy.en).couplePrefix +
                                guest[ur ? 1 : 0],
                            }),
                          ],
                        },
                        guest[0],
                      ),
                    ),
                ],
              },
              rowIndex,
            ),
          ),
        }),
      ],
    });
  }
  // One persistent invitation beneath two envelope flaps. Opening lasts 2300ms.
  function Invitation() {
    const [ur, setUr] = React.useState(false);
    const [opened, setOpened] = React.useState(false);
    const [opening, setOpening] = React.useState(false);
    const cardRef = React.useRef(null);
    const openingTimer = React.useRef(null);
    const text = ur ? copy.ur : copy.en;
    const [burst, setBurst] = React.useState(null);
    const burstTimer = React.useRef(null);
    function celebrate() {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const heartBounds = document
        .querySelector(".scratch-heart")
        ?.getBoundingClientRect();
      setBurst({
        x: heartBounds
          ? heartBounds.left + heartBounds.width / 2
          : window.innerWidth / 2,
        y: heartBounds
          ? heartBounds.top + heartBounds.height / 2
          : window.innerHeight / 2,
      });
      if (burstTimer.current) {
        clearTimeout(burstTimer.current);
      }
      burstTimer.current = setTimeout(() => setBurst(null), 4e3);
    }
    React.useEffect(
      () => () => {
        if (burstTimer.current) {
          clearTimeout(burstTimer.current);
        }
      },
      [],
    );
    React.useEffect(() => {
      document.documentElement.lang = ur ? "ur" : "en";
      document.documentElement.dir = ur ? "rtl" : "ltr";
    }, [ur]);
    React.useEffect(
      () => () => {
        if (openingTimer.current) {
          clearTimeout(openingTimer.current);
        }
      },
      [],
    );
    function openInvitation() {
      if (!opening) {
        setOpening(true);
        openingTimer.current = setTimeout(
          () => {
            setOpened(true);
            setOpening(false);
            window.scrollTo({
              top: 0,
              behavior: "instant",
            });
            requestAnimationFrame(() =>
              cardRef.current?.focus({
                preventScroll: true,
              }),
            );
          },
          window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? 0
            : 2300,
        );
      }
    }
    return jsxs("div", {
      className: `wedding ${ur ? "urdu " : ""}${opened ? "unsealed" : opening ? "revealing" : "sealed"}`,
      children: [
        jsx("header", {
          className: "topbar",
          children: jsxs("div", {
            className: "language",
            "aria-label": "Invitation language",
            children: [
              jsx("button", {
                lang: "en",
                onClick: () => setUr(false),
                "aria-pressed": !ur,
                className: ur ? "" : "active",
                children: "English",
              }),
              jsx("button", {
                lang: "ur",
                onClick: () => setUr(true),
                "aria-pressed": ur,
                className: ur ? "active" : "",
                children: "اردو",
              }),
            ],
          }),
        }),
        burst &&
          jsx(PetalConfetti, {
            origin: burst,
          }),
        !opened &&
          jsx("div", {
            className: "cover side-cover " + (opening ? "opening" : ""),
            "aria-label": text.invitation,
            children: jsxs("div", {
              className: "envelope",
              children: [
                jsx("div", {
                  className: "envelope-left",
                }),
                jsx("div", {
                  className: "envelope-right",
                }),
                jsx("button", {
                  className: "seal",
                  onClick: openInvitation,
                  disabled: opening,
                  "aria-label": text.open,
                  children: jsxs("span", {
                    "aria-hidden": "true",
                    children: [
                      settings.sealInitials[0] + " ",
                      jsx("i", {
                        children: "&",
                      }),
                      " " + settings.sealInitials[1],
                    ],
                  }),
                }),
              ],
            }),
          }),
        jsxs("main", {
          className: "invitation",
          ref: cardRef,
          tabIndex: -1,
          inert: !opened,
          "aria-hidden": !opened,
          children: [
            jsxs("section", {
              className: "hero paper",
              children: [
                jsx("div", {
                  className: "arch-frame",
                }),
                jsxs("div", {
                  className: "hero-content",
                  children: [
                    jsx("p", {
                      className: "bismillah",
                      lang: "ar",
                      dir: "rtl",
                      children: settings.bismillah,
                    }),
                    jsx("p", {
                      className: "eyebrow",
                      children: text.together,
                    }),
                    jsx("p", {
                      className: "invite-copy",
                      children: text.invite,
                    }),
                    jsxs("h1", {
                      className: "names",
                      children: [
                        text.ali,
                        jsx("em", {
                          children: text.and,
                        }),
                        text.hamna,
                      ],
                    }),
                    jsx("div", {
                      className: "ornament",
                      children: "— ♡ —",
                    }),
                    jsx("p", {
                      className: "barat-label",
                      children: text.invitation,
                    }),
                    jsxs("a", {
                      href: "#date",
                      className: "scroll-cue",
                      children: [
                        text.scroll,
                        jsx(ArrowDown, {
                          size: 18,
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            jsxs("section", {
              className: "date-section",
              id: "date",
              children: [
                jsx("p", {
                  className: "eyebrow",
                  children: text.save,
                }),
                jsx("h2", {
                  children: text.dateTitle,
                }),
                jsx("p", {
                  className: "support",
                  children: text.scratch,
                }),
                jsx(ScratchHeart, {
                  ur,
                  onReveal: celebrate,
                }),
              ],
            }),
            jsx(FloralTimeline, {
              ur,
            }),
            jsxs("section", {
              className: "venue paper",
              children: [
                jsx(MapPin, {
                  size: 25,
                  strokeWidth: 1,
                }),
                jsx("p", {
                  className: "eyebrow",
                  children: text.venue,
                }),
                jsx("h2", {
                  children: text.venueName,
                }),
                jsx("address", {
                  className: "venue-address",
                  children: ur
                    ? jsxs(Fragment, {
                        children: [
                          jsx("bdi", {
                            children: settings.plusCode,
                          }),
                          (ur ? copy.ur : copy.en).addressLine1,
                          jsx("br", {}),
                          (ur ? copy.ur : copy.en).addressLine2,
                        ],
                      })
                    : jsxs(Fragment, {
                        children: [
                          (ur ? copy.ur : copy.en).addressLine1,
                          jsx("br", {}),
                          (ur ? copy.ur : copy.en).addressLine2,
                        ],
                      }),
                }),
                jsxs("a", {
                  className: "primary-button",
                  href: mapUrl,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  children: [
                    text.map,
                    jsx(ArrowUpRight, {
                      size: 17,
                    }),
                  ],
                }),
              ],
            }),
            jsx(Guests, {
              ur,
            }),
            jsxs("footer", {
              className: "end",
              children: [
                jsx(Heart, {
                  size: 22,
                  strokeWidth: 1,
                }),
                jsx("h2", {
                  children: text.rsvp,
                }),
                jsx("p", {
                  className: "contact-heading",
                  children: (ur ? copy.ur : copy.en).contactHeading,
                }),
                jsx("div", {
                  className: "contact-list",
                  children: [1, 2].map((contactNumber) =>
                    jsxs(
                      "div",
                      {
                        className: "contact-placeholder",
                        children: [
                          jsx(Phone, {
                            size: 16,
                            "aria-hidden": "true",
                          }),
                          jsxs("div", {
                            children: [
                              jsx("span", {
                                children: (ur ? copy.ur : copy.en)
                                  .contactLabels[contactNumber - 1],
                              }),
                              jsx("p", {
                                dir: "ltr",
                                children: contacts[contactNumber - 1],
                              }),
                            ],
                          }),
                        ],
                      },
                      contactNumber,
                    ),
                  ),
                }),
                jsx("div", {
                  className: "fine-line",
                }),
                jsx("p", {
                  className: "closing-names",
                  children: (ur ? copy.ur : copy.en).closingNames,
                }),
                jsx("p", {
                  className: "footer-note",
                  children: text.footer,
                }),
                jsx("button", {
                  className: "text-button",
                  onClick: () => {
                    setOpened(false);
                    setBurst(null);
                    window.scrollTo({
                      top: 0,
                      behavior: "instant",
                    });
                  },
                  children: text.close,
                }),
              ],
            }),
          ],
        }),
      ],
    });
  }
  createRoot(document.getElementById("root")).render(jsx(Invitation, {}));
})();
