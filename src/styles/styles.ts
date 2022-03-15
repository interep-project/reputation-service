import { SystemStyleObject } from "@chakra-ui/react"
import { mode, Styles, StyleFunctionProps } from "@chakra-ui/theme-tools"

const styles: Styles = {
    global: (props: StyleFunctionProps): SystemStyleObject => ({
        body: {
            bg: mode("white", "#121212")(props)
        },
        "body, #__next": {
            minHeight: "100vh"
        },
        "#__next": {
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
        }
    })
}

export default styles
