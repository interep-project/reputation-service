import { useToast as _useToast, UseToastOptions } from "@chakra-ui/react"
import { useCallback } from "react"
import { Toast } from "src/components/toast"

export default function useToast() {
    const _toast = _useToast()

    const toast = useCallback(
        (options: UseToastOptions & { progress?: boolean }) =>
            _toast({
                render: () => (
                    <Toast
                        progress={options.progress}
                        status={options.status}
                        duration={options.duration === null ? undefined : options.duration}
                        description={options.description}
                    />
                ),
                position: "bottom-right",
                ...options
            }),
        [_toast]
    )

    return toast
}
