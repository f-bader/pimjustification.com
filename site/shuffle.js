// Each level keeps its own shuffled deck. A refill never repeats the last draw.
export function createPicker(collections, random = Math.random) {
  const decks = collections.map(() => []);
  const last = collections.map(() => undefined);
  return function pick(level) {
    const source = collections[level];
    if (!source?.length) throw new RangeError('Unknown or empty justification level');
    const deck = decks[level];
    if (!deck.length) {
      deck.push(...source);
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
      if (deck.length > 1 && deck.at(-1) === last[level]) {
        [deck[0], deck[deck.length - 1]] = [deck.at(-1), deck[0]];
      }
    }
    last[level] = deck.pop();
    return last[level];
  };
}
