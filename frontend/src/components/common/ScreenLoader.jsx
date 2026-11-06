import { Loader2 } from "lucide-react";

const ScreenLoader = () => (
  <div className="grid min-h-screen place-items-center bg-background">
    <Loader2 className="size-8 animate-spin text-primary" />
  </div>
);

export default ScreenLoader;
