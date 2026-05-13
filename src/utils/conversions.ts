export const MT_TO_LBS = 2204.62;
export const TROY_OZ_TO_LBS = 0.06857;
export const G_TO_TROY_OZ = 31.1035;

export function gramsToDMTToTroyOz(grams: number, dryWeight: number): number {
  return (grams * dryWeight) / G_TO_TROY_OZ;
}

export function mtToLbs(mt: number): number {
  return mt * MT_TO_LBS;
}

export function troyOzToLbs(oz: number): number {
  return oz * TROY_OZ_TO_LBS;
}
