import React, { useState } from 'react';
import { X, UserPlus, Calendar, Dna } from 'lucide-react';

interface PatientModalProps {
  onClose: () => void;
  onSave: (patient: any) => void;
}

const PatientModal: React.FC<PatientModalProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    initials: '',
    diagnosisDate: new Date().toISOString().split('T')[0],
    geneticProfile: 'Esporádica',
    id: `ALS-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      status: 'ativo',
      history: []
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-black/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black rounded-lg">
              <UserPlus className="text-white w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold uppercase tracking-tight">Novo Cadastro</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-[10px] font-mono uppercase tracking-widest text-black/40 mb-1 block">Iniciais do Paciente</label>
            <input 
              required
              placeholder="Ex: A.B.C."
              className="w-full p-3 bg-black/5 border border-black/10 rounded-lg focus:outline-none focus:border-black"
              value={formData.initials}
              onChange={e => setFormData({...formData, initials: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-black/40 mb-1 block">Data de Diagnóstico</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20" />
                <input 
                  type="date"
                  className="w-full p-3 pl-10 bg-black/5 border border-black/10 rounded-lg focus:outline-none focus:border-black text-sm"
                  value={formData.diagnosisDate}
                  onChange={e => setFormData({...formData, diagnosisDate: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-black/40 mb-1 block">ID do Sistema</label>
              <input 
                disabled
                className="w-full p-3 bg-black/5 border border-black/10 rounded-lg italic text-black/40 text-sm"
                value={formData.id}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase tracking-widest text-black/40 mb-1 block">Perfil Genético</label>
            <div className="relative">
              <Dna className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20" />
              <select 
                className="w-full p-3 pl-10 bg-black/5 border border-black/10 rounded-lg focus:outline-none focus:border-black text-sm appearance-none"
                value={formData.geneticProfile}
                onChange={e => setFormData({...formData, geneticProfile: e.target.value})}
              >
                <option value="Esporádica">Esporádica</option>
                <option value="Mutação SOD1">Mutação SOD1</option>
                <option value="Mutação C9orf72">Mutação C9orf72</option>
                <option value="Mutação TDP-43">Mutação TDP-43</option>
                <option value="FUS/TLS">FUS/TLS</option>
              </select>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-black text-white rounded-xl font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg mt-4"
          >
            Finalizar Cadastro
          </button>
        </form>
      </div>
    </div>
  );
};

export default PatientModal;
