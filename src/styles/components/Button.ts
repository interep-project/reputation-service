import { SystemStyleObject } from "@chakra-ui/react"
import { mode, StyleFunctionProps } from "@chakra-ui/theme-tools"

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
        })
    }
}

export default Button
