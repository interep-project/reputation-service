import { SystemStyleObject } from "@chakra-ui/react"
import { mode, StyleFunctionProps } from "@chakra-ui/theme-tools"

const Tabs = {
    variants: {
        "solid-rounded": (props: StyleFunctionProps): SystemStyleObject => {
            const bg = mode(`gray.100`, `whiteAlpha.200`)(props)
            const hoverBg = mode(`gray.200`, `whiteAlpha.300`)(props)
            const color = mode("gray.800", "inherit")(props)

            return {
                tab: {
                    bg,
                    borderRadius: "2xl",
                    fontWeight: "semibold",
                    color,
                    _selected: {
                        color,
                        bg: hoverBg
                    },
                    _hover: {
                        bg: hoverBg
                    },
                    _focus: {
                        boxShadow: "none"
                    }
                }
            }
        }
    }
}

export default Tabs
