export const ParallaxGrid = () => {
  return (
    <div
      className="fixed inset-0 w-screen h-screen z-0 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        maskImage: 'radial-gradient(ellipse 60% 100% at center, black 0%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse 60% 100% at center, black 0%, transparent 70%)',
      }}
    />
  );
};

