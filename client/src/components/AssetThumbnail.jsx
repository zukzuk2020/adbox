const SHAPES = {
  web: { width: 240, height: 126 },
  print: { width: 120, height: 155 },
};

export default function AssetThumbnail({ type }) {
  const { width, height } = SHAPES[type] ?? SHAPES.web;
  const x = (260 - width) / 2;
  const y = (170 - height) / 2;
  return (
    <svg viewBox="0 0 260 170" className="h-44 w-full bg-indigo-50" aria-hidden="true">
      <rect x={x} y={y} width={width} height={height} rx="4" fill="#fff" stroke="#C7D2FE" />
      <rect x={x + 10} y={y + 10} width={width * 0.3} height={height * 0.18} rx="2" fill="#0B3D91" />
      <rect x={x + 10} y={y + height * 0.42} width={width * 0.7} height="8" rx="2" fill="#94A3B8" />
      <rect x={x + 10} y={y + height * 0.42 + 14} width={width * 0.5} height="8" rx="2" fill="#CBD5E1" />
      <rect x={x + 10} y={y + height - 22} width={width * 0.4} height="6" rx="2" fill="#CBD5E1" />
    </svg>
  );
}
