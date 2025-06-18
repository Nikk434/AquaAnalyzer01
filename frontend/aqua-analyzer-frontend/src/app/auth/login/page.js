'use client';

import { useState,useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input, Card, CardBody, Divider } from '@heroui/react';
import { Eye, EyeOff, Fish, Mail, Lock, ArrowRight, Phone, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  // Hardcoded credentials for demo
  const validCredentials = {
    username: 'aqua',
    password: 'aqua123'
  };

  const [windowDimensions, setWindowDimensions] = useState({
    width: 1200, // Default fallback values
    height: 800
  });
  const [mounted, setMounted] = useState(false);

  // Handle window dimensions on client side
  useEffect(() => {
    setMounted(true);

    const updateDimensions = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate loading time
    setTimeout(() => {
      if (formData.username === validCredentials.username &&
        formData.password === validCredentials.password) {
        // Success - redirect to home
        router.push('/home');
      } else {
        setError('Invalid credentials. Use username: admin, password: aqua123');
      }
      setIsLoading(false);
    }, 1500);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(""); // Clear error when user starts typing
  };

  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-800 to-cyan-900 flex items-center justify-center p-4 relative overflow-hidden">
  //       {/* Animated Background Elements - Fish Swimming */}
  //       <div className="absolute inset-0 overflow-hidden">
  //         {[...Array(8)].map((_, i) => (
  //           <motion.div
  //             key={i}
  //             className="absolute"
  //             style={{
  //               left: `${-10 + (i % 2) * 120}%`,
  //               top: `${10 + i * 12}%`,
  //             }}
  //             animate={{
  //               x: [0, window.innerWidth + 100],
  //             }}
  //             transition={{
  //               duration: 15 + Math.random() * 10,
  //               repeat: Infinity,
  //               delay: Math.random() * 5,
  //               ease: "linear"
  //             }}
  //           >
  //             <Fish className="w-8 h-8 text-cyan-200/20 transform rotate-0" />
  //           </motion.div>
  //         ))}

  //         {/* Floating Bubbles */}
  //         {[...Array(12)].map((_, i) => (
  //           <motion.div
  //             key={`bubble-${i}`}
  //             className="absolute rounded-full border-2 border-cyan-300/10"
  //             style={{
  //               width: Math.random() * 60 + 20,
  //               height: Math.random() * 60 + 20,
  //               left: `${Math.random() * 100}%`,
  //               top: `100%`,
  //             }}
  //             animate={{
  //               y: [0, -window.innerHeight - 100],
  //               opacity: [0, 0.6, 0],
  //               scale: [0.5, 1, 0.5],
  //             }}
  //             transition={{
  //               duration: 8 + Math.random() * 4,
  //               repeat: Infinity,
  //               delay: Math.random() * 3,
  //               ease: "easeOut"
  //             }}
  //           />
  //         ))}
  //       </div>

  //       <motion.div
  //         initial={{ opacity: 0, y: 20 }}
  //         animate={{ opacity: 1, y: 0 }}
  //         transition={{ duration: 0.6 }}
  //         className="w-full max-w-md relative z-10"
  //       >
  //         <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border border-cyan-200/20">
  //           <CardBody className="p-8">
  //             {/* Logo and Header */}
  //             <motion.div
  //               initial={{ scale: 0.8, opacity: 0 }}
  //               animate={{ scale: 1, opacity: 1 }}
  //               transition={{ delay: 0.2, duration: 0.5 }}
  //               className="text-center mb-8"
  //             >
  //               <motion.div
  //                 animate={{ 
  //                   rotate: [0, 5, -5, 0],
  //                   scale: [1, 1.05, 1]
  //                 }}
  //                 transition={{ 
  //                   duration: 3, 
  //                   repeat: Infinity, 
  //                   repeatDelay: 2 
  //                 }}
  //                 className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 rounded-3xl mb-6 shadow-lg"
  //               >
  //                 <Fish className="w-10 h-10 text-white" />
  //               </motion.div>
  //               <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
  //                 AquaAnalyzer
  //               </h1>
  //               <p className="text-gray-600 mt-2 text-sm">
  //                 Fish Detection & Monitoring System
  //               </p>
  //               {/* <div className="mt-4 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
  //                 <p className="text-xs text-blue-700 font-medium">Demo Credentials:</p>
  //                 <p className="text-xs text-blue-600">Username: admin | Password: aqua123</p>
  //               </div> */}
  //             </motion.div>

  //             {/* Error Message */}
  //             <AnimatePresence>
  //               {error && (
  //                 <motion.div
  //                   initial={{ opacity: 0, height: 0 }}
  //                   animate={{ opacity: 1, height: 'auto' }}
  //                   exit={{ opacity: 0, height: 0 }}
  //                   className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
  //                 >
  //                   <p className="text-red-600 text-sm">{error}</p>
  //                 </motion.div>
  //               )}
  //             </AnimatePresence>

  //             {/* Login Form */}
  //             <motion.form
  //               initial={{ opacity: 0 }}
  //               animate={{ opacity: 1 }}
  //               transition={{ delay: 0.3, duration: 0.5 }}
  //               onSubmit={handleSubmit}
  //               className="space-y-6"
  //             >
  //               <motion.div
  //                 whileFocus={{ scale: 1.02 }}
  //                 transition={{ duration: 0.2 }}
  //               >
  //                 <Input
  //                   type="text"
  //                   label="Username"
  //                   placeholder="Enter your username"
  //                   value={formData.username}
  //                   onChange={(e) => handleInputChange('username', e.target.value)}
  //                   startContent={<Mail className="w-4 h-4 text-cyan-500" />}
  //                   variant="bordered"
  //                   classNames={{
  //                     input: "text-gray-700",
  //                     inputWrapper: "border-gray-300 hover:border-cyan-400 focus-within:!border-cyan-500 transition-all duration-200"
  //                   }}
  //                   required
  //                 />
  //               </motion.div>

  //               <motion.div
  //                 whileFocus={{ scale: 1.02 }}
  //                 transition={{ duration: 0.2 }}
  //               >
  //                 <Input
  //                   type={showPassword ? "text" : "password"}
  //                   label="Password"
  //                   placeholder="Enter your password"
  //                   value={formData.password}
  //                   onChange={(e) => handleInputChange('password', e.target.value)}
  //                   startContent={<Lock className="w-4 h-4 text-cyan-500" />}
  //                   endContent={
  //                     <button
  //                       type="button"
  //                       onClick={() => setShowPassword(!showPassword)}
  //                       className="text-gray-400 hover:text-cyan-600 transition-colors"
  //                     >
  //                       {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
  //                     </button>
  //                   }
  //                   variant="bordered"
  //                   classNames={{
  //                     input: "text-gray-700",
  //                     inputWrapper: "border-gray-300 hover:border-cyan-400 focus-within:!border-cyan-500 transition-all duration-200"
  //                   }}
  //                   required
  //                 />
  //               </motion.div>



  //               <motion.div
  //                 whileHover={{ scale: 1.02 }}
  //                 whileTap={{ scale: 0.98 }}
  //               >
  //                 <Button
  //                   type="submit"
  //                   className="w-full bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
  //                   isLoading={isLoading}
  //                   spinner={
  //                     <motion.div
  //                       animate={{ rotate: 360 }}
  //                       transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
  //                     >
  //                       <Fish className="w-4 h-4" />
  //                     </motion.div>
  //                   }
  //                 >
  //                   {!isLoading && (
  //                     <motion.div
  //                       className="flex items-center space-x-2"
  //                       whileHover={{ x: 2 }}
  //                       transition={{ duration: 0.2 }}
  //                     >
  //                       <span>Sign In to AquaAnalyzer</span>
  //                       <ArrowRight className="w-4 h-4" />
  //                     </motion.div>
  //                   )}
  //                 </Button>
  //               </motion.div>
  //             </motion.form>

  //             <Divider className="my-6" />

  //             {/* Contact Us Section */}
  //             {/* <motion.div
  //               initial={{ opacity: 0 }}
  //               animate={{ opacity: 1 }}
  //               transition={{ delay: 0.5, duration: 0.5 }}
  //               className="space-y-4"
  //             >
  //               <h3 className="text-center text-gray-700 font-medium">Need Help?</h3>
  //               <div className="grid grid-cols-2 gap-3">
  //                 <motion.div
  //                   whileHover={{ scale: 1.05 }}
  //                   whileTap={{ scale: 0.95 }}
  //                 >
  //                   <Button
  //                     variant="bordered"
  //                     className="w-full py-4 border-cyan-200 hover:border-cyan-400 hover:bg-cyan-50 transition-all duration-200"
  //                     startContent={<Phone className="w-4 h-4 text-cyan-600" />}
  //                   >
  //                     <span className="text-gray-700 text-sm">Call Us</span>
  //                   </Button>
  //                 </motion.div>
  //                 <motion.div
  //                   whileHover={{ scale: 1.05 }}
  //                   whileTap={{ scale: 0.95 }}
  //                 >
  //                   <Button
  //                     variant="bordered"
  //                     className="w-full py-4 border-cyan-200 hover:border-cyan-400 hover:bg-cyan-50 transition-all duration-200"
  //                     startContent={<MessageCircle className="w-4 h-4 text-cyan-600" />}
  //                   >
  //                     <span className="text-gray-700 text-sm">Chat</span>
  //                   </Button>
  //                 </motion.div>
  //               </div>
  //               <div className="text-center text-xs text-gray-500 space-y-1">
  //                 <p>Email: support@aquaanalyzer.com</p>
  //                 <p>Phone: +1 (555) 123-4567</p>
  //                 <p>Available 24/7 for technical support</p>
  //               </div>
  //             </motion.div> */}
  //           </CardBody>
  //         </Card>

  //         {/* Floating Fish Animation */}
  //         <AnimatePresence>
  //           {[...Array(3)].map((_, i) => (
  //             <motion.div
  //               key={i}
  //               className="absolute text-cyan-400"
  //               style={{
  //                 left: `${15 + i * 25}%`,
  //                 top: `${-15 + i * 8}%`,
  //               }}
  //               initial={{ opacity: 0, x: -20 }}
  //               animate={{
  //                 opacity: [0, 0.7, 0],
  //                 x: [0, 30, 60],
  //                 rotate: [0, 10, -10, 0]
  //               }}
  //               transition={{
  //                 duration: 4,
  //                 repeat: Infinity,
  //                 delay: i * 0.8,
  //                 repeatDelay: 3
  //               }}
  //             >
  //               <Fish className="w-6 h-6" />
  //             </motion.div>
  //           ))}
  //         </AnimatePresence>
  //       </motion.div>
  //     </div>
  //   );
  // }
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-800 to-cyan-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border border-cyan-200/20">
            <CardBody className="p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 rounded-3xl mb-6 shadow-lg">
                  <Fish className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                  AquaAnalyzer
                </h1>
                <p className="text-gray-600 mt-2 text-sm">
                  Fish Detection & Monitoring System
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  type="text"
                  label="Username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  startContent={<Mail className="w-4 h-4 text-cyan-500" />}
                  variant="bordered"
                  required
                />

                <Input
                  type={showPassword ? "text" : "password"}
                  label="Password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  startContent={<Lock className="w-4 h-4 text-cyan-500" />}
                  endContent={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-cyan-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  variant="bordered"
                  required
                />

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  isLoading={isLoading}
                >
                  Sign In to AquaAnalyzer
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-teal-800 to-cyan-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements - Fish Swimming */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${-10 + (i % 2) * 120}%`,
              top: `${10 + i * 12}%`,
            }}
            animate={{
              x: [0, windowDimensions.width + 100],
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear"
            }}
          >
            <Fish className="w-8 h-8 text-cyan-200/20 transform rotate-0" />
          </motion.div>
        ))}

        {/* Floating Bubbles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`bubble-${i}`}
            className="absolute rounded-full border-2 border-cyan-300/10"
            style={{
              width: Math.random() * 60 + 20,
              height: Math.random() * 60 + 20,
              left: `${Math.random() * 100}%`,
              top: `100%`,
            }}
            animate={{
              y: [0, -windowDimensions.height - 100],
              opacity: [0, 0.6, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeOut"
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="bg-white/95 backdrop-blur-lg shadow-2xl border border-cyan-200/20">
          <CardBody className="p-8">
            {/* Logo and Header */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-center mb-8"
            >
              <motion.div
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 rounded-3xl mb-6 shadow-lg"
              >
                <Fish className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                AquaAnalyzer
              </h1>
              <p className="text-gray-600 mt-2 text-sm">
                Fish Detection & Monitoring System
              </p>
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <p className="text-red-600 text-sm">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Form */}
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <motion.div
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Input
                  type="text"
                  label="Username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  startContent={<Mail className="w-4 h-4 text-cyan-500" />}
                  variant="bordered"
                  classNames={{
                    input: "text-gray-700",
                    inputWrapper: "border-gray-300 hover:border-cyan-400 focus-within:!border-cyan-500 transition-all duration-200"
                  }}
                  required
                />
              </motion.div>

              <motion.div
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Input
                  type={showPassword ? "text" : "password"}
                  label="Password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  startContent={<Lock className="w-4 h-4 text-cyan-500" />}
                  endContent={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-cyan-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  variant="bordered"
                  classNames={{
                    input: "text-gray-700",
                    inputWrapper: "border-gray-300 hover:border-cyan-400 focus-within:!border-cyan-500 transition-all duration-200"
                  }}
                  required
                />
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  isLoading={isLoading}
                  spinner={
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Fish className="w-4 h-4" />
                    </motion.div>
                  }
                >
                  {!isLoading && (
                    <motion.div
                      className="flex items-center space-x-2"
                      whileHover={{ x: 2 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span>Sign In to AquaAnalyzer</span>
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  )}
                </Button>
              </motion.div>
            </motion.form>

            <Divider className="my-6" />
          </CardBody>
        </Card>

        {/* Floating Fish Animation */}
        <AnimatePresence>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-cyan-400"
              style={{
                left: `${15 + i * 25}%`,
                top: `${-15 + i * 8}%`,
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: [0, 0.7, 0],
                x: [0, 30, 60],
                rotate: [0, 10, -10, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 0.8,
                repeatDelay: 3
              }}
            >
              <Fish className="w-6 h-6" />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}