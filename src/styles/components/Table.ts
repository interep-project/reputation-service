import { SystemStyleObject } from "@chakra-ui/react"
import { StyleFunctionProps } from "@chakra-ui/theme-tools"

const Table = {
    variants: {
        grid: (props: StyleFunctionProps): SystemStyleObject => {
            const { colorScheme: c } = props

            return {
                th: {
                    fontSize: "md",
                    textTransform: "capitalize",
                    color: `${c}.100`,
                    borderBottom: "1px",
                    bg: `${c}.600`,
                    borderColor: `${c}.800`,
                    borderRightWidth: 1,
                    "&:last-child": {
                        borderRightWidth: 0
                    }
                },
                td: {
                    bg: `${c}.700`,
                    borderWidth: 0,
                    borderColor: `${c}.800`,
                    borderRightWidth: 1,
                    "&:last-child": {
                        borderRightWidth: 0
                    }
                },
                tr: {
                    borderColor: `${c}.800`,
                    borderBottomWidth: 1,
                    "&:last-child": {
                        borderBottomWidth: 0
                    }
                }
            }
        }
    }
}

export default Table
