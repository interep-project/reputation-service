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
        link: (): SystemStyleObject => ({
            _hover: {
                textDecoration: "none"
            }
        }),
        semisolid: (props: StyleFunctionProps): SystemStyleObject => {
            const { colorScheme: c, theme } = props

            const darkBg = transparentize(`${c}.200`, 0.05)(theme)
            const darkHoverBg = transparentize(`${c}.200`, 0.12)(theme)
            const darkActiveBg = transparentize(`${c}.200`, 0.24)(theme)

            const bg = mode(`${c}.50`, darkBg)(props)

            return {
                color: mode(`${c}.600`, `${c}.200`)(props),
                bg,
                _hover: {
                    bg: darkHoverBg,
                    _disabled: {
                        bg
                    }
                },
                _active: {
                    bg: mode(`${c}.100`, darkActiveBg)(props)
                }
            }
        }
    }
}

export default Button
