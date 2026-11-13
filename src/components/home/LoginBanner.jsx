import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { LogIn } from "lucide-react";

// ── Procedural background ──────────────────────────────────────────────────
// Adapted from the "Alert Banner" designed component's PastelRectangle: a
// self-managing WebGL animation (resize, off-screen pause, reduced motion all
// handled internally). The shader body is untouched; only the palette
// constants are retinted from pastel to this app's near-black / mint palette.
const vertexSource = `
  attribute vec2 a_position;
  void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
`;

const fragmentSource = `
  precision highp float;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_grid;
  uniform float u_grain;
  uniform float u_pixelation;
  uniform float u_circle;
  uniform float u_glow;
  const float TAU = 6.28318530718;
  const float DURATION = 19.842667;

  const vec3 LILAC = vec3(0.043, 0.071, 0.129);
  const vec3 PINK = vec3(0.263, 0.129, 0.404);
  const vec3 BLUE = vec3(0.051, 0.243, 0.310);
  const vec3 MINT = vec3(0.086, 0.451, 0.376);
  const vec3 GREEN = vec3(0.000, 0.780, 0.510);
  const vec3 YELLOW = vec3(0.290, 1.000, 0.850);
  const vec3 PEACH = vec3(0.628, 0.302, 0.812);

  float hash(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
  }
  vec3 gradient(vec3 p) {
    p = fract(p*vec3(0.1031,0.1030,0.0973));
    p += dot(p,p.yxz+33.33);
    return -1.0+2.0*fract((p.xxy+p.yzz)*p.zyx);
  }
  float noise3(vec3 p) {
    vec3 i = floor(p), x = fract(p);
    vec3 f = x*x*x*(x*(x*6.0-15.0)+10.0);
    float a = dot(gradient(i),x);
    float b = dot(gradient(i+vec3(1,0,0)),x-vec3(1,0,0));
    float c = dot(gradient(i+vec3(0,1,0)),x-vec3(0,1,0));
    float d = dot(gradient(i+vec3(1,1,0)),x-vec3(1,1,0));
    float e = dot(gradient(i+vec3(0,0,1)),x-vec3(0,0,1));
    float h = dot(gradient(i+vec3(1,0,1)),x-vec3(1,0,1));
    float j = dot(gradient(i+vec3(0,1,1)),x-vec3(0,1,1));
    float k = dot(gradient(i+vec3(1,1,1)),x-vec3(1,1,1));
    return 0.5+mix(mix(mix(a,b,f.x),mix(c,d,f.x),f.y),
                   mix(mix(e,h,f.x),mix(j,k,f.x),f.y),f.z);
  }
  float fbm(vec3 p) {
    return 0.69*noise3(p) + 0.23*noise3(p*2.03+vec3(7.2,1.3,3.1))
         + 0.08*noise3(p*4.09+vec3(1.8,8.1,5.4));
  }

  vec4 field(vec2 uv, float phase) {
    vec3 drift = vec3(1.85*cos(phase), 1.55*sin(phase), 0.9*sin(phase+0.7));
    vec2 p = uv*4.9;
    vec2 warp = vec2(
      noise3(vec3(p*0.79, 4.1)+drift*0.72),
      noise3(vec3(p*0.79+vec2(8.3,2.4), 1.7)+drift*0.72)
    )-0.5;
    vec3 q = vec3(p + warp*1.85, 2.6)+drift;
    float organic = fbm(q);
    float rose = noise3(vec3(uv*3.2 + warp*0.95, 9.5)+drift*0.60);
    float cool = noise3(vec3(uv*3.9 - warp*0.80, 3.3)+drift*0.51);
    vec3 color = mix(LILAC, BLUE, smoothstep(0.33,0.68,cool)*0.66);
    color = mix(color, PINK, smoothstep(0.38,0.64,rose)*0.77);
    float haze = smoothstep(0.53,0.75,organic);
    float core = smoothstep(0.67,0.86,organic);
    color = mix(color, MINT, haze*0.77);
    color = mix(color, GREEN, core*0.93);
    return vec4(color, core);
  }

  void main() {
    vec2 uv = vec2(gl_FragCoord.x, u_resolution.y-gl_FragCoord.y)/u_resolution;
    float phase = mod(u_time, DURATION)/DURATION*TAU;
    float cellSize = min(u_resolution.x, u_resolution.y)/72.0;
    vec2 cells = u_resolution/cellSize;
    vec2 cellUV = (floor(uv*cells)+0.5)/cells;
    vec4 smoothField = field(uv, phase);
    vec4 blockField = field(cellUV, phase);
    float pixelMix = u_pixelation*(0.36+0.54*smoothstep(0.01,0.45,blockField.a));
    vec4 f = mix(smoothField, blockField, pixelMix);
    vec3 color = f.rgb;

    vec2 glowCenter = mix(vec2(0.855,0.846),vec2(0.765,0.765),u_circle);
    glowCenter += vec2(0.009*cos(phase),0.008*sin(phase));
    vec2 d = uv-glowCenter;
    float breath = 1.0+0.07*sin(phase+1.1);
    float halo = exp(-dot(d/vec2(0.212,0.208), d/vec2(0.212,0.208))*0.85);
    float light = exp(-dot(d/vec2(0.127,0.138), d/vec2(0.127,0.138))*0.68*breath);
    color = mix(color,PEACH,halo*0.43*u_glow);
    color = mix(color,YELLOW,light*0.96*u_glow);

    vec2 cell = fract(uv*cells);
    vec2 edge = min(cell,1.0-cell);
    vec2 lineWidth = vec2(0.037);
    vec2 aa = cells/u_resolution*0.52;
    vec2 lines = 1.0-smoothstep(lineWidth-aa,lineWidth+aa,edge);
    float grid = max(lines.x,lines.y);
    float gridMask = smoothstep(0.09,0.75,blockField.a);
    color = mix(color,vec3(0.945,0.976,0.914),
                grid*gridMask*0.30*u_grid*(1.0-light*0.88));
    float grain = hash(vec3(gl_FragCoord.xy, floor(u_time*24.0)))-0.5;
    color += grain*(0.0033*u_grain);

    float radius = length(uv-0.5);
    float alpha = mix(1.0,1.0-smoothstep(0.5-1.3/u_resolution.x,0.5,radius),u_circle);
    gl_FragColor = vec4(clamp(color,0.0,1.0),alpha);
  }
`;

