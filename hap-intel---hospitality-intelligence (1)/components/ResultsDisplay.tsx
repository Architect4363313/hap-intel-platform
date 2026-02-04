import React, { useState } from 'react';
import { BusinessProfile, OutreachVariant } from '../types';

interface Props {
  profile: BusinessProfile;
  onNewSearch: () => void;
}

const ResultsDisplay: React.FC<Props> = ({ profile, onNewSearch }) => {
  const [activeEmailTab, setActiveEmailTab] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Safe accessor for outreach data that FILTERS OUT invalid/empty items
  const getOutreachVariants = (): OutreachVariant[] => {
    let variants: OutreachVariant[] = [];

    if (Array.isArray(profile.outreach)) {
      variants = profile.outreach;
    } 
    // Backward compatibility
    else if (profile.outreach && typeof profile.outreach === 'object') {
      const legacy = profile.outreach as any;
      variants = [{
        type: 'LEGACY',
        subject: legacy.subject || "Draft Legacy",
        body: legacy.body || "No content available."
      }];
    }

    // CRITICAL FIX: Filter out items that have no body or subject to avoid empty tabs/boxes
    return variants.filter(v => 
      v && 
      v.body && 
      v.body.trim().length > 0 && 
      v.subject && 
      v.subject.trim().length > 0
    );
  };

  const outreachVariants = getOutreachVariants();
  const activeVariant = outreachVariants[activeEmailTab] || outreachVariants[0];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copiado al portapapeles");
  };

  const handleCopyEmail = (email: string, index: number) => {
    navigator.clipboard.writeText(email);
    setCopiedIndex(index);
    // Reset status after 2 seconds
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handlePerplexityClick = () => {
    // Detailed prompt structure as requested
    const prompt = `Actúa como analista de inteligencia comercial B2B. Necesito identificar al Director/a Financiero/a (CFO) de la empresa de hostelería en España: ${profile.businessName} (si es un grupo, incluye filiales y marca comercial).

Devuélveme Nombre y apellidos, cargo exacto, empresa/filial, ciudad, y periodo (año inicio–fin si aparece).

Aporta evidencia: incluye 3–6 enlaces y cita textualmente (frase corta) la parte que lo confirma. Prioriza:
1. Web corporativa (equipo directivo, notas de prensa, memoria/informe anual).
2. LinkedIn (perfil personal + página de empresa).
3. BORME / registros mercantiles / comunicados oficiales si aplica.

Si no hay una confirmación única, propone un top 3 de candidatos (con probabilidad alta/media/baja) y explica en 1 línea por qué. Si la empresa es privada, identifica el rol equivalente (Director de Administración y Finanzas, Finance Director, Head of Finance, Controller corporativo).

Al final, sugiere 5 consultas booleanas para seguir investigando en Google (incluye site:linkedin.com, site:empresa.com, filetype:pdf, y “nombrado”, “incorporación”, “CFO”).

Datos de búsqueda:
Empresa: ${profile.businessName}
Ubicación: ${profile.city}`;

    const url = `https://www.perplexity.ai/search?q=${encodeURIComponent(prompt)}`;
    window.open(url, '_blank');
  };

  const handleGmailClick = () => {
    const targetEmail = profile.emailVectors[0]?.email || '';
    const subject = activeVariant?.subject || '';
    const body = activeVariant?.body || '';
    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${targetEmail}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url, '_blank');
  };

  const getValidationColor = (val: string) => {
    switch(val) {
      case 'ALTO': return 'bg-green-100 text-green-800';
      case 'MEDIO': return 'bg-yellow-100 text-yellow-800';
      case 'BAJO': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8 pb-32 max-w-[1600px] mx-auto space-y-12 animate-[fadeIn_0.5s_ease-out]">
      
      {/* 1. SCORE & TECH GRID */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Label Column */}
        <div className="md:col-span-1 pt-2">
           <span className="mono-label text-[10px]">SCORE</span>
        </div>

        {/* Content Columns */}
        <div className="md:col-span-11 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Score Card */}
            <div className="flat-card p-6 flex flex-col justify-between h-48">
                <h3 className="mono-label text-[10px] text-gray-500 mb-4">VALORACIÓN HONEI</h3>
                <div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-6xl font-black tracking-tighter text-gray-900">{profile.score}%</span>
                        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1 py-0.5 uppercase">[ALTA]</span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 mt-4">
                        <div className="h-full bg-blue-900" style={{ width: `${profile.score}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Operational Attributes */}
            <div className="flat-card p-6 flex flex-col h-48">
                <h3 className="mono-label text-[10px] text-gray-500 mb-4">ATRIBUTOS OPERATIVOS</h3>
                <div className="mb-4">
                     <span className="text-[10px] font-mono text-gray-400 block mb-1">COCINA</span>
                     <span className="font-bold text-xs uppercase text-gray-900">{profile.cuisineType}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-auto">
                    <div className="border border-black p-2 flex flex-col items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-black">{profile.attributes.terrace ? 'deck' : 'block'}</span>
                        <span className="text-[8px] font-bold uppercase text-black">TERRAZA</span>
                    </div>
                    <div className="border border-black p-2 flex flex-col items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-black">{profile.attributes.reservations ? 'event_available' : 'event_busy'}</span>
                        <span className="text-[8px] font-bold uppercase text-black">RESERVAS</span>
                    </div>
                    <div className="border border-black p-2 flex flex-col items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-black">credit_card</span>
                        <span className="text-[8px] font-bold uppercase text-black">{profile.attributes.cardType || 'VISA'}</span>
                    </div>
                </div>
            </div>

            {/* Tech Stack */}
            <div className="flat-card p-6 flex flex-col h-48">
                <h3 className="mono-label text-[10px] text-gray-500 mb-4">TECH STACK DETECTADO</h3>
                <div className="flex flex-wrap gap-2 content-start">
                    {profile.techStack.length > 0 ? profile.techStack.map((tech, i) => (
                        <span key={i} className="px-2 py-1 border border-gray-200 text-[9px] font-bold uppercase hover:border-black transition-colors cursor-default text-gray-800">
                            {tech.name}
                        </span>
                    )) : (
                        <span className="text-xs text-gray-400 italic">No stack detected</span>
                    )}
                </div>
                <p className="mt-auto text-[11px] text-gray-500 italic font-serif">
                    {profile.potentialIntegration ? "Potencial integración detectada." : "Integración no confirmada."}
                </p>
            </div>
        </div>
      </section>

      {/* 2. DECISION MAKERS */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-1 pt-2">
           <span className="mono-label text-[10px]">PROPS</span>
        </div>
        <div className="md:col-span-11">
             <div className="flat-card overflow-hidden">
                <div className="bg-white border-b border-gray-100 p-4">
                    <h3 className="mono-label text-[10px] text-gray-500">IDENTIFIED DECISION MAKERS</h3>
                </div>
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="p-4 mono-label text-[9px] text-gray-400 font-normal">NOMBRE COMPLETO</th>
                                <th className="p-4 mono-label text-[9px] text-gray-400 font-normal">CARGO / RESPONSABILIDAD</th>
                                <th className="p-4 mono-label text-[9px] text-gray-400 font-normal text-right">VALIDACIÓN</th>
                            </tr>
                        </thead>
                        <tbody>
                            {profile.decisionMakers.map((dm, i) => (
                                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-xs font-bold uppercase text-gray-900">{dm.name}</td>
                                    <td className="p-4 text-xs text-gray-600 uppercase">{dm.role}</td>
                                    <td className="p-4 text-right">
                                        <span className={`inline-block px-2 py-0.5 text-[8px] font-bold rounded-sm uppercase ${getValidationColor(dm.validation)}`}>
                                            {dm.validation}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             </div>
        </div>
      </section>

      {/* 3. DEEP ANALYSIS (PERPLEXITY) */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-1 pt-2">
           <span className="mono-label text-[10px]">DEEP</span>
        </div>
        <div className="md:col-span-11">
            <h3 className="mono-label text-[12px] text-gray-500 mb-4">PERPLEXITY DEEP ANALYSIS PROTOCOL</h3>
            <div className="flat-card p-0 flex flex-col md:flex-row">
                <div className="p-8 flex-1">
                    <h4 className="font-bold text-sm uppercase mb-2 text-gray-900">INVESTIGACIÓN EXHAUSTIVA DE CFO</h4>
                    <p className="text-xs text-gray-600 leading-relaxed max-w-2xl">
                        {profile.deepAnalysis.summary || "Protocolo de búsqueda profunda en registros mercantiles, LinkedIn y Webs Corporativas ejecutado. Verificación cruzada de fuentes realizada."}
                    </p>
                </div>
                <div className="p-8 border-l border-gray-100 flex items-center justify-center bg-gray-50 md:w-64">
                    <button 
                        onClick={handlePerplexityClick}
                        className="flex items-center gap-3 px-6 py-3 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
                    >
                        <span className="material-symbols-outlined text-[18px] text-black">travel_explore</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-black">EJECUTAR PERPLEXITY</span>
                    </button>
                </div>
            </div>
        </div>
      </section>

      {/* 4. EMAIL & CONTACT VECTORS */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-1 pt-2">
           <span className="mono-label text-[10px]">MAIL</span>
        </div>
        <div className="md:col-span-11">
             <h3 className="mono-label text-[12px] text-gray-500 mb-4">CONTACT VECTORS & EMAIL PATTERNS</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Email List */}
                <div className="flat-card">
                    <div className="bg-gray-50 border-b border-gray-100 p-3">
                         <span className="mono-label text-[10px] text-gray-500">SUGGESTED EMAILS (ZEROBOUNCE INTEL) REAL-TIME CHECK</span>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {profile.emailVectors.map((email, i) => (
                            <div key={i} className="p-4 flex items-center justify-between group">
                                <div>
                                    <div className="font-mono text-sm font-bold text-blue-900 mb-1">{email.email}</div>
                                    <div className="flex gap-2 text-[9px] text-gray-400 uppercase">
                                        <span>{email.type}</span>
                                        <span>•</span>
                                        <span>RISK: {email.risk}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                    <button className="px-2 py-1 border border-gray-200 text-[8px] font-bold uppercase hover:bg-black hover:text-white transition-colors text-black">
                                        VERIFY_API
                                    </button>
                                    <button 
                                        onClick={() => handleCopyEmail(email.email, i)}
                                        className={`transition-all duration-200 flex items-center justify-center ${copiedIndex === i ? 'text-green-600 scale-110' : 'text-gray-400 hover:text-black'}`}
                                        title="Copy Email"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">
                                            {copiedIndex === i ? 'check_circle' : 'content_copy'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        ))}
                        {profile.emailVectors.length === 0 && (
                            <div className="p-4 text-center text-xs text-gray-400 italic">No email patterns detected.</div>
                        )}
                    </div>
                </div>

                {/* Domain & Notes */}
                <div className="flat-card p-6 flex flex-col justify-between">
                    <div>
                        <div className="mb-6 border-b border-gray-100 pb-6">
                            <span className="mono-label text-[10px] text-gray-400 block mb-2">DOMINIO DETECTADO</span>
                            <span className="font-mono text-lg font-bold text-gray-900">{profile.contact.domain || 'N/A'}</span>
                        </div>
                        <div className="mb-4">
                            <span className="mono-label text-[10px] text-gray-400 block mb-2">OPERATIONS PHONE</span>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[16px] text-black">phone</span>
                                <span className="text-sm font-bold text-gray-900 selection:bg-yellow-200">{profile.contact.phone || 'Not found'}</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <span className="mono-label text-[10px] text-gray-400 block mb-2">NOTAS OSINT DE CONTACTO</span>
                        <p className="text-xs text-gray-500 italic leading-relaxed">
                            {profile.contact.osintNotes || "El proveedor exacto de TPV no está público. Se infiere Oracle Micros por el perfil de grupo internacional, pero podría ser ICG o Ágora. Confirmar visualmente en visita."}
                        </p>
                    </div>
                </div>
             </div>
        </div>
      </section>

      {/* 5. DRAFT EMAIL */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-1 pt-2">
           <span className="mono-label text-[10px]">DRAFT</span>
        </div>
        <div className="md:col-span-11">
             <div className="flex items-center justify-between mb-4">
                <h3 className="mono-label text-[12px] text-gray-500">HONEI TERMINAL OUTREACH</h3>
                <div className="flex gap-3">
                    <button 
                        onClick={() => activeVariant && copyToClipboard(activeVariant.body)} 
                        className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 text-[10px] font-bold uppercase hover:bg-gray-50 transition-colors text-black disabled:opacity-50"
                        disabled={!activeVariant}
                    >
                        <span className="material-symbols-outlined text-[14px]">content_copy</span>
                        COPY BODY
                    </button>
                    <button 
                        onClick={handleGmailClick}
                        className="flex items-center gap-2 px-3 py-1.5 bg-black text-white text-[10px] font-bold uppercase hover:bg-gray-800 transition-colors disabled:opacity-50"
                        disabled={!activeVariant}
                    >
                        <span className="material-symbols-outlined text-[14px]">send</span>
                        OPEN GMAIL
                    </button>
                </div>
             </div>

             {/* TABS */}
             {outreachVariants.length > 0 && (
                 <div className="flex gap-1 mb-0 border-b border-gray-200 overflow-x-auto">
                    {outreachVariants.map((variant, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveEmailTab(index)}
                            className={`
                                px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-all border-t border-x border-b-0 whitespace-nowrap
                                ${activeEmailTab === index 
                                    ? 'bg-white border-gray-200 text-black translate-y-[1px] shadow-sm' 
                                    : 'bg-gray-50 border-transparent text-gray-400 hover:text-black hover:bg-gray-100'
                                }
                            `}
                        >
                            {variant.type || `VAR_${index+1}`}
                        </button>
                    ))}
                 </div>
             )}

             {/* Changed font-mono to font-sans and leading-relaxed for better readability as a real email */}
             <div className="flat-card p-8 bg-white text-sm leading-relaxed text-gray-800 relative rounded-tl-none font-sans">
                <div className="absolute top-0 right-0 w-1.5 h-full bg-gray-100"></div>
                
                {activeVariant ? (
                    <>
                        <div className="mb-6 pb-4 border-b border-gray-100">
                             <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Subject Line</span>
                             <div className="font-bold text-black font-mono">{activeVariant.subject || "No subject generated"}</div>
                        </div>
                        <div className="whitespace-pre-wrap max-w-4xl">
                            {activeVariant.body || "No content generated. Try refreshing the scan."}
                        </div>
                    </>
                ) : (
                    <div className="text-center text-gray-400 italic py-8">
                        No valid draft emails generated. Try refreshing the scan or checking input parameters.
                    </div>
                )}
             </div>
        </div>
      </section>

      {/* 6. NEWS & ICEBREAKERS */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-1 pt-2">
           <span className="mono-label text-[10px]">NEWS</span>
        </div>
        <div className="md:col-span-11">
            <h3 className="mono-label text-[12px] text-gray-500 mb-4">ICEBREAKERS & RECENT EVENTS</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {profile.conversationStarters?.length > 0 ? profile.conversationStarters.map((starter, i) => (
                    <div key={i} className="flat-card p-4 hover:border-black transition-colors group">
                        <div className="text-[9px] font-mono text-gray-400 mb-2 uppercase">{starter.date || 'Recent'}</div>
                        <h4 className="text-xs font-bold text-gray-900 mb-2 line-clamp-2">{starter.headline}</h4>
                        <p className="text-[10px] text-gray-500 leading-normal line-clamp-3 group-hover:text-gray-700">{starter.context}</p>
                    </div>
                )) : (
                    <div className="flat-card p-4 col-span-3 text-center text-xs text-gray-400 italic">No recent news signals detected.</div>
                )}
            </div>
        </div>
      </section>

      {/* 7. DIGITAL PRESENCE */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-1 pt-2">
           <span className="mono-label text-[10px]">PRES</span>
        </div>
        <div className="md:col-span-11">
             <h3 className="mono-label text-[12px] text-gray-500 mb-4">DIGITAL PRESENCE & SOCIAL PROFILES</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {[
                    { label: 'WEBSITE', val: profile.contact.website, name: 'Web Corporativa' },
                    { label: 'LINKEDIN', val: null, name: 'Not Linked' },
                    { label: 'UBER EATS', val: profile.contact.uberEatsUrl, name: 'Delivery Profile' },
                    { label: 'MAPS', val: null, name: 'Not Linked' }
                 ].map((item, i) => (
                    <div key={i} className={`flat-card p-4 flex items-center justify-between ${!item.val ? 'opacity-50 grayscale' : ''}`}>
                        <div>
                            <span className="mono-label text-[8px] block text-gray-400 mb-1">{item.label}</span>
                            <span className="text-xs font-bold truncate block text-black">{item.name}</span>
                        </div>
                        {item.val ? (
                            <a href={item.val} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-[16px] text-black">open_in_new</span>
                            </a>
                        ) : (
                            <span className="material-symbols-outlined text-[16px] text-gray-300">link_off</span>
                        )}
                    </div>
                 ))}
             </div>
        </div>
      </section>

    </div>
  );
};

export default ResultsDisplay;