import React, { useState } from 'react';
import { X, Wind, AlertTriangle, Save } from 'lucide-react';
import { isFccCritical } from '../services/clinicalService';

interface CVFModalProps {
  patientName: string;
  onClose: () => void;
  onSave: (fvc: number) => void;
}

const CVF_TestModal: React.FC<CVFModalProps> = ({ patientName, onClose, onSave }) => {
  const [fvc, setFvc] = useState<number>(80);
  const isCritical = isFccCritical(fvc);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCritical) {
      alert("ATENÇÃO: Capacidade Vital Forçada (CVF) abaixo do limite crítico (50%). Verifique a necessidade de suporte respiratório imediato.");
    }
    onSave(fvc);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-black/5 flex items-center justify-between bg-emerald-600 text-white">
          <div className="flex items-center gap-3">
            <Wind className="w-5 h-5" />
            <div>
              <h2 className="text-lg font-bold uppercase tracking-tight">Teste de CVF</h2>
              <p className="text-[10px] font-mono text-white/50 uppercase tracking-wider">Paciente: {patientName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="text-center">
            <label className="text-[10px] font-mono uppercase tracking-widest text-black/40 mb-3 block">Porcentagem da Capacidade Vital Forçada</label>
            <div className="relative inline-block">
              <input 
                type="number"
                min="0"
                max="120"
                required
                className={`w-32 text-center text-5xl font-mono font-bold p-2 bg-transparent border-b-2 transition-colors focus:outline-none ${
                    isCritical ? 'border-red-500 text-red-600' : 'border-black/10 focus:border-emerald-500'
                }`}
                value={fvc}
                onChange={e => setFvc(Number(e.target.value))}
              />
              <span className="absolute -right-6 bottom-2 font-mono text-xl text-black/20">%</span>
            </div>
          </div>

          {isCritical && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 text-red-800">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase">Alerta de Limite Crítico</p>
                <p className="text-[11px] leading-tight">Valor abaixo de 50%. Recomenda-se avaliação imediata para necessidade de Suporte Ventilatório Não-Invasivo (VNI).</p>
              </div>
            </div>
          )}

          {!isCritical && fvc < 70 && (
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3 text-amber-800">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase">Atenção Médica</p>
                <p className="text-[11px] leading-tight">Capacidade respiratória em declínio. Monitore sinais de dispneia noturna.</p>
              </div>
            </div>
          )}

          <button 
            type="submit"
            className="w-full py-4 bg-black text-white rounded-xl font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Registrar Medição
          </button>
        </form>
      </div>
    </div>
  );
};

export default CVF_TestModal;
