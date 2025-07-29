import { useState, useEffect } from 'react';

const LoadingPage = () => {
  const [progress, setProgress] = useState(0);
  const [activeDot, setActiveDot] = useState(0);

  useEffect(() => {
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 10;
      });
    }, 300);

    // Dot animation
    const dotInterval = setInterval(() => {
      setActiveDot((prev) => (prev + 1) % 3);
    }, 500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(dotInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white">
      <div className="relative w-64 h-64 mb-8">
        {/* Animated circles */}
        <div className="absolute inset-0 rounded-full border-4 border-white opacity-20 animate-ping"></div>
        <div className="absolute inset-4 rounded-full border-4 border-pink-300 opacity-30 animate-pulse"></div>
        
        {/* Main spinner */}
        <div className="absolute inset-8 flex items-center justify-center">
          <div className="w-24 h-24 border-t-4 border-b-4 border-white rounded-full animate-spin"></div>
        </div>
        
        {/* Center logo/text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300">
            Loading
            {['.', '..', '...'].map((dot, index) => (
              <span 
                key={index} 
                className={`transition-opacity ${activeDot === index ? 'opacity-100' : 'opacity-0'}`}
              >
                {dot}
              </span>
            ))}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden mb-4">
        <div 
          className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Percentage text */}
      <p className="text-sm text-gray-300">
        {Math.min(100, Math.floor(progress))}% loaded
      </p>

      {/* Fun message that changes */}
      <p className="mt-6 text-xs text-gray-400 animate-bounce">
        {progress < 30 && 'Preparing awesomeness...'}
        {progress >= 30 && progress < 60 && 'Almost there...'}
        {progress >= 60 && progress < 90 && 'Just a few more seconds...'}
        {progress >= 90 && 'Ready to rock!'}
      </p>
    </div>
  );
};

export default LoadingPage;