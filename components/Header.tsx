import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex justify-center items-center">
        <div className="h-10 w-10 rounded-full mr-3 bg-gradient-to-br from-[#D18F70] to-[#C57F5D] flex items-center justify-center text-white font-bold text-xl font-serif">
          C
        </div>
        <span className="text-xl font-semibold font-serif text-[#3D2C21]">Chamkili AI Content Strategist</span>
      </div>
    </header>
  );
};

export default Header;