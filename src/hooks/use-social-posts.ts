import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SocialContentCategory = "health" | "business";

export type VideoOrientation = "auto" | "portrait" | "landscape" | "square";

/** Frontend-only presentation helper: maps orientation to a Tailwind aspect ratio. */
export function videoAspectClass(orientation?: string | null) {
  switch (orientation) {
    case "portrait":
      return "aspect-[9/16]";
    case "landscape":
      return "aspect-video";
    case "square":
      return "aspect-square";
    default:
      return "aspect-square";
  }
}

export interface SocialPost {
  id: string;
  platform: string;
  content_category: SocialContentCategory;
  author_name: string;
  author_handle: string | null;
  author_avatar_url: string | null;
  content: string | null;
  image_url: string | null;
  video_url: string | null;
  video_thumbnail_url: string | null;
  video_title: string | null;
  video_description: string | null;
  video_orientation: VideoOrientation | null;
  post_url: string | null;
  hashtags: string[] | null;
  likes_count: number;
  is_featured: boolean;
  is_approved: boolean;
  display_order: number;
  created_at: string;
}

export function useSocialPosts(options?: {
  featured?: boolean;
  platform?: string;
  contentCategory?: SocialContentCategory;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["social-posts", options],
    queryFn: async () => {
      let query = supabase
        .from("social_posts")
        .select("*")
        .eq("is_approved", true)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (options?.featured) {
        query = query.eq("is_featured", true);
      }
      if (options?.platform) {
        query = query.eq("platform", options.platform);
      }
      if (options?.contentCategory) {
        query = query.eq("content_category", options.contentCategory);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SocialPost[];
    },
  });
}

