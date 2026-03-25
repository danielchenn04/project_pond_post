export interface PondNym {
  name: string;
  emoji: string;
}

export const POND_NYMS: PondNym[] = [
  { name: 'Frankie the Frog', emoji: '🐸' },
  { name: 'Toby the Tadpole', emoji: '🦎' },
  { name: 'Sammy the Salamander', emoji: '🦎' },
  { name: 'Nico the Newt', emoji: '🦎' },
  { name: 'Bull the Bullfrog', emoji: '🐸' },
  { name: 'Minnie the Mudpuppy', emoji: '🐾' },
  { name: 'Benny the Beetle', emoji: '🪲' },
  { name: 'Sloane the Snail', emoji: '🐌' },
  { name: 'Drake the Dragonfly', emoji: '🪲' },
  { name: 'Gemma the Gnat', emoji: '🦟' },
  { name: 'Lulu the Ladybug', emoji: '🐞' },
  { name: 'Casper the Cricket', emoji: '🦗' },
  { name: 'Archie the Ant', emoji: '🐜' },
  { name: 'Otis the Otter', emoji: '🦦' },
  { name: 'Harvey the Heron', emoji: '🦢' },
  { name: 'Molly the Mallard', emoji: '🦆' },
  { name: 'Barry the Beaver', emoji: '🦫' },
  { name: 'Willow the Water-shrew', emoji: '🐭' },
  { name: 'Piper the Plover', emoji: '🐦' },
  { name: 'King the Kingfisher', emoji: '🐦‍🔥' },
];

export function sampleThreeNyms(): PondNym[] {
  const shuffled = [...POND_NYMS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}
