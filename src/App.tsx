import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Target, 
  Wind, 
  Thermometer, 
  Settings, 
  Crosshair, 
  MessageSquare, 
  ChevronRight, 
  Save, 
  Plus, 
  Trash2,
  Activity,
  Navigation,
  Cloud
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { RifleProfile, EnvironmentalData, BallisticSolution, RifleVariant } from './types';
import { DEFAULT_RIFLE_PROFILES, LEUPOLD_SCOPES, RIFLE_VARIANTS } from './constants';
import { BallisticService } from './services/ballisticService';

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export default function App() {
  const [profiles, setProfiles] = useState<RifleProfile[]>(DEFAULT_RIFLE_PROFILES);
  const [activeProfileId, setActiveProfileId] = useState(DEFAULT_RIFLE_PROFILES[0].id);
  const [range, setRange] = useState<number>(500);
  const [env, setEnv] = useState<EnvironmentalData>({
    temperature: 59,
    pressure: 29.92,
    humidity: 50,
    altitude: 0,
    windSpeed: 5,
    windAngle: 90,
    inclination: 0,
  });
  const [showAI, setShowAI] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const activeProfile = useMemo(() => 
    profiles.find(p => p.id === activeProfileId) || profiles[0],
    [profiles, activeProfileId]
  );

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState<RifleProfile>(activeProfile);

  useEffect(() => {
    setEditProfileData(activeProfile);
  }, [activeProfile]);

  const saveProfile = () => {
    setProfiles(prev => prev.map(p => p.id === editProfileData.id ? editProfileData : p));
    setIsEditingProfile(false);
  };

  const solution = useMemo(() => 
    BallisticService.calculate(range, activeProfile, env),
    [range, activeProfile, env]
  );

  const trajectoryTable = useMemo(() => 
    BallisticService.getTrajectoryTable(activeProfile, env),
    [activeProfile, env]
  );

  const handleAiQuery = async () => {
    if (!aiQuery.trim()) return;
    setIsAiLoading(true);
    try {
      const prompt = `
        You are the SC-76 Thunderbolt Ballistic Assistant. 
        Current Context:
        Rifle: ${activeProfile.variant} (${activeProfile.name})
        Muzzle Velocity: ${activeProfile.muzzleVelocity} fps
        Bullet: ${activeProfile.bulletWeight}gr, BC: ${activeProfile.ballisticCoefficient} (${activeProfile.bcType})
        Conditions: ${env.temperature}°F, ${env.pressure} inHg, ${env.windSpeed}mph wind at ${env.windAngle}°.
        
        User Query: ${aiQuery}
        
        Provide a professional, precise, and concise response focused on ballistic solutions or shooting advice.
      `;
      const response = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }],
      });
      setAiResponse(response.text || 'No response generated.');
    } catch (error) {
      console.error(error);
      setAiResponse("Error connecting to Gemini. Please check your connection.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen technical-grid p-4 md:p-8 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter text-white flex items-center gap-2">
            <Crosshair className="text-emerald-500" />
            SC-76 <span className="text-emerald-500">THUNDERBOLT</span>
          </h1>
          <p className="text-neutral-500 text-sm font-mono uppercase tracking-widest">Ballistic Companion • Leupold 1/4 MOA Optimized</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowAI(!showAI)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${showAI ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-600'}`}
          >
            <MessageSquare size={18} />
            <span className="font-medium">AI Assistant</span>
          </button>
          <div className="h-10 w-px bg-neutral-800 hidden md:block" />
          <div className="flex flex-col items-end">
            <span className="text-xs text-neutral-500 font-mono uppercase">System Status</span>
            <span className="text-emerald-500 text-xs font-mono flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Operational
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Inputs & Profile */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Solve Card */}
          <section className="glass-panel rounded-2xl p-6">
            <h2 className="text-sm font-mono text-neutral-500 uppercase mb-4 flex items-center gap-2">
              <Target size={16} /> Target Parameters
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-neutral-400 mb-1 uppercase tracking-wider">Range (Yards)</label>
                <input 
                  type="number" 
                  value={range}
                  onChange={(e) => setRange(Number(e.target.value))}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-2xl font-mono text-emerald-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <input 
                  type="range" 
                  min="100" 
                  max="1200" 
                  step="10"
                  value={range}
                  onChange={(e) => setRange(Number(e.target.value))}
                  className="w-full mt-4 accent-emerald-500"
                />
              </div>
            </div>
          </section>

          {/* Environmental Card */}
          <section className="glass-panel rounded-2xl p-6">
            <h2 className="text-sm font-mono text-neutral-500 uppercase mb-4 flex items-center gap-2">
              <Cloud size={16} /> Environment
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-neutral-500 uppercase">Temp (°F)</label>
                <div className="flex items-center gap-2 bg-neutral-900/50 p-2 rounded-lg border border-neutral-800">
                  <Thermometer size={14} className="text-neutral-400" />
                  <input 
                    type="number" 
                    value={env.temperature}
                    onChange={(e) => setEnv({...env, temperature: Number(e.target.value)})}
                    className="bg-transparent w-full text-sm font-mono focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-neutral-500 uppercase">Pressure (inHg)</label>
                <div className="flex items-center gap-2 bg-neutral-900/50 p-2 rounded-lg border border-neutral-800">
                  <Activity size={14} className="text-neutral-400" />
                  <input 
                    type="number" 
                    step="0.01"
                    value={env.pressure}
                    onChange={(e) => setEnv({...env, pressure: Number(e.target.value)})}
                    className="bg-transparent w-full text-sm font-mono focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-neutral-500 uppercase">Wind (MPH)</label>
                <div className="flex items-center gap-2 bg-neutral-900/50 p-2 rounded-lg border border-neutral-800">
                  <Wind size={14} className="text-neutral-400" />
                  <input 
                    type="number" 
                    value={env.windSpeed}
                    onChange={(e) => setEnv({...env, windSpeed: Number(e.target.value)})}
                    className="bg-transparent w-full text-sm font-mono focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-neutral-500 uppercase">Wind Angle (°)</label>
                <div className="flex items-center gap-2 bg-neutral-900/50 p-2 rounded-lg border border-neutral-800">
                  <Navigation size={14} className="text-neutral-400" />
                  <input 
                    type="number" 
                    value={env.windAngle}
                    onChange={(e) => setEnv({...env, windAngle: Number(e.target.value)})}
                    className="bg-transparent w-full text-sm font-mono focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Profile Selector */}
          <section className="glass-panel rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-mono text-neutral-500 uppercase flex items-center gap-2">
                <Settings size={16} /> Rifle Profile
              </h2>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsEditingProfile(true)}
                  className="text-neutral-500 hover:text-emerald-500 transition-colors"
                  title="Edit Active Profile"
                >
                  <Settings size={18} />
                </button>
                <button className="text-emerald-500 hover:text-emerald-400 transition-colors">
                  <Plus size={18} />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {profiles.map(p => (
                <button
                  key={p.id}
                  onClick={() => setActiveProfileId(p.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group ${activeProfileId === p.id ? 'bg-emerald-500/10 border-emerald-500/50 text-white' : 'bg-neutral-900/50 border-neutral-800 text-neutral-400 hover:border-neutral-700'}`}
                >
                  <div>
                    <div className="text-sm font-bold">{p.name}</div>
                    <div className="text-[10px] uppercase font-mono opacity-60">{p.variant}</div>
                  </div>
                  <ChevronRight size={16} className={`transition-transform ${activeProfileId === p.id ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Center Column: Solution */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Solution Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Elevation */}
            <motion.div 
              layout
              className="glass-panel rounded-3xl p-8 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Target size={120} />
              </div>
              <h3 className="text-neutral-500 font-mono text-xs uppercase tracking-widest mb-2">Elevation Solution</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-bold text-white tracking-tighter">{solution.elevationMOA}</span>
                <span className="text-xl font-mono text-emerald-500">MOA</span>
              </div>
              <div className="mt-6 flex items-center gap-4">
                <div className="bg-emerald-500 text-black px-4 py-2 rounded-xl font-bold text-lg">
                  {solution.elevationClicks} <span className="text-xs uppercase">Clicks UP</span>
                </div>
                <div className="text-neutral-500 text-xs font-mono">
                  Leupold 1/4 MOA<br/>Adjustment
                </div>
              </div>
            </motion.div>

            {/* Windage */}
            <motion.div 
              layout
              className="glass-panel rounded-3xl p-8 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Wind size={120} />
              </div>
              <h3 className="text-neutral-500 font-mono text-xs uppercase tracking-widest mb-2">Windage Solution</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-bold text-white tracking-tighter">{solution.windageMOA}</span>
                <span className="text-xl font-mono text-emerald-500">MOA</span>
              </div>
              <div className="mt-6 flex items-center gap-4">
                <div className={`px-4 py-2 rounded-xl font-bold text-lg ${solution.windageClicks > 0 ? 'bg-blue-500 text-white' : 'bg-neutral-800 text-neutral-400'}`}>
                  {Math.abs(solution.windageClicks)} <span className="text-xs uppercase">{solution.windageClicks >= 0 ? 'Clicks RIGHT' : 'Clicks LEFT'}</span>
                </div>
                <div className="text-neutral-500 text-xs font-mono">
                  {env.windSpeed} MPH @ {env.windAngle}°<br/>Crosswind
                </div>
              </div>
            </motion.div>
          </div>

          {/* Trajectory Table */}
          <section className="glass-panel rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
              <h2 className="text-sm font-mono text-neutral-500 uppercase flex items-center gap-2">
                <Activity size={16} /> Trajectory Table
              </h2>
              <span className="text-[10px] font-mono text-neutral-600 uppercase">100 - 1000 Yards</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-900/50">
                    <th className="p-4 text-[10px] font-mono text-neutral-500 uppercase border-b border-neutral-800">Range (yd)</th>
                    <th className="p-4 text-[10px] font-mono text-neutral-500 uppercase border-b border-neutral-800">Drop (MOA)</th>
                    <th className="p-4 text-[10px] font-mono text-neutral-500 uppercase border-b border-neutral-800">Clicks</th>
                    <th className="p-4 text-[10px] font-mono text-neutral-500 uppercase border-b border-neutral-800">Wind (MOA)</th>
                    <th className="p-4 text-[10px] font-mono text-neutral-500 uppercase border-b border-neutral-800">Velocity (fps)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {trajectoryTable.map((row, idx) => (
                    <tr key={idx} className={`hover:bg-neutral-900/30 transition-colors ${row.range === Math.round(range / 50) * 50 ? 'bg-emerald-500/5' : ''}`}>
                      <td className="p-4 font-mono text-sm text-neutral-300">{row.range}</td>
                      <td className="p-4 font-mono text-sm text-white">{row.elevationMOA}</td>
                      <td className="p-4 font-mono text-sm text-emerald-500">{row.elevationClicks}</td>
                      <td className="p-4 font-mono text-sm text-neutral-400">{row.windageMOA}</td>
                      <td className="p-4 font-mono text-sm text-neutral-500">{row.velocity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      {/* Profile Editor Modal */}
      <AnimatePresence>
        {isEditingProfile && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditingProfile(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel w-full max-w-2xl rounded-3xl p-8 relative z-10 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Settings className="text-emerald-500" /> Edit Rifle Profile
                </h2>
                <button onClick={() => setIsEditingProfile(false)} className="text-neutral-500 hover:text-white">
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-neutral-500 uppercase mb-1">Profile Name</label>
                    <input 
                      type="text" 
                      value={editProfileData.name}
                      onChange={(e) => setEditProfileData({...editProfileData, name: e.target.value})}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-500 uppercase mb-1">Variant</label>
                    <select 
                      value={editProfileData.variant}
                      onChange={(e) => setEditProfileData({...editProfileData, variant: e.target.value as RifleVariant})}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:border-emerald-500 outline-none"
                    >
                      {RIFLE_VARIANTS.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-500 uppercase mb-1">Muzzle Velocity (FPS)</label>
                    <input 
                      type="number" 
                      value={editProfileData.muzzleVelocity}
                      onChange={(e) => setEditProfileData({...editProfileData, muzzleVelocity: Number(e.target.value)})}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-500 uppercase mb-1">Sight Height (Inches)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={editProfileData.sightHeight}
                      onChange={(e) => setEditProfileData({...editProfileData, sightHeight: Number(e.target.value)})}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-neutral-500 uppercase mb-1">Bullet Weight (Grains)</label>
                    <input 
                      type="number" 
                      value={editProfileData.bulletWeight}
                      onChange={(e) => setEditProfileData({...editProfileData, bulletWeight: Number(e.target.value)})}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-500 uppercase mb-1">Ballistic Coefficient</label>
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        step="0.001"
                        value={editProfileData.ballisticCoefficient}
                        onChange={(e) => setEditProfileData({...editProfileData, ballisticCoefficient: Number(e.target.value)})}
                        className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:border-emerald-500 outline-none"
                      />
                      <select 
                        value={editProfileData.bcType}
                        onChange={(e) => setEditProfileData({...editProfileData, bcType: e.target.value as 'G1' | 'G7'})}
                        className="bg-neutral-900 border border-neutral-800 rounded-xl px-2 py-2 text-sm focus:border-emerald-500 outline-none"
                      >
                        <option value="G1">G1</option>
                        <option value="G7">G7</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-500 uppercase mb-1">Scope Model</label>
                    <select 
                      value={editProfileData.scopeModel}
                      onChange={(e) => setEditProfileData({...editProfileData, scopeModel: e.target.value})}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:border-emerald-500 outline-none"
                    >
                      {LEUPOLD_SCOPES.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-500 uppercase mb-1">Zero Range (Yards)</label>
                    <input 
                      type="number" 
                      value={editProfileData.zeroRange}
                      onChange={(e) => setEditProfileData({...editProfileData, zeroRange: Number(e.target.value)})}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-10 flex gap-4">
                <button 
                  onClick={saveProfile}
                  className="flex-1 bg-emerald-500 text-black font-bold py-3 rounded-xl hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={18} /> Save Profile
                </button>
                <button 
                  onClick={() => setIsEditingProfile(false)}
                  className="flex-1 bg-neutral-800 text-white font-bold py-3 rounded-xl hover:bg-neutral-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Assistant Sidebar */}
      <AnimatePresence>
        {showAI && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full md:w-[400px] bg-neutral-950 border-l border-neutral-800 z-50 shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center text-black">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white">Gemini Assistant</h3>
                  <p className="text-[10px] text-emerald-500 font-mono uppercase">Ballistic Intelligence</p>
                </div>
              </div>
              <button onClick={() => setShowAI(false)} className="text-neutral-500 hover:text-white">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {aiResponse ? (
                <div className="bg-neutral-900 rounded-2xl p-4 border border-neutral-800 text-sm leading-relaxed text-neutral-300">
                  {aiResponse}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="h-16 w-16 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-neutral-800">
                    <Activity className="text-neutral-700" />
                  </div>
                  <p className="text-neutral-500 text-sm">Ask about wind holds, comparisons, or shooting tips.</p>
                </div>
              )}
              {isAiLoading && (
                <div className="flex items-center gap-2 text-emerald-500 font-mono text-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Analyzing ballistics...
                </div>
              )}
            </div>

            <div className="p-6 border-t border-neutral-800">
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Ask Gemini..."
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAiQuery()}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors pr-12"
                />
                <button 
                  onClick={handleAiQuery}
                  disabled={isAiLoading}
                  className="absolute right-2 top-2 h-8 w-8 bg-emerald-500 rounded-lg flex items-center justify-center text-black hover:bg-emerald-400 transition-colors disabled:opacity-50"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
              <p className="text-[10px] text-neutral-600 mt-3 text-center uppercase font-mono">Powered by Gemini 3 Flash</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer / Status Bar */}
      <footer className="max-w-7xl mx-auto mt-12 pt-8 border-t border-neutral-900 flex flex-col md:flex-row items-center justify-between gap-4 text-neutral-600">
        <div className="text-[10px] font-mono uppercase tracking-widest">
          &copy; 2026 Steel Core Designs • Tactical Systems Division
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-mono uppercase">GPS Locked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-mono uppercase">Leupold Sync Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
