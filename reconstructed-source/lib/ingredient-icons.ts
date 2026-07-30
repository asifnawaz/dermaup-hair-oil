/**
 * Recovered from the deployed IngredientsSection client chunk.
 */
export const ICON_MAP: Record<string, string> = {
  glutathione: "/icons/ingredients/glutathione.svg",
  retinol: "/icons/ingredients/retinol.svg",
  "hyaluronic-acid": "/icons/ingredients/hyaluronic-acid.svg",
  "vitamin-c": "/icons/ingredients/vitamin-c.svg",
  "rice-extract": "/icons/ingredients/rice-extract.svg",
  "alpha-arbutin": "/icons/ingredients/alpha-arbutin.svg",
  niacinamide: "/icons/ingredients/niacinamide.svg",
  spf: "/icons/ingredients/spf.svg",
  "shea-butter": "/icons/ingredients/shea-butter.svg",
  collagen: "/icons/ingredients/collagen.svg",
  "glycolic-acid": "/icons/ingredients/glycolic-acid.svg",
  caffeine: "/icons/ingredients/caffeine.svg",
  "dht-blocker": "/icons/ingredients/dht-blocker.svg",
  "growth-stimulation": "/icons/ingredients/growth-stimulation.svg",
  circulation: "/icons/ingredients/circulation.svg",
  "follicle-strength": "/icons/ingredients/follicle-strength.svg",
  "scalp-repair": "/icons/ingredients/scalp-repair.svg",
  "carrier-system": "/icons/ingredients/carrier-system.svg",
  shield: "/icons/ingredients/dht-blocker.svg",
  sprout: "/icons/ingredients/growth-stimulation.svg",
  wind: "/icons/ingredients/circulation.svg",
  coffee: "/icons/ingredients/caffeine.svg",
  circle: "/icons/ingredients/scalp-repair.svg",
  dumbbell: "/icons/ingredients/follicle-strength.svg",
  droplet: "/icons/ingredients/hyaluronic-acid.svg",
  sparkles: "/icons/ingredients/glutathione.svg",
  leaf: "/icons/ingredients/rice-extract.svg",
  sun: "/icons/ingredients/vitamin-c.svg",
  target: "/icons/ingredients/alpha-arbutin.svg",
  "refresh-cw": "/icons/ingredients/glycolic-acid.svg",
};

export function getIngredientIconPath(icon: string): string {
  return ICON_MAP[icon] || ICON_MAP.glutathione;
}
