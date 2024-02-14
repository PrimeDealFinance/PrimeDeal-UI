
import { useEffect } from "react";
import { redirect } from "next/navigation";
import { useWalletStore } from "@/service/store";

export default function ProtectedRoute<T extends Record<string, T>>(Component: React.ComponentType<T>) {
  return (props: T) =>  {
    const { isConnect } = useWalletStore();

    useEffect(() => {
      if (!isConnect) {
        return redirect("/");
      }
    }, []);

    if (!isConnect) {
      return null;
    }

    return <Component {...props} />;
  };
}
