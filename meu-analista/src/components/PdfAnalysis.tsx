import React from 'react';
import { MagnifyingGlassIcon, DocumentChartBarIcon, DocumentArrowDownIcon} from '@heroicons/react/24/outline';
// conteudo dos cards

const steps =[
  {
    icon: MagnifyingGlassIcon , 
    title: 'Busque a Empresa na B3',
    description: 'Acesse o site da B3 e procure pela seção "Empresas Listadas". Na barra de pesquisa, digite o código da ação (ex: PETR4, MGLU3) ou o nome da empresa para encontrar sua página oficial.',
  },
  { 
    icon: DocumentChartBarIcon,
    title: 'Localize os Relatórios',
    description: 'Dentro da página da empresa, navegue até a área de "Documentos", "Relatórios Financeiros" ou "Arquivos CVM". Esta seção contém todos os comunicados e relatórios oficiais enviados pela empresa.',
  },
  {
    icon: DocumentArrowDownIcon,
    title: 'Baixe o PDF Correto (DFP ou ITR)',
    description: 'Para uma análise de valuation completa, filtre a lista e baixe o DFP (Demonstrações Financeiras Padronizadas). Este é o relatório anual mais detalhado. Para dados mais recentes, baixe o ITR (Informações Trimestrais).',
  }
]

export default function PdfAnalysis() {
  return (
    <section className="mb-20">
      <h2 className='text-3xl font-bold text-center mt-12 mb-12'>Análise com PDF</h2>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-8 bg-background-pdf hover:transforme hover:translate-y-1'> {steps.map((step) => {
        const IconComponent = step.icon;
        return (
        <div key={step.title} className='bg-white/5 p-6 rounded-lg border border-white/10 text-center'>
          <div className='flex justify-center mb-4'>
            <IconComponent className='h-12 w-12 text-primary'/>
          </div>
          <h3 className='text-xl font-bold mt-4 mb-2'>{step.title}</h3>
          <p className='text-text-secondary'>{step.description}</p>
        </div>
      );
      })}
      </div>
    </section>
  );
}