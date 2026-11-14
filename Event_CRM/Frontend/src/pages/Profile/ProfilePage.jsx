import { useRef, useState } from "react";
import {
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Camera,
  Mail,
  MapPin,
  Phone,
  Save,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import Button from "../../components/common/Button";
import PageHeader from "../../components/common/PageHeader";
import { TextField } from "../../components/common/FormControls";
import { useAuth } from "../../context/AuthContext";
import { ROLE_LABELS } from "../../constants/roles";
import { getInitials } from "../../utils/initials";

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const avatarInputRef = useRef(null);
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    jobTitle: user?.jobTitle || "",
    department: user?.department || "",
    location: user?.location || "",
  });
  const [busy, setBusy] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);

  const isDirty = Object.keys(form).some((field) => form[field] !== (user?.[field] || ""));

  const save = (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      updateProfile(form);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const uploadAvatar = async (event) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Choose a JPG, PNG, or WebP image");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Profile pictures must be 2 MB or smaller");
      return;
    }

    setAvatarBusy(true);
    try {
      const avatarUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") resolve(reader.result);
          else reject(new Error("Could not read the selected image"));
        };
        reader.onerror = () => reject(new Error("Could not read the selected image"));
        reader.readAsDataURL(file);
      });
      updateProfile({ avatarUrl });
      toast.success("Profile picture updated");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAvatarBusy(false);
    }
  };

  const removeAvatar = () => {
    try {
      updateProfile({ avatarUrl: "" });
      toast.success("Profile picture removed");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="mx-auto max-w-[1100px] space-y-6">
      <PageHeader
        title="My Profile"
        description="Manage your personal information and keep your team directory details up to date."
      />

      <section className="overflow-hidden rounded-3xl border border-line bg-card">
        <div className="h-32 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/10" />
        <div className="px-6 pb-6 sm:px-8">
          <div className="-mt-10 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <span className="grid size-20 place-items-center overflow-hidden rounded-3xl border-4 border-card bg-gradient-to-br from-accent to-primary text-xl font-bold text-on-primary shadow-lg">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={`${user?.name || "User"} profile`}
                    className="size-full object-cover"
                  />
                ) : (
                  getInitials(user?.name || "User")
                )}
              </span>
              <div className="pb-1"><h2 className="text-xl font-semibold">{user?.name || "Account"}</h2><p className="mt-1 text-sm text-muted">{ROLE_LABELS[user?.role] || "Team member"}</p></div>
            </div>
            <span className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600"><BadgeCheck className="size-4" />Active account</span>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={uploadAvatar}
              className="sr-only"
              aria-label="Upload profile picture"
            />
            <Button
              type="button"
              variant="ghost"
              onClick={() => avatarInputRef.current?.click()}
              loading={avatarBusy}
              className="h-10 px-4"
            >
              <Camera className="size-4" />
              {user?.avatarUrl ? "Change photo" : "Upload photo"}
            </Button>
            {user?.avatarUrl && (
              <button
                type="button"
                onClick={removeAvatar}
                disabled={avatarBusy}
                className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium text-rose-500 transition hover:bg-rose-500/10 disabled:opacity-60"
              >
                <Trash2 className="size-4" />
                Remove photo
              </button>
            )}
            <p className="text-xs text-muted">JPG, PNG, or WebP · up to 2 MB</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <form onSubmit={save} className="space-y-6 rounded-3xl border border-line bg-card p-5 sm:p-7">
          <div><h2 className="text-lg font-semibold">Personal information</h2><p className="mt-1 text-sm text-muted">Your email and access role are managed by your administrator.</p></div>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField label="Full name" required autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Your name" />
            <TextField label="Email address" type="email" value={user?.email || ""} readOnly disabled />
            <TextField label="Phone number" type="tel" autoComplete="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="Your phone number" />
            <TextField label="Job title" value={form.jobTitle} onChange={(event) => setForm({ ...form, jobTitle: event.target.value })} placeholder="e.g. Operations manager" />
            <TextField label="Department" value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} placeholder="e.g. Events" />
            <TextField label="Location" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} placeholder="City, country" />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
            <p className="text-xs text-muted">Profile details are saved to this browser.</p>
            <Button type="submit" loading={busy} disabled={!isDirty}><Save className="size-4" />Save changes</Button>
          </div>
        </form>

        <aside className="h-fit space-y-4 rounded-3xl border border-line bg-card p-5 sm:p-6">
          <h2 className="font-semibold">Account details</h2>
          <div className="space-y-4">
            {[
              { label: "Email", value: user?.email || "Not set", icon: Mail },
              { label: "Phone", value: form.phone || "Not set", icon: Phone },
              { label: "Role", value: ROLE_LABELS[user?.role] || "Team member", icon: UserRound },
              { label: "Department", value: form.department || "Not set", icon: Building2 },
              { label: "Location", value: form.location || "Not set", icon: MapPin },
              { label: "Position", value: form.jobTitle || "Not set", icon: BriefcaseBusiness },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-elevated text-muted"><Icon className="size-4" /></span>
                <div className="min-w-0"><p className="text-xs text-muted">{label}</p><p className="mt-0.5 break-words text-sm font-medium">{value}</p></div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ProfilePage;
