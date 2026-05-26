import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileIcon, FolderIcon, BookOpenIcon, ShoppingBagIcon, MoreHorizontalIcon, PlusIcon, Download, Heart, Search, Filter, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import assetApi from "@/api/asset.api";
import { useToast } from "@/components/ui/use-toast";
import UploadAssetModal from "./UploadAssetModal";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SidebarItem = ({ icon: Icon, label, count, isActive, onClick }) => (
  <TooltipProvider delayDuration={0}>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="relative group">
          <button
            onClick={onClick}
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded-full transition-all",
              isActive 
                ? "text-primary bg-primary/10" 
                : "text-muted-foreground hover:text-primary hover:bg-primary/5"
            )}
          >
            <Icon className="h-5 w-5" />
            {count > 0 && (
              <span className={cn(
                "absolute -top-1 -right-1 w-4 h-4 text-[10px] flex items-center justify-center rounded-full bg-primary text-primary-foreground"
              )}>
                {count}
              </span>
            )}
          </button>
        </div>
      </TooltipTrigger>
      <TooltipContent side="left" className="font-medium">
        {label}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const FileTypeItem = ({ icon: Icon, label, count, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
  >
    <Icon className="h-4 w-4" />
    <span className="flex-1 text-left">{label}</span>
    {count > 0 && (
      <span className="rounded-full px-2 py-0.5 text-xs bg-muted-foreground/20">
        {count}
      </span>
    )}
  </button>
);

const AssetDetailsDialog = ({ asset, isOpen, onClose, onDownload, onFavorite }) => {
  if (!asset) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Asset Details</DialogTitle>
          <p className="text-sm text-muted-foreground">
            View and manage your asset details
          </p>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-6">
          {/* Preview Section */}
          <div className="col-span-2 aspect-video bg-muted rounded-lg flex items-center justify-center">
            {asset.fileType === 'pdf' && (
              <iframe src={asset.media.url} className="w-full h-full rounded-lg" />
            )}
            {['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'].includes(asset.fileType) && (
              <div className="text-center">
                <FileIcon className="h-20 w-20 mx-auto text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Preview not available</p>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{asset.name}</h3>
              <p className="text-sm text-muted-foreground">{asset.description}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subject</span>
                <span className="font-medium">{asset.subject}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">File Size</span>
                <span className="font-medium">{asset.fileSize}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Uploaded</span>
                <span className="font-medium">{new Date(asset.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Downloads</span>
                <span className="font-medium">{asset.downloads?.length || 0}</span>
              </div>
            </div>

            {asset.tags?.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Tags</label>
                <div className="flex flex-wrap gap-1">
                  {asset.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full bg-muted text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button 
                className="flex-1" 
                onClick={() => onDownload(asset._id)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onFavorite(asset._id)}
                className={cn(
                  "hover:text-red-500",
                  asset.favorites?.includes(asset.currentUserId) && "text-red-500"
                )}
              >
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AssetCard = ({ asset, onDownload, onFavorite, view, onClick }) => {
  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'pdf':
        return 'file-text';
      case 'doc':
      case 'docx':
        return 'file-text';
      case 'xls':
      case 'xlsx':
        return 'file-spreadsheet';
      case 'ppt':
      case 'pptx':
        return 'file-presentation';
      default:
        return 'file';
    }
  };

  return (
    <div 
      onClick={() => onClick(asset)}
      className="bg-card border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <FileIcon className="h-8 w-8 text-primary" />
          <div>
            <h3 className="font-medium text-sm">{asset.name}</h3>
            <p className="text-xs text-muted-foreground">{asset.fileSize}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onFavorite(asset._id);
            }}
            className={cn(
              "hover:text-red-500",
              asset.favorites?.includes(asset.currentUserId) && "text-red-500"
            )}
          >
            <Heart className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDownload(asset._id);
            }}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2">{asset.description}</p>
      {asset.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {asset.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full bg-muted text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{asset.subject}</span>
        <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

const FilterDropdown = ({ filters, onFilterChange }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" size="sm">
        <Filter className="h-4 w-4 mr-2" />
        Filters
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-56">
      <DropdownMenuLabel>Sort By</DropdownMenuLabel>
      <Select
        value={filters.sortBy}
        onValueChange={(value) => onFilterChange('sortBy', value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Sort by..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recent">Most Recent</SelectItem>
          <SelectItem value="name">Name</SelectItem>
          <SelectItem value="size">Size</SelectItem>
          <SelectItem value="downloads">Most Downloaded</SelectItem>
        </SelectContent>
      </Select>
      
      <DropdownMenuSeparator />
      
      <DropdownMenuLabel>File Type</DropdownMenuLabel>
      <Select
        value={filters.fileType}
        onValueChange={(value) => onFilterChange('fileType', value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="File type..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="pdf">PDF</SelectItem>
          <SelectItem value="doc">Word</SelectItem>
          <SelectItem value="xls">Excel</SelectItem>
          <SelectItem value="ppt">PowerPoint</SelectItem>
          <SelectItem value="txt">Text</SelectItem>
        </SelectContent>
      </Select>

      <DropdownMenuSeparator />

      <DropdownMenuLabel>Date Range</DropdownMenuLabel>
      <Select
        value={filters.dateRange}
        onValueChange={(value) => onFilterChange('dateRange', value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Date range..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Time</SelectItem>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="week">This Week</SelectItem>
          <SelectItem value="month">This Month</SelectItem>
          <SelectItem value="year">This Year</SelectItem>
        </SelectContent>
      </Select>
    </DropdownMenuContent>
  </DropdownMenu>
);

const ViewToggle = ({ view, onViewChange }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" size="sm">
        <SlidersHorizontal className="h-4 w-4 mr-2" />
        View
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem onClick={() => onViewChange('grid')}>
        Grid View
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onViewChange('list')}>
        List View
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onViewChange('compact')}>
        Compact View
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

const Assets = () => {
  const [activeCategory, setActiveCategory] = useState("study");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [assets, setAssets] = useState([]);
  const [stats, setStats] = useState({
    totalAssets: 0,
    totalDownloads: 0,
    totalFavorites: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    sortBy: "recent",
    fileType: "all",
    dateRange: "all"
  });
  const [view, setView] = useState("grid");
  const [selectedAsset, setSelectedAsset] = useState(null);

  const categories = [
    { id: "study", label: "Study Materials", icon: BookOpenIcon, count: 0 },
    { id: "accessories", label: "Accessories", icon: FolderIcon, count: 0 },
    { id: "marketplace", label: "Marketplace", icon: ShoppingBagIcon, count: 0 },
    { id: "others", label: "Others", icon: MoreHorizontalIcon, count: 0 }
  ];

  const fileTypes = [
    { id: "pdf", label: "PDF Documents", icon: FileIcon, count: 0 },
    { id: "doc", label: "Word Documents", icon: FileIcon, count: 0 },
    { id: "xls", label: "Excel Sheets", icon: FileIcon, count: 0 },
    { id: "ppt", label: "Presentations", icon: FileIcon, count: 0 },
    { id: "txt", label: "Text Files", icon: FileIcon, count: 0 }
  ];

  useEffect(() => {
    loadAssets();
    loadStats();
  }, [activeCategory, searchQuery, filters]);

  const loadAssets = async () => {
    try {
      setIsLoading(true);
      const data = await assetApi.getAssets({ 
        category: activeCategory,
        search: searchQuery,
        fileType: filters.fileType !== 'all' ? filters.fileType : undefined,
        dateRange: filters.dateRange !== 'all' ? filters.dateRange : undefined,
        sortBy: filters.sortBy
      });
      
      setAssets(data);
      
      // Update category counts
      categories.forEach(cat => {
        cat.count = data.filter(asset => asset.category === cat.id).length;
      });

      // Update file type counts
      fileTypes.forEach(type => {
        type.count = data.filter(asset => asset.fileType === type.id).length;
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await assetApi.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleUpload = async (formData) => {
    try {
      await assetApi.createAsset(formData);
      toast({
        title: "Success",
        description: "Asset uploaded successfully",
      });
      setIsUploadModalOpen(false);
      loadAssets();
      loadStats();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (assetId) => {
    try {
      const { downloadUrl } = await assetApi.downloadAsset(assetId);
      window.open(downloadUrl, '_blank');
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleFavorite = async (assetId) => {
    try {
      await assetApi.toggleFavorite(assetId);
      loadAssets();
      loadStats();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleAssetClick = (asset) => {
    setSelectedAsset(asset);
  };

  return (
    <div className="flex h-screen">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header with Search and Filters */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold">
                {categories.find(cat => cat.id === activeCategory)?.label || 'Assets'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {activeCategory === 'study' && 'Share and manage your study materials'}
                {activeCategory === 'accessories' && 'Find useful tools and templates'}
                {activeCategory === 'marketplace' && 'Buy and sell educational resources'}
                {activeCategory === 'others' && 'Explore other resources'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <FilterDropdown 
              filters={filters}
              onFilterChange={handleFilterChange}
            />
            <ViewToggle 
              view={view}
              onViewChange={setView}
            />
          </div>
        </div>

        {/* Asset Grid */}
        <ScrollArea className="flex-1 p-4">
          {isLoading ? (
            <div className="grid place-items-center h-full">
              <p>Loading assets...</p>
            </div>
          ) : assets.length === 0 ? (
            <div className="grid place-items-center h-full">
              <div className="text-center space-y-2">
                <p className="text-muted-foreground">No assets found</p>
                <Button onClick={() => setIsUploadModalOpen(true)}>
                  Upload your first asset
                </Button>
              </div>
            </div>
          ) : (
            <div className={cn(
              "gap-4",
              view === "grid" && "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
              view === "list" && "space-y-4",
              view === "compact" && "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
            )}>
              {assets.map((asset) => (
                <AssetCard
                  key={asset._id}
                  asset={asset}
                  onDownload={handleDownload}
                  onFavorite={handleFavorite}
                  view={view}
                  onClick={handleAssetClick}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Compact Sidebar (Right) */}
      <div className="w-14 py-4 flex flex-col items-center gap-6">
        {/* Main Categories */}
        <div className="space-y-4">
          {categories.map((category) => (
            <SidebarItem
              key={category.id}
              icon={category.icon}
              label={category.label}
              count={category.count}
              isActive={activeCategory === category.id}
              onClick={() => setActiveCategory(category.id)}
            />
          ))}
        </div>

        {/* Divider */}
        <div className="w-8 h-px bg-border/50" />

        {/* Quick Access */}
        <div className="space-y-4">
          <SidebarItem
            icon={FileIcon}
            label="Recent Files"
            count={stats.totalAssets}
            onClick={() => handleFilterChange('dateRange', 'week')}
          />
          <SidebarItem
            icon={Download}
            label="Downloads"
            count={stats.totalDownloads}
          />
          <SidebarItem
            icon={Heart}
            label="Favorites"
            count={stats.totalFavorites}
          />
        </div>

        {/* Upload Button */}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="mt-auto w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" className="font-medium">
              Upload New Asset
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <UploadAssetModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />

      <AssetDetailsDialog
        asset={selectedAsset}
        isOpen={!!selectedAsset}
        onClose={() => setSelectedAsset(null)}
        onDownload={handleDownload}
        onFavorite={handleFavorite}
      />
    </div>
  );
};

export default Assets;