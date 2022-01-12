import { SystemStyleObject } from "@chakra-ui/react"
import { mode, StyleFunctionProps } from "@chakra-ui/theme-tools"

const Modal = {
    baseStyle: (props: StyleFunctionProps): SystemStyleObject => ({
        dialog: {
            bg: mode("white", "background.700")(props),
            borderRadius: "2xl"
        }
    })
}

export default Modal
