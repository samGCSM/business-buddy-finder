import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@/types/user";

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  users: User[];
  onConfirm: (userId: number, reassignToId: number | null) => Promise<void>;
}

export const DeleteUserDialog = ({
  open,
  onOpenChange,
  user,
  users,
  onConfirm,
}: DeleteUserDialogProps) => {
  const [prospectCount, setProspectCount] = useState<number | null>(null);
  const [reassignToId, setReassignToId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setReassignToId("");
      supabase
        .from("prospects")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .then(({ count }) => setProspectCount(count ?? 0));
    }
  }, [open, user.id]);

  const availableUsers = users.filter(
    (u) => u.id !== user.id
  );

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const targetId = reassignToId ? parseInt(reassignToId) : null;
      await onConfirm(user.id, targetId);
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  const canConfirm =
    prospectCount !== null &&
    (prospectCount === 0 || reassignToId !== "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <strong>{user.email}</strong>?
          </DialogDescription>
        </DialogHeader>

        {prospectCount === null ? (
          <p className="text-sm text-muted-foreground">Loading prospect count…</p>
        ) : prospectCount > 0 ? (
          <div className="space-y-3">
            <p className="text-sm">
              This user has <strong>{prospectCount}</strong> prospect
              {prospectCount !== 1 ? "s" : ""}. Choose who should receive them:
            </p>
            <Select value={reassignToId} onValueChange={setReassignToId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {availableUsers.map((u) => (
                  <SelectItem key={u.id} value={u.id.toString()}>
                    {u.full_name ? `${u.full_name} (${u.email})` : u.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            This user has no prospects. They can be deleted directly.
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!canConfirm || isLoading}
          >
            {isLoading ? "Deleting…" : "Delete User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
