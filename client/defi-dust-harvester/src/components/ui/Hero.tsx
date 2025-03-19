import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from './button';

const HeroBanner: React.FC = () => {
  return (
    <div className="relative w-full h-[600px] overflow-hidden flex items-center justify-center">
      <Link href="/demo" className='absolute top-5 right-32 z-50'>
        <Button className='bg-yellow-700 text-white hover:bg-yellow-900 font-semibold hover:text-white'>Demo</Button>
      </Link>
      {/* Background Image */}
      <div className="absolute inset-0 z-0 w-full">
        <Image 
          src="/images/Hero.png" 
          alt="DeFi Dust Harvester Banner" 
          layout="fill" 
          objectFit="cover" 
          className="opacity-90"
        />
      </div>
  
     
      
      {/* Content Overlay */}
      <div className="relative z-10 text-center px-6 py-16 bg-black/60 rounded-xl ">
        <h1 className="text-6xl font-bold text-white drop-shadow-lg mb-4">
          DeFi Dust Harvester
        </h1>
        <h2 className="text-2xl font-semibold text-yellow-300 italic drop-shadow-md animate-pulse">
          Turning Crypto Crumbs into Cosmic Coins! 🚀✨
        </h2>
      </div>

      
    </div>
  );
};

export default HeroBanner;