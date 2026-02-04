import React from 'react';
import { BusinessProfile } from '../types';

interface Props {
  items: BusinessProfile[];
  onSelect: (profile: BusinessProfile) => void;
  onDelete: (index: number) => void;
  onBack: () => void;
}

const HistoryList: React.FC<Props> = ({ items, onSelect, onDelete, onBack }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
            <h2 className="text-2xl font-bold uppercase tracking-tight">Audit Log</h2>
            <p className="mono-label text-[10px] mt-1">Archived investigations</p>
        </div>
        <button onClick={onBack} className="text-xs font-bold underline hover:no-underline">Close Log</button>
      </div>

      {items.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-gray-100">
            <span className="material-symbols-outlined text-4xl text-gray-200 mb-2">folder_off</span>
            <p className="text-sm text-gray-400 font-mono">No records found in local database.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b-2 border-black">
                        <th className="py-3 px-2 mono-label text-[9px] text-black">Target Entity</th>
                        <th className="py-3 px-2 mono-label text-[9px] text-black">Location</th>
                        <th className="py-3 px-2 mono-label text-[9px] text-black text-center">Score</th>
                        <th className="py-3 px-2 mono-label text-[9px] text-black text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 group transition-colors">
                            <td className="py-3 px-2">
                                <button onClick={() => onSelect(item)} className="font-bold text-sm hover:underline uppercase text-left">
                                    {item.businessName}
                                </button>
                            </td>
                            <td className="py-3 px-2 text-xs text-gray-500">{item.city}</td>
                            <td className="py-3 px-2 text-center">
                                <span className={`
                                    inline-block w-8 py-0.5 text-[10px] font-bold text-white rounded-sm
                                    ${item.score > 75 ? 'bg-green-600' : item.score > 50 ? 'bg-yellow-600' : 'bg-red-600'}
                                `}>
                                    {item.score}
                                </span>
                            </td>
                            <td className="py-3 px-2 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => onSelect(item)}
                                        className="text-[10px] font-bold text-black border border-gray-300 px-2 py-1 hover:bg-black hover:text-white transition-colors"
                                    >
                                        VIEW
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onDelete(index); }}
                                        className="text-gray-400 hover:text-red-600"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">delete</span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      )}
    </div>
  );
};

export default HistoryList;
