
import React from 'react';
import { Wine } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface DashboardProps {
  cellar: Wine[];
}

const COLORS = ['#4a0e0e', '#c8a97e', '#1a3a3a', '#a3a3a3', '#4d4d4d'];

const Dashboard: React.FC<DashboardProps> = ({ cellar }) => {
  const totalBottles = cellar.reduce((sum, w) => sum + w.quantity, 0);
  const totalValue = cellar.reduce((sum, w) => sum + (w.quantity * (w.valuation || 0)), 0);

  // Data processing for charts
  const typeData = ['Red', 'White', 'Rosé', 'Sparkling', 'Dessert'].map(type => ({
    name: type,
    value: cellar.filter(w => w.type === type).reduce((sum, w) => sum + w.quantity, 0)
  })).filter(d => d.value > 0);

  const varietalData = Array.from(new Set(cellar.map(w => w.varietal)))
    .map(varietal => ({
      name: varietal || 'Unknown',
      count: cellar.filter(w => w.varietal === varietal).reduce((sum, w) => sum + w.quantity, 0)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1a1616] border border-[#2d2424] p-6 rounded-xl shadow-lg">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Total Collection</p>
          <p className="text-4xl font-serif text-[#c8a97e]">{totalBottles}</p>
          <p className="text-xs text-gray-400 mt-2">Individual Bottles</p>
        </div>
        <div className="bg-[#1a1616] border border-[#2d2424] p-6 rounded-xl shadow-lg">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Estimated Value</p>
          <p className="text-4xl font-serif text-[#c8a97e]">${totalValue.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-2">Market Valuation</p>
        </div>
        <div className="bg-[#1a1616] border border-[#2d2424] p-6 rounded-xl shadow-lg">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Unique Vintages</p>
          <p className="text-4xl font-serif text-[#c8a97e]">{cellar.length}</p>
          <p className="text-xs text-gray-400 mt-2">Labels Registered</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1a1616] border border-[#2d2424] p-6 rounded-xl shadow-lg h-80">
          <h4 className="font-serif text-[#c8a97e] mb-4">Composition by Type</h4>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie
                data={typeData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1616', border: '1px solid #3a3030' }}
                itemStyle={{ color: '#c8a97e' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 text-[10px] uppercase font-bold tracking-tighter">
            {typeData.map((d, i) => (
              <div key={i} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                <span className="text-gray-400">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1a1616] border border-[#2d2424] p-6 rounded-xl shadow-lg h-80">
          <h4 className="font-serif text-[#c8a97e] mb-4">Top Varietals</h4>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={varietalData}>
              <XAxis dataKey="name" stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#555" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: '#231d1d' }}
                contentStyle={{ backgroundColor: '#1a1616', border: '1px solid #3a3030' }}
              />
              <Bar dataKey="count" fill="#4a0e0e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
