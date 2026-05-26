import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FileIcon, Download, ShoppingCart, Plus, Search } from "lucide-react";
import UploadAssetModal from "@/components/Common/UploadAssetModal";

const AssetCard = ({ asset }) => {
  const getFileIcon = (type) => {
    const icons = {
      pdf: "📄",
      doc: "📝",
      docx: "📝",
      xls: "📊",
      xlsx: "📊",
      ppt: "📽️",
      pptx: "📽️",
      txt: "📋",
      other: "📁"
    };
    return icons[type] || icons.other;
  };

  return (
    <Card className="group hover:shadow-lg transition-all">
      <CardHeader className="space-y-1">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10">
                {getFileIcon(asset.fileType)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{asset.name}</CardTitle>
              <p className="text-xs text-muted-foreground">
                By {asset.author} • {asset.subject}
              </p>
            </div>
          </div>
          <Badge variant={asset.isPaid ? "default" : "secondary"}>
            {asset.isPaid ? `₹${asset.price}` : "Free"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {asset.description}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {asset.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex items-center text-xs text-muted-foreground">
          <FileIcon className="h-3 w-3 mr-1" />
          {asset.fileSize}
        </div>
        <Button variant={asset.isPaid ? "default" : "secondary"} size="sm">
          {asset.isPaid ? (
            <>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Buy Now
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Download
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

const AssetsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("study");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Example data - replace with actual API data
  const assets = {
    study: [
      {
        id: 1,
        name: "Data Structures Notes",
        author: "Prof. Smith",
        subject: "Computer Science",
        description: "Comprehensive notes covering all major data structures with examples and practice problems.",
        fileType: "pdf",
        fileSize: "2.5 MB",
        tags: ["DSA", "Programming", "Notes"],
        isPaid: false
      },
      {
        id: 2,
        name: "Machine Learning Course",
        author: "Dr. Johnson",
        subject: "AI/ML",
        description: "Complete ML course with practical examples and datasets.",
        fileType: "pptx",
        fileSize: "150 MB",
        tags: ["ML", "AI", "Course"],
        isPaid: true,
        price: 499
      }
    ],
    accessories: [
      {
        id: 3,
        name: "Lab Manual Template",
        author: "Lab Admin",
        subject: "General",
        description: "Standard lab manual template with formatting guidelines.",
        fileType: "docx",
        fileSize: "500 KB",
        tags: ["Template", "Lab"],
        isPaid: false
      }
    ],
    marketplace: [
      {
        id: 4,
        name: "Project Management Excel",
        author: "Business Club",
        subject: "Management",
        description: "Professional project management template with automated calculations.",
        fileType: "xlsx",
        fileSize: "1.2 MB",
        tags: ["Project", "Management", "Template"],
        isPaid: true,
        price: 299
      }
    ]
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Assets Library</h1>
        <Button onClick={() => setIsUploadModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Upload Asset
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="study" className="w-full" onValueChange={setActiveCategory}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="study" className="flex-1">
            Study Materials
            <Badge variant="secondary" className="ml-2">
              {assets.study.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="accessories" className="flex-1">
            Accessories
            <Badge variant="secondary" className="ml-2">
              {assets.accessories.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="marketplace" className="flex-1">
            Marketplace
            <Badge variant="secondary" className="ml-2">
              {assets.marketplace.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[calc(100vh-280px)]">
          <TabsContent value="study" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assets.study.map((asset) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="accessories" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assets.accessories.map((asset) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="marketplace" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assets.marketplace.map((asset) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>

      <UploadAssetModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
};

export default AssetsPage; 