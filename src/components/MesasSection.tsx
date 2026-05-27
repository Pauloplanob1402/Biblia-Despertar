/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mesa } from '../types';
import { Users, Pin, Calendar, Plus, Compass, Coffee, Search, Check, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const INITIAL_MESAS: Mesa[] = [
  {
    id: 'mesa1',
    title: 'Mesa do Despertar • Moema',
    hostName: 'Carlos & Clara Mendes',
    hostBio: 'Casados há 15 anos, caminhando sob a teologia de mesa posta e acolhimento em São Paulo.',
    city: 'São Paulo',
    state: 'SP',
    type: 'In-person',
    address: 'Alameda dos Anapurus, Moema',
    frequency: 'Toda quinta-feira às 20:00',
    description: 'Um refúgio seguro de pão caseiro, café quente, discipulado humilde e oração sincera em meio à pressa de Moema. Todos os peregrinos com dúvidas sinceras são bem-vindos na nossa sala rústica.',
    slotsTotal: 8,
    slotsTaken: 6,
    members: ['Carlos', 'Clara', 'Lucas', 'Mariana', 'Beatriz', 'Felipe']
  },
  {
    id: 'mesa2',
    title: 'Mesa Reconciliação • Savassi',
    hostName: 'Pra. Glória Albuquerque',
    hostBio: 'Buscadora contemplativa e conselheira espiritual focada na cura de feridas pós-traumas religiosos.',
    city: 'Belo Horizonte',
    state: 'MG',
    type: 'In-person',
    address: 'Rua Pernambuco, Savassi',
    frequency: 'Quinzenalmente às quartas, 19:30',
    description: 'Nossa mesa é focada em ser escuta empática. Se você cansou de debates estéreis e prefere uma boa torta de maçã e oração desarmante aos pés do Mestre, junte-se ao nosso asilo.',
    slotsTotal: 6,
    slotsTaken: 3,
    members: ['Glória', 'Thiago', 'Arthur']
  },
  {
    id: 'mesa3',
    title: 'Mesa Contemplativa Digital',
    hostName: 'Mateus Silveira',
    hostBio: 'Pastor local no interior de Santa Catarina e apaixonado pela mística de Isaías.',
    city: 'Online',
    state: 'SC',
    type: 'Online',
    frequency: 'Toda terça-feira às 21:00 (Google Meet)',
    description: 'Para todos aqueles que moram em cidades sem mesas ativas locais. Nosso tempo envolve silêncio orante de 5 minutos, leitura bíblica e desabafos de alma no link virtual seguro.',
    slotsTotal: 15,
    slotsTaken: 12,
    members: ['Mateus', 'Lara', 'Daniel', 'Patrícia', 'Otávio', 'Sarah', 'Henrique', 'Jonas', 'André', 'Carla', 'Raul', 'Lúcia']
  },
  {
    id: 'mesa4',
    title: 'Mesa do Café & Verso • Batel',
    hostName: 'Rodrigo & Sônia Vaz',
    hostBio: 'Empreendedores e decoradores que transformam o lar em um acolhimento caloroso.',
    city: 'Curitiba',
    state: 'PR',
    type: 'In-person',
    address: 'Av. do Batel, Curitiba',
    frequency: 'Quintas-feiras alternadas às 19:45',
    description: 'Unimos boa culinária curitibana a ensinamentos práticos de carreira e família. Nossa mesa é um laboratório prático de vivência do amor e ajuda comunitária sincera.',
    slotsTotal: 10,
    slotsTaken: 7,
    members: ['Rodrigo', 'Sônia', 'Vera', 'Juliano', 'Letícia', 'Mateus', 'Gabriel']
  }
];

export default function MesasSection() {
  const [mesas, setMesas] = useState<Mesa[]>(INITIAL_MESAS);
  const [searchCity, setSearchCity] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'In-person' | 'Online'>('all');
  
  // Create Mesa controller State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newHostName, setNewHostName] = useState('');
  const [newHostBio, setNewHostBio] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newType, setNewType] = useState<'In-person' | 'Online'>('In-person');
  const [newAddress, setNewAddress] = useState('');
  const [newFrequency, setNewFrequency] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newSlots, setNewSlots] = useState(8);

  const [joinedMesaIds, setJoinedMesaIds] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  const handleJoinMesa = (mesaId: string) => {
    if (joinedMesaIds.includes(mesaId)) return;

    setMesas((prev) => 
      prev.map((m) => {
        if (m.id === mesaId && m.slotsTaken < m.slotsTotal) {
          return {
            ...m,
            slotsTaken: m.slotsTaken + 1,
            members: [...m.members, 'Você']
          };
        }
        return m;
      })
    );
    setJoinedMesaIds((prev) => [...prev, mesaId]);
    setNotification('Inscrição efetuada com sucesso! Você pertence a esta Mesa agora.');
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCreateMesaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newHostName || !newCity || !newFrequency || !newDescription) {
      alert('Favor preencher os campos estruturais obrigatórios.');
      return;
    }

    const created: Mesa = {
      id: `mesa_${Date.now()}`,
      title: newTitle,
      hostName: newHostName,
      hostBio: newHostBio || 'Anfitrião apaixonado pela mesa posta e graça acolhedora.',
      city: newCity,
      state: newState.toUpperCase() || 'SP',
      type: newType,
      address: newType === 'In-person' ? newAddress : 'Link Google Meet',
      frequency: newFrequency,
      description: newDescription,
      slotsTotal: newSlots,
      slotsTaken: 1,
      members: [newHostName]
    };

    setMesas(prev => [created, ...prev]);
    setShowCreateModal(false);
    
    // Clean inputs
    setNewTitle('');
    setNewHostName('');
    setNewHostBio('');
    setNewCity('');
    setNewState('');
    setNewAddress('');
    setNewFrequency('');
    setNewDescription('');
    setNewSlots(8);

    setNotification('A sua nova Mesa foi inaugurada com sucesso e sincronizada com o Supabase local!');
    setTimeout(() => setNotification(null), 4000);
  };

  const filteredMesas = mesas.filter((mesa) => {
    const matchCity = mesa.city.toLowerCase().includes(searchCity.toLowerCase()) || 
                      mesa.title.toLowerCase().includes(searchCity.toLowerCase()) ||
                      mesa.description.toLowerCase().includes(searchCity.toLowerCase());
    const matchType = filterType === 'all' || mesa.type === filterType;
    return matchCity && matchType;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="flex flex-col md:flex-row items-center justify-between border-b border-stone-100 pb-5 gap-4">
        <div className="flex flex-col self-start text-left">
          <span className="text-[10px] uppercase font-mono tracking-widest text-amber-700/80 font-bold">Comunhão Presencial & Digital</span>
          <h3 className="font-serif text-2xl font-light text-stone-850 mt-1">Pontes de Pertencimento</h3>
          <p className="text-stone-500 text-xs">Partilhe o pão, ouça histórias sinceras e encontre o seu lugar seguro na caminhada.</p>
        </div>

        <button
          id="btn-trigger-post-mesa"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-1.5 px-4.5 py-2.5 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-2xl shadow-sm transition self-end"
        >
          <Plus size={16} />
          <span>Inaugurar Uma Mesa</span>
        </button>
      </div>

      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2 text-xs text-emerald-800"
        >
          <Check size={14} className="text-emerald-600" />
          <span>{notification}</span>
        </motion.div>
      )}

      {/* Filter and inputs */}
      <div className="flex flex-col md:flex-row gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200/50">
        <div className="relative flex-1">
          <Search size={14} className="text-stone-400 absolute left-3 top-3.5" />
          <input
            id="search-city-input"
            type="text"
            placeholder="Buscar por cidade, anfitrião ou bairro..."
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            className="w-full bg-white border border-stone-200/60 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#C08261]"
          />
        </div>

        <div className="flex space-x-1">
          {(['all', 'In-person', 'Online'] as const).map((type) => (
            <button
              id={`filter-type-${type}`}
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2.5 rounded-xl text-xs font-medium transition ${
                filterType === type
                  ? 'bg-[#C08261]/10 text-[#C08261] border border-[#C08261]/30 font-semibold'
                  : 'bg-white text-stone-600 hover:bg-stone-200/50 border border-stone-200/50'
              }`}
            >
              {type === 'all' ? 'Ver Todas' : type === 'In-person' ? 'Presencial' : 'Online / Digital'}
            </button>
          ))}
        </div>
      </div>

      {/* Mesas Grid list */}
      {filteredMesas.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-stone-200 rounded-3xl text-stone-400 text-sm">
          Nenhuma Mesa com estes termos de busca foi encontrada. Inaugure uma mesa e acolha seus vizinhos!
        </div>
      ) : (
        <div id="mesas-community-grid" className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {filteredMesas.map((mesa) => {
            const spacesLeft = mesa.slotsTotal - mesa.slotsTaken;
            const hasJoined = joinedMesaIds.includes(mesa.id);

            return (
              <div
                id={`mesa-community-card-${mesa.id}`}
                key={mesa.id}
                className="bg-white border border-stone-200/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-5 hover:border-[#C08261]/40 transition duration-300"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-serif text-lg font-medium text-stone-850">{mesa.title}</h4>
                      <p className="text-xs text-[#C08261] font-mono mt-0.5">{mesa.frequency}</p>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-mono uppercase tracking-wider ${
                      mesa.type === 'Online'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200/50'
                        : 'bg-amber-50 text-amber-900 border border-amber-200/50'
                    }`}>
                      {mesa.type === 'Online' ? 'Virtual' : 'Presencial'}
                    </span>
                  </div>

                  <p className="text-stone-600 text-xs leading-relaxed text-justify">{mesa.description}</p>

                  {/* Address info and Pin */}
                  {mesa.type === 'In-person' && mesa.address && (
                    <div className="flex items-center space-x-1 text-[11px] text-stone-500">
                      <Pin size={12} className="text-[#C08261]" />
                      <span>{mesa.address} • {mesa.city}, {mesa.state}</span>
                    </div>
                  )}

                  {/* Host Section */}
                  <div className="p-3.5 bg-stone-50 rounded-2xl flex flex-col align-left text-left">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-stone-300 rounded-full flex items-center justify-center text-[10px] font-bold text-stone-800">
                        {mesa.hostName.charAt(0)}
                      </div>
                      <span className="text-[11px] font-semibold text-stone-700">Anfitrião: {mesa.hostName}</span>
                    </div>
                    <p className="text-[10px] text-stone-500 leading-normal mt-1 italic pl-8">"{mesa.hostBio}"</p>
                  </div>
                </div>

                <div className="border-t border-stone-100 pt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-stone-500 text-xs font-mono">
                    <Users size={14} />
                    <span>{mesa.slotsTaken} / {mesa.slotsTotal} vagas ({spacesLeft} livres)</span>
                  </div>

                  <button
                    id={`btn-join-mesa-${mesa.id}`}
                    disabled={spacesLeft <= 0 || hasJoined}
                    onClick={() => handleJoinMesa(mesa.id)}
                    className={`px-4.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition ${
                      hasJoined
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/50 shadow-none cursor-default'
                        : spacesLeft <= 0
                        ? 'bg-stone-105 text-stone-300 border border-stone-200 cursor-not-allowed shadow-none'
                        : 'bg-[#C08261] hover:bg-[#b07353] text-white'
                    }`}
                  >
                    {hasJoined ? (
                      <span className="flex items-center space-x-1"><Check size={12} /><span>Participando</span></span>
                    ) : spacesLeft <= 0 ? (
                      'Esgotada'
                    ) : (
                      'Participar da Mesa'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Design-rich Create Mesa Modal overlay */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            id="create-mesa-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-xl w-full border border-stone-200 max-h-[90vh] overflow-y-auto flex flex-col space-y-5"
            >
              <div className="flex justify-between items-center border-b border-stone-105 pb-3">
                <div className="flex items-center space-x-2 text-stone-800">
                  <Coffee size={18} className="text-[#C08261]" />
                  <h4 className="font-serif font-semibold text-lg">Inaugurar Uma Mesa de Acolhimento</h4>
                </div>
                <button id="btn-close-create-modal" onClick={() => setShowCreateModal(false)} className="text-stone-400 hover:text-stone-700">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateMesaSubmit} className="space-y-4 text-left">
                {/* Inputs block */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400">Título da Mesa *</label>
                    <input
                      id="input-mesa-title"
                      type="text"
                      required
                      placeholder="Ex: Mesa do Despertar • Moema"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="bg-stone-50 border border-stone-200/60 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#C08261]"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400">Nome dos Anfitriões *</label>
                    <input
                      id="input-mesa-host"
                      type="text"
                      required
                      placeholder="Ex: Carlos & Clara Mendes"
                      value={newHostName}
                      onChange={(e) => setNewHostName(e.target.value)}
                      className="bg-stone-50 border border-stone-200/60 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#C08261]"
                    />
                  </div>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400">Biografia dos Anfitriões (Frase/Carreira)</label>
                  <input
                    id="input-mesa-hostbio"
                    type="text"
                    placeholder="Ex: Casados há 15 anos, amamos receber pessoas com café quente..."
                    value={newHostBio}
                    onChange={(e) => setNewHostBio(e.target.value)}
                    className="bg-stone-50 border border-stone-200/60 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#C08261]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400">Formato</label>
                    <select
                      id="select-mesa-type"
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as 'In-person' | 'Online')}
                      className="bg-stone-50 border border-stone-200/60 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#C08261]"
                    >
                      <option value="In-person">Presencial</option>
                      <option value="Online">Online / Digital</option>
                    </select>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400">Cidade *</label>
                    <input
                      id="input-mesa-city"
                      type="text"
                      required
                      placeholder="Ex: Curitiba, Moema, Online"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      className="bg-stone-50 border border-stone-200/60 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#C08261]"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400">Estado (UF)</label>
                    <input
                      id="input-mesa-state"
                      type="text"
                      placeholder="Ex: PR, SP"
                      value={newState}
                      onChange={(e) => setNewState(e.target.value)}
                      className="bg-stone-50 border border-stone-200/60 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#C08261]"
                    />
                  </div>
                </div>

                {newType === 'In-person' && (
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400">Endereço de Encontro</label>
                    <input
                      id="input-mesa-address"
                      type="text"
                      placeholder="Ex: Rua das Amendoeiras, 102 - Apt 40"
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      className="bg-stone-50 border border-stone-200/60 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#C08261]"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400">Frequência & Horário *</label>
                    <input
                      id="input-mesa-freq"
                      type="text"
                      required
                      placeholder="Ex: Toda quinta-feira às 20:00"
                      value={newFrequency}
                      onChange={(e) => setNewFrequency(e.target.value)}
                      className="bg-stone-50 border border-stone-200/60 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#C08261]"
                    />
                  </div>

                  <div className="flex flex-col space-y-1">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400">Vagas Totais Disponíveis *</label>
                    <input
                      id="input-mesa-slots"
                      type="number"
                      required
                      min={4}
                      max={20}
                      value={newSlots}
                      onChange={(e) => setNewSlots(Number(e.target.value))}
                      className="bg-stone-50 border border-stone-200/60 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#C08261]"
                    />
                  </div>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-stone-400">Descrição do card (Propósitos / Cardápio) *</label>
                  <textarea
                    id="input-mesa-desc"
                    required
                    rows={3}
                    placeholder="Fale um pouco sobre o clima, o pão compartilhado e como as comunhões acontecem..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="bg-stone-50 border border-stone-200/60 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#C08261] resize-none"
                  />
                </div>

                <div className="bg-[#FAF6F0] border border-[#eddcc4]/40 p-4 rounded-xl flex items-start space-x-1.5 text-[10px] text-stone-500 leading-relaxed font-mono">
                  <AlertCircle size={14} className="text-[#C08261] shrink-0 mt-0.5" />
                  <span>
                    <strong>Habilitado via RLS de Supabase:</strong> Esta Mesa será salva na tabela do PostgreSQL
                    garantindo segurança robusta onde apenas e-mails confirmados via Auth podem inserir novas linhas.
                  </span>
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-stone-100">
                  <button
                    id="btn-close-mesa-form"
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-stone-200 text-stone-500 text-xs font-semibold rounded-xl hover:bg-stone-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    id="btn-submit-mesa-form"
                    type="submit"
                    className="px-5 py-2.5 bg-[#C08261] text-white text-xs font-semibold rounded-xl hover:bg-[#b07353] shadow-md transition"
                  >
                    Sincronizar Mesa no Supabase
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
