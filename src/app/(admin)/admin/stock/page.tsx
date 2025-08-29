'use client';

import { useState, useEffect, useMemo } from 'react';
import { UniversalAdminLayout, PageHeader, LoadingState, ErrorState, EmptyState } from '@/components/admin/universal-admin-layout';
import { NoProductsEmptyState, PrerequisiteEmptyState, GrayEmptyState, TableWrapper } from '@/components/admin/reusable-empty-states';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Search, Filter, BarChart3, Package, Building2, AlertTriangle, TrendingUp, Eye } from 'lucide-react';
import Link from 'next/link';

interface InventoryItem {
  id: string;
  quantity: number;
  active: boolean;
  currentlyAvailable: number;
  totalAvailable: number;
  inUse: number;
  utilization: number;
  isFullyBooked: boolean;
  isLowStock: boolean;
  hasRecentDemand: boolean;
  hotel: {
    id: string;
    name: string;
    city: {
      id: string;
      name: string;
    };
  };
  product: {
    id: string;
    name: string;
    pricePerDay?: number;
    pricePerHour?: number;
  };
}

interface Product {
  id: string;
  name: string;
  pricePerDay?: number;
  pricePerHour?: number;
}

interface Hotel {
  id: string;
  name: string;
  city?: {
    id: string;
    name: string;
  };
}

interface City {
  id: string;
  name: string;
}

interface StockSummary {
  totalProducts: number;
  totalHotels: number;
  totalStock: number;
  currentlyAvailable: number;
  inUse: number;
  lowStockItems: number;
  fullyBookedItems: number;
  averageUtilization: number;
}

interface ProductStockView {
  productId: string;
  productName: string;
  totalStock: number;
  currentlyAvailable: number;
  inUse: number;
  hotelsCount: number;
  averageUtilization: number;
  hotels: Array<{
    hotelId: string;
    hotelName: string;
    cityName: string;
    quantity: number;
    currentlyAvailable: number;
    inUse: number;
    active: boolean;
  }>;
}

interface HotelStockView {
  hotelId: string;
  hotelName: string;
  cityName: string;
  totalProducts: number;
  totalStock: number;
  currentlyAvailable: number;
  inUse: number;
  averageUtilization: number;
  products: Array<{
    productId: string;
    productName: string;
    quantity: number;
    currentlyAvailable: number;
    inUse: number;
    active: boolean;
  }>;
}

type ViewMode = 'table' | 'product-centric' | 'hotel-centric';
type FilterStatus = 'all' | 'available' | 'in-use' | 'fully-booked';
type StockLevel = 'all' | 'low' | 'normal' | 'high' | 'high-demand';

