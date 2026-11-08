"use client";

import { useEffect, useRef, useState } from "react";
import { createCameraController } from "./camera.mjs";

type Preset = "both" | "left" | "right";
type FieldEffect = "combined" | "central" | "peripheral" | "none";

const presets: Record<Preset, {
  label: string;
  detail: string;
  blur: number;
  maxContrast: number;
  maxColor: number;
  brightnessLoss: number;
  fieldWeight: number;
  hazeWeight: number;
}> = {
  both: {
    label: "Both eyes",
    detail: "A blended example",
    blur: 13,
    maxContrast: 58,
    maxColor: 55,
    brightnessLoss: 14,
    fieldWeight: 0.74,
    hazeWeight: 1.15,
  },
  left: {
    label: "Left eye",
    detail: "A lower-detail example",
    blur: 13,
    maxContrast: 58,
    maxColor: 55,
    brightnessLoss: 14,
    fieldWeight: 0.74,
    hazeWeight: 1.15,
  },
  right: {
    label: "Right eye",
    detail: "A very low-detail example",
    blur: 48,
    maxContrast: 34,
    maxColor: 28,
    brightnessLoss: 28,
    fieldWeight: 0.94,
    hazeWeight: 0.55,
  },
};

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraRef = useRef<ReturnType<typeof createCameraController> | null>(null);
  if (cameraRef.current == null) cameraRef.current = createCameraController();
  const [started, setStarted] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment",
  );
  const [preset, setPreset] = useState<Preset>("left");
  const [strength, setStrength] = useState(100);
  const [contrast, setContrast] = useState(58);
  const [color, setColor] = useState(55);
  const [glare, setGlare] = useState(32);
  const [haze, setHaze] = useState(34);
  const [fieldEffect, setFieldEffect] = useState<FieldEffect>("combined");
  const [panelOpen, setPanelOpen] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [holdingNormal, setHoldingNormal] = useState(false);

  const startCamera = async (nextFacing = facingMode) => {
    setCameraError("");
    const camera = cameraRef.current!;

    if (!navigator.mediaDevices?.getUserMedia) {
      camera.stop();
      setStarted(false);
      setCameraError(
        "This browser cannot open the camera. Try Safari on an iPhone over a secure connection.",
      );
      return;
    }

    const result = await camera.start(
      () => navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: nextFacing },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      }),
      () => videoRef.current,
    );
    if (result.status === "started") {
      setStarted(true);
    } else if (result.status === "failed") {
      setStarted(false);
      const name = result.error instanceof DOMException ? result.error.name : "";
      setCameraError(
        name === "NotAllowedError"
          ? "Camera access was blocked. Allow Camera for this site in Safari settings, then try again."
          : "The camera could not start. Close other camera apps and try again.",
      );
    }
  };

  const switchCamera = async () => {
    const nextFacing = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextFacing);
    await startCamera(nextFacing);
  };

  const switchEye = () => {
    setPreset((current) => (current === "left" ? "right" : "left"));
  };

  useEffect(() => {
    const camera = cameraRef.current!;
    return () => camera.stop();
  }, []);

  const activeStrength = holdingNormal ? 0 : strength / 100;
  const activePreset = presets[preset];
  const blur = activePreset.blur * activeStrength;
  const targetContrast = Math.min(contrast, activePreset.maxContrast);
  const targetColor = Math.min(color, activePreset.maxColor);
  const fieldOpacity = activeStrength * activePreset.fieldWeight;
  const hazeOpacity = Math.min(
    1,
    (haze / 100) * activeStrength * activePreset.hazeWeight,
  );
  const videoFilter = `blur(${blur}px) contrast(${
    100 - (100 - targetContrast) * activeStrength
  }%) saturate(${100 - (100 - targetColor) * activeStrength}%) brightness(${
    100 - activePreset.brightnessLoss * activeStrength
  }%)`;

  return (
    <main className={`app ${started ? "camera-is-live" : ""}`}>
      <section className="camera-stage" aria-label="Live camera simulation">
        <video
          ref={videoRef}
          className="camera-feed"
          autoPlay
          muted
          playsInline
          style={{ filter: videoFilter }}
        />

        <div
          className={`field-overlay field-${fieldEffect}`}
          style={{ opacity: fieldOpacity }}
          aria-hidden="true"
        />
        <div
          className="glare-overlay"
          style={{ opacity: (glare / 100) * activeStrength }}
          aria-hidden="true"
        />
        <div
          className="haze-overlay"
          style={{ opacity: hazeOpacity }}
          aria-hidden="true"
        />
        <div className="camera-grain" aria-hidden="true" />

        {!started && (
          <div className="welcome">
            <div className="eyemark" aria-hidden="true">
              <span />
            </div>
            <p className="kicker">A low-vision conversation tool</p>
            <h1>Through<br />her eyes</h1>
            <p className="intro">
              Use the camera to explore a rough approximation of central
              vision loss, a narrower field of view, haze and lower contrast.
            </p>

            <div className="effect-chip">
              <span aria-hidden="true">●</span>
              Central loss, narrow field, haze, low contrast
            </div>

            <button className="start-button" onClick={() => startCamera()}>
              <span className="camera-dot" aria-hidden="true" />
              Start camera experience
            </button>
            <p className="privacy-note">Video stays on this device.</p>

            {cameraError && <p className="error-message">{cameraError}</p>}

            <button className="text-button" onClick={() => setShowGuide(true)}>
              Read the safety guide first <span aria-hidden="true">→</span>
            </button>
          </div>
        )}

        {started && (
          <>
            <header className="live-header">
              <div>
                <p className="live-kicker"><span /> Approximate live view</p>
                <h2>{preset === "both" ? "Combined view" : presets[preset].label}</h2>
              </div>
              <button
                className="round-button"
                aria-label="Switch between front and rear camera"
                onClick={switchCamera}
              >
                ↻
              </button>
            </header>

            <div className="live-controls">
              <button className="eye-switch-button" onClick={switchEye}>
                <span className="eye-badge" aria-hidden="true">
                  {preset === "right" ? "R" : "L"}
                </span>
                <span>
                  <small>Showing {preset === "right" ? "right" : "left"} eye</small>
                  <strong>Switch to {preset === "left" ? "right" : "left"} eye</strong>
                </span>
                <span className="switch-arrows" aria-hidden="true">⇄</span>
              </button>

              <button
                className="compare-button"
                onPointerDown={() => setHoldingNormal(true)}
                onPointerUp={() => setHoldingNormal(false)}
                onPointerCancel={() => setHoldingNormal(false)}
                onPointerLeave={() => setHoldingNormal(false)}
              >
                <span className={holdingNormal ? "compare-icon active" : "compare-icon"} />
                {holdingNormal ? "Normal view" : "Hold to compare"}
              </button>

              <div className="strength-card">
                <div className="strength-labels">
                  <span>Normal</span>
                  <strong>Simulation {strength}%</strong>
                </div>
                <input
                  aria-label="Simulation strength"
                  type="range"
                  min="0"
                  max="100"
                  value={strength}
                  onChange={(event) => setStrength(Number(event.target.value))}
                  style={{ "--range-progress": `${strength}%` } as React.CSSProperties}
                />
              </div>

              <button className="settings-button" onClick={() => setPanelOpen(true)}>
                <span aria-hidden="true">☷</span>
                Adjust the experience
              </button>

              <p className="safety-strip">
                <span aria-hidden="true">!</span>
                Stay seated or still. Never use near roads, stairs, heat or sharp objects.
              </p>
            </div>
          </>
        )}
      </section>

      {panelOpen && (
        <div className="sheet-backdrop" role="presentation" onClick={() => setPanelOpen(false)}>
          <section
            className="settings-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sheet-handle" />
            <div className="sheet-heading">
              <div>
                <p className="kicker">Tune with lived experience</p>
                <h2 id="settings-title">Adjust the view</h2>
              </div>
              <button className="close-button" onClick={() => setPanelOpen(false)} aria-label="Close settings">×</button>
            </div>

            <fieldset className="preset-picker">
              <legend>Known acuity</legend>
              {(Object.keys(presets) as Preset[]).map((key) => (
                <button
                  key={key}
                  className={preset === key ? "preset active" : "preset"}
                  onClick={() => setPreset(key)}
                >
                  <span className="radio" />
                  <span><strong>{presets[key].label}</strong><small>{presets[key].detail}</small></span>
                </button>
              ))}
            </fieldset>

            <div className="control-group">
              <label><span>Contrast</span><strong>{contrast}%</strong></label>
              <input
                aria-label="Contrast"
                type="range"
                min="25"
                max="100"
                value={contrast}
                onChange={(event) => setContrast(Number(event.target.value))}
                style={{ "--range-progress": `${((contrast - 25) / 75) * 100}%` } as React.CSSProperties}
              />
            </div>

            <div className="control-group">
              <label><span>Color</span><strong>{color}%</strong></label>
              <input
                aria-label="Color saturation"
                type="range"
                min="0"
                max="100"
                value={color}
                onChange={(event) => setColor(Number(event.target.value))}
                style={{ "--range-progress": `${color}%` } as React.CSSProperties}
              />
            </div>

            <div className="control-group">
              <label><span>Glare</span><strong>{glare}%</strong></label>
              <input
                aria-label="Glare"
                type="range"
                min="0"
                max="100"
                value={glare}
                onChange={(event) => setGlare(Number(event.target.value))}
                style={{ "--range-progress": `${glare}%` } as React.CSSProperties}
              />
            </div>

            <div className="control-group">
              <label><span>Cloudy veil</span><strong>{haze}%</strong></label>
              <input
                aria-label="Cloudy veil"
                type="range"
                min="0"
                max="100"
                value={haze}
                onChange={(event) => setHaze(Number(event.target.value))}
                style={{ "--range-progress": `${haze}%` } as React.CSSProperties}
              />
            </div>

            <fieldset className="field-picker">
              <legend>Pattern of vision loss <span>Shape is adjustable</span></legend>
              <div>
                {(["combined", "central", "peripheral", "none"] as FieldEffect[]).map((effect) => (
                  <button
                    key={effect}
                    className={fieldEffect === effect ? "active" : ""}
                    onClick={() => setFieldEffect(effect)}
                  >
                    {effect === "combined" ? "Both" : effect === "none" ? "No effect" : effect === "central" ? "Central loss" : "Narrow field"}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="truth-note">
              <span aria-hidden="true">i</span>
              <p><strong>This is a starting point, not a diagnosis.</strong> Low vision is different for every person and can change with lighting, fatigue and surroundings. Let the person you are trying to understand guide the settings and tell you what feels close and what does not.</p>
            </div>

            <button className="done-button" onClick={() => setPanelOpen(false)}>Use this view</button>
          </section>
        </div>
      )}

      {showGuide && (
        <div className="sheet-backdrop guide-backdrop" role="presentation" onClick={() => setShowGuide(false)}>
          <section className="guide-card" role="dialog" aria-modal="true" aria-labelledby="guide-title" onClick={(event) => event.stopPropagation()}>
            <button className="close-button" onClick={() => setShowGuide(false)} aria-label="Close safety guide">×</button>
            <p className="kicker">Before you begin</p>
            <h2 id="guide-title">Experience it safely</h2>
            <ol>
              <li><span>1</span><p><strong>Sit down first.</strong> Point the camera around the room; do not walk while viewing the screen.</p></li>
              <li><span>2</span><p><strong>Try familiar tasks.</strong> Look at a face, a food label, a remote control or objects on a table.</p></li>
              <li><span>3</span><p><strong>Let the person lead.</strong> Ask what feels similar, what feels wrong and what kind of help they actually want.</p></li>
            </ol>
            <button className="done-button" onClick={() => { setShowGuide(false); startCamera(); }}>I&apos;m seated. Start the camera</button>
          </section>
        </div>
      )}
    </main>
  );
}
