import { SystemStyleObject } from "@chakra-ui/react"

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
        link: (): SystemStyleObject => ({
            _hover: {
                textDecoration: "none"
            }
        })
    }
}

export default Button
