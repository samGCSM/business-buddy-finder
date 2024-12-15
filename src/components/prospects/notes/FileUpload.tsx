import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
}

const FileUpload = ({ onFileUpload, isUploading }: FileUploadProps) => {
  return (
    <div className="flex gap-2">
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={onFileUpload}
        accept="image/*,.pdf,.doc,.docx,.txt"
      />
      <label htmlFor="file-upload">
        <Button
          variant="outline"
          className="gap-2"
          disabled={isUploading}
          asChild
        >
          <span>
            <Upload className="h-4 w-4" />
            {isUploading ? "Uploading..." : "Upload File"}
          </span>
        </Button>
      </label>
    </div>
  );
};

export default FileUpload;