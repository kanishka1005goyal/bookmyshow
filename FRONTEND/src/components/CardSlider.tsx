interface CardSliderProps {
  title: string;
  children: React.ReactNode;
  darkTheme?: boolean;
}

export default function CardSlider({ title, children, darkTheme = false }: CardSliderProps) {
  const bgColor = darkTheme ? 'bg-[#2b3149]' : 'bg-white';
  const textColor = darkTheme ? 'text-white' : 'text-gray-900';

  return (
    <div className={`${bgColor} py-8`}>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-2xl font-bold ${textColor}`}>{title}</h2>
          <a href="#" className="text-red-500 text-sm hover:underline">See All &gt;</a>
        </div>
        {/* Horizontal scrollable container */}
        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
          {children}
        </div>
      </div>
    </div>
  );
}