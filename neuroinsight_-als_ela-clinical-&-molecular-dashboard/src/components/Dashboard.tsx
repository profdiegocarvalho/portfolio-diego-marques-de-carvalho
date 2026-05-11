import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { 
  Activity, AlertCircle, Beaker, ChevronRight, 
  Dna, FileText, User as UserIcon, LogOut,
  ArrowDown, UserPlus, ClipboardList
} from 'lucide-react';
import { MOCK_PATIENTS, ALS_PROTEINS_LIST } from '../mockData';
import { calculateDeclineRate, isFccCritical, calculateWeightLossPct } from '../services/clinicalService';
import ProteinViewer from './ProteinViewer';
import { logout } from '../services/authService';
import PatientModal from './PatientModal';
import ALSFRS_TestModal from './ALSFRS_TestModal';
import CVF_TestModal from './CVF_TestModal';

const Dashboard: React.FC<{ user: any }> = ({ user }) => {
  const [patients, setPatients] = useState(MOCK_PATIENTS);
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0].id);
  const [selectedProtein, setSelectedProtein] = useState(ALS_PROTEINS_LIST[0]);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showCVFModal, setShowCVFModal] = useState(false);

  const patient = useMemo(() => 
    patients.find(p => p.id === selectedPatientId) || patients[0]
  , [selectedPatientId, patients]);

  const stats = useMemo(() => {
    if (!patient.history || patient.history.length === 0) {
      return { declineRate: 0, isCriticalFvc: false, lastFvc: 0, weightLoss: 0 };
    }
    const alsfrsHistory = patient.history.map(h => ({ date: h.date, score: h.score }));
    const declineRate = calculateDeclineRate(alsfrsHistory);
    const lastFvc = patient.history[patient.history.length - 1].fvc;
    const initialWeight = patient.history[0].weight;
    const lastWeight = patient.history[patient.history.length - 1].weight;
    const weightLoss = calculateWeightLossPct(initialWeight, lastWeight);
    
    return {
      declineRate,
      isCriticalFvc: isFccCritical(lastFvc),
      lastFvc,
      weightLoss
    };
  }, [patient]);

  const chartData = useMemo(() => {
    return patient.history.map((h, idx) => {
      const prev = idx > 0 ? patient.history[idx - 1] : null;
      const delta = prev ? h.score - prev.score : 0;
      
      return {
        name: h.date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        fullDate: h.date.toLocaleDateString('pt-BR'),
        alsfrs: h.score,
        fvc: h.fvc,
        delta: delta,
        weight: h.weight
      };
    });
  }, [patient]);

  // Cálculo de domínios (assumindo distribuição uniforme para o mock, 
  // mas preparado para dados reais se integrados futuramente)
  const domainData = useMemo(() => {
    const lastScore = stats.lastFvc; // Apenas para contexto
    const score = patient.history[patient.history.length - 1].score;
    
    // Distribuição estimada baseada no score total para o mock
    // Em um cenário real, isso viria do array 'responses' salvo nos testes
    return [
      { name: 'Bulbar', value: Math.min(12, Math.ceil(score * 0.25)), color: '#3b82f6' },
      { name: 'Fino', value: Math.min(12, Math.floor(score * 0.25)), color: '#8b5cf6' },
      { name: 'Grosso', value: Math.min(12, Math.floor(score * 0.20)), color: '#ec4899' },
      { name: 'Resp', value: Math.min(12, Math.ceil(score * 0.30)), color: '#10b981' },
    ];
  }, [patient, stats]);

  const handleCreatePatient = (newPatient: any) => {
    setPatients([...patients, newPatient]);
    setSelectedPatientId(newPatient.id);
    setShowPatientModal(false);
  };

  const handleSaveTest = (result: any) => {
    const updatedPatients = patients.map(p => {
      if (p.id === selectedPatientId) {
        return {
          ...p,
          history: [...p.history, {
            date: new Date(result.timestamp),
            score: result.alsfrs_total,
            fvc: result.fvc_percent,
            weight: result.weight_kg
          }]
        };
      }
      return p;
    });
    setPatients(updatedPatients);
    setShowTestModal(false);
  };

  const handleSaveCVF = (fvcValue: number) => {
    const updatedPatients = patients.map(p => {
      if (p.id === selectedPatientId) {
        return {
          ...p,
          history: [...p.history, {
            date: new Date(),
            score: p.history[p.history.length - 1].score, // Repete o último score ALSFRS
            fvc: fvcValue,
            weight: p.history[p.history.length - 1].weight // Repete o último peso
          }]
        };
      }
      return p;
    });
    setPatients(updatedPatients);
    setShowCVFModal(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col">
      {/* Navbar */}
      <header className="h-16 border-b border-black/10 flex items-center justify-between px-8 bg-white sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black rounded-sm flex items-center justify-center">
            <Activity className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold uppercase tracking-tighter">NeuroInsight <span className="font-normal opacity-50">/ Pesquisa ELA</span></h1>
            <p className="text-[10px] text-black/50 font-mono -mt-1 leading-none">V1.04 ALPHA_PESQUISA_BR</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden md:block">
            <p className="text-[11px] font-semibold leading-none">{user.displayName || 'Pesquisador'}</p>
            <p className="text-[9px] text-black/40 font-mono tracking-widest uppercase">{user.email}</p>
          </div>
          <button 
            onClick={() => logout()}
            className="p-2 hover:bg-red-50 text-red-400 rounded-full transition-colors group"
            title="Sair"
          >
            <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar - Pacientes */}
        <aside className="w-80 border-r border-black/10 bg-white flex flex-col shrink-0">
          <div className="p-6 border-b border-black/5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] font-mono uppercase tracking-[0.2em] text-black/40">Coorte de Pacientes</h2>
              <button 
                onClick={() => setShowPatientModal(true)}
                className="p-1.5 hover:bg-black text-black hover:text-white border border-black/10 rounded transition-all"
                title="Cadastrar Paciente"
              >
                <UserPlus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {patients.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPatientId(p.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedPatientId === p.id 
                      ? 'border-black bg-black text-white shadow-lg' 
                      : 'border-black/5 hover:border-black/20 hover:bg-black/[0.02]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{p.initials}</span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                      selectedPatientId === p.id ? 'bg-white/20' : 'bg-black/5'
                    }`}>
                      {p.id}
                    </span>
                  </div>
                  <p className={`text-[10px] mt-1 ${selectedPatientId === p.id ? 'text-white/60' : 'text-black/40'}`}>
                    {p.geneticProfile}
                  </p>
                </button>
              ))}
            </div>
          </div>
          
          <div className="p-6 mt-auto">
             <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4">
               <div className="flex gap-2 text-amber-800">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p className="text-[11px] leading-tight font-medium">CONFORMIDADE LGPD: Certifique-se de que todos os dados permaneçam anonimizados.</p>
               </div>
             </div>
             <button 
               onClick={() => setShowCVFModal(true)}
               className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-emerald-700 transition-colors mb-3"
             >
               <ClipboardList className="w-4 h-4" />
               Registrar CVF
             </button>
             <button 
               onClick={() => setShowTestModal(true)}
               className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-colors"
             >
               <ClipboardList className="w-4 h-4" />
               Novo Teste ALSFRS-R
             </button>
          </div>
        </aside>

        {/* Área de Conteúdo */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#F8F7F4]">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Overview do Paciente */}
            <section className="technical-grid rounded-xl overflow-hidden shadow-sm">
              <div className="grid-cell col-span-12 md:col-span-4 flex flex-col justify-between">
                <div>
                  <h3 className="serif-header text-2xl mb-1">{patient.initials}</h3>
                  <p className="text-[11px] text-black/40 font-mono tracking-wider">MEMBRO DA COORTE DE PESQUISA {patient.id}</p>
                </div>
                <div className="mt-8 space-y-4">
                   <div className="flex justify-between items-end border-b border-black/5 pb-2">
                      <span className="text-[10px] uppercase font-mono text-black/40">Data do Diagnóstico</span>
                      <span className="text-xs font-semibold">{patient.diagnosisDate}</span>
                   </div>
                   <div className="flex justify-between items-end border-b border-black/5 pb-2">
                      <span className="text-[10px] uppercase font-mono text-black/40">Perfil Genético</span>
                      <div className="flex items-center gap-1.5 text-xs font-semibold">
                        <Dna className="w-3 h-3 text-blue-500" />
                        {patient.geneticProfile}
                      </div>
                   </div>
                </div>
              </div>

              {/* Cards de KPI */}
              <div className="grid-cell col-span-12 md:col-span-8 grid grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-black/40 uppercase mb-2">Declínio ALSFRS-R</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-light mono-data">{stats.declineRate.toFixed(2)}</span>
                    <span className="text-[10px] text-black/40 uppercase">Pts/Mês</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-red-500 font-medium">
                    <ArrowDown className="w-3 h-3" />
                    TENDÊNCIA DE QUEDA
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-black/40 uppercase mb-2">Capacidade CVF</span>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-3xl font-light mono-data ${stats.isCriticalFvc ? 'text-red-500 font-bold' : ''}`}>
                      {stats.lastFvc}%
                    </span>
                  </div>
                  {stats.isCriticalFvc && (
                    <div className="mt-2 px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded text-[9px] font-bold uppercase w-fit">
                      LIMITE CRÍTICO CVF
                    </div>
                  )}
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-black/40 uppercase mb-2">Variação Ponderal</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-light mono-data">-{stats.weightLoss.toFixed(1)}%</span>
                  </div>
                  <p className="text-[9px] text-black/40 mt-1 uppercase italic leading-tight text-balance">Calculado desde a linha de base diagnóstica</p>
                </div>
              </div>
            </section>

            {/* Seção de Gráficos e Molecular */}
            <div className="grid grid-cols-12 gap-8">
              {/* Trend Chart Detalhado */}
              <div className="col-span-12 lg:col-span-8 space-y-6">
                <div className="bg-white border border-black/10 rounded-xl p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                        <Activity className="w-4 h-4 text-black/40" />
                        Evolução Clínica Detalhada
                      </h3>
                      <p className="text-[10px] text-black/40 font-mono mt-1 uppercase">Monitoramento Longitudinal ALSFRS-R vs CVF</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-[10px] font-mono">ALSFRS-R</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-mono">CVF %</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorAls" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorFvc" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#eee" />
                        <XAxis 
                          dataKey="name" 
                          fontSize={9} 
                          tickLine={false} 
                          axisLine={false}
                          fontFamily="JetBrains Mono"
                          dy={10}
                        />
                        <YAxis 
                          fontSize={9} 
                          tickLine={false} 
                          axisLine={false}
                          fontFamily="JetBrains Mono"
                          domain={[0, 100]}
                        />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-white p-3 border border-black/10 shadow-xl rounded-lg font-sans">
                                  <p className="text-[10px] font-mono mb-2 text-black/40">{data.fullDate}</p>
                                  <div className="space-y-1">
                                    <div className="flex justify-between gap-4">
                                      <span className="text-xs font-medium">ALSFRS-R:</span>
                                      <span className="text-xs font-bold text-blue-600">{data.alsfrs} pts</span>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                      <span className="text-xs font-medium">CVF:</span>
                                      <span className="text-xs font-bold text-emerald-600">{data.fvc}%</span>
                                    </div>
                                    {data.delta !== 0 && (
                                      <div className={`text-[10px] font-bold uppercase mt-2 pt-1 border-t border-black/5 ${data.delta < 0 ? 'text-red-500' : 'text-green-500'}`}>
                                        Variação: {data.delta > 0 ? '+' : ''}{data.delta} pts
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="fvc" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorFvc)" 
                          activeDot={{ r: 4, strokeWidth: 0 }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="alsfrs" 
                          stroke="#3b82f6" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorAls)" 
                          activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Painel de Domínios */}
                <div className="grid grid-cols-4 gap-4">
                  {domainData.map((d) => (
                    <div key={d.name} className="bg-white border border-black/10 rounded-xl p-4 shadow-sm group hover:border-black transition-colors">
                      <p className="text-[9px] font-mono uppercase tracking-widest text-black/40 mb-1">{d.name}</p>
                      <div className="flex items-baseline justify-between">
                        <span className="text-xl font-bold mono-data">{d.value}</span>
                        <span className="text-[9px] font-mono text-black/20">/ 12</span>
                      </div>
                      <div className="mt-3 h-1 w-full bg-black/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-1000" 
                          style={{ width: `${(d.value/12)*100}%`, backgroundColor: d.color }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visualizador Molecular */}
              <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
                <div className="bg-white border border-black/10 rounded-xl p-6 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                      <Beaker className="w-4 h-4 text-black/40" />
                      Explorador AlphaFold
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {ALS_PROTEINS_LIST.map(prot => (
                      <button
                        key={prot.id}
                        onClick={() => setSelectedProtein(prot)}
                        className={`text-[10px] py-2 px-3 rounded border font-mono transition-all ${
                          selectedProtein.id === prot.id
                            ? 'bg-black text-white border-black'
                            : 'bg-white border-black/5 hover:bg-black/5'
                        }`}
                      >
                        {prot.name}
                      </button>
                    ))}
                  </div>

                  <ProteinViewer pdbId={selectedProtein.id} name={selectedProtein.name} />
                  
                  <div className="mt-4 p-4 bg-blue-50/50 rounded-lg border border-blue-100 italic text-[11px] text-blue-900 leading-relaxed">
                    "A visualização do dobramento espacial de {selectedProtein.name} via AlphaFold ajuda a identificar pontos de mutação e domínios de agregação críticos para a neurodegeneração."
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modais */}
      {showPatientModal && (
        <PatientModal 
          onClose={() => setShowPatientModal(false)}
          onSave={handleCreatePatient}
        />
      )}
      {showTestModal && (
        <ALSFRS_TestModal 
          patientName={patient.initials}
          onClose={() => setShowTestModal(false)}
          onSave={handleSaveTest}
        />
      )}
      {showCVFModal && (
        <CVF_TestModal
          patientName={patient.initials}
          onClose={() => setShowCVFModal(false)}
          onSave={handleSaveCVF}
        />
      )}
    </div>
  );
};

export default Dashboard;
