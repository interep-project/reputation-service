import { SystemStyleObject } from "@chakra-ui/react"
import { mode, StyleFunctionProps } from "@chakra-ui/theme-tools"

const Modal = {
    baseStyle: (props: StyleFunctionProps): SystemStyleObject => ({
        dialog: {
            bg: mode("white", "background.800")(props),
            borderRadius: "4px"
        }
    })
}

export default Modal
