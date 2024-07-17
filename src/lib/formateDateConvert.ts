
export function DateFormateConvert(date: string) {
    const initialDate = new Date(date);
    const isoString = initialDate.toISOString();
    return isoString;
}