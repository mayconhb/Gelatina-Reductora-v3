import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Camera, Loader2, Pencil, Check, X } from 'lucide-react';

interface ProfileViewProps {
  onLogout: () => void;
  userName: string;
  userAvatar: string | null;
  onUpdateProfile: (name: string, avatar: string | null) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onLogout, userName, userAvatar, onUpdateProfile }) => {
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(userName);
  const [isSavingName, setIsSavingName] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentNameRef = useRef(userName);

  useEffect(() => {
    currentNameRef.current = userName;
  }, [userName]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsSavingPhoto(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const newAvatar = reader.result as string;
        setTimeout(() => {
          onUpdateProfile(currentNameRef.current, newAvatar);
          setIsSavingPhoto(false);
        }, 500);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditNameClick = () => {
    setEditName(userName);
    setIsEditingName(true);
  };

  const handleSaveName = () => {
    const trimmedName = editName.trim();
    if (trimmedName && trimmedName !== userName) {
      currentNameRef.current = trimmedName;
      setIsSavingName(true);
      setTimeout(() => {
        onUpdateProfile(trimmedName, userAvatar);
        setIsSavingName(false);
        setIsEditingName(false);
      }, 500);
    } else {
      setIsEditingName(false);
    }
  };

  const handleCancelEditName = () => {
    setEditName(userName);
    setIsEditingName(false);
  };

  const AvatarDisplay = ({ src, size = "large" }: { src: string | null, size?: "large" | "small" }) => {
    const sizeClasses = size === "large" ? "w-24 h-24" : "w-20 h-20";
    const iconSize = size === "large" ? 40 : 32;

    if (src) {
      return (
        <div className={`${sizeClasses} rounded-full overflow-hidden border-4 border-white shadow-md bg-slate-200`}>
          <img src={src} alt="Avatar" className="w-full h-full object-cover" />
        </div>
      );
    }
    return (
      <div className={`${sizeClasses} rounded-full border-4 border-white shadow-md bg-slate-200 flex items-center justify-center text-slate-400`}>
        <User size={iconSize} strokeWidth={1.5} />
      </div>
    );
  };

  return (
    <div className="pt-10 px-6 pb-24 animate-fade-in bg-transparent min-h-screen">
      
      {/* Header Profile */}
      <div className="flex flex-col items-center mb-10">
        <div className="mb-4 relative">
          <div 
            className="relative group cursor-pointer" 
            onClick={() => !isSavingPhoto && fileInputRef.current?.click()}
          >
            <AvatarDisplay src={userAvatar} size="large" />
            <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {isSavingPhoto ? (
                <Loader2 className="text-white animate-spin" size={24} />
              ) : (
                <Camera className="text-white" size={24} />
              )}
            </div>
            <div className={`absolute bottom-0 right-0 p-2 rounded-full text-white shadow-sm border-2 border-white ${isSavingPhoto ? 'bg-slate-400' : 'bg-emerald-500'}`}>
              {isSavingPhoto ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Camera size={14} />
              )}
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            capture="user"
            onChange={handleFileChange}
            disabled={isSavingPhoto}
          />
        </div>
        
        {/* Name Section */}
        {isEditingName ? (
          <div className="flex items-center gap-2 mt-2">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900 font-medium text-center"
              autoFocus
              disabled={isSavingName}
            />
            <button
              onClick={handleSaveName}
              disabled={isSavingName || !editName.trim()}
              className="p-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              {isSavingName ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            </button>
            <button
              onClick={handleCancelEditName}
              disabled={isSavingName}
              className="p-2 bg-slate-200 text-slate-600 rounded-full hover:bg-slate-300 transition-colors disabled:opacity-50"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleEditNameClick}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-slate-100 active:bg-slate-100 transition-colors"
          >
            <h2 className="text-xl font-bold text-slate-900">{userName}</h2>
            <Pencil size={14} className="text-slate-400" />
          </button>
        )}
        
        <p className="text-xs text-slate-400 mt-2">Toca la foto para cambiar</p>
      </div>

      {/* Logout */}
      <button 
        onClick={onLogout}
        className="w-full bg-white/70 backdrop-blur-sm text-red-600 font-semibold py-4 rounded-xl border border-white/50 shadow-sm active:bg-red-50 transition-colors flex items-center justify-center gap-2"
      >
        <LogOut size={18} />
        Cerrar sesión
      </button>

      <p className="text-center text-slate-400 text-xs mt-8">Versión 1.0.0</p>
    </div>
  );
};
