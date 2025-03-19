"use client";

import React, { useRef, useEffect, useState } from 'react';
import { SiEthereum, SiPolygon, SiBinance } from '@icons-pack/react-simple-icons';

const NETWORKS = [
  { 
    name: 'Ethereum', 
    logo: SiEthereum, 
    color: '#627EEA' 
  },
  { 
    name: 'Polygon', 
    logo: SiPolygon, 
    color: '#8247E5' 
  },
  { 
    name: 'Binance', 
    logo: SiBinance, 
    color: '#F0B90B' 
  }
];

const NetworkLogoSlider: React.FC = () => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const animate = () => {
      // Reset offset when it reaches full width
      setOffset((prevOffset) => {
        const newOffset = prevOffset - 1;
        return newOffset <= -slider.scrollWidth / 2 ? 0 : newOffset;
      });
    };

    const intervalId = setInterval(animate, 20);
    return () => clearInterval(intervalId);
  }, []);

  // Duplicate networks to create infinite scroll
  const duplicatedNetworks = [...NETWORKS, ...NETWORKS];

  return (
    <div className="flex justify-self-center w-2/4 overflow-hidden  py-8">
      <div 
        ref={sliderRef}
        className="flex"
        style={{
          transform: `translateX(${offset}px)`,
          transition: 'transform linear'
        }}
      >
        {duplicatedNetworks.map((network, index) => (
          <div 
            key={index} 
            className="flex-shrink-0 flex flex-wrap justify-evenly items-center justify-center mx-8 w-40"
          >
            <network.logo 
              color={network.color} 
              size={64} 
              className="mb-2" 
            />
            <p className="text-white font-bold text-sm">{network.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NetworkLogoSlider;