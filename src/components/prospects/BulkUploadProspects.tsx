import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from '@supabase/auth-helpers-react';
import * as XLSX from 'xlsx';
import { Upload } from "lucide-react";

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
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const prospects = XLSX.utils.sheet_to_json(sheet);

          if (!session?.user?.id) {
            throw new Error("Please log in to upload prospects");
          }

          console.log("Processing prospects:", prospects);

          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('id', session.user.id)
            .single();

          if (userError || !userData) {
            throw new Error("Failed to get user data");
          }

          const formattedProspects = prospects.map((prospect: any) => ({
            business_name: prospect.business_name || "Unknown Business",
            notes: prospect.notes || "",
            website: prospect.website || "",
            email: prospect.email || "",
            business_address: prospect.business_address || "",
            phone_number: prospect.phone_number || "",
            owner_name: prospect.owner_name || "",
            status: prospect.status || "New",
            priority: prospect.priority || "Medium",
            owner_phone: prospect.owner_phone || "",
            owner_email: prospect.owner_email || "",
            user_id: userData.id,
            last_contact: new Date().toISOString()
          }));

          const { error: insertError } = await supabase
            .from('prospects')
            .insert(formattedProspects);

          if (insertError) throw insertError;

          toast({
            title: "Success",
            description: `${formattedProspects.length} prospects uploaded successfully`,
          });
          onSuccess();
        } catch (error) {
          console.error('Error processing file:', error);
          toast({
            title: "Error",
            description: "Failed to process file. Please check the format and try again.",
            variant: "destructive",
          });
        }
      };

      reader.onerror = () => {
        toast({
          title: "Error",
          description: "Failed to read file",
          variant: "destructive",
        });
      };

      reader.readAsBinaryString(file);
    } catch (error) {
      console.error('Error uploading prospects:', error);
      toast({
        title: "Error",
        description: "Failed to upload prospects",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
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