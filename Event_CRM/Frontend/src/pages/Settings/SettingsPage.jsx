import { useState } from "react";
import {
  Bell,
  Building2,
  Check,
  Globe2,
  Palette,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import Button from "../../components/common/Button";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import PageHeader from "../../components/common/PageHeader";
import { SelectField, TextField } from "../../components/common/FormControls";
import Switch from "../../components/common/Switch";
import { useTheme } from "../../context/ThemeContext";
import { ROLE_ACCESS, ROLE_LABELS } from "../../constants/roles";
import {
  DEFAULT_SYSTEM_SETTINGS,
  getSystemSettings,
  resetSystemSettings,
  saveSystemSettings,
} from "../../utils/systemSettings";

const SettingSection = ({ icon: Icon, title, description, children }) => (
  <section className="rounded-3xl border border-line bg-card">
    <div className="flex items-start gap-3 border-b border-line px-5 py-5 sm:px-6">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <div>
        <h2 className="font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
    </div>
    <div className="space-y-5 px-5 py-5 sm:px-6">{children}</div>
  </section>
);

const SystemSettingsPage = () => {
  const [settings, setSettings] = useState(getSystemSettings);
  const [savedSettings, setSavedSettings] = useState(getSystemSettings);
  const [resetOpen, setResetOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const isDirty = JSON.stringify(settings) !== JSON.stringify(savedSettings);
  const canReset =
    isDirty ||
    JSON.stringify(savedSettings) !== JSON.stringify(DEFAULT_SYSTEM_SETTINGS) ||
    theme !== "light";

  const updateSetting = (field, value) => {
    setSettings((current) => ({ ...current, [field]: value }));
  };

  const updateNotification = (field, value) => {
    setSettings((current) => ({
      ...current,
      notifications: { ...current.notifications, [field]: value },
    }));
  };

  const save = (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      saveSystemSettings(settings);
      setSavedSettings(settings);
      toast.success("System settings saved");
    } catch (error) {
      toast.error(error.message || "Could not save system settings");
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    try {
      resetSystemSettings();
      const defaults = {
        ...DEFAULT_SYSTEM_SETTINGS,
        notifications: { ...DEFAULT_SYSTEM_SETTINGS.notifications },
      };
      if (theme !== "light") toggleTheme();
      setSettings(defaults);
      setSavedSettings(defaults);
      setResetOpen(false);
      toast.success("Settings restored to defaults");
    } catch (error) {
      toast.error(error.message || "Could not reset system settings");
    }
  };

  const roleDescriptions = {
    SUPER_ADMIN: "All modules, including System Settings",
    ADMIN: "All operational modules",
    EMPLOYEE: "Dashboard, Gate Check-In, and My Profile",
  };

  return (
    <div className="mx-auto max-w-[1100px] space-y-6">
      <PageHeader
        title="System Settings"
        description="Set the workspace defaults and preferences used by your event team."
        actions={
          <Button
            variant="ghost"
            onClick={() => setResetOpen(true)}
            disabled={!canReset}
          >
            <RotateCcw className="size-4" />
            Reset to defaults
          </Button>
        }
      />

      <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted">
        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
        <p>
          Settings are saved in this browser. They are not synced to the server
          yet.
        </p>
      </div>

      <form onSubmit={save} className="space-y-5">
        <SettingSection
          icon={Building2}
          title="Organization"
          description="Contact details for your event workspace."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Organization name"
              required
              value={settings.organizationName}
              onChange={(event) =>
                updateSetting("organizationName", event.target.value)
              }
              placeholder="Your organization"
            />
            <TextField
              label="Support email"
              type="email"
              value={settings.supportEmail}
              onChange={(event) =>
                updateSetting("supportEmail", event.target.value)
              }
              placeholder="support@example.com"
            />
            <TextField
              label="Support phone"
              type="tel"
              value={settings.supportPhone}
              onChange={(event) =>
                updateSetting("supportPhone", event.target.value)
              }
              placeholder="Contact number"
            />
          </div>
        </SettingSection>

        <SettingSection
          icon={Globe2}
          title="Regional defaults"
          description="Set the preferred location and regional values for this workspace."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Default event city"
              required
              value={settings.defaultCity}
              onChange={(event) =>
                updateSetting("defaultCity", event.target.value)
              }
              placeholder="e.g. Chennai"
            />
            <SelectField
              label="Currency"
              value={settings.currency}
              onChange={(event) => updateSetting("currency", event.target.value)}
              options={[
                { value: "INR", label: "INR — Indian Rupee" },
                { value: "USD", label: "USD — US Dollar" },
                { value: "GBP", label: "GBP — British Pound" },
                { value: "EUR", label: "EUR — Euro" },
              ]}
            />
            <SelectField
              label="Time zone"
              value={settings.timezone}
              onChange={(event) => updateSetting("timezone", event.target.value)}
              options={[
                { value: "Asia/Kolkata", label: "India Standard Time (IST)" },
                { value: "Asia/Dubai", label: "Gulf Standard Time (GST)" },
                { value: "Europe/London", label: "Greenwich Mean Time (GMT)" },
                { value: "America/New_York", label: "Eastern Time (ET)" },
              ]}
            />
          </div>
        </SettingSection>

        <SettingSection
          icon={Bell}
          title="Notifications"
          description="Choose which updates you want this workspace to track."
        >
          {[
            {
              key: "proposals",
              title: "Inbound proposals",
              description: "Keep new proposal alerts enabled for the team.",
            },
            {
              key: "gateAlerts",
              title: "Gate alerts",
              description: "Track check-in and gate activity alerts.",
            },
            {
              key: "weeklySummary",
              title: "Weekly summary",
              description: "Include a weekly operations summary preference.",
            },
          ].map(({ key, title, description }) => (
            <div
              key={key}
              className="flex items-center justify-between gap-4"
            >
              <div>
                <p className="text-sm font-medium">{title}</p>
                <p className="mt-1 text-xs text-muted">{description}</p>
              </div>
              <Switch
                label={title}
                checked={settings.notifications[key]}
                onChange={(checked) => updateNotification(key, checked)}
              />
            </div>
          ))}
          <p className="border-t border-line pt-4 text-xs text-muted">
            These preferences are stored locally; email and push delivery are
            not connected yet.
          </p>
        </SettingSection>

        <SettingSection
          icon={Palette}
          title="Appearance"
          description="Change how the event workspace looks on this device."
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Dark theme</p>
              <p className="mt-1 text-xs text-muted">
                Currently using {theme} mode.
              </p>
            </div>
            <Switch
              label="Dark theme"
              checked={theme === "dark"}
              onChange={toggleTheme}
            />
          </div>
        </SettingSection>

        <SettingSection
          icon={ShieldCheck}
          title="Role access"
          description="Access is controlled by the signed-in user's role."
        >
          <div className="divide-y divide-line">
            {Object.entries(ROLE_ACCESS)
              .filter(([role]) => roleDescriptions[role])
              .map(([role, access]) => (
                <div
                  key={role}
                  className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {ROLE_LABELS[role]}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {roleDescriptions[role]}
                    </p>
                  </div>
                  <span className="rounded-full bg-elevated px-3 py-1 text-xs font-medium text-muted">
                    {access.length} modules
                  </span>
                </div>
              ))}
          </div>
        </SettingSection>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-line bg-card px-5 py-4">
          <p className="text-xs text-muted">
            {isDirty ? "You have unsaved changes." : "All changes are saved."}
          </p>
          <Button type="submit" loading={saving} disabled={!isDirty}>
            Save settings
          </Button>
        </div>
      </form>

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset system settings?"
        message="Unsaved changes will be discarded, saved workspace preferences will be cleared, and the theme will return to light mode."
        confirmLabel="Reset settings"
        onConfirm={reset}
      />
    </div>
  );
};

export default SystemSettingsPage;
