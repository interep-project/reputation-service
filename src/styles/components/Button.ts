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
                _hover: {
                    bg: hoverBg
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
