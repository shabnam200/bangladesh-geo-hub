// D / Z / U / P badges, explained: each letter is the short form of that
// tier's real Bangladeshi administrative name, not an arbitrary color code.
export const TYPE_INITIAL = { division: 'D', district: 'Z', upazila: 'U', union: 'P' };

export const TYPE_LABEL = {
  division: 'Division',
  district: 'District (Zila)',
  upazila: 'Upazila',
  union: 'Union (Parishad)',
};

// One fixed color per administrative tier — used everywhere (cards, search
// results, the legend, landing stats) so color always means "this level of
// government," the same way it does on an official gazetteer.
export const TYPE_ACCENT = {
  division: '#2F6F52', // paddy green
  district: '#2B3A67', // indigo ink
  upazila: '#D89A2B', // marigold
  union: '#B23A3A', // brick red
};