
const DOTS_PER_INCH = 96;

const INCHES_PER_UNIT: Record<string, number> = { m: 39.37 };

export const getResolutionFromScale = (scale: number, units: string) => {
    const inches = INCHES_PER_UNIT[units];
    if (!inches) throw new Error(`Unknown units: ${units}`);
    return scale / (inches * DOTS_PER_INCH);
}

export const getScaleFromResolution = (resolution: number, units: string) => {
    const inches = INCHES_PER_UNIT[units];
    if (!inches) throw new Error(`Unknown units: ${units}`);
    return Math.round(inches * DOTS_PER_INCH * resolution);
}