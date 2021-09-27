import { SystemStyleObject } from "@chakra-ui/react"
import { mode, StyleFunctionProps, transparentize } from "@chakra-ui/theme-tools"

const Button = {
    baseStyle: {
        _focus: {
            boxShadow: "none"
        },
        borderRadius: "2xl"
    },
    defaultProps: {
        size: "lg"
    },
    variants: {
        nav: (props: StyleFunctionProps): SystemStyleObject => {
            const hoverBg = mode(`gray.200`, `whiteAlpha.300`)(props)

            return {
                minW: 10,
                fontSize: "md",
                px: 4,
                py: 3,
                lineHeight: "1.2",
                borderRadius: "2xl",
                fontWeight: "semibold",
                transitionProperty: "common",
                transitionDuration: "normal",
                _hover: {
                    bg: hoverBg,
                    _disabled: {
                        bg: "initial"
                    }
                },
                _disabled: {
                    opacity: 0.4,
                    cursor: "not-allowed",
                    boxShadow: "none"
                },
                _active: { bg: hoverBg }
            }
        },
        ghost: (props: StyleFunctionProps): SystemStyleObject => {
            const { colorScheme: c, theme } = props
            const bg = mode(`${c}.50`, transparentize(`${c}.200`, 0.05)(theme))(props)

            return {
                bg,
                _hover: {
                    _disabled: {
                        bg
                    }
                }
            }
        }
    }
}

export default Button
