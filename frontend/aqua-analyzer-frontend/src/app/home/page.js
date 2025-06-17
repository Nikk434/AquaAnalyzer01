"use client";
import React, { useState, useEffect, useRef } from "react";
// import { stopAnalysis } from "../api/stop/route";
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
  // API Integration States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(null);
  const [geofenceCrossed, setGeofenceCrossed] = useState(false);
  const eventSourceRef = useRef(null);

  // Original states - now connected to API
  const [totalFishCount, setTotalFishCount] = useState(0);
  const [oxygenLevel, setOxygenLevel] = useState(8.2);
  const [waterTemp, setWaterTemp] = useState(24.5);
  const [isLiveStreamActive, setIsLiveStreamActive] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'connecting', 'connected', 'disconnected', 'error'

  // Fish species data - now updated from API
  const [fishSpecies, setFishSpecies] = useState([
    { name: "KOI", count: 0, threshold: 8, color: "#f59e0b" },
    { name: "THILAPIA", count: 0, threshold: 7, color: "#8b5cf6" },
  ]);

  // Mock user data
  const user = {
    name: "Admin",
    avatar: "https://www.gravatar.com/avatar/89ff869ef48948d2365305c2f3be6181",
    tankLocation: "Main Aquarium Hall"
  };

  // Cleanup function for EventSource
  const cleanupEventSource = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  // API Integration Functions - Updated for proper streaming
  const startAnalysis = async () => {
    if (isAnalyzing) return; // Prevent multiple connections

    setIsAnalyzing(true);
    setIsLiveStreamActive(true);
    setConnectionStatus('connecting');
    setCurrentFrame(null);
    setTotalFishCount(0);
    setFishSpecies(prev => prev.map(species => ({ ...species, count: 0 })));
    setGeofenceCrossed(false);
    setAlerts([]);

    // Clean up any existing connection
    cleanupEventSource();

    try {
      // Use EventSource for Server-Sent Events (SSE) - connects to GET endpoint
      const eventSource = new EventSource('/api/analyze');
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('SSE connection opened');
        setConnectionStatus('connected');
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received data:', data);

          if (data.frame !== undefined) {
            setCurrentFrame(data.frame);
          }

          if (data.total_fish !== undefined) {
            setTotalFishCount(data.total_fish);
          }

          if (data.species_count) {
            // Update species count state
            setFishSpecies(prev => prev.map(species => ({
              ...species,
              count: data.species_count[species.name] || 0
            })));

            // Update alerts based on new species count
            const newAlerts = [];
            Object.entries(data.species_count).forEach(([speciesName, count]) => {
              const speciesData = fishSpecies.find(s => s.name === speciesName);
              if (speciesData && count < speciesData.threshold) {
                newAlerts.push({
                  id: Date.now() + Math.random(),
                  type: "warning",
                  message: `${speciesName} count below threshold (${count}/${speciesData.threshold})`,
                  time: "now"
                });
              }
            });

            if (newAlerts.length > 0) {
              setAlerts(prev => {
                // Remove old alerts for the same species and add new ones
                const filteredAlerts = prev.filter(alert =>
                  !newAlerts.some(newAlert =>
                    alert.message.includes(newAlert.message.split(' ')[0])
                  )
                );
                return [...filteredAlerts, ...newAlerts];
              });
            }
          }

          if (data.geofence_crossed !== undefined) {
            setGeofenceCrossed(data.geofence_crossed);
            if (data.geofence_crossed) {
              setAlerts(prev => [...prev, {
                id: Date.now(),
                type: "warning",
                message: "Geofence boundary crossed!",
                time: "now"
              }]);
            }
          }
        } catch (e) {
          console.warn('Could not parse SSE data:', event.data, e);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        setConnectionStatus('error');
        setAlerts(prev => [...prev, {
          id: Date.now(),
          type: "error",
          message: "Connection error - stream interrupted",
          time: "now"
        }]);

        // Auto-retry after 3 seconds
        // setTimeout(() => {
        //   if (isLiveStreamActive) {
        //     console.log('Attempting to reconnect...');
        //     startAnalysis();
        //   }
        // }, 3000);
      };

    } catch (err) {
      console.error('Failed to start analysis:', err);
      setConnectionStatus('error');
      setAlerts(prev => [...prev, {
        id: Date.now(),
        type: "error",
        message: "Failed to start analysis - please retry",
        time: "now"
      }]);
      setIsAnalyzing(false);
    }
  };

  // const stopAnalysis = () => {
  //   setIsAnalyzing(false);
  //   setIsLiveStreamActive(false);
  //   setConnectionStatus('disconnected');
  //   cleanupEventSource();
  // };

  const stop_analysis = async () => {
  try {
    const response = await fetch('/api/stop', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();

    if (response.ok) {
      setIsAnalyzing(false);
      setIsLiveStreamActive(false);
      setConnectionStatus('disconnected');
      cleanupEventSource(); // Clean up the SSE connection
      alert('Analysis stopped successfully!');
    } else {
      alert(`Failed to stop analysis: ${result.message}`);
    }

  } catch (error) {
    console.error('Error stopping analysis:', error);
    alert('An unexpected error occurred while stopping analysis.');
  }


};

  // Get one-time data fetch (using POST endpoint)
  // const fetchOneTimeData = async () => {
  //   try {
  //     const response = await fetch('/api/analyze', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       }
  //     });

  //     if (!response.ok) {
  //       throw new Error('Failed to fetch data');
  //     }

  //     const data = await response.json();
  //     console.log('One-time data:', data);

  //     // Update state with one-time data
  //     if (data.total_fish !== undefined) {
  //       setTotalFishCount(data.total_fish);
  //     }

  //     if (data.species) {
  //       setFishSpecies(prev => prev.map(species => ({
  //         ...species,
  //         count: data.species[species.name] || 0
  //       })));
  //     }

  //   } catch (error) {
  //     console.error('Error fetching one-time data:', error);
  //     setAlerts(prev => [...prev, {
  //       id: Date.now(),
  //       type: "error",
  //       message: "Failed to fetch data",
  //       time: "now"
  //     }]);
  //   }
  // };

  // Handle play/pause button
  const handleStreamToggle = () => {
    if (isLiveStreamActive && isAnalyzing) {
      stop_analysis();
    } else if (!isLiveStreamActive && !isAnalyzing) {
      startAnalysis();
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupEventSource();
    };
  }, []);

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

  // Simulate environmental data updates (oxygen, temperature)
  useEffect(() => {
    const interval = setInterval(() => {
      setOxygenLevel(prev => Math.max(5.0, Math.min(10.0, prev + (Math.random() - 0.5) * 0.2)));
      setWaterTemp(prev => Math.max(20, Math.min(30, prev + (Math.random() - 0.5) * 0.3)));
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
      <div className={`bg-white rounded-xl p-4 shadow-md border-l-4 ${isLow ? 'border-red-400' : 'border-green-400'
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
            {isLow && species.count > 0 && (
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
              {/* Connection Status Indicator */}
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' :
                    connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                      connectionStatus === 'error' ? 'bg-red-500' : 'bg-gray-500'
                  }`}></div>
                <span className="text-cyan-200 text-sm capitalize">{connectionStatus}</span>
              </div>

              <div className="flex items-center space-x-2 text-white">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border-2 border-cyan-300"
                />
                <div className="text-right">
                  <span className="text-sm font-medium">Welcome, {user.name}</span>
                  {user.lastLogin && <p className="text-xs text-cyan-200">{user.lastLogin}</p>}
                </div>
              </div>
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
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-6 shadow-2xl transform opacity-0 animate-fade-in" style={{ animation: 'fadeIn 0.8s ease-out forwards' }}>
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
                  {geofenceCrossed && (
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                      Geofence Alert!
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleStreamToggle}
                    disabled={connectionStatus === 'connecting'}
                    className={`p-3 rounded-xl transition-all transform hover:scale-105 ${isLiveStreamActive
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-green-100 text-green-600 hover:bg-green-200'
                      } ${connectionStatus === 'connecting' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {connectionStatus === 'connecting' ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : isLiveStreamActive ? (
                      <PauseCircle onClick={stop_analysis} className="w-5 h-5" />
                    ) : (
                      <PlayCircle onClick={startAnalysis} className="w-5 h-5" />
                    )}
                  </button>
                  {/* <button
                    onClick={fetchOneTimeData}
                    className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-all transform hover:scale-105"
                    title="Fetch current data"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button> */}
                  <button className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all transform hover:scale-105">
                    <Camera className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Video Feed Area */}
              <div className="relative bg-gradient-to-br from-blue-900 to-teal-800 rounded-2xl overflow-hidden aspect-video">
                {isLiveStreamActive ? (
                  <div className="absolute inset-0">
                    {/* Real video feed from API */}
                    <img
                      src="http://127.0.0.1:5000/video_feed"
                      alt="Live Video Stream"
                      className="w-full h-full object-cover rounded-2xl"
                      onError={(e) => {
                        // Fallback to animated view if video feed fails
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />

                    {/* Fallback animated view */}
                    <div className="w-full h-full flex items-center justify-center" style={{ display: 'none' }}>
                      <div className="relative w-full h-full">
                        <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-green-600/30 to-transparent"></div>

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
                      </div>
                    </div>

                    {/* Live indicator */}
                    <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span>LIVE</span>
                    </div>

                    {/* Frame counter */}
                    {currentFrame !== null && (
                      <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                        Frame: {currentFrame}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <div className="text-center text-white">
                      <PlayCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">Feed Stopped</p>
                      <p className="text-sm opacity-75">Click play to start monitoring</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Feed Controls */}
              <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-4">
                  <span>Quality: 1080p</span>
                  <span>FPS: 30</span>
                  <span>Status: {
                    connectionStatus === 'connected' ? 'Connected' :
                      connectionStatus === 'connecting' ? 'Connecting...' :
                        connectionStatus === 'error' ? 'Error' : 'Disconnected'
                  }</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>{isLiveStreamActive ? 'AI Detection Active' : 'Detection Paused'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Dashboard Stats */}
          <div className="space-y-6">
            {/* System Status and Total Count - Side by Side */}
            <div className="grid grid-cols-2 gap-4">
              {/* System Status - Compact */}
              <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-4 shadow-xl transform opacity-0 animate-fade-in" style={{ animation: 'fadeIn 0.8s ease-out 0.6s forwards' }}>
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${connectionStatus === 'connected' ? 'bg-green-500' :
                      connectionStatus === 'connecting' ? 'bg-yellow-500' :
                        connectionStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'
                    }`}>
                    {connectionStatus === 'connected' ? <Check className="w-3 h-3 text-white" /> :
                      connectionStatus === 'connecting' ? <RefreshCw className="w-3 h-3 text-white animate-spin" /> :
                        <X className="w-3 h-3 text-white" />}
                  </div>
                  Status
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Camera</span>
                    <span className={`font-medium ${isLiveStreamActive ? 'text-green-600' : 'text-gray-500'}`}>
                      {isLiveStreamActive ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">AI Detection</span>
                    <span className={`font-medium ${connectionStatus === 'connected' ? 'text-green-600' : 'text-gray-500'}`}>
                      {connectionStatus === 'connected' ? 'Active' : 'Inactive'}
                    </span>
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
                trend={totalFishCount > 0 ? 2 : 0}
              />
            </div>

            {/* Alerts Panel */}
            {alerts.length > 0 && (
              <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl transform opacity-0 animate-fade-in" style={{ animation: 'fadeIn 0.8s ease-out 0.4s forwards' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <Bell className="w-5 h-5 mr-2 text-orange-500" />
                    Active Alerts
                  </h3>
                  <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                    {alerts.length}
                  </span>
                </div>
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-lg border-l-4 ${alert.type === 'warning'
                        ? 'bg-orange-50 border-orange-400'
                        : alert.type === 'error'
                          ? 'bg-red-50 border-red-400'
                          : 'bg-blue-50 border-blue-400'
                        }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${alert.type === 'warning' ? 'text-orange-800' :
                            alert.type === 'error' ? 'text-red-800' : 'text-blue-800'
                            }`}>
                            {alert.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                        </div>
                        <AlertTriangle className={`w-4 h-4 ml-2 ${alert.type === 'warning' ? 'text-orange-500' :
                          alert.type === 'error' ? 'text-red-500' : 'text-blue-500'
                          }`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fish Species Count - Now takes full width */}
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl transform opacity-0 animate-fade-in" style={{ animation: 'fadeIn 0.8s ease-out 0.2s forwards' }}>
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