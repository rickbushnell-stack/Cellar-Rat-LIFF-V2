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

  // LIFF Initialization
  useEffect(() => {
    const initLiff = async () => {
      const LIFF_ID = process.env.LIFF_ID || "";
      
      // Check for common setup mistakes
      if (!LIFF_ID || LIFF_ID === "YOUR_LIFF_ID_HERE") {
        setLiffError({
          title: "Setup Required",
          message: "The LIFF ID is missing. Please add 'LIFF_ID' to your Vercel Environment Variables."
        });
        return;
      }

      try {
        await liff.init({ liffId: LIFF_ID });
        if (!liff.isLoggedIn()) {
          liff.login();
        } else {
          const profile = await liff.getProfile();
          setUser(profile);
        }
      } catch (err: any) {
        console.error("LIFF Init Error", err);
        // "channel not found" usually means the ID exists but is invalid/wrong
        const msg = err.message === "channel not found" 
          ? "Invalid LIFF ID. Please double-check the ID in your LINE Developers Console."
          : err.message;
        
        setLiffError({
          title: "Cellar Gate Locked",
          message: msg
        });
      }
    };
    initLiff();
  }, []);

  // Scoped real-time synchronization with Firestore based on User ID
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
      console.error("Firestore Error:", error);
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
      console.error("Error adding wine: ", e);
      alert("Failed to add wine to cloud.");
    }
  };

  const updateWine = async (data: Omit<Wine, 'id' | 'addedAt'>) => {
    if (!editingWine || !user?.userId) return;
    try {
      const wineRef = doc(db, "users", user.userId, "wines", editingWine.id);
      await updateDoc(wineRef, { ...data });
      setEditingWine(null);
    } catch (e) {
      console.error("Error updating wine: ", e);
      alert("Failed to update wine.");
    }
  };

  const removeWine = async (id: string) => {
    if (!user?.userId) return;
    if (confirm('Remove this vintage from your collection?')) {
      try {
        await deleteDoc(doc(db, "users", user.userId, "wines", id));
      } catch (e) {
        console.error("Error deleting wine: ", e);
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
      if (confirm('Last bottle removed. Keep this record with 0 quantity?')) {
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
      <div className="flex items-center justify-center min-h-screen bg-[#0f0c0c] p-8 text-center">
        <div className="max-w-md w-full bg-[#1a1616] p-8 rounded-2xl border border-[#2d2424] shadow-2xl">
          <div className="w-16 h-16 bg-[#4a0e0e] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#c8a97e]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#c8a97e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-6a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-[#c8a97e] font-serif text-2xl mb-4">{liffError.title}</h2>
          <p className="text-gray-400 mb-8 leading-relaxed">{liffError.message}</p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => window.location.reload()} 
              className="bg-[#c8a97e] text-black font-bold py-3 rounded-lg hover:bg-[#b8986d] transition-colors"
            >
              Try Again
            </button>
            <a 
              href="https://developers.line.biz/console/" 
              target="_blank" 
              className="text-[#c8a97e] text-sm underline hover:text-white transition-colors"
            >
              Open LINE Developers Console
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f0c0c]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#c8a97e] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#c8a97e] font-serif animate-pulse text-lg">Decanting your cellar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 lg:pb-0 flex bg-[#0f0c0c]">
      {/* Sidebar for Desktop */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#1a1616] border-r border-[#2d2424] hidden lg:flex flex-col p-8 z-50">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-[#4a0e0e] rounded-lg rotate-12 flex items-center justify-center border border-[#c8a97e]">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#c8a97e] -rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
          </div>
          <h1 className="text-2xl font-serif text-[#c8a97e] tracking-tight">Cellar Rat</h1>
        </div>

        <nav className="space-y-4">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${activeTab === 'dashboard' ? 'bg-[#231d1d] text-[#c8a97e] border border-[#3a3030]' : 'text-gray-500 hover:text-gray-300'}`}>Dashboard</button>
          <button onClick={() => setActiveTab('inventory')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${activeTab === 'inventory' ? 'bg-[#231d1d] text-[#c8a97e] border border-[#3a3030]' : 'text-gray-500 hover:text-gray-300'}`}>Inventory</button>
          <button onClick={() => setActiveTab('sommelier')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${activeTab === 'sommelier' ? 'bg-[#231d1d] text-[#c8a97e] border border-[#3a3030]' : 'text-gray-500 hover:text-gray-300'}`}>AI Sommelier</button>
        </nav>

        <div className="mt-auto pt-8 border-t border-[#2d2424]">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Collector</p>
            {isSyncing ? <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span> : <span className="w-2 h-2 bg-green-500 rounded-full"></span>}
          </div>
          <div className="flex items-center gap-3">
             <img src={user.pictureUrl || 'https://via.placeholder.com/150'} className="w-8 h-8 rounded-full object-cover border border-[#c8a97e]" alt="profile" />
             <span className="text-sm font-medium truncate">{user.displayName}</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="lg:ml-64 flex-1 p-6 lg:p-12 max-w-7xl mx-auto w-full">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl font-serif text-[#c8a97e]">
              {activeTab === 'dashboard' && 'Cellar Insights'}
              {activeTab === 'inventory' && 'Wine Collection'}
              {activeTab === 'sommelier' && 'Digital Sommelier'}
            </h2>
          </div>
          {activeTab === 'inventory' && (
            <button onClick={() => setIsAdding(true)} className="bg-[#c8a97e] hover:bg-[#b8986d] text-black px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors">Add Wine</button>
          )}
        </header>

        {(isAdding || editingWine) && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
              <WineForm initialData={editingWine || undefined} onSubmit={editingWine ? updateWine : addWine} onCancel={() => { setIsAdding(false); setEditingWine(null); }} />
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && <Dashboard cellar={cellar} />}
        {activeTab === 'inventory' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {cellar.length === 0 && !isSyncing && (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-[#2d2424] rounded-xl">
                <p className="text-gray-500 italic">Your cellar is currently empty. Start by adding a bottle.</p>
              </div>
            )}
            {cellar.map(wine => (
              <div key={wine.id} className="bg-[#1a1616] border border-[#2d2424] rounded-xl overflow-hidden group hover:border-[#c8a97e] transition-colors shadow-lg">
                <div className="p-5">
                   <div className="flex justify-between mb-2">
                    <span className="text-[10px] font-bold text-[#c8a97e]">{wine.vintage}</span>
                    <div className="flex gap-4">
                      <button onClick={() => setEditingWine(wine)} className="text-xs text-gray-500 hover:text-white transition-colors">Edit</button>
                      <button onClick={() => removeWine(wine.id)} className="text-xs text-gray-500 hover:text-red-500 transition-colors">Delete</button>
                    </div>
                  </div>
                  <h4 className="font-serif text-xl">{wine.producer}</h4>
                  <p className="text-gray-400 text-sm">{wine.name}</p>
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center gap-3">
                      <button onClick={() => adjustQuantity(wine.id, -1)} className="w-8 h-8 rounded border border-gray-700 hover:bg-gray-800 flex items-center justify-center transition-colors">-</button>
                      <span className="font-bold min-w-[1rem] text-center">{wine.quantity}</span>
                      <button onClick={() => adjustQuantity(wine.id, 1)} className="w-8 h-8 rounded border border-gray-700 hover:bg-gray-800 flex items-center justify-center transition-colors">+</button>
                    </div>
                    <span className="text-[#c8a97e] font-serif text-lg">${((wine.valuation || 0) * wine.quantity).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'sommelier' && <SommelierChat cellar={cellar} />}
      </main>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-[#1a1616] border-t border-[#2d2424] flex justify-around p-4 z-40 backdrop-blur-md bg-opacity-90">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-[#c8a97e]' : 'text-gray-500'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
          <span className="text-[10px] uppercase font-bold tracking-tighter">Stats</span>
        </button>
        <button onClick={() => setActiveTab('inventory')} className={`flex flex-col items-center gap-1 ${activeTab === 'inventory' ? 'text-[#c8a97e]' : 'text-gray-500'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          <span className="text-[10px] uppercase font-bold tracking-tighter">Cellar</span>
        </button>
        <button onClick={() => setActiveTab('sommelier')} className={`flex flex-col items-center gap-1 ${activeTab === 'sommelier' ? 'text-[#c8a97e]' : 'text-gray-500'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
          <span className="text-[10px] uppercase font-bold tracking-tighter">AI Help</span>
        </button>
      </nav>
    </div>
  );
};

export default App;