class PastelRectangle {
  constructor(canvas, options = {}) {
    if (!(canvas instanceof HTMLCanvasElement)) throw new TypeError("A canvas element is required.");
    this.canvas = canvas;
    this.options = {
      speed: 1, grid: 1, grain: 1, pixelation: 1, circle: 0, glow: 1,
      maxDpr: 2, maxResolution: 1200, autoplay: true, respectReducedMotion: true, ...options,
    };
    this.time = 0;
    this.running = false;
    this.destroyed = false;
    this.inView = true;
    this.frame = null;
    this.gl = canvas.getContext("webgl", {
      alpha: true, antialias: false, premultipliedAlpha: false,
      preserveDrawingBuffer: false, powerPreference: "low-power",
    });
    if (!this.gl) throw new Error("WebGL is unavailable.");
    this.onLost = (event) => { event.preventDefault(); this.wasRunning = this.running; this.pause(); };
    this.onRestored = () => { this.init(); this.resize(); if (this.wasRunning) this.play(); };
    canvas.addEventListener("webglcontextlost", this.onLost);
    canvas.addEventListener("webglcontextrestored", this.onRestored);
    this.init();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    this.motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.onMotion = () => { if (this.motionQuery.matches && this.options.respectReducedMotion) this.pause(); };
    this.motionQuery.addEventListener("change", this.onMotion);
    this.onVisibility = () => { this.last = null; if (!document.hidden) this.schedule(); };
    document.addEventListener("visibilitychange", this.onVisibility);
    this.intersectionObserver = new IntersectionObserver((entries) => {
      this.inView = entries[0].isIntersecting;
      this.last = null;
      if (this.inView) this.schedule();
    });
    this.intersectionObserver.observe(canvas);
    this.tick = (timestamp) => {
      this.frame = null;
      if (this.destroyed || !this.running || document.hidden || !this.inView) return;
      if (this.last != null) this.time += Math.min((timestamp - this.last) / 1000, 0.1) * this.options.speed;
      this.last = timestamp;
      this.render();
      this.schedule();
    };
    this.resize();
    if (this.options.autoplay && !(this.options.respectReducedMotion && this.motionQuery.matches)) this.play();
  }
  init() {
    const gl = this.gl;
    const compile = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(info);
      }
      return shader;
    };
    const vertex = compile(gl.VERTEX_SHADER, vertexSource);
    const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
    this.program = gl.createProgram();
    gl.attachShader(this.program, vertex);
    gl.attachShader(this.program, fragment);
    gl.linkProgram(this.program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(this.program));
    gl.useProgram(this.program);
    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(this.program, "a_position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    this.uniforms = {};
    for (const key of ["resolution", "time", "grid", "grain", "pixelation", "circle", "glow"]) {
      this.uniforms[key] = gl.getUniformLocation(this.program, "u_" + key);
    }
  }
  resize() {
    if (this.destroyed) return;
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, this.options.maxDpr);
    const scale = Math.min(dpr, this.options.maxResolution / Math.max(1, rect.width, rect.height));
    this.canvas.width = Math.max(1, Math.round(rect.width * scale));
    this.canvas.height = Math.max(1, Math.round(rect.height * scale));
    this.render();
  }
  render() {
    if (this.destroyed || this.gl.isContextLost()) return;
    const gl = this.gl;
    gl.useProgram(this.program);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
    gl.uniform1f(this.uniforms.time, this.time);
    for (const key of ["grid", "grain", "pixelation", "circle", "glow"]) {
      gl.uniform1f(this.uniforms[key], this.options[key]);
    }
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
  schedule() {
    if (!this.destroyed && this.running && !document.hidden && this.inView && this.frame == null) {
      this.frame = requestAnimationFrame(this.tick);
    }
  }
  play() { if (this.destroyed) return; this.running = true; this.last = null; this.schedule(); }
  pause() { this.running = false; cancelAnimationFrame(this.frame); this.frame = null; this.last = null; }
  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.pause();
    this.resizeObserver.disconnect();
    this.intersectionObserver.disconnect();
    this.motionQuery.removeEventListener("change", this.onMotion);
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.canvas.removeEventListener("webglcontextlost", this.onLost);
    this.canvas.removeEventListener("webglcontextrestored", this.onRestored);
    this.gl.deleteBuffer(this.buffer);
    this.gl.deleteProgram(this.program);
  }
}

