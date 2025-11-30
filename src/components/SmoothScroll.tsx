import { createContext, useContext } from 'react';

// Create Context to expose scroll control
interface ScrollContextType {
  stopScroll: () => void;
  startScroll: () => void;
}

export const ScrollContext = createContext<ScrollContextType>({
  stopScroll: () => {},
  startScroll: () => {},
});

export const useScrollControl = () => useContext(ScrollContext);

export const SmoothScroll = ({ children }: { children: React.ReactNode }) => {
  
  const stopScroll = () => {
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';
  };

  const startScroll = () => {
    document.body.style.overflow = '';
    document.body.style.height = '';
  };

  return (
    <ScrollContext.Provider value={{ stopScroll, startScroll }}>
      {children}
    </ScrollContext.Provider>
  );
};
