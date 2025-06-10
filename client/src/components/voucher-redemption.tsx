import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Gift, CheckCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface VoucherRedemptionProps {
  totalAmount: number;
  onVoucherApplied: (voucherAmount: number, voucherCode: string) => void;
  onVoucherRemoved: () => void;
  appliedVoucher?: { code: string; amount: number } | null;
}

export default function VoucherRedemption({ 
  totalAmount, 
  onVoucherApplied, 
  onVoucherRemoved, 
  appliedVoucher 
}: VoucherRedemptionProps) {
  const [voucherCode, setVoucherCode] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const validateVoucherMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", "/api/validate-voucher", { voucherCode: code });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.valid) {
        const voucherAmount = Math.min(data.voucher.amount, totalAmount);
        onVoucherApplied(voucherAmount, voucherCode);
        setVoucherCode("");
        setIsExpanded(false);
        toast({
          title: "Voucher Applied",
          description: `€${voucherAmount} discount applied to your booking.`,
        });
      } else {
        toast({
          title: "Invalid Voucher",
          description: data.message,
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Voucher Error",
        description: "Failed to validate voucher. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleApplyVoucher = () => {
    if (!voucherCode.trim()) {
      toast({
        title: "Voucher Code Required",
        description: "Please enter a voucher code.",
        variant: "destructive",
      });
      return;
    }
    validateVoucherMutation.mutate(voucherCode.trim().toUpperCase());
  };

  const handleRemoveVoucher = () => {
    onVoucherRemoved();
    toast({
      title: "Voucher Removed",
      description: "Voucher discount has been removed from your booking.",
    });
  };

  if (appliedVoucher) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">
                  Voucher Applied: {appliedVoucher.code}
                </p>
                <p className="text-sm text-green-600">
                  Discount: €{appliedVoucher.amount}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveVoucher}
              className="text-green-600 hover:text-green-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        {!isExpanded ? (
          <Button
            variant="outline"
            onClick={() => setIsExpanded(true)}
            className="w-full flex items-center justify-center space-x-2"
          >
            <Gift className="h-4 w-4" />
            <span>Have a gift voucher?</span>
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Gift className="h-5 w-5 text-forest" />
              <Label htmlFor="voucherCode" className="font-semibold">
                Enter Voucher Code
              </Label>
            </div>
            
            <div className="flex space-x-2">
              <Input
                id="voucherCode"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                placeholder="LHC-XXXXXXXX"
                className="flex-1"
                maxLength={12}
              />
              <Button
                onClick={handleApplyVoucher}
                disabled={validateVoucherMutation.isPending}
                className="bg-forest hover:bg-forest/80"
              >
                {validateVoucherMutation.isPending ? "Checking..." : "Apply"}
              </Button>
            </div>
            
            <div className="flex justify-between text-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsExpanded(false);
                  setVoucherCode("");
                }}
                className="text-gray-500"
              >
                Cancel
              </Button>
              <span className="text-gray-600">
                Valid voucher codes start with LHC-
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}