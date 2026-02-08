
import React, { useState, useRef } from 'react';
import { Wine, WineType } from '../types';
import { analyzeLabel } from '../services/geminiService';

interface WineFormProps {
  onSubmit: (wine: Omit<Wine, 'id' | 'addedAt'>) => void;
  onCancel: () => void;
  initialData?: Wine;
}

const WineForm: React.FC<WineFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState<Omit<Wine, 'id' | 'addedAt'>>({
    name: initialData?.name || '',
    producer: initialData?.producer || '',
    varietal: initialData?.varietal || '',
    vintage: initialData?.vintage || '',
    region: initialData?.region || '',
    type: initialData?.type || 'Red',
    quantity: initialData?.quantity || 1,
    notes: initialData?.notes || '',
    valuation: initialData?.valuation || 0,
  });

  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const details = await analyzeLabel(base64);
      if (details) {
        setFormData(prev => ({ ...prev, ...details }));
      }
      setIsScanning(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-[#1a1616] border border-[#2d2424] p-6 rounded-xl shadow-2xl">
      <h2 className="text-2xl font-serif mb-6 text-[#c8a97e]">{initialData ? 'Edit Vintage' : 'Register New Vintage'}</h2>
      
      <div className="mb-6 flex items-center justify-between p-4 bg-[#231d1d] rounded-lg border border-[#3a3030]">
        <div>
          <p className="text-sm text-gray-400 font-medium">Quick Register</p>
          <p className="text-xs text-gray-500">Scan label to auto-fill details</p>
        </div>
        <button 
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isScanning}
          className="px-4 py-2 bg-[#4a0e0e] hover:bg-[#601212] transition-colors rounded text-sm font-semibold flex items-center gap-2"
        >
          {isScanning ? 'Analyzing...' : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              Scan Label
            </>
          )}
        </button>
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleScan} />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Wine Name</label>
            <input 
              required
              className="bg-[#231d1d] border border-[#3a3030] p-3 rounded focus:outline-none focus:border-[#c8a97e] transition-colors"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Producer</label>
            <input 
              required
              className="bg-[#231d1d] border border-[#3a3030] p-3 rounded focus:outline-none focus:border-[#c8a97e] transition-colors"
              value={formData.producer}
              onChange={e => setFormData({ ...formData, producer: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Varietal / Blend</label>
            <input 
              className="bg-[#231d1d] border border-[#3a3030] p-3 rounded focus:outline-none focus:border-[#c8a97e] transition-colors"
              value={formData.varietal}
              onChange={e => setFormData({ ...formData, varietal: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Vintage</label>
            <input 
              className="bg-[#231d1d] border border-[#3a3030] p-3 rounded focus:outline-none focus:border-[#c8a97e] transition-colors"
              value={formData.vintage}
              onChange={e => setFormData({ ...formData, vintage: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Region</label>
            <input 
              className="bg-[#231d1d] border border-[#3a3030] p-3 rounded focus:outline-none focus:border-[#c8a97e] transition-colors"
              value={formData.region}
              onChange={e => setFormData({ ...formData, region: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Type</label>
            <select 
              className="bg-[#231d1d] border border-[#3a3030] p-3 rounded focus:outline-none focus:border-[#c8a97e] transition-colors"
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value as WineType })}
            >
              <option value="Red">Red</option>
              <option value="White">White</option>
              <option value="Rosé">Rosé</option>
              <option value="Sparkling">Sparkling</option>
              <option value="Dessert">Dessert</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Quantity (Bottles)</label>
            <input 
              type="number"
              min="1"
              className="bg-[#231d1d] border border-[#3a3030] p-3 rounded focus:outline-none focus:border-[#c8a97e] transition-colors"
              value={formData.quantity}
              onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Valuation (Est. $/btl)</label>
            <input 
              type="number"
              className="bg-[#231d1d] border border-[#3a3030] p-3 rounded focus:outline-none focus:border-[#c8a97e] transition-colors"
              value={formData.valuation}
              onChange={e => setFormData({ ...formData, valuation: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Tasting Notes / Cellar Location</label>
          <textarea 
            className="bg-[#231d1d] border border-[#3a3030] p-3 rounded h-24 focus:outline-none focus:border-[#c8a97e] transition-colors"
            value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button 
            type="submit"
            className="flex-1 bg-[#c8a97e] hover:bg-[#b8986d] text-black font-bold py-3 rounded-lg transition-colors"
          >
            {initialData ? 'Update Record' : 'Add to Collection'}
          </button>
          <button 
            type="button"
            onClick={onCancel}
            className="flex-1 bg-transparent border border-[#3a3030] hover:bg-[#3a3030] py-3 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default WineForm;
