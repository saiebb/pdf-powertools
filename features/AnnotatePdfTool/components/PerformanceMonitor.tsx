import React, { useEffect, useState } from 'react';

interface PerformanceMonitorProps {
  isVisible?: boolean;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ 
  isVisible = process.env.NODE_ENV === 'development' 
}) => {
  const [metrics, setMetrics] = useState({
    memoryUsage: 0,
    renderCount: 0,
    lastRenderTime: 0
  });

  useEffect(() => {
    if (!isVisible) return;

    let renderCount = 0;
    const startTime = performance.now();

    const updateMetrics = () => {
      renderCount++;
      const currentTime = performance.now();
      
      // قياس استخدام الذاكرة (إذا كان متاحاً)
      const memoryInfo = (performance as any).memory;
      const memoryUsage = memoryInfo ? 
        Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024) : 0;

      setMetrics({
        memoryUsage,
        renderCount,
        lastRenderTime: currentTime - startTime
      });
    };

    // تحديث المقاييس كل ثانية
    const interval = setInterval(updateMetrics, 1000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs font-mono z-50">
      <div>Memory: {metrics.memoryUsage}MB</div>
      <div>Renders: {metrics.renderCount}</div>
      <div>Time: {Math.round(metrics.lastRenderTime)}ms</div>
    </div>
  );
};