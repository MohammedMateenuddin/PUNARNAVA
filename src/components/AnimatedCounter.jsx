import { useEffect, useRef } from 'react';

export default function AnimatedCounter({ end, duration = 2500, prefix = '', suffix = '', decimals = 0 }) {
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    // Reset if end changes
    started.current = false;
    
    const format = (val) => {
      const formatted = decimals > 0 ? val.toFixed(decimals) : Math.floor(val).toLocaleString('en-IN');
      return `${prefix}${formatted}${suffix}`;
    };

    // Set initial value immediately
    if (ref.current) {
      ref.current.textContent = format(0);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = Date.now();
          
          const tick = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Smoother easing (quartic out)
            const eased = 1 - Math.pow(1 - progress, 4);
            
            const currentVal = eased * end;
            
            // Directly update DOM to avoid React re-render lag
            if (ref.current) {
              ref.current.textContent = format(currentVal);
            }
            
            if (progress < 1) {
              requestAnimationFrame(tick);
            } else {
              if (ref.current) ref.current.textContent = format(end); // Exact end
            }
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.1 }
    );
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, prefix, suffix, decimals]);

  return (
    <span ref={ref} className="font-bold tabular-nums tracking-tight" style={{ fontVariantNumeric: 'tabular-nums' }}>
      0
    </span>
  );
}
