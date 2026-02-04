import React, { useState } from 'react';

interface Props {
  onSearch: (name: string, location: string) => void;
  isLoading: boolean;
}

const BusinessInputForm: React.FC<Props> = ({ onSearch, isLoading }) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && location.trim()) {
      onSearch(name, location);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8 border-b border-black pb-4">
        <h2 className="text-xl font-bold uppercase tracking-tighter">Initiate Scan</h2>
        <p className="font-mono text-[10px] text-gray-500 mt-1 uppercase">Enter target parameters for intelligence gathering</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1">
          <label className="font-mono text-[9px] uppercase tracking-widest text-gray-600 font-bold ml-1">
            Target_Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="E.g. The Ritz London"
            className="w-full bg-gray-50 border-b-2 border-gray-200 p-3 font-medium text-sm focus:outline-none focus:border-black focus:bg-white transition-colors rounded-t-sm"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-1">
          <label className="font-mono text-[9px] uppercase tracking-widest text-gray-600 font-bold ml-1">
            Geo_Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="E.g. London, UK"
            className="w-full bg-gray-50 border-b-2 border-gray-200 p-3 font-medium text-sm focus:outline-none focus:border-black focus:bg-white transition-colors rounded-t-sm"
            disabled={isLoading}
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading || !name || !location}
            className={`
              w-full py-4 px-6 text-xs font-black uppercase tracking-[0.2em] 
              transition-all duration-300 flex items-center justify-center gap-3
              ${isLoading 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-black text-white hover:bg-gray-900 hover:shadow-lg'
              }
            `}
          >
            {isLoading ? (
              <>Processing...</>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">radar</span>
                Execute_Protocol
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BusinessInputForm;
