export const generateFilename = (input: string): string => {
    const umlautMap = {
        Ä: 'Ae', Ö: 'Oe', Ü: 'Ue', ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss',
    };
    let output = input.replace(/[ÄÖÜäöüß]/g, (match) => umlautMap[match]);

    output = output
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9\-]/g, '');

    return output;
}