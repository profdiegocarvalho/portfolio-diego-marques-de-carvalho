import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { loginWithGoogle, useAuthListener } from './services/authService';
import Dashboard from './components/Dashboard';
import { Activity, ShieldCheck, Microscope, TestTube2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { runClinicalTests } from './services/clinicalTests';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [showTests, setShowTests] = useState(false);

  useEffect(() => {
    const unsubscribe = useAuthListener((u) => {
      setUser(u);
      setLoading(false);
    });

    // Run clinical unit tests on initialization
    const results = runClinicalTests();
    setTestResults(results);
    console.table(results);

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Activity className="w-8 h-8 text-black/20" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex flex-col">
        {/* Landing/Login Hero */}
        <div className="flex-1 flex flex-col md:flex-row">
          <div className="md:w-1/2 p-12 md:p-24 flex flex-col justify-center">
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-8">
              <Microscope className="text-white w-7 h-7" />
            </div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-serif italic text-6xl md:text-7xl mb-8 leading-tight tracking-tighter"
            >
              O futuro da <br/> 
              <span className="text-blue-600">pesquisa em ELA</span> <br/>
              é interativo.
            </motion.h1>
            <p className="text-black/50 max-w-md mb-12 text-lg leading-relaxed">
              O NeuroInsight combina dados clínicos longitudinais com visualização molecular AlphaFold para oferecer aos pesquisadores uma visão holística da neurodegeneração.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <button
                onClick={() => loginWithGoogle()}
                className="px-8 py-4 bg-black text-white rounded-full font-semibold hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-xl"
              >
                <ShieldCheck className="w-5 h-5" />
                Login do Pesquisador
              </button>
              <button 
                onClick={() => setShowTests(!showTests)}
                className="px-6 py-2 text-xs font-mono uppercase tracking-widest text-black/40 hover:text-black transition-colors"
              >
                {showTests ? 'Ocultar Testes de Engine' : 'Ver Testes de Integridade'}
              </button>
            </div>

            {showTests && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-8 p-4 bg-white border border-black/10 rounded-xl font-mono text-[10px]"
              >
                <p className="mb-2 text-black/40 font-bold">LOG_INTEGRIDADE_SISTEMA.LOG</p>
                {testResults.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 mb-1">
                    {t.passed ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <AlertTriangle className="w-3 h-3 text-red-500" />}
                    <span className={t.passed ? 'text-green-700' : 'text-red-700'}>
                      [{t.passed ? 'SUCESSO' : 'FALHA'}] {t.name}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
          
          <div className="md:w-1/2 bg-black relative overflow-hidden flex items-center justify-center p-12">
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#3b82f6_0%,transparent_70%)]" />
            </div>
            <div className="relative z-10 text-center max-w-sm">
               <div className="mb-8 inline-block p-4 bg-white/10 rounded-2xl backdrop-blur-xl">
                  <TestTube2 className="w-12 h-12 text-blue-400" />
               </div>
               <h3 className="text-white font-serif italic text-2xl mb-4 italic">"Precisão molecular para decisões clínicas."</h3>
               <p className="text-white/40 text-sm">Desenvolvido com AlphaFold & Clinical Engine V1.0</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <Dashboard user={user} />;
}
