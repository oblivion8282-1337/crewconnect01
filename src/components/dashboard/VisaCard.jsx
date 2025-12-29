import React from 'react';
import { Wifi } from 'lucide-react';

/**
 * VisaCard - Display a virtual card with glassmorphism effect
 */
const VisaCard = ({ cardDetails }) => {
  return (
    <div className="
      relative p-6 rounded-2xl overflow-hidden
      bg-gradient-to-br from-gray-800 via-gray-900 to-gray-950
      dark:from-gray-800 dark:via-gray-900 dark:to-black
      min-h-48
    ">
      {/* Green Glow Effect */}
      <div className="
        absolute -right-20 -top-20 w-64 h-64
        bg-primary/20 rounded-full blur-3xl
      " />
      <div className="
        absolute -left-10 -bottom-10 w-48 h-48
        bg-primary/10 rounded-full blur-3xl
      " />

      {/* Card Content */}
      <div className="relative z-10 h-full flex flex-col justify-between">
        {/* Top Row */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-caption text-gray-400 mb-1">Guthaben</p>
            <p className="text-2xl font-bold text-white">
              35.200,00 €
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Wifi className="w-6 h-6 text-gray-400 rotate-90" />
          </div>
        </div>

        {/* Card Number */}
        <div className="my-6">
          <p className="font-mono text-lg text-white tracking-widest">
            {cardDetails?.number || '4532 •••• •••• 8901'}
          </p>
        </div>

        {/* Bottom Row */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-caption text-gray-500 mb-1">Karteninhaber</p>
            <p className="text-sm font-medium text-white">
              {cardDetails?.holder || 'MICHAEL SCHMIDT'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-caption text-gray-500 mb-1">Gültig bis</p>
            <p className="text-sm font-medium text-white">
              {cardDetails?.expiry || '09/28'}
            </p>
          </div>
          <div className="ml-4">
            {/* Visa Logo */}
            <svg
              viewBox="0 0 48 16"
              className="w-12 h-4 fill-white"
            >
              <path d="M19.5 0.5L16.8 15.5H13.2L15.9 0.5H19.5ZM32.4 10.2L34.2 5L35.2 10.2H32.4ZM36.2 15.5H39.5L36.7 0.5H33.7C32.9 0.5 32.2 1 31.9 1.7L26.5 15.5H30.4L31.2 13.1H36L36.2 15.5ZM28.5 10.5C28.5 6.2 22.5 5.9 22.5 4C22.5 3.4 23.1 2.7 24.3 2.5C24.9 2.5 26.6 2.4 28.5 3.3L29.2 0.9C28.2 0.5 26.9 0.2 25.3 0.2C21.6 0.2 19 2.2 19 5C19 7 20.8 8.1 22.2 8.8C23.6 9.5 24.1 10 24.1 10.6C24.1 11.5 23 12 21.8 12C19.7 12 18.4 11.4 17.4 10.9L16.7 13.4C17.8 13.9 19.7 14.4 21.7 14.4C25.6 14.3 28.5 12.4 28.5 10.5ZM12.2 0.5L6.2 15.5H2.2L-0.6 3.3C-0.8 2.5 -0.9 2.2 -1.5 1.8C-2.5 1.2 -4.2 0.7 -5.7 0.4L-5.6 0.5H0.3C1.2 0.5 2 1.1 2.2 2.1L3.7 10.4L7.5 0.5H12.2Z" transform="translate(6, 0)"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Subtle Grid Pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />
    </div>
  );
};

export default VisaCard;
