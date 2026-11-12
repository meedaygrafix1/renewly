// Unit sphere sampled along a Fibonacci spiral; no rings of overlapping logos.
export function spherePoints(count) {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: count }, (_, index) => {
    const y = 1 - 2 * (index + 0.5) / count;
    const r = Math.sqrt(1 - y * y);
    return { x: Math.cos(index * goldenAngle) * r, y, z: Math.sin(index * goldenAngle) * r };
  });
}
export function project(point, yaw, pitch, radius) {
  const x = point.x * Math.cos(yaw) + point.z * Math.sin(yaw);
  const depth = point.z * Math.cos(yaw) - point.x * Math.sin(yaw);
  const y = point.y * Math.cos(pitch) - depth * Math.sin(pitch);
  const z = point.y * Math.sin(pitch) + depth * Math.cos(pitch);
  return { x: x * radius, y: y * radius, z, scale: 0.7 + (z + 1) * 0.19, opacity: 0.3 + (z + 1) * 0.35 };
}
