"use client";
import React, { useState, useEffect } from "react";
import {
  Fish,
  Waves,
  Thermometer,
  AlertTriangle,
  Bell,
  Users,
  Target,
  Settings,
  User,
  X,
  Check,
  Zap,
  Eye,
  Activity,
  Droplets,
  MessageSquare,
  Phone,
  PlayCircle,
  PauseCircle,
  RefreshCw,
  Camera,
  Gauge,
} from "lucide-react";

const AquaAnalyzerHome = () => {
  // Mock data for fish monitoring
  const [totalFishCount, setTotalFishCount] = useState(47);
  const [oxygenLevel, setOxygenLevel] = useState(8.2);
  const [waterTemp, setWaterTemp] = useState(24.5);
  const [isLiveStreamActive, setIsLiveStreamActive] = useState(true);
  const [alerts, setAlerts] = useState([
    { id: 1, type: "warning", message: "Goldfish count below threshold (8/10)", time: "2 min ago" },
    { id: 2, type: "info", message: "Oxygen level optimal", time: "5 min ago" },
  ]);
  
  // Fish species data
  const [fishSpecies, setFishSpecies] = useState([
    { name: "Goldfish", count: 8, threshold: 10, color: "#f59e0b" },
    { name: "Angelfish", count: 12, threshold: 10, color: "#8b5cf6" },
    { name: "Clownfish", count: 15, threshold: 12, color: "#f97316" },
    { name: "Tetra", count: 12, threshold: 15, color: "#06b6d4" },
  ]);

  // Mock user data
  const user = {
    name: "Admin",
    avatar: "https://www.gravatar.com/avatar/89ff869ef48948d2365305c2f3be6181",
    // lastLogin: "Today, 2:30 PM",
    tankLocation: "Main Aquarium Hall"
  };

  // Calculate overall health status
  const getHealthStatus = () => {
    const oxygenOk = oxygenLevel >= 6.0;
    const tempOk = waterTemp >= 22 && waterTemp <= 28;
    const fishCountOk = fishSpecies.every(species => species.count >= species.threshold * 0.8);
    
    if (oxygenOk && tempOk && fishCountOk) return { status: "Excellent", color: "green" };
    if (oxygenOk && tempOk) return { status: "Good", color: "yellow" };
    return { status: "Needs Attention", color: "red" };
  };

  const healthStatus = getHealthStatus();

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setOxygenLevel(prev => Math.max(5.0, Math.min(10.0, prev + (Math.random() - 0.5) * 0.2)));
      setWaterTemp(prev => Math.max(20, Math.min(30, prev + (Math.random() - 0.5) * 0.3)));
      
      // Occasionally update fish counts
      if (Math.random() < 0.1) {
        setFishSpecies(prev => prev.map(species => ({
          ...species,
          count: Math.max(0, species.count + (Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0))
        })));
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue", trend }) => (
    <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 transform hover:scale-105 transition-transform duration-200">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 bg-gradient-to-r from-${color}-400 to-${color}-600 rounded-xl flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <div className={`text-xs font-medium ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'}`}>
            {trend > 0 ? '↗' : trend < 0 ? '↘' : '→'} {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-900">{value}</h3>
        <p className="text-gray-600 text-xs">{title}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );

  const SpeciesCard = ({ species }) => {
    const isLow = species.count < species.threshold;
    return (
      <div className={`bg-white rounded-xl p-4 shadow-md border-l-4 ${
        isLow ? 'border-red-400' : 'border-green-400'
      } transform hover:scale-105 transition-transform duration-200`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: species.color }}
            >
              <Fish className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{species.name}</h4>
              <p className="text-xs text-gray-500">Target: {species.threshold}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${isLow ? 'text-red-600' : 'text-green-600'}`}>
              {species.count}
            </div>
            {isLow && (
              <div className="text-xs text-red-500 font-medium">Below threshold</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-800 to-cyan-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center transform hover:scale-110 hover:rotate-12 transition-all duration-200">
                <Fish className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-white">AquaAnalyzer</span>
                <p className="text-cyan-200 text-xs">Fish Monitoring System</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-white">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border-2 border-cyan-300"
                />
                <div className="text-right">
                  <span className="text-sm font-medium">Welcome, {user.name}</span>
                  <p className="text-xs text-cyan-200">{user.lastLogin}</p>
                </div>
              </div>
              {/* <button className="p-2 text-white hover:text-cyan-200 transition-colors">
                <Settings className="w-5 h-5" />
              </button> */}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Live Feed */}
          <div className="lg:col-span-2 space-y-8">
            {/* Live Feed Card */}
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-6 shadow-2xl transform opacity-0 animate-fade-in" style={{animation: 'fadeIn 0.8s ease-out forwards'}}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${isLiveStreamActive ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {isLiveStreamActive ? 'Live Feed' : 'Feed Paused'}
                    </h2>
                  </div>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    {user.tankLocation}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsLiveStreamActive(!isLiveStreamActive)}
                    className={`p-3 rounded-xl transition-all transform hover:scale-105 ${
                      isLiveStreamActive 
                        ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                        : 'bg-green-100 text-green-600 hover:bg-green-200'
                    }`}
                  >
                    {isLiveStreamActive ? <PauseCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                  </button>
                  <button className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all transform hover:scale-105">
                    <RefreshCw className="w-5 h-5" />
                  </button>
                  <button className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-all transform hover:scale-105">
                    <Camera className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Video Feed Area */}
              <div className="relative bg-gradient-to-br from-blue-900 to-teal-800 rounded-2xl overflow-hidden aspect-video">
                {isLiveStreamActive ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* Simulated aquarium view with animated fish */}
                    <div className="relative w-full h-full">
                      {/* Background aquarium elements */}
                      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-green-600/30 to-transparent"></div>
                      
                      {/* Animated fish */}
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute animate-bounce"
                          style={{
                            left: `${Math.random() * 80 + 10}%`,
                            top: `${Math.random() * 60 + 20}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            animationDuration: `${3 + Math.random() * 2}s`
                          }}
                        >
                          <Fish className="w-6 h-6 text-yellow-300" style={{ 
                            filter: `hue-rotate(${Math.random() * 360}deg)` 
                          }} />
                        </div>
                      ))}
                      
                      {/* Bubbles */}
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={`bubble-${i}`}
                          className="absolute bottom-0 w-2 h-2 bg-white/30 rounded-full animate-ping"
                          style={{ 
                            left: `${20 + i * 15}%`,
                            animationDelay: `${i * 0.5}s`
                          }}
                        />
                      ))}
                      
                      {/* Live indicator */}
                      <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span>LIVE</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <div className="text-center text-white">
                      <PlayCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">Feed Paused</p>
                      <p className="text-sm opacity-75">Click play to resume monitoring</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Feed Controls */}
              <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-4">
                  <span>Quality: 1080p</span>
                  <span>FPS: 30</span>
                  <span>Latency: 120ms</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>Real-time Detection Active</span>
                </div>
              </div>
            </div>

            {/* Fish Species Overview */}
            
          </div>

          {/* Right Column - Dashboard Stats */}
          <div className="space-y-6">
            {/* System Status and Total Count - Side by Side */}
            <div className="grid grid-cols-2 gap-4">
              {/* System Status - Compact */}
              <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-4 shadow-xl transform opacity-0 animate-fade-in" style={{animation: 'fadeIn 0.8s ease-out 0.6s forwards'}}>
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-2">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  Status
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Camera</span>
                    <span className="text-green-600 font-medium">Online</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">AI Detection</span>
                    <span className="text-green-600 font-medium">Active</span>
                  </div>
                </div>
              </div>

              {/* Total Fish Count - Compact */}
              <StatCard
                icon={Fish}
                title="Total Fish"
                value={totalFishCount}
                subtitle="Detected"
                color="blue"
                trend={2}
              />
            </div>

            {/* Fish Species Count - Now takes full width */}
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl transform opacity-0 animate-fade-in" style={{animation: 'fadeIn 0.8s ease-out 0.2s forwards'}}>
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Fish className="w-6 h-6 mr-2 text-blue-600" />
                Fish Species Count
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {fishSpecies.map((species, index) => (
                  <SpeciesCard key={index} species={species} />
                ))}
              </div>
            </div>
            
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default AquaAnalyzerHome;