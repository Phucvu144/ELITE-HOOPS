import { Search, X } from 'lucide-react';
import { Brand, Player } from '../types';

interface FilterSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedBrand: Brand;
  setSelectedBrand: (brand: Brand) => void;
  selectedPlayer: Player;
  setSelectedPlayer: (player: Player) => void;
}

const brands: Brand[] = ['All', 'Nike', 'Jordan', 'Adidas'];
const players: Player[] = ['All', 'LeBron', 'KD', 'Ja', 'Tatum', 'Luka', 'Giannis', 'Ant'];

const FilterSection = ({
  searchQuery,
  setSearchQuery,
  selectedBrand,
  setSelectedBrand,
  selectedPlayer,
  setSelectedPlayer,
}: FilterSectionProps) => {
  return (
    <div className="space-y-8 mb-12">
      {/* Search Bar */}
      <div className="relative max-w-2xl mx-auto">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm kiếm giày (ví dụ: Jordan 1, LeBron...)"
          className="block w-full pl-12 pr-12 py-5 bg-gray-50 border-2 border-transparent rounded-sm text-lg font-bold focus:border-black focus:bg-white focus:ring-4 focus:ring-black/5 focus:shadow-2xl transition-all duration-300 placeholder:text-gray-400 placeholder:font-medium"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-black transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Quick Filters */}
      <div className="space-y-6">
        {/* Brand Filter */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Thương hiệu</span>
          <div className="flex flex-wrap justify-center gap-3">
            {brands.map((brand) => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`px-8 py-2 rounded-sm text-xs font-black uppercase tracking-widest transition-all border-2 ${
                  selectedBrand === brand
                    ? 'bg-black border-black text-white'
                    : 'bg-white border-gray-100 text-gray-400 hover:border-black hover:text-black'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>

        {/* Player Line Filter */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Dòng cầu thủ</span>
          <div className="flex flex-wrap justify-center gap-2">
            {players.map((player) => (
              <button
                key={player}
                onClick={() => setSelectedPlayer(player)}
                className={`px-5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                  selectedPlayer === player
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {player}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSection;
