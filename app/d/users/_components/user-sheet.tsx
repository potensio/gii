import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";

export type User = {
  id: string;
  name: string | null;
  email: string;
  role: "user" | "admin" | "super_admin";
  isActive: boolean;
  isConfirmed: boolean;
  createdAt: Date;
  updatedAt: Date;
};

interface UserSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUser: User | null;
  onSave: (user: Partial<User>) => void;
  mode: "create" | "edit";
}

export function UserSheet({
  isOpen,
  onClose,
  selectedUser,
  onSave,
  mode,
}: UserSheetProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user" as "user" | "admin",
  });

  // Reset form when sheet opens/closes or selectedUser changes
  useEffect(() => {
    if (mode === "edit" && selectedUser) {
      setFormData({
        name: selectedUser.name || "",
        email: selectedUser.email,
        role: selectedUser.role === "super_admin" ? "admin" : selectedUser.role,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        role: "user",
      });
    }
  }, [mode, selectedUser, isOpen]);

  const handleSave = () => {
    const userData =
      mode === "edit" && selectedUser
        ? { ...formData, id: selectedUser.id }
        : formData;

    onSave(userData);
  };

  const isFormValid = formData.name.trim() && formData.email.trim();

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="flex flex-col h-full gap-0">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle>
            {mode === "edit" ? "Edit User" : "Tambahkan User"}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6">
          <div className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="sheet-name">Nama</Label>
              <Input
                id="sheet-name"
                placeholder="Budi Santoso"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="sheet-email">Email</Label>
              <Input
                id="sheet-email"
                placeholder="budi@gmail.com"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="sheet-role">Role</Label>
              <Tabs
                value={formData.role}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    role: value as "user" | "admin",
                  }))
                }
              >
                <TabsList>
                  <TabsTrigger value="user">User</TabsTrigger>
                  <TabsTrigger value="admin">Admin</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>

        <SheetFooter className="flex-shrink-0 pt-4">
          <Button type="submit" onClick={handleSave} disabled={!isFormValid}>
            {mode === "edit" ? "Update User" : "Tambahkan User"}
          </Button>
          <SheetClose asChild>
            <Button variant="outline" onClick={onClose}>
              Batal
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
