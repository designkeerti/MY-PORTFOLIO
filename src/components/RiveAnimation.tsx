import { useRive } from 'rive-react';

interface RiveAnimationProps {
  src: string;
  artboard?: string;
  stateMachineName?: string;
  autoplay?: boolean;
  className?: string;
  width?: number | string;
  height?: number | string;
}

export const RiveAnimation = ({
  src,
  artboard,
  stateMachineName,
  autoplay = true,
  className = '',
  width,
  height,
}: RiveAnimationProps) => {
  const { RiveComponent } = useRive({
    src,
    artboard,
    autoplay,
    stateMachines: stateMachineName ? [stateMachineName] : undefined,
  });

  return (
    <div className={className} style={{ width, height, position: 'relative', overflow: 'hidden' }}>
      <RiveComponent 
        style={{ 
          width: '100%', 
          height: '100%',
          objectFit: 'cover',
          transform: 'scale(1.2)', // Scale up to ensure coverage
        }} 
      />
    </div>
  );
};

