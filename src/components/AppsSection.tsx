import React from 'react';
import { motion } from 'motion/react';
import { Smartphone, BookOpen, Star, ArrowRight, Download, Sparkles, Heart } from 'lucide-react';

export default function AppsSection() {
  const apps = [
    {
      id: 'biblia',
      title: 'A Bíblia do Despertar',
      subtitle: 'Uma Bíblia para quem deseja despertar',
      playStoreUrl: 'https://play.google.com/store/apps/details?id=com.break_app.app&hl=pt_BR',
      tagline: 'Você já imaginou ter uma Bíblia criada para ajudar uma nova geração a despertar para aquilo que Deus sonhou?',
      intro: 'A Bíblia do Despertar nasceu com esse propósito. Mais do que um aplicativo de leitura bíblica, ela foi criada para ajudar jovens e adultos a desenvolverem uma caminhada diária com Deus, compreenderem as Escrituras de forma prática e viverem uma fé autêntica em um mundo cheio de distrações.',
      highlights: [
        'Leitura da Bíblia sagrada facilitada',
        'Planos de leitura inteligentes',
        'Devocionais inspirados nas Escrituras',
        'Versículos para compartilhar no WhatsApp',
        'Reflexões práticas do dia a dia',
        'Estudos bíblicos profundos',
        'Recursos para crescimento espiritual',
        'Ferramentas para fortalecer sua fé diariamente'
      ],
      mission: 'Cada capítulo lido. Cada versículo compartilhado. Cada momento com Deus é um passo em direção à pessoa que você nasceu para ser.',
      badgeColor: '#DCAE6C',
      accentColor: 'from-[#1E1C1A] via-[#121110] to-[#0A0A09]',
      borderColor: 'border-[#DCAE6C]/30',
      taglineColor: 'text-[#DCAE6C]'
    },
    {
      id: 'devocional',
      title: 'O Despertar',
      subtitle: 'Devocional diário para jovens',
      playStoreUrl: 'https://play.google.com/store/apps/details?id=com.sparksresiliencia.app&hl=pt_BR',
      tagline: 'Você sente que existe algo maior dentro de você?',
      intro: 'O Despertar foi criado para jovens que desejam crescer espiritualmente, fortalecer sua fé e construir um relacionamento verdadeiro com Deus todos os dias. Mais do que um aplicativo de devocionais, O Despertar é uma jornada diária de transformação.',
      highlights: [
        'Devocionais diários exclusivos',
        'Reflexões práticas para jovens',
        'Estudos bíblicos transformadores',
        'Planos de crescimento espiritual',
        'Diário de fé e oração em tempo real',
        'Desafios para desenvolver novos hábitos',
        'Versículos prontos para partilhar',
        'Comunidade cristã em crescimento e atualizações'
      ],
      mission: 'Dedique apenas alguns minutos do seu dia para fortalecer sua mente, sua fé e seu coração. Cada devocional foi desenvolvido para ajudar você a superar medos, ansiedade e inseguranças.',
      badgeColor: '#C08261',
      accentColor: 'from-[#2A2421] via-[#1D1917] to-[#12100F]',
      borderColor: 'border-[#C08261]/30',
      taglineColor: 'text-[#C08261]'
    }
  ];

  return (
    <div className="space-y-16 py-8">
      {/* HEADER SECTION */}
      <div className="space-y-4 max-w-2xl mx-auto text-center">
        <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs uppercase font-mono tracking-widest text-[#C08261] bg-[#C08261]/10 border border-[#C08261]/20 font-bold">
          <Smartphone size={12} />
          <span>Ecossistema Mobile</span>
        </span>
        <h2 className="font-serif text-3xl md:text-5xl font-light text-stone-850 tracking-tight leading-tight">
          O que estamos construindo.
        </h2>
        <p className="text-stone-500 text-sm md:text-base leading-relaxed">
          Nossos aplicativos foram criados para tornar o relacionamento diário com Deus simples, acessível e profundamente integrativo na sua rotina diária.
        </p>
      </div>

      {/* APPS LISTING CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {apps.map((app) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative rounded-3xl border ${app.borderColor} overflow-hidden bg-gradient-to-br ${app.accentColor} p-8 text-left shadow-xl flex flex-col justify-between`}
          >
            {/* Ambient gold/orange background light glow */}
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-full blur-2xl" />

            {/* Content Top */}
            <div className="space-y-6 relative z-10">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-stone-400 font-bold">
                    {app.subtitle}
                  </span>
                  <h3 className="font-serif text-2xl md:text-3xl font-bold text-stone-100 mt-1">
                    {app.title}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white font-serif font-semibold shrink-0">
                  {app.id === 'biblia' ? '📖' : '🌅'}
                </div>
              </div>

              <div className="space-y-3">
                <p className={`font-serif text-base italic leading-relaxed ${app.taglineColor}`}>
                  "{app.tagline}"
                </p>
                <p className="text-stone-300 text-xs md:text-sm leading-relaxed font-sans">
                  {app.intro}
                </p>
              </div>

              {/* HIGHLIGHT CHECKLIST */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 font-semibold block">
                  Cursos & Funcionalidades exclusivas:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {app.highlights.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-stone-300">
                      <span className="text-emerald-500 text-xs font-bold leading-none shrink-0 font-sans">✔</span>
                      <span className="text-[11px] leading-snug">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* MISSION BOX */}
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[11px] text-stone-400 leading-relaxed italic">
                  {app.mission}
                </p>
              </div>
            </div>

            {/* BUTTON / CALL TO ACTION */}
            <div className="pt-8 relative z-10">
              <a
                href={app.playStoreUrl}
                target="_blank"
                referrerPolicy="no-referrer"
                className="w-full py-4 bg-white hover:bg-stone-50 text-stone-900 rounded-2xl text-xs font-bold tracking-wider uppercase transition cursor-pointer flex items-center justify-center space-x-3 shadow-lg group active:scale-98"
              >
                <Download size={15} className="text-stone-900" />
                <span>Instalar via Google Play</span>
                <ArrowRight size={14} className="text-stone-500 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      {/* FEEDBACK & CONTRIBUTE CALL TO ACTION CARD */}
      <div className="bg-white border border-stone-200/55 p-8 md:p-10 rounded-3xl text-left space-y-6 max-w-4xl mx-auto shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#C08261]/5 to-transparent pointer-events-none rounded-bl-full animate-pulse" />

        <div className="space-y-3">
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[9px] uppercase font-mono tracking-wider font-extrabold text-[#C08261] bg-[#C08261]/10 w-fit">
            <Sparkles size={11} />
            <span>Participando da Missão</span>
          </span>
          <h4 className="font-serif text-xl md:text-2xl font-bold text-stone-850">
            Estamos apenas começando e você faz parte desse Despertar!
          </h4>
          <p className="text-stone-600 text-xs md:text-sm leading-relaxed">
            A Bíblia do Despertar e O Despertar estão em constante construção. Novos recursos, estudos, planos de leitura, ferramentas e experiências estão sendo desenvolvidos para tornar este ecossistema cada vez mais útil para sua jornada espiritual.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          <div className="bg-stone-50/50 border border-stone-150 rounded-2xl p-5 space-y-2">
            <div className="text-lg">⭐</div>
            <h5 className="font-serif text-xs font-bold text-stone-800">Avaliações de Coração</h5>
            <p className="text-[10px] text-stone-500 leading-normal">
              Cada avaliação ajuda o aplicativo a romper barreiras de algoritmos e alcançar cada vez mais corações pelo mundo.
            </p>
          </div>

          <div className="bg-stone-50/50 border border-stone-150 rounded-2xl p-5 space-y-2">
            <div className="text-lg">📤</div>
            <h5 className="font-serif text-xs font-bold text-stone-800">Partilhar nos Grupos</h5>
            <p className="text-[10px] text-stone-500 leading-normal">
              Cada compartilhamento com amigos ou famílias ajuda a Palavra Viva do Pai a chegar onde ela mais faz falta.
            </p>
          </div>

          <div className="bg-stone-50/50 border border-stone-150 rounded-2xl p-5 space-y-2">
            <div className="text-lg">💡</div>
            <h5 className="font-serif text-xs font-bold text-stone-800">Sugerir Funcionalidades</h5>
            <p className="text-[10px] text-stone-500 leading-normal">
              Cada nova ideia ou sugestão enviada via nossas Mesas é carinhosamente analisada para construir um app melhor para todos.
            </p>
          </div>
        </div>

        <div className="text-[11px] text-stone-500 leading-relaxed text-center pt-2 italic">
          "O mundo não precisa de mais distrações cotidianas. O mundo precisa despertar. E tudo começa com uma única Palavra divina."
        </div>
      </div>
    </div>
  );
}
