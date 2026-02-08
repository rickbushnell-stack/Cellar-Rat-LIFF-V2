// Force Sync Update: 2025-02-21
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

declare const liff: any;

interface UserProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'sommelier'>('dashboard');
  const [cellar, setCellar] = useState<Wine[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingWine, setEditingWine] = useState<Wine | null>(null);
  const [isSyncing, setIsSyncing] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [liffError, setLiffError] = useState<{title: string, message: string} | null>(null);

  useEffect(() => {
    const initLiff = async () => {
      // Force trim to remove any hidden characters from Vercel
      const rawId = process.env.LIFF_ID || "";
      const sanitizedId = rawId.replace(/[\n\r\t]/g, "").trim();
      
      if (!sanitizedId || sanitizedId === "YOUR_LIFF_ID_HERE") {
        setLiffError({
          title: "Setup Required",
          message: "Please add your LIFF_ID to the Environment Variables in Vercel."
        });
        return;
      }

      try {
        await liff.init({ liffId: sanitizedId });
        if (!liff.isLoggedIn()) {
          liff.login();
        } else {
          const profile = await liff.getProfile();
          setUser(profile);
        }
      } catch (err: any) {
        console.error("LIFF Error:", err);
        let msg = err.message;
        if (msg === "channel not found") {
          msg = "Invalid LIFF ID. Check for hidden spaces in your Vercel Environment Variables.";
        }
        setLiffError({
          title: "Connection Error",
          message: msg
        });
      }
    };
    initLiff();
  }, []);

  useEffect(() => {
    if (!user?.userId) return;

    const userWinesRef = collection(db, "users", user.userId, "wines");
    const q = query(userWinesRef, orderBy("addedAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const wines: Wine[] = [];
      querySnapshot.forEach((doc) => {
        wines.push({ id: doc.id, ...doc.data() } as Wine);
      });
      setCellar(wines);
      setIsSyncing(false);
    }, (error) => {
      console.error("Firestore Sync Error:", error);
      setIsSyncing(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addWine = async (data: Omit<Wine, 'id' | 'addedAt'>) => {
    if (!user?.userId) return;
    try {
      const userWinesRef = collection(db, "users", user.userId, "wines");
      await addDoc(userWinesRef, {
        ...data,
        addedAt: Date.now(),
      });
      setIsAdding(false);
    } catch (e) {
      console.error("Error adding wine:", e);
    }
  };

  const updateWine = async (data: Omit<Wine, 'id' | 'addedAt'>) => {
    if (!editingWine || !user?.userId) return;
    try {
      const wineRef = doc(db, "users", user.userId, "wines", editingWine.id);
      await updateDoc(wineRef, { ...data });
      setEditingWine(null);
    } catch (e) {
      console.error("Error updating wine:", e);
    }
  };

  const removeWine = async (id: string) => {
    if (!user?.userId) return;
    if (confirm('Permanently remove this record?')) {
      try {
        await deleteDoc(doc(db, "users", user.userId, "wines", id));
      } catch (e) {
        console.error("Error deleting wine:", e);
      }
    }
  };

  const adjustQuantity = async (id: string, delta: number) => {
    if (!user?.userId) return;
    const wine = cellar.find(w => w.id === id);
    if (!wine) return;
    
    const newQty = Math.max(0, wine.quantity + delta);
    const wineRef = doc(db, "users", user.userId, "wines", id);
    
    if (newQty === 0) {
      if (confirm('Last bottle removed. Keep this record in your history?')) {
        await updateDoc(wineRef, { quantity: 0 });
      } else {
        await removeWine(id);
      }
    } else {
      await updateDoc(wineRef, { quantity: newQty });
    }
  };

  if (liffError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f0c0c] p-8">
        <div className="max-w-md w-full bg-[#1a1616] p-8 rounded-2xl border border-[#2d2424] text-center">
          <h2 className="text-[#c8a97e] font-serif text-2xl mb-4">{liffError.title}</h2>
          <p className="text-gray-400 mb-8">{liffError.message}</p>
          <button onClick={() => window.location.reload()} className="w-full bg-[#c8a97e] text-black font-bold py-3 rounded-lg">Retry Connection</button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f0c0c]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#c8a97e] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#c8a97e] font-serif animate-pulse">Entering the cellar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 lg:pb-0 flex bg-[#0f0c0c]">
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#1a1616] border-r border-[#2d2424] hidden lg:flex flex-col p-8 z-50">
        <div className="flex items-center gap-3 mb-12">
          <h1 className="text-2xl font-serif text-[#c8a97e]">Cellar Rat</h1>
        </div>
        <nav className="space-y-4">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full text-left px-4 py-3 rounded-lg ${activeTab === 'dashboard' ? 'bg-[#231d1d] text-[#c8a97e]' : 'text-gray-500'}`}>Dashboard</button>
          <button onClick={() => setActiveTab('inventory')} className={`w-full text-left px-4 py-3 rounded-lg ${activeTab === 'inventory' ? 'bg-[#231d1d] text-[#c8a97e]' : 'text-gray-500'}`}>Inventory</button>
          <button onClick={() => setActiveTab('sommelier')} className={`w-full text-left px-4 py-3 rounded-lg ${activeTab === 'sommelier' ? 'bg-[#231d1d] text-[#c8a97e]' : 'text-gray-500'}`}>AI Sommelier</button>
        </nav>
      </aside>

      <main className="lg:ml-64 flex-1 p-6 lg:p-12 max-w-7xl mx-auto w-full">
        <header className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-serif text-[#c8a97e] capitalize">{activeTab}</h2>
          {activeTab === 'inventory' && (
            <button onClick={() => setIsAdding(true)} className="bg-[#c8a97e] text-black px-6 py-2 rounded-lg font-bold">Add Wine</button>
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
              <div key={wine.id} className="bg-[#1a1616] border border-[#2d2424] rounded-xl p-5 hover:border-[#c8a97e] transition-colors">
                <div className="flex justify-between mb-2">
                  <span className="text-[10px] font-bold text-[#c8a97e]">{wine.vintage}</span>
                  <div className="flex gap-3">
                    <button onClick={() => setEditingWine(wine)} className="text-xs text-gray-500 hover:text-white">Edit</button>
                    <button onClick={() => removeWine(wine.id)} className="text-xs text-gray-500 hover:text-red-500">Delete</button>
                  </div>
                </div>
                <h4 className="font-serif text-xl">{wine.producer}</h4>
                <p className="text-gray-400 text-sm mb-4">{wine.name}</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <button onClick={() => adjustQuantity(wine.id, -1)} className="w-8 h-8 rounded border border-gray-700">-</button>
                    <span className="font-bold">{wine.quantity}</span>
                    <button onClick={() => adjustQuantity(wine.id, 1)} className="w-8 h-8 rounded border border-gray-700">+</button>
                  </div>
                  <span className="text-[#c8a97e] font-serif">${((wine.valuation || 0) * wine.quantity).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'sommelier' && <SommelierChat cellar={cellar} />}
      </main>

      <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-[#1a1616] border-t border-[#2d2424] flex justify-around p-4 z-40">
        <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'text-[#c8a97e]' : 'text-gray-500'}>Stats</button>
        <button onClick={() => setActiveTab('inventory')} className={activeTab === 'inventory' ? 'text-[#c8a97e]' : 'text-gray-500'}>Cellar</button>
        <button onClick={() => setActiveTab('sommelier')} className={activeTab === 'sommelier' ? 'text-[#c8a97e]' : 'text-gray-500'}>Somm</button>
      </nav>
    </div>
  );
};

export default App;