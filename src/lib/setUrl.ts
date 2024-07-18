import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";




export function SetUrl(name: string, value: string) {
    const pathname = usePathname();
    const { replace } = useRouter();
    const searchParams = useSearchParams();
    useEffect(() => {
        function handleSubCategory(term: string, name: string) {
            const params = new URLSearchParams(searchParams);
            if (term) {
                params.set(name, term);
            } else {
                params.delete(name);
            }
            replace(`${pathname}?${params.toString()}`);
        };
        handleSubCategory(name, value);
    }, [name, pathname, replace, value, searchParams]);

};