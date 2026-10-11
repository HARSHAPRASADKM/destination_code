import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Navbar } from "@/components/Navbar";
import { RequireAuth } from "@/components/RequireAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { LANGUAGES } from "@/lib/code-execution";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Destination Code" },
      { name: "description", content: "Manage your Destination Code profile." },
      { property: "og:title", content: "Profile — Destination Code" },
      { property: "og:description", content: "Manage your Destination Code profile." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <div className="min-h-screen bg-background">
      <Navbar />
      <RequireAuth>
        <Profile />
      </RequireAuth>
    </div>
  ),
});

function Profile() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["profile", user!.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [lang, setLang] = useState("python");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      setName(data.display_name ?? "");
      setBio(data.bio ?? "");
      setLang(data.preferred_language);
    }
  }, [data]);

  async function save() {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: name, bio, preferred_language: lang })
      .eq("user_id", user!.id);
    setSaving(false);
    if (error) toast.error("Could not save profile");
    else {
      toast.success("Profile saved");
      qc.invalidateQueries({ queryKey: ["profile"] });
    }
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-10">
      <h1 className="font-display text-3xl font-semibold">Profile</h1>
      <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
      <div className="mt-6 space-y-4 rounded-2xl border border-border p-6">
        <div className="space-y-1.5">
          <Label htmlFor="name">Display name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} maxLength={300} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lang">Preferred language</Label>
          <select
            id="lang"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            {LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>{l.label}</option>
            ))}
          </select>
        </div>
        <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
      </div>
    </main>
  );
}
