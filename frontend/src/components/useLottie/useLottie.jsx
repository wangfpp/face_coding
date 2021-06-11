import { useEffect, useRef, useState } from 'react';

const createUseLottie = lottieInstance => options => {
  let container = useRef(null);
  let [animationInstance, setInstance] = useState(null);

  useEffect(() => {
    if (!container) {
      return null;
    }

    setInstance(lottieInstance.loadAnimation(options));

    return () => animationInstance.destroy();
  }, [container]);

  return [animationInstance, containerRef];
};

export default createUseLottie;