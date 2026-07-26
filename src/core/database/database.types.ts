export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      knowledge_entries: {
        Row: {
          id: string;
          slug: string;
          title: string;
          summary: string;
          body: string;
          category: string;
          status: string;
          tags: string[];
          keywords: string[];
          aliases: string[];
          sources: Json;
          medical_review_required: boolean;
          reviewed_by: string | null;
          reviewed_at: string | null;
          version: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          slug: string;
          title: string;
          summary: string;
          body: string;
          category: string;
          status?: string;
          tags?: string[];
          keywords?: string[];
          aliases?: string[];
          sources?: Json;
          medical_review_required?: boolean;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          version?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          slug?: string;
          title?: string;
          summary?: string;
          body?: string;
          category?: string;
          status?: string;
          tags?: string[];
          keywords?: string[];
          aliases?: string[];
          sources?: Json;
          medical_review_required?: boolean;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          version?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
