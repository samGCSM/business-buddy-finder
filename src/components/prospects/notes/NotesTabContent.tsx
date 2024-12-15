import NotesDisplay from "./NotesDisplay";
import FileUpload from "./FileUpload";
import NotesInput from "./NotesInput";

interface NotesTabContentProps {
  existingNotes: string;
  newNote: string;
  isUploading: boolean;
  onNoteChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onNoteSave: () => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const NotesTabContent = ({
  existingNotes,
  newNote,
  isUploading,
  onNoteChange,
  onNoteSave,
  onFileUpload
}: NotesTabContentProps) => {
  return (
    <div className="flex flex-col flex-1">
      <NotesDisplay notes={existingNotes} />
      
      <div className="space-y-4 mt-auto">
        <FileUpload 
          onFileUpload={onFileUpload}
          isUploading={isUploading}
        />

        <NotesInput
          value={newNote}
          onChange={onNoteChange}
          onSave={onNoteSave}
        />
      </div>
    </div>
  );
};

export default NotesTabContent;