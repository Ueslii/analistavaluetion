import React from 'react';
import { MagnifyingGlassIcon, CheckBadgeIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import AnimatedSection from './AnimatedSection';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';


const steps =[
  {
    icon: MagnifyingGlassIcon,
    title: 'Insira o Ticlker',
    description: 'Digite o codigo da ação que deseja analisar na caixa do chat (ex: PETR4, MGLU3).',
  },
  {
    icon: CheckBadgeIcon,
    title: 'Valide os Dados',
    description: 'O painel de dados será preenchido com as informações da empresa. Verifique se estão corretas antes de enviar.',
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Receba a Análise',
    description: 'Interaja com o assistente para receber uma análise fundamentalista completa e tire suas conclusões.',
  }
]

export default function HowToUse() {
  return (
    <section className="mb-20">
      <AnimatedSection>
      <h2 className='text-3xl font-bold text-center mt-12 mb-12 '>Como Funciona</h2>
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
              <SwiperSlide key={step.title} className="py-4">

              <div className='bg-white/5 p-6 rounded-lg border border-white/10 text-center h-full flex flex-col items-center transform transition-transform hover:-translate-y-2'>
                <div className='flex justify-center mb-4'>
                    <IconComponent className='h-12 w-12 text-primary'/>
                  </div>
                  <h3 className='text-xl font-bold mt-4 mb-2'>{step.title}</h3>
                  <p className='text-text-secondary'>{step.description}</p>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
    </AnimatedSection>
    </section>
  );
}