/* Achondroplasia growth curves: the 5th, 25th, 50th, 75th and 95th
   percentiles published by the CLARITY study (Hoover-Fong et al., Orphanet
   Journal of Rare Diseases 2021;16:522, CC BY 4.0), traced from the paper's
   Figs. 2, 3, 6, 7 and 8 by scripts/digitise-clarity.py. */
import curves from "./clarity-curves.json";

export type Sex = "boys" | "girls";
export type Measure = keyof typeof curves;
export const PERCENTILES = [95, 75, 50, 25, 5] as const;
export type Percentile = (typeof PERCENTILES)[number];
export type Point = { x: number } & Record<`p${Percentile}`, number>;

/** x is age in years (height, head) or height in cm (weightForHeight) */
export const growthCurve = (measure: Measure, sex: Sex): Point[] => curves[measure][sex];
