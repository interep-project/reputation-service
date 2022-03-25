import { SystemStyleObject } from "@chakra-ui/react"
import { StyleFunctionProps } from "@chakra-ui/theme-tools"

const Button = {
    baseStyle: {
        _focus: {
            boxShadow: "none"
        },
        borderRadius: "4px"
    },
    defaultProps: {
        size: "lg"
    },
    variants: {
        solid: (props: StyleFunctionProps): SystemStyleObject => {
            const { colorScheme: c } = props

            if (c === "primary") {
                const bg = `${c}.500`
                const color = "white"
                const hoverBg = `${c}.600`
                const activeBg = `${c}.700`

                return {
                    bg,
                    color,
                    _hover: {
                        bg: hoverBg,
                        _disabled: {
                            bg
                        }
                    },
                    _active: activeBg
                }
            }

            return {}
        },
        link: (): SystemStyleObject => ({
            _hover: {
                textDecoration: "none"
            }
        })
    }
}

export default Button