// Styles lifted from the designed component's sheet, retinted onto this app's
// tokens: card surface, border, foreground and the mint primary button.
const CARD_CSS = `
  .ab1-card {
    position: relative;
    width: 100%;
    max-width: 425px;
    margin: 0 auto;
    aspect-ratio: 425 / 553;
    box-sizing: border-box;
    background: hsl(var(--card));
    border: 1px solid hsl(var(--border));
    border-radius: 24px;
    overflow: hidden;
    padding: 40px 16px 16px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: 42px;
  }
  .ab1-card::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    background: linear-gradient(to top,
      hsl(var(--background) / 0.94) 0%,
      hsl(var(--background) / 0.62) 46%,
      hsl(var(--background) / 0) 78%);
  }
  .ab1-bg-anim {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
    border-radius: inherit;
    z-index: 0;
    pointer-events: none;
  }
  .ab1-copy {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-left: 8px;
  }
  .ab1-title {
    margin: 0;
    font-family: var(--font-heading);
    font-size: 44px;
    font-weight: 700;
    line-height: 0.95;
    letter-spacing: -0.03em;
    color: hsl(var(--foreground));
  }
  .ab1-subtitle {
    margin: 0;
    font-size: 17px;
    line-height: 1.3;
    color: hsl(var(--foreground) / 0.88);
  }
  .ab1-action {
    position: relative;
    z-index: 2;
    display: block;
    width: 100%;
    height: 68px;
    flex-shrink: 0;
    border-radius: 16px;
    background: hsl(var(--primary));
    text-decoration: none;
    transition: background 320ms cubic-bezier(0.22, 1, 0.36, 1);
  }
  .ab1-action:hover { background: hsl(var(--primary) / 0.88); }
  .ab1-action:focus-visible {
    outline: 2px solid hsl(var(--primary));
    outline-offset: 3px;
  }
  .ab1-btn-face {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    pointer-events: none;
  }
  .ab1-btn-chip {
    width: 48px;
    height: 48px;
    margin-left: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: hsl(var(--primary-foreground));
    color: hsl(var(--primary));
    flex-shrink: 0;
    transition: transform 320ms cubic-bezier(0.22, 1, 0.36, 1);
  }
  .ab1-action:hover .ab1-btn-chip { transform: translateX(4px); }
  .ab1-btn-label {
    position: absolute;
    left: 74px;
    top: 0;
    height: 100%;
    display: flex;
    align-items: center;
    font-family: var(--font-heading);
    font-size: 18px;
    font-weight: 700;
    color: hsl(var(--primary-foreground));
  }
  @media (max-width: 480px) {
    .ab1-card { padding: 28px 16px 16px; gap: 32px; }
    .ab1-title { font-size: 34px; }
    .ab1-subtitle { font-size: 16px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .ab1-action, .ab1-btn-chip { transition: none; }
    .ab1-action:hover .ab1-btn-chip { transform: none; }
  }
`;

// Shown to signed-out visitors only. Same card the designed component ships
// with (background animation, copy block, one full-width action), retinted to
// this app and pointed at the real sign-in route instead of a demo upgrade.
export default function LoginBanner() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    let anim = null;
    try {
      anim = new PastelRectangle(canvas, { speed: 0.15, grid: 1, pixelation: 1, glow: 1, circle: 0 });
    } catch {
      canvas.remove();
    }
    return () => anim?.destroy();
  }, []);

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12">
      <style>{CARD_CSS}</style>
      <div className="ab1-card">
        <canvas ref={canvasRef} className="ab1-bg-anim" aria-hidden="true" />
        <div className="ab1-copy">
          <h2 className="ab1-title">
            Sign in to
            <br />
            use the bot
          </h2>
          <p className="ab1-subtitle">
            The market bot, live signals, watchlist alerts and your paper portfolio all live
            behind your account. Log in to run a scan and follow your trades.
          </p>
        </div>
        <Link to="/login" className="ab1-action">
          <span className="ab1-btn-face" aria-hidden="true">
            <span className="ab1-btn-chip">
              <LogIn className="w-6 h-6" />
            </span>
          </span>
          <span className="ab1-btn-label">Log in</span>
        </Link>
      </div>
    </section>
  );
}