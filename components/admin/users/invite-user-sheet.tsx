"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCreateUser } from "@/hooks/use-users";
import { toast } from "sonner";

// Define types locally to avoid import issues
type UserRole = "ADMIN" | "USER" | "MODERATOR";

interface InviteUserSheetProps {
  trigger?: React.ReactNode;
}

export function InviteUserSheet({ trigger }: InviteUserSheetProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    password: "",
    role: "USER" as UserRole,
    status: "ACTIVE" as "ACTIVE" | "INACTIVE" | "SUSPENDED",
  });

  const createUserMutation = useCreateUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createUserMutation.mutateAsync(formData);

      toast.success(`Invitation sent to ${formData.email}`);

      // Reset form and close sheet
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "USER",
        status: "ACTIVE",
      });
      setIsOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to invite user"
      );
    }
  };

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | UserRole
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="secondary">
            <Plus className="h-4 w-4" />
            Invite User
          </Button>
        )}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Undang User</SheetTitle>
          <SheetDescription>
            Undang user baru ke platform Anda.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nama lengkap</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="John Doe"
              required
              disabled={createUserMutation.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Alamat email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="johndoe@example.com"
              required
              disabled={createUserMutation.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Kata sandi</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              placeholder="Masukkan kata sandi"
              required
              disabled={createUserMutation.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Peran</Label>
            <Select
              value={formData.role}
              onValueChange={(value: UserRole) =>
                handleInputChange("role", value)
              }
              disabled={createUserMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="MODERATOR">Moderator</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={createUserMutation.isPending}
            >
              {createUserMutation.isPending ? "Sending..." : "Send Invitation"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={createUserMutation.isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
