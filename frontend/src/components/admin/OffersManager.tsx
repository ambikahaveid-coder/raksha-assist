import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Edit2, Trash2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function OffersManager({ canEdit }: { canEdit: boolean }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: offers = [], isLoading } = useQuery({
    queryKey: ["offers"],
    queryFn: api.offers.getAll,
  });

  const createMutation = useMutation({
    mutationFn: api.offers.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      setIsDialogOpen(false);
      toast({
        title: "Offer Created",
        description: `${newOffer.title} has been published successfully.`,
      });
      setNewOffer({ title: "", discount: "", code: "", validTill: "", target: "All Users" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create offer",
        variant: "destructive",
      });
    }
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newOffer, setNewOffer] = useState({
    title: "",
    discount: "",
    code: "",
    validTill: "",
    target: "All Users"
  });

  const handleCreateOffer = () => {
    createMutation.mutate({
      title: newOffer.title,
      discount: newOffer.discount,
      code: newOffer.code,
      validTill: newOffer.validTill,
      targetAudience: newOffer.target,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Active Offers & Promotions</h2>
          <p className="text-sm text-muted-foreground">Manage discounts and special campaigns.</p>
        </div>
        {canEdit && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" /> Create New Offer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Offer</DialogTitle>
                <DialogDescription>
                  Set up a new promotional campaign for users or agents.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Campaign Title</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g. Summer Safety Sale" 
                    value={newOffer.title}
                    onChange={(e) => setNewOffer({...newOffer, title: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Promo Code</Label>
                    <Input 
                      id="code" 
                      placeholder="SUMMER20" 
                      value={newOffer.code}
                      onChange={(e) => setNewOffer({...newOffer, code: e.target.value.toUpperCase()})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discount">Benefit/Discount</Label>
                    <Input 
                      id="discount" 
                      placeholder="20% OFF" 
                      value={newOffer.discount}
                      onChange={(e) => setNewOffer({...newOffer, discount: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="valid">Valid Until</Label>
                    <Input 
                      id="valid" 
                      type="date"
                      value={newOffer.validTill}
                      onChange={(e) => setNewOffer({...newOffer, validTill: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="target">Target Audience</Label>
                    <Select onValueChange={(val) => setNewOffer({...newOffer, target: val})} defaultValue="All Users">
                      <SelectTrigger>
                        <SelectValue placeholder="Select target" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All Users">All Users</SelectItem>
                        <SelectItem value="Family Plans">Family Plans</SelectItem>
                        <SelectItem value="Agents">Agents Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleCreateOffer}>Publish Offer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : offers.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No offers yet. Create your first promotion!
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer: any) => {
            const isActive = offer.status === 'active' && new Date(offer.validTill) > new Date();
            return (
              <Card key={offer.id} className={`border ${isActive ? 'border-primary/20 shadow-sm' : 'border-slate-100 opacity-70'}`}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <Badge variant={isActive ? 'default' : 'secondary'} className={isActive ? 'bg-green-600' : ''}>
                      {isActive ? 'Active' : 'Expired'}
                    </Badge>
                    {canEdit && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <CardTitle className="mt-2 text-lg">{offer.title}</CardTitle>
                  <CardDescription>{offer.targetAudience || 'All Users'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-3 bg-slate-50 rounded-lg border border-dashed border-slate-300 flex justify-between items-center mb-4">
                    <code className="text-sm font-mono font-bold text-primary">{offer.code}</code>
                    <span className="text-sm font-medium text-slate-900">{offer.discount}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Valid until {offer.validTill}</span>
                  </div>
                </CardContent>
                {canEdit && (
                   <CardFooter className="pt-0">
                      <Button variant="outline" className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100">
                        <Trash2 className="mr-2 h-3 w-3" /> End Campaign
                      </Button>
                   </CardFooter>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
