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

                return {
                    bg,
                    color,
                    _hover: {
                        bg: `${c}.600`,
                        _disabled: {
                            bg
                        }
                    },
                    _active: `${c}.700`
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
