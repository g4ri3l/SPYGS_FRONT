import { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onFilterChange: (filter: string) => void;
  onSortChange: (sort: string) => void;
}

const SearchBar = ({ onSearch, onFilterChange, onSortChange }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Todos');
  const [selectedSort, setSelectedSort] = useState('Mejor valorados');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    onFilterChange(filter);
  };

  const handleSortChange = (sort: string) => {
    setSelectedSort(sort);
    onSortChange(sort);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-8 border border-gray-100 dark:border-gray-700">
      <form onSubmit={handleSearch} className="mb-4">
        <div className="relative flex items-center">
          <svg className="absolute left-4 w-5 h-5 text-gray-600 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8" strokeWidth="2" />
            <path d="m21 21-4.35-4.35" strokeWidth="2" />
          </svg>
          <input
            type="text"
            className="w-full py-3.5 pl-12 pr-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-base transition-all duration-300 bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:border-primary-500 focus:bg-white dark:focus:bg-gray-600 focus:ring-4 focus:ring-primary-500/10 placeholder:text-gray-400 dark:placeholder:text-gray-400"
            placeholder="Buscar productos, servicios o negocios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </form>

      <div className="flex gap-3 flex-wrap">
        {/* Categoría */}
        <div className="relative group">
          <button className="flex items-center gap-1.5 py-1.5 px-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer transition-all duration-300 hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-gray-600">
            <svg className="w-3.5 h-3.5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" strokeWidth="2" />
            </svg>
            <span>{selectedFilter}</span>
            <svg className="w-3 h-3 text-gray-600 transition-transform duration-300 group-hover:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="6 9 12 15 18 9" strokeWidth="2" />
            </svg>
          </button>
          <div className="absolute top-full left-0 mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl min-w-[140px] opacity-0 invisible -translate-y-2 transition-all duration-300 z-50 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0">
            <button onClick={() => handleFilterChange('Todos')} className="block w-full py-2 px-3 text-left text-xs text-black bg-white hover:bg-primary-50 transition-colors rounded-t-lg">Todos</button>
            <button onClick={() => handleFilterChange('Comida')} className="block w-full py-2 px-3 text-left text-xs text-black bg-white hover:bg-primary-50 transition-colors rounded-t-lg">Comida</button>
          </div>
        </div>

        {/* Ordenar */}
        <div className="relative group">
          <button className="flex items-center gap-1.5 py-1.5 px-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer transition-all duration-300 hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-gray-600">
            <svg className="w-3.5 h-3.5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            <span>{selectedSort}</span>
            <svg className="w-3 h-3 text-gray-600 transition-transform duration-300 group-hover:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="6 9 12 15 18 9" strokeWidth="2" />
            </svg>
          </button>
          <div className="absolute top-full left-0 mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl min-w-[160px] opacity-0 invisible -translate-y-2 transition-all duration-300 z-50 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0">
            <button onClick={() => handleSortChange('Mejor valorados')} className="block w-full py-2 px-3 text-left text-xs text-black bg-white hover:bg-primary-50 transition-colors rounded-t-lg">Mejor valorados</button>
            <button onClick={() => handleSortChange('Más cercanos')} className="block w-full py-2 px-3 text-left text-xs text-black bg-white hover:bg-primary-50 transition-colors rounded-t-lg">Más cercanos</button>
            <button onClick={() => handleSortChange('Menor precio')} className="block w-full py-2 px-3 text-left text-xs text-black bg-white hover:bg-primary-50 transition-colors rounded-t-lg">Menor precio</button>
            <button onClick={() => handleSortChange('Mayor precio')} className="block w-full py-2 px-3 text-left text-xs text-black bg-white hover:bg-primary-50 transition-colors rounded-t-lg">Mayor precio</button>
          </div>
        </div>

        {/* Filtros adicionales */}
        <div className="relative group">
          <button className="flex items-center gap-1.5 py-1.5 px-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer transition-all duration-300 hover:border-primary-500 dark:hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-gray-600">
            <svg className="w-3.5 h-3.5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span>Más Filtros</span>
            <svg className="w-3 h-3 text-gray-600 transition-transform duration-300 group-hover:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="6 9 12 15 18 9" strokeWidth="2" />
            </svg>
          </button>
          <div className="absolute top-full left-0 mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl min-w-[200px] opacity-0 invisible -translate-y-2 transition-all duration-300 z-50 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 p-3">
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Rango de Precio</label>
                <div className="flex gap-2">
                  <input type="number" placeholder="Min" className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs" />
                  <input type="number" placeholder="Max" className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Calificación Mínima</label>
                <select className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs">
                  <option>Todas</option>
                  <option>4.5+</option>
                  <option>4.0+</option>
                  <option>3.5+</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Distancia Máxima</label>
                <select className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs">
                  <option>Cualquier distancia</option>
                  <option>Menos de 2 km</option>
                  <option>Menos de 5 km</option>
                  <option>Menos de 10 km</option>
                </select>
              </div>
              <button className="w-full py-1.5 bg-primary-500 text-white rounded-lg text-xs font-medium hover:bg-primary-600 transition-colors">
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;

