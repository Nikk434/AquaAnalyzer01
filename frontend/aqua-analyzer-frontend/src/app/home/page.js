"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-r from-${color}-400 to-${color}-600 rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'}`}>
            {trend > 0 ? '↗' : trend < 0 ? '↘' : '→'} {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        <p className="text-gray-600 text-sm">{title}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </motion.div>
  );

  const SpeciesCard = ({ species }) => {
    const isLow = species.count < species.threshold;
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={`bg-white rounded-xl p-4 shadow-md border-l-4 ${
          isLow ? 'border-red-400' : 'border-green-400'
        }`}
      >
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
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-800 to-cyan-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center"
              >
                <Fish className="w-6 h-6 text-white" />
              </motion.div>
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/95 backdrop-blur-lg rounded-3xl p-6 shadow-2xl"
            >
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
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsLiveStreamActive(!isLiveStreamActive)}
                    className={`p-3 rounded-xl transition-colors ${
                      isLiveStreamActive 
                        ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                        : 'bg-green-100 text-green-600 hover:bg-green-200'
                    }`}
                  >
                    {isLiveStreamActive ? <PauseCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors"
                  >
                    <Camera className="w-5 h-5" />
                  </motion.button>
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
                        <motion.div
                          key={i}
                          className="absolute"
                          style={{
                            left: `${Math.random() * 80 + 10}%`,
                            top: `${Math.random() * 60 + 20}%`,
                          }}
                          animate={{
                            x: [0, Math.random() * 100 - 50, 0],
                            y: [0, Math.random() * 50 - 25, 0],
                          }}
                          transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                          }}
                        >
                          <Fish className="w-6 h-6 text-yellow-300" style={{ 
                            filter: `hue-rotate(${Math.random() * 360}deg)` 
                          }} />
                        </motion.div>
                      ))}
                      
                      {/* Bubbles */}
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={`bubble-${i}`}
                          className="absolute bottom-0 w-2 h-2 bg-white/30 rounded-full"
                          style={{ left: `${20 + i * 15}%` }}
                          animate={{
                            y: [0, -400],
                            opacity: [0, 1, 0],
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            delay: i * 0.5,
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
            </motion.div>

            {/* Fish Species Overview */}
            
          </div>

          {/* Right Column - Dashboard Stats */}
          <div className="space-y-6">
            {/* System Health */}
            {/* <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`bg-gradient-to-br ${
                healthStatus.color === 'green' ? 'from-green-400 to-emerald-600' :
                healthStatus.color === 'yellow' ? 'from-yellow-400 to-orange-500' :
                'from-red-400 to-red-600'
              } rounded-2xl p-6 shadow-xl text-white`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold">System Health</h3>
                  <p className="text-white/90 text-sm">Overall Status</p>
                </div>
                <Gauge className="w-8 h-8" />
              </div>
              <div className="text-2xl font-bold">{healthStatus.status}</div>
            </motion.div> */}
            {/* System Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                💡 System Status
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Camera Status</span>
                  <span className="text-green-600 font-medium">Online</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">AI Detection</span>
                  <span className="text-green-600 font-medium">Active</span>
                </div>
                {/* <div className="flex justify-between">
                  <span className="text-gray-600">Last Backup</span>
                  <span className="text-gray-600">2 hrs ago</span>
                </div> */}
                {/* <div className="flex justify-between">
                  <span className="text-gray-600">Uptime</span>
                  <span className="text-gray-600">15 days</span>
                </div> */}
              </div>
            </motion.div>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 gap-4">
              <StatCard
                icon={Fish}
                title="Total Fish Count"
                value={totalFishCount}
                subtitle="Currently detected"
                color="blue"
                trend={2}
              />
              
              {/* <StatCard
                icon={Droplets}
                title="Oxygen Level"
                value={`${oxygenLevel.toFixed(1)} mg/L`}
                subtitle={oxygenLevel >= 6 ? "Optimal range" : "Below optimal"}
                color={oxygenLevel >= 6 ? "green" : "red"}
                trend={oxygenLevel >= 7 ? 5 : -3}
              /> */}
              
              {/* <StatCard
                icon={Thermometer}
                title="Water Temperature"
                value={`${waterTemp.toFixed(1)}°C`}
                subtitle="Current reading"
                color="cyan"
                trend={1}
              /> */}
            </div>

            {/* Alerts Panel */}
            {/* <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-orange-500" />
                  Recent Alerts
                </h3>
                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                  {alerts.length} Active
                </span>
              </div>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-3 rounded-lg border-l-4 ${
                      alert.type === 'warning' 
                        ? 'bg-orange-50 border-orange-400' 
                        : 'bg-blue-50 border-blue-400'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          alert.type === 'warning' ? 'text-orange-800' : 'text-blue-800'
                        }`}>
                          {alert.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                      </div>
                      {alert.type === 'warning' && (
                        <AlertTriangle className="w-4 h-4 text-orange-500 ml-2" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div> */}

            {/* Emergency Contact */}
            {/* <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 shadow-xl text-white"
            >
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="w-8 h-8" />
                <div>
                  <h3 className="font-bold text-lg">Emergency Alert</h3>
                  <p className="text-red-100 text-sm">24/7 SMS Notifications</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center space-x-2 py-3 bg-white text-red-600 rounded-xl font-semibold hover:shadow-lg transition-shadow"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center space-x-2 py-3 bg-white text-red-600 rounded-xl font-semibold hover:shadow-lg transition-shadow"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>SMS</span>
                </motion.button>
              </div>
            </motion.div> */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Fish className="w-6 h-6 mr-2 text-blue-600" />
                Fish Species Count
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {fishSpecies.map((species, index) => (
                  <SpeciesCard key={index} species={species} />
                ))}
              </div>
            </motion.div>
            
          </div>
        </div>
      </main>
    </div>
  );
};

export default AquaAnalyzerHome;