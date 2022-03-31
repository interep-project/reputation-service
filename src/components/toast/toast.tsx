import { Alert, AlertIcon, AlertStatus, Progress } from "@chakra-ui/react"
import React, { ReactNode, useEffect, useState } from "react"

export type ToastProps = {
    status?: AlertStatus
    description?: ReactNode
    duration?: number
    progress?: boolean
}

export function Toast({ status = "info", description, duration = 5000, progress = false }: ToastProps): JSX.Element {
    const [_timestamp] = useState<number>(Date.now() + duration)
    const [_progressValue, setProgressValue] = useState<number>(100)

    useEffect(() => {
        if (progress) {
            if (_progressValue !== 0) {
                setTimeout(() => {
                    setProgressValue(((_timestamp - Date.now()) * 100) / duration)
                }, 50)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [_progressValue])

    return (
        <>
            <Alert
                status={status}
                colorScheme={status === "info" ? "gray" : undefined}
                variant="solid"
                borderTopRadius="4px"
            >
                <AlertIcon />
                {description}
            </Alert>
            {progress && <Progress colorScheme="green" size="sm" borderBottomRadius="4px" value={_progressValue} />}
        </>
    )
}
