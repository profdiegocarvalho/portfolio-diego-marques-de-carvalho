import React, { useState } from 'react';
import { X, ClipboardCheck, ChevronRight, ChevronLeft, Save } from 'lucide-react';
import { ALSFRS_R_QUESTIONS } from '../services/clinicalService';

interface TestModalProps {
  patientName: string;
  onClose: () => void;
  onSave: (entry: any) => void;
}

const ALSFRS_TestModal: React.FC<TestModalProps> = ({ patientName, onClose, onSave }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [fvc, setFvc] = useState<number>(100);
  const [weight, setWeight] = useState<number>(70);

  const totalScore = Object.values(scores).reduce((a: number, b: number) => a + b, 0);
  const progress = ((Object.keys(scores).length) / ALSFRS_R_QUESTIONS.length) * 100;

  const handleSelect = (questionId: number, value: number) => {
    setScores(prev => ({ ...prev, [questionId]: value }));
    if (currentStep < ALSFRS_R_QUESTIONS.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 300);
    }
  };

  const handleFinalSave = () => {
    onSave({
      timestamp: new Date().toISOString(),
      alsfrs_total: totalScore,
      fvc_percent: fvc,
      weight_kg: weight,
      responses: scores
    });
  };

  const question = ALSFRS_R_QUESTIONS[currentStep];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-black/5 flex items-center justify-between bg-black text-white">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="w-6 h-6 text-blue-400" />
            <div>
              <h2 className="text-lg font-bold uppercase tracking-tight">Avaliação ALSFRS-R</h2>
              <p className="text-[10px] font-mono text-white/50 uppercase tracking-wider">Paciente: {patientName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-black/5 w-full">
          <div 
            className="h-full bg-blue-500 transition-all duration-500" 
            style={{ width: `${progress}%` }} 
          />
        </div>

        {/* Test Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {currentStep < ALSFRS_R_QUESTIONS.length ? (
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <span className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-mono text-sm">
                  {question.id}
                </span>
                <h3 className="text-xl font-semibold">{question.label}</h3>
              </div>

              <div className="grid gap-3">
                {question.options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleSelect(question.id, opt.value)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${
                      scores[question.id] === opt.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-black/5 hover:border-black/20 hover:bg-black/[0.02]'
                    }`}
                  >
                    <span className="text-sm font-medium">{opt.label}</span>
                    <span className={`font-mono text-xs px-2 py-1 rounded ${
                      scores[question.id] === opt.value ? 'bg-blue-500 text-white' : 'bg-black/5 text-black/40'
                    }`}>
                      {opt.value} pts
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8 py-4">
               <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold">Resumo da Avaliação</h3>
                  <div className="inline-block px-6 py-3 bg-blue-600 text-white rounded-2xl text-4xl font-mono font-bold shadow-lg">
                    {totalScore} / 48
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-6 pt-4">
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-black/40 mb-2 block">Capacidade Vital Forçada (CVF %)</label>
                    <input 
                      type="number"
                      className="w-full p-4 bg-black/5 border border-black/10 rounded-xl font-mono text-xl"
                      value={fvc}
                      onChange={e => setFvc(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-black/40 mb-2 block">Peso Atual (kg)</label>
                    <input 
                      type="number"
                      className="w-full p-4 bg-black/5 border border-black/10 rounded-xl font-mono text-xl"
                      value={weight}
                      onChange={e => setWeight(Number(e.target.value))}
                    />
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-6 border-t border-black/5 bg-[#F8F7F4] flex justify-between items-center">
          <button
            disabled={currentStep === 0}
            onClick={() => setCurrentStep(prev => prev - 1)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-black/40 hover:text-black disabled:opacity-0"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>

          {currentStep < ALSFRS_R_QUESTIONS.length ? (
            <button
              disabled={scores[question.id] === undefined}
              onClick={() => setCurrentStep(prev => prev + 1)}
              className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-full text-sm font-bold disabled:opacity-30"
            >
              Próximo
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinalSave}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-full text-sm font-bold shadow-lg hover:scale-105 transition-transform"
            >
              <Save className="w-4 h-4" />
              Salvar Resultados
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ALSFRS_TestModal;
