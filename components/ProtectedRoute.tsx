
import { useEffect } from "react";
import { redirect } from "next/navigation";
import { getLocalStorage } from "@/utils/getLocalStorage";

type ProtectedRouteProps = {
  params?: {
    id: string;
  };
};

const ProtectedRoute = <T extends ProtectedRouteProps>(Component: React.ComponentType<T>) => {
  return (props: T) =>  {
    const isAuth = getLocalStorage();
    console.log(isAuth)
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
export default  ProtectedRoute
