import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from '@supabase/auth-helpers-react';
import * as XLSX from 'xlsx';
import { Upload } from "lucide-react";
import { getCurrentUser } from "@/services/userService";

interface BulkUploadProspectsProps {
  onSuccess: () => void;
}

const BulkUploadProspects = ({ onSuccess }: BulkUploadProspectsProps) => {
  const session = useSession();
  const [isUploading, setIsUploading] = useState(false);

  const processFile = async (file: File) => {
    try {
      setIsUploading(true);
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const currentUser = await getCurrentUser();
          if (!currentUser?.id) {
            throw new Error("Please log in to upload prospects");
          }

          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const rawProspects = XLSX.utils.sheet_to_json(sheet);

          console.log("Raw prospects data:", rawProspects);

          const formattedProspects = rawProspects.map((prospect: any) => ({
            business_name: prospect['Business Name'] || prospect.business_name || "Unknown Business",
            website: prospect['Website'] || prospect.website || "",
            email: prospect['Email'] || prospect.email || "",
            business_address: prospect['Address'] || prospect.business_address || "",
            phone_number: prospect['Phone'] || prospect.phone_number || "",
            rating: parseFloat(prospect['Rating'] || prospect.rating || "0.0"),
            review_count: parseInt(prospect['Review Count'] || prospect.review_count || "0"),
            user_id: currentUser.id,
            status: "New",
            priority: "Medium",
            last_contact: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }));

          console.log("Formatted prospects:", formattedProspects);

          const { error: insertError } = await supabase
            .from('prospects')
            .insert(formattedProspects);

          if (insertError) {
            console.error('Error inserting prospects:', insertError);
            throw insertError;
          }

          toast({
            title: "Success",
            description: `${formattedProspects.length} prospects uploaded successfully`,
          });
          onSuccess();
        } catch (error) {
          console.error('Error processing file:', error);
          toast({
            title: "Error",
            description: error.message || "Failed to process file. Please check the format and try again.",
            variant: "destructive",
          });
        } finally {
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        setIsUploading(false);
        toast({
          title: "Error",
          description: "Failed to read file",
          variant: "destructive",
        });
      };

      reader.readAsBinaryString(file);
    } catch (error) {
      console.error('Error uploading prospects:', error);
      setIsUploading(false);
      toast({
        title: "Error",
        description: "Failed to upload prospects",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || 
          file.type === "text/csv") {
        processFile(file);
      } else {
        toast({
          title: "Error",
          description: "Please upload a valid Excel or CSV file",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="inline-block">
      <input
        type="file"
        accept=".xlsx,.csv"
        onChange={handleFileChange}
        className="hidden"
        id="bulk-upload"
      />
      <label htmlFor="bulk-upload">
        <Button
          variant="outline"
          className="gap-2"
          disabled={isUploading}
          asChild
        >
          <span>
            <Upload className="h-4 w-4" />
            {isUploading ? "Uploading..." : "Bulk Upload"}
          </span>
        </Button>
      </label>
    </div>
  );
};

export default BulkUploadProspects;