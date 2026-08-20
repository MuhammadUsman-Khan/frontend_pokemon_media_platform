import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, Volume2, Shield, Swords, Heart, Zap, Sparkles, Crown, Flame } from 'lucide-react';
import TypeBadge from './TypeBadge';
import { pokeapi } from '../services/pokeapi';
import allPokemonList from '../assets/data/allPokemon.json';
import { soundFX } from '../utils/audio';

const POKEDEX_FILTERS = [
  { id: 'all', label: 'All (1,302)', filter: () => true },
  { id: 'legendary', label: '👑 Legendary & Mythical', filter: (p) => p.isLegendary },
  { id: 'megas', label: '✨ Megas & Forms', filter: (p) => p.category === 'Mega / Form' },
  { id: 'gen1', label: 'Gen 1 Kanto (1-151)', filter: (p) => p.id >= 1 && p.id <= 151 },
  { id: 'gen2', label: 'Gen 2 Johto (152-251)', filter: (p) => p.id >= 152 && p.id <= 251 },
  { id: 'gen3', label: 'Gen 3 Hoenn (252-386)', filter: (p) => p.id >= 252 && p.id <= 386 },
  { id: 'gen4', label: 'Gen 4 Sinnoh (387-493)', filter: (p) => p.id >= 387 && p.id <= 493 },
  { id: 'gen5', label: 'Gen 5 Unova (494-649)', filter: (p) => p.id >= 494 && p.id <= 649 },
  { id: 'gen6', label: 'Gen 6 Kalos (650-721)', filter: (p) => p.id >= 650 && p.id <= 721 },
  { id: 'gen7', label: 'Gen 7 Alola (722-809)', filter: (p) => p.id >= 722 && p.id <= 809 },
  { id: 'gen8', label: 'Gen 8 Galar (810-905)', filter: (p) => p.id >= 810 && p.id <= 905 },
  { id: 'gen9', label: 'Gen 9 Paldea (906-1025)', filter: (p) => p.id >= 906 && p.id <= 1025 },
];

