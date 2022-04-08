import { SystemStyleObject } from "@chakra-ui/react"
import { StyleFunctionProps, lighten } from "@chakra-ui/theme-tools"
import { StepsStyleConfig } from "chakra-ui-steps"

const Steps = {
    ...StepsStyleConfig,
    baseStyle: (props: StyleFunctionProps): SystemStyleObject => {
        const { colorScheme: c } = props

        const inactiveColor = `${c}.700`
        const activeColor = `${c}.600`

        return {
            ...StepsStyleConfig.baseStyle(props),
            stepIconContainer: {
                ...StepsStyleConfig.baseStyle(props).stepIconContainer,
                bg: inactiveColor,
                borderColor: inactiveColor,
                _activeStep: {
                    bg: inactiveColor,
                    borderColor: lighten(activeColor, 20),
                    _invalid: {
                        bg: "red.500",
                        borderColor: "red.500"
                    }
                },
                _highlighted: {
                    bg: activeColor,
                    borderColor: activeColor
                }
            },
            connector: {
                ...StepsStyleConfig.baseStyle(props).connector,
                borderColor: inactiveColor,
                _highlighted: {
                    borderColor: activeColor
                }
            }
        }
    }
}

export default Steps
