import { Search } from 'lucide-react'
import React from 'react'
import { Input } from './ui/Input'

const SearchContainer = ({ searchQuery, setSearchQuery }: { searchQuery: string, setSearchQuery: (value: string) => void }) => {
    return (
        <div className="relative flex-1">
            <Search className="absolute right-4 top-[20px] z-10 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
                placeholder="Search items by name, SKU, or description..."
                className="pl-10 border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
    )
}

export default SearchContainer
