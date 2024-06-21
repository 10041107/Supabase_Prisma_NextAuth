import { useRouter } from 'next/router';
import React from 'react';
import AnimatedContainer from '../components/motion/AnimatedContainer';
import { useState } from 'react';

const Custom404: React.FC = (): JSX.Element => {

    const [isOpen, setIsOpen] =  useState(false);

    const toggleOpen = () => setIsOpen(!isOpen);
    
  const router = useRouter();
  return (
    <div className="h-screen overflow-y-scroll lg:overflow-y-hidden hide-scrollbar">
 
    <section>
        <div className="container flex items-center min-h-screen py-12 mx-auto px-30">
                <AnimatedContainer type="fadeIn">
                <AnimatedContainer type="Vibration">
            <div className="flex flex-col items-center mx-auto text-center">
                <p className="p-3 text-sm font-medium text-gray-400 rounded-full bg-blue-50 dark:bg-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                </p>
                <h1 className="mt-3 text-2xl font-semibold text-gray-800 dark:text-white md:text-3xl">원하시는 페이지를 찾을 수 없습니다.</h1>
                <p className="mt-4 text-gray-500 dark:text-gray-400">입력하신 페이지의 주소가 명확한지 다시 한 번 확인해주세요.</p>

                <div className="flex items-center w-full mt-6 gap-x-3 shrink-0 sm:w-auto">
                    <button onClick={() => router.back()}>

                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 rtl:rotate-180">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18" />
                        </svg>

                        <span>돌아가기</span>
                    </button>

                    <button onClick={() => router.push('/')}>
                        홈으로 가기
                    </button>
                </div>
            </div>
            </AnimatedContainer>
        </AnimatedContainer>
        </div>
    </section>
    </div>
  );
};

export default Custom404;
