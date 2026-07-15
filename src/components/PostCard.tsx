import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type PostCardData = {
  id: string;
  title: string;
  content: string;
  cover_image_url: string | null;
  created_at: string;
  author: { dni: string; full_name: string; level: number } | null;
  category: { name: string; emoji: string; slug: string } | null;
  likes_count: number;
  comments_count: number;
};

export default function PostCard({ post, onDeleted }: { post: PostCardData; onDeleted?: (id: string) => void }) {
  const { isTeacher } = useAuth();
  const [open, setOpen] = useState(false);
  const excerpt = post.content.length > 180 ? post.content.slice(0, 180) + "…" : post.content;

  const doDelete = async () => {
    const { error } = await supabase.from("posts").delete().eq("id", post.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Publicación eliminada");
    onDeleted?.(post.id);
    setOpen(false);
  };

  return (
    <div className="relative">
      {isTeacher && (
        <>
          <button
            type="button"
            aria-label="Eliminar publicación"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
            className="neo-btn absolute right-2 top-2 z-10 rounded-full bg-destructive p-2 text-destructive-foreground shadow-md hover:scale-110">
            <Trash2 className="h-4 w-4" />
          </button>
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar esta publicación?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. "{post.title}" será eliminada permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={doDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Sí, eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
      <Link to="/post/$id" params={{ id: post.id }} className="neo-card block overflow-hidden">
        {post.cover_image_url && (
          <div className="aspect-[16/9] w-full overflow-hidden border-b-2 border-ink">
            <img src={post.cover_image_url} alt={post.title} className="h-full w-full object-cover" loading="lazy" />
          </div>
        )}
        <div className="p-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {post.category && <span className="chip bg-lemon">{post.category.emoji} {post.category.name}</span>}
            {post.author && <span className="chip bg-mint">Lv {post.author.level} · {post.author.full_name.split(" ")[0]}</span>}
          </div>
          <h3 className="font-display text-2xl font-extrabold leading-tight">{post.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{excerpt}</p>
          <div className="mt-4 flex items-center gap-4 text-sm font-bold">
            <span className="inline-flex items-center gap-1"><Heart className="h-4 w-4" /> {post.likes_count}</span>
            <span className="inline-flex items-center gap-1"><MessageCircle className="h-4 w-4" /> {post.comments_count}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
