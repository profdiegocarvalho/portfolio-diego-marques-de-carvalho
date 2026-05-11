import React, { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface ProteinViewerProps {
  pdbId: string;
  name: string;
}

declare global {
  interface Window {
    $3Dmol: any;
  }
}

const ProteinViewer: React.FC<ProteinViewerProps> = ({ pdbId, name }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://3Dmol.org/build/3Dmol-min.js';
    script.async = true;
    script.onload = () => {
      initViewer();
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (viewerRef.current) {
      loadProtein(pdbId);
    }
  }, [pdbId]);

  const initViewer = () => {
    if (!containerRef.current || !window.$3Dmol) return;

    const viewer = window.$3Dmol.createViewer(containerRef.current, {
      backgroundColor: '#f8f7f4'
    });
    viewerRef.current = viewer;
    loadProtein(pdbId);
  };

  const loadProtein = async (uniprotId: string) => {
    if (!viewerRef.current) return;

    viewerRef.current.clear();
    
    // Lista de tentativas: v4 (atual), v3 (antigo), e RCSB PDB como último recurso
    const versions = ['v4', 'v3'];
    let loaded = false;

    // Se for um ID do AlphaFold (UniProt)
    try {
      // Tenta buscar a API do AlphaFold primeiro para pegar a URL exata
      const apiInfo = await fetch(`https://alphafold.ebi.ac.uk/api/prediction/${uniprotId}`);
      if (apiInfo.ok) {
        const infoData = await apiInfo.json();
        if (infoData && infoData.length > 0 && infoData[0].pdbUrl) {
          const fetchedUrl = infoData[0].pdbUrl;
          console.log(`URL do AlphaFold API encontrada: ${fetchedUrl}`);
          
          const pdbResponse = await fetch(fetchedUrl);
          if (pdbResponse.ok) {
            const data = await pdbResponse.text();
            viewerRef.current.addModel(data, 'pdb');
            viewerRef.current.setStyle({}, { 
              cartoon: { color: 'spectrum', opacity: 0.9 },
              stick: { radius: 0.1, opacity: 0.3 } 
            });
            viewerRef.current.zoomTo();
            viewerRef.current.render();
            loaded = true;
            console.log(`Sucesso ao carregar ${uniprotId} via API`);
          }
        }
      }
    } catch (e) {
      console.warn("A chamada para a API do AlphaFold falhou, tentando fallback de versões.", e);
    }

    if (!loaded) {
      // Fallback de versões caso a API falhe ou a URL PDB falhe
      const versions = ['v6', 'v5', 'v4', 'v3'];
      
      for (const v of versions) {
        if (loaded) break;

        const url = `https://alphafold.ebi.ac.uk/files/AF-${uniprotId}-F1-model_${v}.pdb`;

        try {
          console.log(`Tentando AlphaFold versão manual ${v}: ${url}`);
          const response = await fetch(url);
          
          if (response.ok) {
            const data = await response.text();
            viewerRef.current.addModel(data, 'pdb');
            viewerRef.current.setStyle({}, { 
              cartoon: { color: 'spectrum', opacity: 0.9 },
              stick: { radius: 0.1, opacity: 0.3 } 
            });
            viewerRef.current.zoomTo();
            viewerRef.current.render();
            loaded = true;
            console.log(`Sucesso ao carregar ${uniprotId} (v${v})`);
          }
        } catch (err) {
          console.warn(`Erro na tentativa AlphaFold manual v${v}:`, err);
        }
      }
    }

    // Fallback para RCSB PDB se não for AlphaFold ou se falhar
    if (!loaded) {
      const pdbUrl = `https://files.rcsb.org/download/${uniprotId}.pdb`;
      try {
        console.log(`Tentando RCSB PDB Fallback: ${pdbUrl}`);
        const response = await fetch(pdbUrl);
        if (response.ok) {
          const data = await response.text();
          viewerRef.current.addModel(data, 'pdb');
          viewerRef.current.setStyle({}, { cartoon: { color: 'spectrum' } });
          viewerRef.current.zoomTo();
          viewerRef.current.render();
          loaded = true;
        }
      } catch (e) {
        console.error("Todos os carregamentos falharam.");
      }
    }

    if (loaded) {
      setTimeout(() => {
        if (viewerRef.current) {
          viewerRef.current.render();
          viewerRef.current.zoomTo();
        }
      }, 200);
    } else {
      if (viewerRef.current && window.$3Dmol) {
        viewerRef.current.addLabel("Erro: Estrutura não encontrada", {
          position: {x:0, y:0, z:0},
          backgroundColor: '#ef4444',
          fontColor: 'white'
        });
        viewerRef.current.render();
      }
    }
  };

  return (
    <div className="relative w-full h-[400px] border border-black/5 bg-white overflow-hidden rounded-lg shadow-inner group">
      <div id="protein-container" ref={containerRef} className="w-full h-full" />
      <div className="absolute top-4 left-4 z-10">
        <span className="px-2 py-1 bg-black text-white text-[10px] font-mono uppercase tracking-wider rounded">
          {name} / ID: {pdbId}
        </span>
      </div>
      <div className="absolute bottom-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] text-black/40 font-mono italic">
          AlphaFold Research Visualization
        </span>
      </div>
    </div>
  );
};

export default ProteinViewer;