export default function PokedexModal({ isOpen, onClose }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [visibleCount, setVisibleCount] = useState(80);
  const listRef = useRef(null);

  // Initialize with Pikachu on first open
  useEffect(() => {
    if (isOpen && !selectedPokemon) {
      pokeapi.fetchPokemonDetails('pikachu').then(setSelectedPokemon);
    }
  }, [isOpen, selectedPokemon]);

  // Fast Instant Filter across all 1,302 Pokémon
  const filteredList = useMemo(() => {
    const filterConfig = POKEDEX_FILTERS.find(f => f.id === activeFilter) || POKEDEX_FILTERS[0];
    let list = allPokemonList.filter(filterConfig.filter);

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.rawName.toLowerCase().includes(q) ||
        String(p.id).includes(q)
      );
    }
    return list;
  }, [activeFilter, searchTerm]);

  // Reset pagination count on search/tab change
  useEffect(() => {
    setVisibleCount(80);
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [activeFilter, searchTerm]);

  const handleSelectPokemon = async (pokemon) => {
    soundFX.playClick();
    const details = await pokeapi.fetchPokemonDetails(pokemon.rawName || pokemon.id);
    if (details) setSelectedPokemon(details);
  };

  const playCry = () => {
    if (selectedPokemon?.cryAudio) {
      const audio = new Audio(selectedPokemon.cryAudio);
      audio.volume = 0.5;
      audio.play().catch(() => soundFX.playBadge());
    } else {
      soundFX.playBadge();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1100px',
        maxHeight: '94vh',
        background: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(32px) saturate(200%)',
        WebkitBackdropFilter: 'blur(32px) saturate(200%)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        borderRadius: '26px',
        boxShadow: '0 25px 65px rgba(0, 0, 0, 0.85), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          background: 'rgba(239, 68, 68, 0.12)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: '#ef4444',
              boxShadow: '0 0 14px #ef4444, inset 0 1px 2px rgba(255,255,255,0.8)'
            }} />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>
              Complete National Pokédex <span style={{ fontSize: '0.82rem', color: '#fca5a5', fontWeight: 700 }}>(1,302 Pokémon & Forms)</span>
            </h2>
          </div>

          <button
            onClick={() => { soundFX.playClick(); onClose(); }}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#cbd5e1',
              cursor: 'pointer'
            }}
            className="hover:scale-110"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search & Category Tabs */}
        <div style={{ padding: '14px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <Search size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search across all 1,302 Pokémon by Name, Dex #, or Form (e.g. 150, Rayquaza, Mega Lucario, Arceus, Koraidon)..."
              className="liquid-glass-input"
              style={{ width: '100%', padding: '10px 14px 10px 42px', fontSize: '0.9rem' }}
            />
          </div>

          {/* Filter Pills with Special Legendary and Mega Highlights */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }} className="no-scrollbar">
            {POKEDEX_FILTERS.map((f) => {
              const isSelected = activeFilter === f.id;
              const isLegendaryTab = f.id === 'legendary';
              const isMegaTab = f.id === 'megas';
              
              let bg = isSelected ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'rgba(255, 255, 255, 0.05)';
              let border = isSelected ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.1)';
              let shadow = isSelected ? '0 0 14px rgba(239, 68, 68, 0.5)' : 'none';

              if (isLegendaryTab && !isSelected) {
                bg = 'rgba(245, 158, 11, 0.15)';
                border = '1px solid rgba(245, 158, 11, 0.35)';
              } else if (isMegaTab && !isSelected) {
                bg = 'rgba(168, 85, 247, 0.15)';
                border = '1px solid rgba(168, 85, 247, 0.35)';
              }

              return (
                <button
                  key={f.id}
                  onClick={() => { soundFX.playClick(); setActiveFilter(f.id); }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '12px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    background: bg,
                    border: border,
                    color: '#ffffff',
                    boxShadow: shadow,
                    transition: 'all 0.15s ease'
                  }}
                  className="hover:scale-105"
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Split Content (Scroll List on Left, Detail Card on Right) */}
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* Pokémon Grid / List */}
          <div
            ref={listRef}
            style={{
              padding: '16px',
              overflowY: 'auto',
              borderRight: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            {filteredList.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                No Pokémon found matching "{searchTerm}"
              </div>
            ) : (
              <>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, padding: '2px 6px', marginBottom: '4px' }}>
                  Showing {Math.min(visibleCount, filteredList.length)} of {filteredList.length} Pokémon
                </div>
                {filteredList.slice(0, visibleCount).map((p) => {
                  const isSelected = selectedPokemon?.id === p.id || selectedPokemon?.rawName === p.rawName;
                  return (
                    <div
                      key={`${p.id}-${p.rawName}`}
                      onClick={() => handleSelectPokemon(p)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: isSelected
                          ? 'rgba(239, 68, 68, 0.28)'
                          : p.isLegendary
                            ? 'rgba(245, 158, 11, 0.08)'
                            : 'rgba(255, 255, 255, 0.03)',
                        border: isSelected
                          ? '1.5px solid #ef4444'
                          : p.isLegendary
                            ? '1px solid rgba(245, 158, 11, 0.25)'
                            : '1px solid rgba(255, 255, 255, 0.06)',
                        boxShadow: isSelected
                          ? '0 0 12px rgba(239, 68, 68, 0.3)'
                          : p.isLegendary
                            ? 'inset 0 0 8px rgba(245, 158, 11, 0.1)'
                            : 'none',
                        transition: 'all 0.12s ease'
                      }}
                      className="hover:bg-white/10"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={p.sprite}
                          alt={p.name}
                          style={{ width: '36px', height: '36px', objectFit: 'contain', imageRendering: 'pixelated' }}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`;
                          }}
                        />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff' }}>
                              {p.name}
                            </span>
                            {p.isLegendary && (
                              <Crown size={12} style={{ color: '#f59e0b', filter: 'drop-shadow(0 0 4px #f59e0b)' }} />
                            )}
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.74rem', color: isSelected ? '#fca5a5' : '#64748b', fontWeight: 700 }}>
                        {p.dexNumber}
                      </span>
                    </div>
                  );
                })}

                {visibleCount < filteredList.length && (
                  <button
                    onClick={() => setVisibleCount(v => v + 80)}
                    style={{
                      marginTop: '8px',
                      padding: '10px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      cursor: 'pointer'
                    }}
                    className="hover:bg-white/15"
                  >
                    Load More ({filteredList.length - visibleCount} remaining)
                  </button>
                )}
              </>
            )}
          </div>

          {/* Pokémon Detail Showcase */}
          <div style={{ padding: '24px', overflowY: 'auto' }}>
            {selectedPokemon ? (
              <div style={{ maxWidth: '540px', margin: '0 auto' }}>
                {/* Visual Showcase Card */}
                <div style={{
                  background: selectedPokemon.isLegendary
                    ? 'radial-gradient(circle at 50% 40%, rgba(245, 158, 11, 0.22) 0%, rgba(0, 0, 0, 0.5) 100%)'
                    : 'radial-gradient(circle at 50% 40%, rgba(239, 68, 68, 0.18) 0%, rgba(0, 0, 0, 0.4) 100%)',
                  border: selectedPokemon.isLegendary
                    ? '1.5px solid rgba(245, 158, 11, 0.4)'
                    : '1px solid rgba(255, 255, 255, 0.14)',
                  borderRadius: '22px',
                  padding: '24px',
                  textAlign: 'center',
                  position: 'relative',
                  marginBottom: '20px',
                  boxShadow: selectedPokemon.isLegendary
                    ? '0 0 30px rgba(245, 158, 11, 0.25), inset 0 1px 1px rgba(255,255,255,0.4)'
                    : '0 12px 30px rgba(0, 0, 0, 0.5)'
                }}>
                  <div style={{ position: 'absolute', top: '16px', left: '18px', fontSize: '0.9rem', fontWeight: 900, color: '#cbd5e1' }}>
                    {selectedPokemon.dexNumber}
                  </div>

                  <button
                    onClick={playCry}
                    style={{
                      position: 'absolute',
                      top: '14px',
                      right: '16px',
                      background: 'rgba(239, 68, 68, 0.25)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      cursor: 'pointer'
                    }}
                    className="hover:scale-110"
                    title="Play Pokémon Cry"
                  >
                    <Volume2 size={18} />
                  </button>

                  <div style={{ height: '190px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                      src={selectedPokemon.officialArt}
                      alt={selectedPokemon.name}
                      style={{
                        maxHeight: '180px',
                        maxWidth: '180px',
                        objectFit: 'contain',
                        filter: selectedPokemon.isLegendary
                          ? 'drop-shadow(0 10px 24px rgba(245, 158, 11, 0.55))'
                          : 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.6))',
                        animation: 'floatSlow 4s ease-in-out infinite'
                      }}
                      onError={(e) => {
                        e.currentTarget.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${selectedPokemon.id}.png`;
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
                    <h3 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#ffffff' }}>
                      {selectedPokemon.name}
                    </h3>
                    {selectedPokemon.isLegendary && (
                      <span style={{
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        color: '#0f172a',
                        fontWeight: 900,
                        fontSize: '0.72rem',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Crown size={11} /> LEGENDARY
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '10px' }}>
                    {selectedPokemon.types?.map(t => (
                      <TypeBadge key={t} type={t} />
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '14px', fontSize: '0.86rem', color: '#cbd5e1' }}>
                    <span><strong>Height:</strong> {selectedPokemon.height} m</span>
                    <span><strong>Weight:</strong> {selectedPokemon.weight} kg</span>
                  </div>
                </div>

                {/* Base Stats Breakdown */}
                <div style={{
                  background: 'rgba(0, 0, 0, 0.35)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '18px',
                  padding: '20px'
                }}>
                  <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#ffffff', marginBottom: '14px' }}>
                    Base Combat Statistics
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      { label: 'HP', val: selectedPokemon.stats?.hp, max: 255, color: '#22c55e' },
                      { label: 'Attack', val: selectedPokemon.stats?.attack, max: 200, color: '#ef4444' },
                      { label: 'Defense', val: selectedPokemon.stats?.defense, max: 230, color: '#3b82f6' },
                      { label: 'Sp. Atk', val: selectedPokemon.stats?.spAtk, max: 200, color: '#f97316' },
                      { label: 'Sp. Def', val: selectedPokemon.stats?.spDef, max: 230, color: '#a855f7' },
                      { label: 'Speed', val: selectedPokemon.stats?.speed, max: 200, color: '#eab308' },
                    ].map(stat => (
                      <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ width: '70px', fontSize: '0.78rem', fontWeight: 800, color: '#94a3b8' }}>
                          {stat.label}
                        </span>
                        <span style={{ width: '32px', fontSize: '0.8rem', fontWeight: 900, color: '#ffffff', textAlign: 'right' }}>
                          {stat.val || 50}
                        </span>
                        <div style={{ flex: 1, height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '6px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${Math.min(100, ((stat.val || 50) / stat.max) * 100)}%`,
                            height: '100%',
                            background: stat.color,
                            borderRadius: '6px',
                            boxShadow: `0 0 8px ${stat.color}80`
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
                Select any Pokémon from the Pokédex to view full details.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
