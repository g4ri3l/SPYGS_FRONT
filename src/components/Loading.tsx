interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

const Loading = ({ size = 'md', text, fullScreen = false }: LoadingProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const containerClass = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-50'
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center gap-4">
        <div className={`${sizeClasses[size]} border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin`}></div>
        {text && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>
        )}
      </div>
    </div>
  );
};

export default Loading;

