import { SystemStyleObject } from "@chakra-ui/react"
import { mode, cssVar, StyleFunctionProps } from "@chakra-ui/theme-tools"

const $bg = cssVar("tooltip-bg")

const Tooltip = {
    baseStyle: (props: StyleFunctionProps): SystemStyleObject => {
        const bg = mode("gray.300", "background.600")(props)

        return {
            [$bg.variable]: `colors.${bg}`,
            bg: [$bg.reference],
            color: mode("gray.900", "whiteAlpha.900")(props),
            borderRadius: "lg",
            py: "10px",
            px: "15px",
            fontWeight: "bold",
            maxW: "350px"
        }
    }
}

export default Tooltip
