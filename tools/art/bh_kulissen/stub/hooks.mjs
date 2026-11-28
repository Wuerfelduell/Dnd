export async function resolve(spec, ctx, next) {
  if (spec === 'phaser') return { url: new URL('./phaser.mjs', import.meta.url).href, shortCircuit: true };
  return next(spec, ctx);
}
