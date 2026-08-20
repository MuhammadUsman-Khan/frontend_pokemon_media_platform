import allPokemonDataset from '../assets/data/allPokemon.json';

const POKE_CACHE = new Map();

export function getAllPokemonList() {
  return allPokemonDataset;
}

export async function fetchAllPokemonNames() {
  return allPokemonDataset;
}

export async function fetchPokemonDetails(nameOrId) {
  if (!nameOrId) return null;
  const key = String(nameOrId).toLowerCase().trim().replace(/\s+/g, '-');
  if (POKE_CACHE.has(key)) return POKE_CACHE.get(key);

  // Find in local dataset first for basic data
  const localData = allPokemonDataset.find(p =>
    p.rawName === key ||
    p.name.toLowerCase() === key ||
    String(p.id) === key
  );

  try {
    const fetchKey = localData?.rawName || key;
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${fetchKey}`);
    if (res.ok) {
      const data = await res.json();
      const types = data.types.map(t => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1));
      const details = {
        id: data.id,
        dexNumber: localData?.dexNumber || `#${String(data.id).padStart(4, '0')}`,
        name: localData?.name || (data.name.charAt(0).toUpperCase() + data.name.slice(1).replace(/-/g, ' ')),
        rawName: data.name,
        category: localData?.category || 'Standard',
        isLegendary: localData?.isLegendary || false,
        height: (data.height / 10).toFixed(1),
        weight: (data.weight / 10).toFixed(1),
        types: types,
        type1: types[0] || 'Normal',
        type2: types[1] || null,
        officialArt: data.sprites?.other?.['official-artwork']?.front_default || localData?.artwork || data.sprites?.front_default,
        animatedSprite: data.sprites?.other?.showdown?.front_default || data.sprites?.front_default,
        cryAudio: data.cries?.latest || `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${data.id}.ogg`,
        stats: {
          hp: data.stats.find(s => s.stat.name === 'hp')?.base_stat || 50,
          attack: data.stats.find(s => s.stat.name === 'attack')?.base_stat || 50,
          defense: data.stats.find(s => s.stat.name === 'defense')?.base_stat || 50,
          spAtk: data.stats.find(s => s.stat.name === 'special-attack')?.base_stat || 50,
          spDef: data.stats.find(s => s.stat.name === 'special-defense')?.base_stat || 50,
          speed: data.stats.find(s => s.stat.name === 'speed')?.base_stat || 50
        }
      };
      POKE_CACHE.set(key, details);
      POKE_CACHE.set(String(data.id), details);
      return details;
    }
  } catch (err) {
    console.error(`PokeAPI details error for ${nameOrId}:`, err);
  }

  // Fallback to local dataset entry if network is slow/fails
  if (localData) {
    return {
      id: localData.id,
      dexNumber: localData.dexNumber,
      name: localData.name,
      rawName: localData.rawName,
      category: localData.category,
      isLegendary: localData.isLegendary,
      height: '1.0',
      weight: '30.0',
      types: ['Normal'],
      type1: 'Normal',
      type2: null,
      officialArt: localData.artwork,
      animatedSprite: localData.sprite,
      cryAudio: null,
      stats: { hp: 70, attack: 75, defense: 70, spAtk: 75, spDef: 70, speed: 70 }
    };
  }

  return null;
}

export const pokeapi = {
  getAllPokemonList,
  fetchAllPokemonNames,
  fetchPokemonDetails,
  getPokemonList: async (limit = 1302) => {
    return allPokemonDataset.slice(0, limit);
  },
  getPokemonDetails: fetchPokemonDetails
};

export default pokeapi;
