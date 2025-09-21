import React from 'react';
import { MagnifyingGlassIcon, DocumentChartBarIcon, DocumentArrowDownIcon} from '@heroicons/react/24/outline';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

import AnimatedSection from './AnimatedSection';
const steps =[
  {
    icon: MagnifyingGlassIcon , 
    title: 'Busque a Empresa na B3',
    description: 'Acesse o site da B3 e procure pela seção "Empresas Listadas". Na barra de pesquisa, digite o código da ação (ex: PETR4, MGLU3) ou o nome da empresa para encontrar sua página oficial.',
  },
  { 
    icon: DocumentChartBarIcon,
    title: 'Localize os Relatórios',
    description: 'Na página da empresa, localize o menu de seleção (geralmente ao lado do nome) e altere a opção de "Sobre a Empresa" para "Relatórios Estruturados".',
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
      <AnimatedSection>
      <h2 className='text-3xl font-bold text-center mt-12 mb-12'>Análise com PDF</h2>
      <Swiper
          modules={[Pagination, A11y]}
          spaceBetween={30}
          slidesPerView={1}
          pagination={{ clickable: true }}
          breakpoints={{
            768: {
              slidesPerView: 3,
              spaceBetween: 40
            },
          }}
          className="py-12"
        >
          {steps.map((step) => {
            const IconComponent = step.icon;
            return (
             
           <SwiperSlide key={step.title} className="py-4 self-stretch">
              <div className='bg-white/5 p-6 rounded-lg border border-white/10 bg-background-pdf text-center h-full flex flex-col items-center transform transition-transform hover:-translate-y-2'>
                <div className='flex justify-center mb-4'>
                  <IconComponent className='h-12 w-12 text-primary'/>
                </div>
                <h3 className='text-xl font-bold mt-4 mb-2'>{step.title}</h3>
                <p className='flex-grow flex flex-col justify-center text-text-secondary'>{step.description}</p>
              </div>
            </SwiperSlide>
            );
          })}
        </Swiper>
      </AnimatedSection>
    </section>
  );
}