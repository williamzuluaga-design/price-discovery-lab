import { useEffect, useRef } from 'react';
import type { Trade } from '../types/market';

export default function PriceChart({ trades }: { trades: Trade[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    ctx.clearRect(0, 0, w, h);

    // grid lines
    ctx.strokeStyle = '#253449';
    ctx.lineWidth = 1;
    for (let y = 20; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(w - 20, y);
      ctx.stroke();
    }

    if (trades.length < 1) {
      ctx.fillStyle = '#91a0b3';
      ctx.font = '13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Sin transacciones aún', w / 2, h / 2);
      return;
    }

    const prices = trades.map((t) => t.price);
    const min = Math.min(...prices) - 500;
    const max = Math.max(...prices) + 500;
    const padLeft = 50;
    const padRight = 20;
    const padTop = 20;
    const padBottom = 30;
    const plotW = w - padLeft - padRight;
    const plotH = h - padTop - padBottom;

    const x = (i: number) => padLeft + (i * plotW) / Math.max(1, prices.length - 1);
    const y = (p: number) => padTop + ((max - p) * plotH) / (max - min || 1);

    // price labels
    ctx.fillStyle = '#91a0b3';
    ctx.font = '10px ui-monospace, monospace';
    ctx.textAlign = 'right';
    const steps = 5;
    for (let i = 0; i <= steps; i++) {
      const val = min + ((max - min) * i) / steps;
      const yy = padTop + plotH - (i * plotH) / steps;
      ctx.fillText(Math.round(val).toLocaleString('es-CO'), 42, yy + 3);
    }

    // line
    ctx.strokeStyle = '#27d17f';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    prices.forEach((p, i) => {
      if (i === 0) ctx.moveTo(x(i), y(p));
      else ctx.lineTo(x(i), y(p));
    });
    ctx.stroke();

    // dots
    ctx.fillStyle = '#e8eef6';
    prices.forEach((p, i) => {
      ctx.beginPath();
      ctx.arc(x(i), y(p), 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [trades]);

  return (
    <div className="chart-container">
      <canvas ref={canvasRef} />
    </div>
  );
}
