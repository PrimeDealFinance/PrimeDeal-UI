
import { useEffect } from "react";
import { redirect } from "next/navigation";
import { getLocalStorageItem } from "@/utils/getLocalStorageItem";

type ProtectedRouteProps = {
  params?: {
    id: string;
  };
};

export const ProtectedRoute = <T extends ProtectedRouteProps>(Component: React.ComponentType<T>) => {
  return (props: T) =>  {
    const isAuth = getLocalStorageItem();
    
    useEffect(() => {
      if (!isAuth) {
        return redirect("/");
      }
    }, []);

    if (!isAuth) {
      return null;
    }

    return <Component {...props} />;
  };
}
