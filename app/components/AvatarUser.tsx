"use client";
import { useState, useEffect } from "react";
import { UserProfileData } from "@/types/types";
import toast from "react-hot-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/hooks/getInitials";

const AvatarUser = () => {
  const [profile, setProfile] = useState<UserProfileData | null>(null); // Initialize as null
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/profile");
      if (!response.ok) throw new Error("Error al obtener perfil");
      const data: UserProfileData = await response.json();
      setProfile(data);
      setAvatarPreviewUrl(null);
    } catch (error) {
      console.error("Error al cargar perfil:", error);
      toast.error("Error, No se pudo cargar el perfil");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      await Promise.all([fetchProfileData()]);
      setIsLoading(false);
    };
    loadInitialData();
  }, []);

  // if (isLoading) {
  //     return (
  //         <Loader2 className="h-12 w-12 animate-spin text-baseColor" />
  //     )
  // }

  return (
    <Avatar
      className="pointer-events-none my-3 h-24 w-24 select-none"
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
    >
      <AvatarImage
        src={avatarPreviewUrl || profile?.profile?.publicAvatarDisplayUrl || ""}
        alt={profile?.name || "Avatar"}
      />
      <AvatarFallback className="bg-baseColor/20 text-2xl uppercase text-baseColor">
        {getInitials(profile?.name)}
      </AvatarFallback>
    </Avatar>
  );
};

export default AvatarUser;
