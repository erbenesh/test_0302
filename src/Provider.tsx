import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

type Props = {
    children: ReactNode;
};

const queryClient = new QueryClient();

export function Provider({children} : Props) {

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
    
}