export default function StockPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>('all');
  const [selectedHotelId, setSelectedHotelId] = useState<string>('all');
  const [selectedCityId, setSelectedCityId] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [stockLevel, setStockLevel] = useState<StockLevel>('all');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [inventoryResponse, productsResponse, hotelsResponse, citiesResponse] = await Promise.all([
        fetch('/api/inventory/enhanced'),
        fetch('/api/products'),
        fetch('/api/hotels'),
        fetch('/api/cities')
      ]);
      
      if (!inventoryResponse.ok || !productsResponse.ok || !hotelsResponse.ok || !citiesResponse.ok) {
        throw new Error(`Erreur HTTP: ${inventoryResponse.status}`);
      }
      
      const [inventoryResult, productsData, hotelsData, citiesData] = await Promise.all([
        inventoryResponse.json(),
        productsResponse.json(),
        hotelsResponse.json(),
        citiesResponse.json()
      ]);
      
      setInventory(inventoryResult.inventory || []);
      setProducts(productsData || []);
      setHotels(hotelsData || []);
      setCities(citiesData || []);
    } catch (err: any) {
      console.error('Erreur lors du chargement:', err);
      setError(err.message);
      setInventory([]);
      setProducts([]);
      setHotels([]);
      setCities([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute filtered inventory based on all filters
  const filteredInventory = useMemo(() => {
    let filtered = inventory;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item => 
        item.product.name.toLowerCase().includes(query) ||
        item.hotel.name.toLowerCase().includes(query) ||
        item.hotel.city.name.toLowerCase().includes(query)
      );
    }

    // Filter by product
    if (selectedProductId !== 'all') {
      filtered = filtered.filter(item => item.product.id === selectedProductId);
    }

    // Filter by hotel
    if (selectedHotelId !== 'all') {
      filtered = filtered.filter(item => item.hotel.id === selectedHotelId);
    }

    // Filter by city
    if (selectedCityId !== 'all') {
      filtered = filtered.filter(item => item.hotel.city.id === selectedCityId);
    }

    // Filter by availability status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => {
        if (filterStatus === 'available') return item.currentlyAvailable > 0;
        if (filterStatus === 'in-use') return item.inUse > 0;
        if (filterStatus === 'fully-booked') return item.isFullyBooked;
        return true;
      });
    }

    // Filter by stock level and demand
    if (stockLevel !== 'all') {
      filtered = filtered.filter(item => {
        if (stockLevel === 'low') return item.isLowStock;
        if (stockLevel === 'normal') return item.currentlyAvailable > 2 && item.currentlyAvailable <= 10;
        if (stockLevel === 'high') return item.currentlyAvailable > 10;
        if (stockLevel === 'high-demand') return item.hasRecentDemand;
        return true;
      });
    }

    return filtered;
  }, [inventory, searchQuery, selectedProductId, selectedHotelId, selectedCityId, filterStatus, stockLevel]);

  // Compute stock summary statistics
  const stockSummary = useMemo((): StockSummary => {
    return {
      totalProducts: new Set(inventory.map(item => item.product.id)).size,
      totalHotels: new Set(inventory.map(item => item.hotel.id)).size,
      totalStock: inventory.reduce((sum, item) => sum + item.quantity, 0),
      currentlyAvailable: inventory.reduce((sum, item) => sum + item.currentlyAvailable, 0),
      inUse: inventory.reduce((sum, item) => sum + item.inUse, 0),
      lowStockItems: inventory.filter(item => item.isLowStock).length,
      fullyBookedItems: inventory.filter(item => item.isFullyBooked).length,
      averageUtilization: inventory.length > 0 ? Math.round(
        inventory.reduce((sum, item) => sum + item.utilization, 0) / inventory.length
      ) : 0,
    };
  }, [inventory]);

  // Compute product-centric view
  const productStockView = useMemo((): ProductStockView[] => {
    const productMap = new Map<string, ProductStockView>();

    filteredInventory.forEach(item => {
      const productId = item.product.id;
      
      if (!productMap.has(productId)) {
        productMap.set(productId, {
          productId,
          productName: item.product.name,
          totalStock: 0,
          currentlyAvailable: 0,
          inUse: 0,
          hotelsCount: 0,
          averageUtilization: 0,
          hotels: []
        });
      }

      const productView = productMap.get(productId)!;
      productView.totalStock += item.quantity;
      productView.currentlyAvailable += item.currentlyAvailable;
      productView.inUse += item.inUse;
      
      productView.hotels.push({
        hotelId: item.hotel.id,
        hotelName: item.hotel.name,
        cityName: item.hotel.city.name,
        quantity: item.quantity,
        currentlyAvailable: item.currentlyAvailable,
        inUse: item.inUse,
        active: item.active
      });
    });

    // Update hotels count, calculate average utilization, and sort
    productMap.forEach(productView => {
      productView.hotelsCount = productView.hotels.length;
      productView.averageUtilization = productView.totalStock > 0 ? 
        Math.round((productView.inUse / productView.totalStock) * 100) : 0;
      productView.hotels.sort((a, b) => b.quantity - a.quantity);
    });

    return Array.from(productMap.values()).sort((a, b) => b.totalStock - a.totalStock);
  }, [filteredInventory]);

  // Compute hotel-centric view
  const hotelStockView = useMemo((): HotelStockView[] => {
    const hotelMap = new Map<string, HotelStockView>();

    filteredInventory.forEach(item => {
      const hotelId = item.hotel.id;
      
      if (!hotelMap.has(hotelId)) {
        hotelMap.set(hotelId, {
          hotelId,
          hotelName: item.hotel.name,
          cityName: item.hotel.city.name,
          totalProducts: 0,
          totalStock: 0,
          currentlyAvailable: 0,
          inUse: 0,
          averageUtilization: 0,
          products: []
        });
      }

      const hotelView = hotelMap.get(hotelId)!;
      hotelView.totalStock += item.quantity;
      hotelView.currentlyAvailable += item.currentlyAvailable;
      hotelView.inUse += item.inUse;
      
      hotelView.products.push({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        currentlyAvailable: item.currentlyAvailable,
        inUse: item.inUse,
        active: item.active
      });
    });

    // Update product count, calculate average utilization, and sort
    hotelMap.forEach(hotelView => {
      hotelView.totalProducts = hotelView.products.length;
      hotelView.averageUtilization = hotelView.totalStock > 0 ? 
        Math.round((hotelView.inUse / hotelView.totalStock) * 100) : 0;
      hotelView.products.sort((a, b) => b.quantity - a.quantity);
    });

    return Array.from(hotelMap.values()).sort((a, b) => b.totalStock - a.totalStock);
  }, [filteredInventory]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedProductId('all');
    setSelectedHotelId('all');
    setSelectedCityId('all');
    setFilterStatus('all');
    setStockLevel('all');
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery || selectedProductId !== 'all' || selectedHotelId !== 'all' || 
    selectedCityId !== 'all' || filterStatus !== 'all' || stockLevel !== 'all';

  if (isLoading) {
    return (
      <LoadingState 
        title="Stock & Inventaire"
        message="Chargement du stock..."
      />
    );
  }

  if (error) {
    return (
      <ErrorState 
        title="Stock & Inventaire"
        error={error}
        onRetry={fetchData}
      />
    );
  }

  return (
    <UniversalAdminLayout>
      <PageHeader 
        title="Stock & Inventaire"
        subtitle="Gérez le stock des produits par hôtel avec des vues intelligentes et des filtres avancés"
        actions={
          (products.length > 0 && hotels.length > 0) ? (
            <Button>Ajouter du stock</Button>
          ) : null
        }
      />

      {products.length === 0 ? (
        <NoProductsEmptyState />
      ) : hotels.length === 0 ? (
        <PrerequisiteEmptyState
          icon="🏨"
          title="Aucun hôtel disponible"
          description="Vous devez d'abord créer des hôtels pour pouvoir y assigner du stock de produits."
          buttonText="Créer des hôtels"
          buttonHref="/admin/hotels"
        />
      ) : inventory.length === 0 ? (
        <GrayEmptyState
          icon="📊"
          title="Aucun stock configuré"
          description="Assignez vos produits aux hôtels pour définir les quantités disponibles à la location."
        >
          <Button>Configurer le premier stock</Button>
        </GrayEmptyState>
      ) : (
        <div className="space-y-6">
          {/* Stock Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="flex items-center">
                <Package className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Produits</p>
                  <p className="text-2xl font-bold text-gray-900">{stockSummary.totalProducts}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="flex items-center">
                <Building2 className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Hôtels</p>
                  <p className="text-2xl font-bold text-gray-900">{stockSummary.totalHotels}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="flex items-center">
                <BarChart3 className="h-5 w-5 text-purple-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Stock Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stockSummary.totalStock}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Disponible</p>
                  <p className="text-2xl font-bold text-green-900">{stockSummary.currentlyAvailable}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-600">En Usage</p>
                  <p className="text-2xl font-bold text-orange-600">{stockSummary.inUse}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Stock Faible</p>
                  <p className="text-2xl font-bold text-red-600">{stockSummary.lowStockItems}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="flex items-center">
                <BarChart3 className="h-5 w-5 text-purple-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Utilisation</p>
                  <p className="text-2xl font-bold text-purple-600">{stockSummary.averageUtilization}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* View Mode Selector */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex space-x-2">
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Vue Tableau
              </Button>
              <Button
                variant={viewMode === 'product-centric' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('product-centric')}
                className="flex items-center gap-2"
              >
                <Package className="h-4 w-4" />
                Vue Produits
              </Button>
              <Button
                variant={viewMode === 'hotel-centric' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('hotel-centric')}
                className="flex items-center gap-2"
              >
                <Building2 className="h-4 w-4" />
                Vue Hôtels
              </Button>
            </div>

            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Effacer les filtres
              </Button>
            )}
          </div>

          {/* Search and Filters */}
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Rechercher produits, hôtels, villes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Product Filter */}
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span className="truncate">
                        {selectedProductId === 'all' ? 'Tous les produits' : 
                         products.find(p => p.id === selectedProductId)?.name || 'Produit'}
                      </span>
                      <Filter className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Filtrer par produit</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setSelectedProductId('all')}>
                      Tous les produits
                    </DropdownMenuItem>
                    {products.map(product => (
                      <DropdownMenuItem 
                        key={product.id}
                        onClick={() => setSelectedProductId(product.id)}
                      >
                        {product.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Hotel Filter */}
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span className="truncate">
                        {selectedHotelId === 'all' ? 'Tous les hôtels' : 
                         hotels.find(h => h.id === selectedHotelId)?.name || 'Hôtel'}
                      </span>
                      <Filter className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Filtrer par hôtel</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setSelectedHotelId('all')}>
                      Tous les hôtels
                    </DropdownMenuItem>
                    {hotels.map(hotel => (
                      <DropdownMenuItem 
                        key={hotel.id}
                        onClick={() => setSelectedHotelId(hotel.id)}
                      >
                        {hotel.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* City Filter */}
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span className="truncate">
                        {selectedCityId === 'all' ? 'Toutes les villes' : 
                         cities.find(c => c.id === selectedCityId)?.name || 'Ville'}
                      </span>
                      <Filter className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Filtrer par ville</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setSelectedCityId('all')}>
                      Toutes les villes
                    </DropdownMenuItem>
                    {cities.map(city => (
                      <DropdownMenuItem 
                        key={city.id}
                        onClick={() => setSelectedCityId(city.id)}
                      >
                        {city.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Status & Stock Level Filters */}
              <div className="grid grid-cols-2 gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      {filterStatus === 'all' ? 'Statut' : 
                       filterStatus === 'available' ? 'Disponible' : 
                       filterStatus === 'in-use' ? 'En Usage' : 'Complet'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                      Tous
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus('available')}>
                      Disponible
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus('in-use')}>
                      En Usage
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus('fully-booked')}>
                      Complet
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      {stockLevel === 'all' ? 'Stock' :
                       stockLevel === 'low' ? 'Faible' :
                       stockLevel === 'normal' ? 'Normal' : 
                       stockLevel === 'high' ? 'Élevé' : 'Demandé'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setStockLevel('all')}>
                      Tous
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStockLevel('low')}>
                      Faible (≤2)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStockLevel('normal')}>
                      Normal (3-10)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStockLevel('high')}>
                      Élevé (&gt;10)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStockLevel('high-demand')}>
                      Forte Demande
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          {filteredInventory.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun résultat</h3>
              <p className="mt-1 text-sm text-gray-500">
                Aucun élément ne correspond à vos critères de filtrage.
              </p>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4">
                  Effacer les filtres
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Table View */}
              {viewMode === 'table' && (
                <TableWrapper>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hôtel
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ville
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Produit
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Disponible
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          En Usage
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredInventory.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.hotel.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.hotel.city.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.product.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="text-gray-900 font-medium">{item.quantity}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              item.currentlyAvailable === 0
                                ? 'bg-red-100 text-red-800' 
                                : item.currentlyAvailable <= 2
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                            }`}>
                              {item.currentlyAvailable}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              item.inUse === 0
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {item.inUse}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <Link 
                              href={`/admin/hotels/${item.hotel.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Gérer
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TableWrapper>
              )}

              {/* Product-Centric View */}
              {viewMode === 'product-centric' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Vue par Produits ({productStockView.length})
                  </h3>
                  <div className="grid gap-4">
                    {productStockView.map((product) => (
                      <div key={product.productId} className="bg-white border rounded-lg p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">{product.productName}</h4>
                            <div className="flex space-x-4 text-sm mt-1">
                              <span className="text-gray-600">
                                Stock Total: <span className="font-semibold text-gray-900">{product.totalStock}</span>
                              </span>
                              <span className="text-green-600">
                                Disponible: <span className="font-semibold">{product.currentlyAvailable}</span>
                              </span>
                              <span className="text-orange-600">
                                En Usage: <span className="font-semibold">{product.inUse}</span>
                              </span>
                              <span className="text-blue-600">
                                Hôtels: <span className="font-semibold">{product.hotelsCount}</span>
                              </span>
                              <span className="text-purple-600">
                                Utilisation: <span className="font-semibold">{product.averageUtilization}%</span>
                              </span>
                            </div>
                          </div>
                          <Link 
                            href={`/admin/products/${product.productId}`}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            Gérer Produit
                          </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {product.hotels.map((hotel) => (
                            <div 
                              key={hotel.hotelId} 
                              className={`p-3 rounded border-l-4 ${
                                hotel.currentlyAvailable > 0 ? 'border-green-400 bg-green-50' : 
                                hotel.inUse > 0 ? 'border-orange-400 bg-orange-50' : 
                                'border-gray-400 bg-gray-50'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-medium text-gray-900">{hotel.hotelName}</p>
                                      <p className="text-sm text-gray-600">{hotel.cityName}</p>
                                    </div>
                                    <Link 
                                      href={`/admin/hotels/${hotel.hotelId}`}
                                      className="text-xs text-blue-600 hover:text-blue-800"
                                    >
                                      Gérer
                                    </Link>
                                  </div>
                                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                                    <div>
                                      <span className="text-gray-500">Total:</span>
                                      <span className="font-semibold ml-1">{hotel.quantity}</span>
                                    </div>
                                    <div>
                                      <span className="text-green-600">Dispo:</span>
                                      <span className="font-semibold ml-1">{hotel.currentlyAvailable}</span>
                                    </div>
                                    <div>
                                      <span className="text-orange-600">Usage:</span>
                                      <span className="font-semibold ml-1">{hotel.inUse}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hotel-Centric View */}
              {viewMode === 'hotel-centric' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Building2 className="h-5 w-5 mr-2" />
                    Vue par Hôtels ({hotelStockView.length})
                  </h3>
                  <div className="grid gap-4">
                    {hotelStockView.map((hotel) => (
                      <div key={hotel.hotelId} className="bg-white border rounded-lg p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">{hotel.hotelName}</h4>
                            <p className="text-sm text-gray-600">{hotel.cityName}</p>
                            <div className="flex space-x-4 text-sm mt-1">
                              <span className="text-gray-600">
                                Produits: <span className="font-semibold text-gray-900">{hotel.totalProducts}</span>
                              </span>
                              <span className="text-gray-600">
                                Stock Total: <span className="font-semibold text-gray-900">{hotel.totalStock}</span>
                              </span>
                              <span className="text-green-600">
                                Disponible: <span className="font-semibold">{hotel.currentlyAvailable}</span>
                              </span>
                              <span className="text-orange-600">
                                En Usage: <span className="font-semibold">{hotel.inUse}</span>
                              </span>
                              <span className="text-purple-600">
                                Utilisation: <span className="font-semibold">{hotel.averageUtilization}%</span>
                              </span>
                            </div>
                          </div>
                          <Link 
                            href={`/admin/hotels/${hotel.hotelId}`}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            Gérer Hôtel
                          </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {hotel.products.map((product) => (
                            <div 
                              key={product.productId} 
                              className={`p-3 rounded border-l-4 ${
                                product.currentlyAvailable > 0 ? 'border-blue-400 bg-blue-50' : 
                                product.inUse > 0 ? 'border-orange-400 bg-orange-50' : 
                                'border-gray-400 bg-gray-50'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-medium text-gray-900">{product.productName}</p>
                                    </div>
                                    <Link 
                                      href={`/admin/products/${product.productId}`}
                                      className="text-xs text-blue-600 hover:text-blue-800"
                                    >
                                      Gérer
                                    </Link>
                                  </div>
                                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                                    <div>
                                      <span className="text-gray-500">Total:</span>
                                      <span className="font-semibold ml-1">{product.quantity}</span>
                                    </div>
                                    <div>
                                      <span className="text-green-600">Dispo:</span>
                                      <span className="font-semibold ml-1">{product.currentlyAvailable}</span>
                                    </div>
                                    <div>
                                      <span className="text-orange-600">Usage:</span>
                                      <span className="font-semibold ml-1">{product.inUse}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </UniversalAdminLayout>
  );
}