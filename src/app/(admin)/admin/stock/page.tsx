'use client';

import { useState, useEffect, useMemo } from 'react';
import { UniversalAdminLayout, PageHeader, LoadingState, ErrorState, EmptyState } from '@/components/admin/universal-admin-layout';
import { NoProductsEmptyState, PrerequisiteEmptyState, GrayEmptyState, TableWrapper } from '@/components/admin/reusable-empty-states';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Filter, BarChart3, Package, Building2, AlertTriangle, TrendingUp, Eye, Plus } from 'lucide-react';
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

type ViewMode = 'product-centric' | 'hotel-centric';
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
  const [viewMode, setViewMode] = useState<ViewMode>('product-centric');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>('all');
  const [selectedHotelId, setSelectedHotelId] = useState<string>('all');
  const [selectedCityId, setSelectedCityId] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [stockLevel, setStockLevel] = useState<StockLevel>('all');

  // Add stock popup states
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [selectedCityIdForAdd, setSelectedCityIdForAdd] = useState<string>('');
  const [selectedHotelIdForAdd, setSelectedHotelIdForAdd] = useState<string>('');
  const [selectedProductIdForAdd, setSelectedProductIdForAdd] = useState<string>('');
  const [quantityToAdd, setQuantityToAdd] = useState<string>('1');
  const [isSubmittingStock, setIsSubmittingStock] = useState(false);
  const [stockError, setStockError] = useState<string>('');

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

  // Get filtered hotels for add stock popup
  const filteredHotelsForAdd = useMemo(() => {
    if (!selectedCityIdForAdd) return [];
    return hotels.filter(hotel => hotel.city?.id === selectedCityIdForAdd);
  }, [hotels, selectedCityIdForAdd]);

  // Handle add stock submission
  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCityIdForAdd || !selectedHotelIdForAdd || !selectedProductIdForAdd || !quantityToAdd) {
      setStockError('Tous les champs sont requis');
      return;
    }

    setIsSubmittingStock(true);
    setStockError('');

    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hotelId: selectedHotelIdForAdd,
          productId: selectedProductIdForAdd,
          quantity: parseInt(quantityToAdd),
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout du stock');
      }

      // Reset form and close popup
      setSelectedCityIdForAdd('');
      setSelectedHotelIdForAdd('');
      setSelectedProductIdForAdd('');
      setQuantityToAdd('1');
      setIsAddStockOpen(false);
      
      // Refresh data
      fetchData();
    } catch (err: any) {
      setStockError(err.message);
    } finally {
      setIsSubmittingStock(false);
    }
  };

  // Reset hotel selection when city changes
  useEffect(() => {
    setSelectedHotelIdForAdd('');
  }, [selectedCityIdForAdd]);

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
            <Dialog open={isAddStockOpen} onOpenChange={setIsAddStockOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gray-900 hover:bg-gray-800 text-white border-0">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter du stock
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Ajouter du stock</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddStock} className="space-y-4">
                  {stockError && (
                    <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded">
                      {stockError}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="city">Ville *</Label>
                    <select
                      id="city"
                      value={selectedCityIdForAdd}
                      onChange={(e) => setSelectedCityIdForAdd(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                      required
                    >
                      <option value="">Sélectionner une ville</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hotel">Hôtel *</Label>
                    <select
                      id="hotel"
                      value={selectedHotelIdForAdd}
                      onChange={(e) => setSelectedHotelIdForAdd(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                      required
                      disabled={!selectedCityIdForAdd}
                    >
                      <option value="">Sélectionner un hôtel</option>
                      {filteredHotelsForAdd.map((hotel) => (
                        <option key={hotel.id} value={hotel.id}>
                          {hotel.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="product">Produit *</Label>
                    <select
                      id="product"
                      value={selectedProductIdForAdd}
                      onChange={(e) => setSelectedProductIdForAdd(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
                      required
                    >
                      <option value="">Sélectionner un produit</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantité *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={quantityToAdd}
                      onChange={(e) => setQuantityToAdd(e.target.value)}
                      placeholder="Nombre d'unités à ajouter"
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddStockOpen(false)}
                      disabled={isSubmittingStock}
                      className="border-gray-200"
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmittingStock}
                      className="bg-gray-900 hover:bg-gray-800 text-white border-0"
                    >
                      {isSubmittingStock ? 'Ajout...' : 'Ajouter'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
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
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white p-4 border border-gray-200">
              <div className="flex items-center">
                <Package className="h-4 w-4 text-gray-800 mr-2" />
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Produits</p>
                  <p className="text-xl font-semibold text-gray-900">{stockSummary.totalProducts}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 border border-gray-200">
              <div className="flex items-center">
                <Building2 className="h-4 w-4 text-gray-800 mr-2" />
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Hôtels</p>
                  <p className="text-xl font-semibold text-gray-900">{stockSummary.totalHotels}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 border border-gray-200">
              <div className="flex items-center">
                <BarChart3 className="h-4 w-4 text-gray-800 mr-2" />
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Total</p>
                  <p className="text-xl font-semibold text-gray-900">{stockSummary.totalStock}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="h-4 w-4 bg-gray-800 mr-2" />
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Disponible</p>
                  <p className="text-xl font-semibold text-gray-900">{stockSummary.currentlyAvailable}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 border border-gray-200">
              <div className="flex items-center">
                <div className="h-4 w-4 bg-gray-400 mr-2" />
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">En Usage</p>
                  <p className="text-xl font-semibold text-gray-900">{stockSummary.inUse}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 border border-gray-200">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-gray-800 mr-2" />
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Faible</p>
                  <p className="text-xl font-semibold text-black">{stockSummary.lowStockItems}</p>
                </div>
              </div>
            </div>
          </div>

          {/* View Mode Selector */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex space-x-1 border border-gray-200 bg-white">
              <Button
                variant={viewMode === 'product-centric' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('product-centric')}
                className="border-0 rounded-none"
              >
                Vue Produits
              </Button>
              <Button
                variant={viewMode === 'hotel-centric' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('hotel-centric')}
                className="border-0 rounded-none"
              >
                Vue Hôtels
              </Button>
            </div>

            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters} className="border-gray-200">
                Effacer les filtres
              </Button>
            )}
          </div>

          {/* Search and Filters */}
          <div className="bg-white p-4 border border-gray-200">
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
              {/* Product-Centric View */}
              {viewMode === 'product-centric' && (
                <div className="bg-white border border-gray-200">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900">
                      Vue par Produits ({productStockView.length})
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
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
                            Hôtels
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Utilisation
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {productStockView.map((product) => (
                          <tr key={product.productId} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {product.productName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {product.totalStock}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {product.currentlyAvailable}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {product.inUse}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {product.hotelsCount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {product.averageUtilization}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <Link 
                                href={`/admin/products/${product.productId}`}
                                className="text-gray-900 hover:text-gray-700"
                              >
                                Détails
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Hotel-Centric View */}
              {viewMode === 'hotel-centric' && (
                <div className="bg-white border border-gray-200">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900">
                      Vue par Hôtels ({hotelStockView.length})
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
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
                            Produits
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
                            Utilisation
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {hotelStockView.map((hotel) => (
                          <tr key={hotel.hotelId} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {hotel.hotelName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {hotel.cityName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {hotel.totalProducts}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {hotel.totalStock}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {hotel.currentlyAvailable}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {hotel.inUse}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {hotel.averageUtilization}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <Link 
                                href={`/admin/hotels/${hotel.hotelId}`}
                                className="text-gray-900 hover:text-gray-700"
                              >
                                Gérer
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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