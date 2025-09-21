import React from 'react';
import { ScaleIcon, ShieldCheckIcon, BeakerIcon } from '@heroicons/react/24/outline';
import Header from './Header';
import AnimatedSection from './AnimatedSection';


const concept = [
  {
    icon: ScaleIcon,
    title: 'O que é Preço Justo?',
    description: 'Calculamos o valor intrínseco de uma empresa com base em seu fluxo de caixa futuro, descontado a uma taxa que reflete seus riscos.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Margem de Segurança',
    description: 'O princípio de investir com uma "margem de segurança" significa comprar uma ação por um preço significativamente abaixo do seu valor justo estimado.',
  },
  {
    icon: BeakerIcon,
    title: 'Análise Qualitativa',
    description: 'Lembre-se: números são importantes, mas a qualidade da gestão e as vantagens competitivas da empresa são cruciais para o sucesso a longo prazo.',
  }
];
 
export default function KeyWidgets() {
  return (
<section className='space-y-16'>
      {concept.map((concept, index) => {
        const IconComponent = concept.icon;
        return (
            <AnimatedSection key={concept.title}>
          <div
            key={concept.title}
            className="bg-slate-900/50 border border-white/10 rounded-lg p-8 transform transition-transform hover:-translate-y-2"
          >
           
            <div 
              className={`
                flex flex-col md:flex-row items-center gap-8 md:gap-12
                ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}
              `}
            >
  
              <div className="md:w-1/4 flex justify-center">
                <IconComponent className='h-16 w-16 text-green-400 text-primary'/>
              </div>


              <div className="md:w-3/4 text-center md:text-left">
                <h3 className='text-2xl font-bold mb-3'>{concept.title}</h3>
                <p className='text-text-secondary leading-relaxed'>{concept.description}</p>
              </div>
            </div>
          </div>
          </AnimatedSection>
        );
      })}
    </section>
  );
}