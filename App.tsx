
import React, { useState, useEffect } from 'react';
import { Wine } from './types';
import WineForm from './components/WineForm';
import SommelierChat from './components/SommelierChat';
import Dashboard from './components/Dashboard';
import { db } from './firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy 
} from "firebase/firestore";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'sommelier'>('dashboard');
  const [cellar, setCellar] = useState<Wine[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingWine, setEditingWine] = useState<Wine | null>(null);
  const [isSyncing, setIsSyncing] = useState(true);

  // Real-time synchronization with Firestore
  useEffect(() => {
    const q = query(collection(db, "wines"), orderBy("addedAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const wines: Wine[] = [];
      querySnapshot.forEach((doc) => {
        wines.push({ id: doc.id, ...doc.data() } as Wine);
      });
      setCellar(wines);
      setIsSyncing(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setIsSyncing(false);
    });

    return () => unsubscribe();
  }, []);

  const addWine = async (data: Omit<Wine, 'id' | 'addedAt'>) => {
    try {
      await addDoc(collection(db, "wines"), {
        ...data,
        addedAt: Date.now(),
      });
      setIsAdding(false);
    } catch (e) {
      console.error("Error adding wine: ", e);
      alert("Failed to add wine to cloud.");
    }
  };

  const updateWine = async (data: Omit<Wine, 'id' | 'addedAt'>) => {
    if (!editingWine) return;
    try {
      const wineRef = doc(db, "wines", editingWine.id);
      await updateDoc(wineRef, { ...data });
      setEditingWine(null);
    } catch (e) {
      console.error("Error updating wine: ", e);
      alert("Failed to update wine.");
    }
  };

  const removeWine = async (id: string) => {
    if (confirm('Remove this vintage from your collection?')) {
      try {
        await deleteDoc(doc(db, "wines", id));
      } catch (e) {
        console.error("Error deleting wine: ", e);
      }
    }
  };

  const adjustQuantity = async (id: string, delta: number) => {
    const wine = cellar.find(w => w.id === id);
    if (!wine) return;
    
    const newQty = Math.max(0, wine.quantity + delta);
    
    if (newQty === 0) {
      if (confirm('Last bottle removed. Keep this record with 0 quantity?')) {
        await updateDoc(doc(db, "wines", id), { quantity: 0 });
      } else {
        await removeWine(id);
      }
    } else {
      await updateDoc(doc(db, "wines", id), { quantity: newQty });
    }
  };

  return (
    <div className="min-h-screen pb-24 lg:pb-0">
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#1a1616] border-r border-[#2d2424] hidden lg:flex flex-col p-8">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-[#4a0e0e] rounded-lg rotate-12 flex items-center justify-center border border-[#c8a97e]">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#c8a97e] -rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
          </div>
          <h1 className="text-2xl font-serif text-[#c8a97e] tracking-tight">VintnerAI</h1>
        </div>

        <nav className="space-y-4">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${activeTab === 'dashboard' ? 'bg-[#231d1d] text-[#c8a97e] border border-[#3a3030]' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${activeTab === 'inventory' ? 'bg-[#231d1d] text-[#c8a97e] border border-[#3a3030]' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Inventory
          </button>
          <button 
            onClick={() => setActiveTab('sommelier')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${activeTab === 'sommelier' ? 'bg-[#231d1d] text-[#c8a97e] border border-[#3a3030]' : 'text-gray-500 hover:text-gray-300'}`}
          >
            AI Sommelier
          </button>
        </nav>

        <div className="mt-auto pt-8 border-t border-[#2d2424]">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Cloud Status</p>
            {isSyncing ? (
              <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
            ) : (
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            )}
          </div>
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#4a0e0e] to-[#c8a97e]"></div>
             <span className="text-sm font-medium">Head Collector</span>
          </div>
        </div>
      </aside>

      <main className="lg:ml-64 p-6 lg:p-12 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl font-serif text-[#c8a97e]">
              {activeTab === 'dashboard' && 'Cellar Insights'}
              {activeTab === 'inventory' && 'Wine Collection'}
              {activeTab === 'sommelier' && 'Digital Sommelier'}
            </h2>
          </div>
          {activeTab === 'inventory' && (
            <button 
              onClick={() => setIsAdding(true)}
              className="bg-[#c8a97e] hover:bg-[#b8986d] text-black px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
            >
              Add Wine
            </button>
          )}
        </header>

        {(isAdding || editingWine) && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
              <WineForm 
                initialData={editingWine || undefined}
                onSubmit={editingWine ? updateWine : addWine} 
                onCancel={() => { setIsAdding(false); setEditingWine(null); }} 
              />
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && <Dashboard cellar={cellar} />}
        {activeTab === 'inventory' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {cellar.map(wine => (
              <div key={wine.id} className="bg-[#1a1616] border border-[#2d2424] rounded-xl overflow-hidden group hover:border-[#c8a97e] transition-colors shadow-lg">
                <div className="p-5">
                   <div className="flex justify-between mb-2">
                    <span className="text-[10px] font-bold text-[#c8a97e]">{wine.vintage}</span>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingWine(wine)} className="text-gray-500 hover:text-white">Edit</button>
                      <button onClick={() => removeWine(wine.id)} className="text-gray-500 hover:text-red-500">Delete</button>
                    </div>
                  </div>
                  <h4 className="font-serif text-xl">{wine.producer}</h4>
                  <p className="text-gray-400 text-sm">{wine.name}</p>
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => adjustQuantity(wine.id, -1)} className="p-1 border border-gray-700">-</button>
                      <span>{wine.quantity}</span>
                      <button onClick={() => adjustQuantity(wine.id, 1)} className="p-1 border border-gray-700">+</button>
                    </div>
                    <span className="text-[#c8a97e] font-serif">${((wine.valuation || 0) * wine.quantity).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'sommelier' && <SommelierChat cellar={cellar} />}
      </main>
    </div>
  );
};

export default App;
